import { db } from './db.js';

export interface GoogleAdsCredentials {
  clientId?: string;
  clientSecret?: string;
  developerToken: string;
  redirectUri?: string;
}

export interface GoogleAdsErrorDetail {
  errorCode?: string;
  message: string;
  trigger?: string;
  location?: string;
}

export interface GoogleAdsApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  errorDetails?: GoogleAdsErrorDetail[];
  requestId?: string;
  statusCode?: number;
}

// Default developer token provided by the user
export const DEFAULT_DEVELOPER_TOKEN = 'obopXETQW2Vmfba7OhvGQ';

export function getGoogleAdsConfig(): GoogleAdsCredentials {
  const custom = db.getSystemConfig();
  return {
    clientId: custom.clientId || process.env.GOOGLE_CLIENT_ID || '',
    clientSecret: custom.clientSecret || process.env.GOOGLE_CLIENT_SECRET || '',
    developerToken: custom.developerToken || process.env.GOOGLE_ADS_DEVELOPER_TOKEN || DEFAULT_DEVELOPER_TOKEN,
    redirectUri: process.env.GOOGLE_REDIRECT_URI || `${process.env.APP_URL || ''}/auth/callback`,
  };
}

export function isGoogleAdsConfigured(): { configured: boolean; missing: string[] } {
  const config = getGoogleAdsConfig();
  const missing: string[] = [];
  if (!config.clientId) missing.push('GOOGLE_CLIENT_ID');
  if (!config.clientSecret) missing.push('GOOGLE_CLIENT_SECRET');
  if (!config.developerToken) missing.push('GOOGLE_ADS_DEVELOPER_TOKEN');

  return {
    configured: missing.length === 0,
    missing,
  };
}

/**
 * Clean customer ID removing hyphens for Google Ads REST API URLs
 */
export function cleanCustomerId(id: string): string {
  return id.replace(/[^0-9]/g, '');
}

/**
 * Format customer ID with hyphens (e.g. 123-456-7890)
 */
export function formatCustomerId(id: string): string {
  const cleaned = cleanCustomerId(id);
  if (cleaned.length === 10) {
    return `${cleaned.substring(0, 3)}-${cleaned.substring(3, 6)}-${cleaned.substring(6, 10)}`;
  }
  return id;
}

/**
 * Exchange Authorization Code for Access and Refresh Tokens
 */
export async function exchangeOAuthCode(code: string, redirectUri: string): Promise<{
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
  scope: string;
  googleEmail?: string;
}> {
  const config = getGoogleAdsConfig();
  if (!config.clientId || !config.clientSecret) {
    throw new Error('Google OAuth credentials not configured (GOOGLE_CLIENT_ID or GOOGLE_CLIENT_SECRET missing).');
  }

  const params = new URLSearchParams({
    code,
    client_id: config.clientId,
    client_secret: config.clientSecret,
    redirect_uri: redirectUri,
    grant_type: 'authorization_code',
  });

  const res = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: params.toString(),
  });

  const json = await res.json();
  if (!res.ok) {
    throw new Error(json.error_description || json.error || 'Failed to exchange authorization code');
  }

  // Get user info to retrieve email
  let googleEmail: string | undefined;
  try {
    const userRes = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
      headers: { Authorization: `Bearer ${json.access_token}` },
    });
    if (userRes.ok) {
      const userInfo = await userRes.json();
      googleEmail = userInfo.email;
    }
  } catch (e) {
    console.warn('Could not fetch Google user info:', e);
  }

  return {
    accessToken: json.access_token,
    refreshToken: json.refresh_token || '',
    expiresIn: json.expires_in,
    scope: json.scope,
    googleEmail,
  };
}

/**
 * Refresh an existing Google Access Token
 */
export async function refreshAccessToken(refreshToken: string): Promise<string> {
  const config = getGoogleAdsConfig();
  const params = new URLSearchParams({
    client_id: config.clientId || '',
    client_secret: config.clientSecret || '',
    refresh_token: refreshToken,
    grant_type: 'refresh_token',
  });

  const res = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: params.toString(),
  });

  const json = await res.json();
  if (!res.ok) {
    throw new Error(json.error_description || json.error || 'Failed to refresh Google token');
  }

  return json.access_token;
}

/**
 * Execute request to official Google Ads API v18
 */
export async function callGoogleAdsApi<T = any>(options: {
  endpoint: string; // e.g. /v18/customers:listAccessibleCustomers or /v18/customers/1234567890/campaigns:mutate
  method?: 'GET' | 'POST';
  accessToken: string;
  customerId?: string;
  body?: any;
  userId?: string;
  operationName: string;
}): Promise<GoogleAdsApiResponse<T>> {
  const { endpoint, method = 'POST', accessToken, customerId, body, userId, operationName } = options;
  const config = getGoogleAdsConfig();
  const url = `https://googleads.googleapis.com${endpoint}`;

  const headers: Record<string, string> = {
    'Authorization': `Bearer ${accessToken}`,
    'developer-token': config.developerToken,
    'Content-Type': 'application/json',
  };

  const startTime = Date.now();
  let requestId = `req-${Date.now()}`;
  let statusCode = 500;
  let responsePayload = '';

  try {
    const res = await fetch(url, {
      method,
      headers,
      body: body ? JSON.stringify(body) : undefined,
    });

    statusCode = res.status;
    const reqHeader = res.headers.get('request-id');
    if (reqHeader) requestId = reqHeader;

    const rawText = await res.text();
    responsePayload = rawText;
    let json: any = null;
    try {
      json = JSON.parse(rawText);
    } catch {
      json = { raw: rawText };
    }

    if (!res.ok) {
      // Extract Google Ads API error details
      const errorDetails: GoogleAdsErrorDetail[] = [];
      let mainErrorMsg = `Google Ads API error (HTTP ${res.status})`;

      if (json?.error?.details && Array.isArray(json.error.details)) {
        for (const detail of json.error.details) {
          if (detail.errors && Array.isArray(detail.errors)) {
            for (const err of detail.errors) {
              const codeObj = err.errorCode ? Object.values(err.errorCode)[0] : '';
              errorDetails.push({
                errorCode: String(codeObj || 'UNKNOWN_ERROR'),
                message: err.message || 'Erro não especificado pela API',
                trigger: err.trigger?.stringValue,
                location: err.location?.fieldPathElements?.map((p: any) => p.fieldName).join('.'),
              });
            }
          }
        }
      }

      if (json?.error?.message) {
        mainErrorMsg = json.error.message;
      } else if (errorDetails.length > 0) {
        mainErrorMsg = errorDetails.map(e => e.message).join('; ');
      }

      // Record API log
      db.addApiLog({
        userId,
        customerId: customerId ? formatCustomerId(customerId) : undefined,
        endpoint,
        operation: operationName,
        requestId,
        statusCode,
        status: 'ERROR',
        errorMessage: mainErrorMsg,
        requestPayload: body ? JSON.stringify(body).substring(0, 1500) : undefined,
        responsePayload: rawText.substring(0, 2000),
      });

      return {
        success: false,
        error: mainErrorMsg,
        errorDetails,
        requestId,
        statusCode,
      };
    }

    // Record success API log
    db.addApiLog({
      userId,
      customerId: customerId ? formatCustomerId(customerId) : undefined,
      endpoint,
      operation: operationName,
      requestId,
      statusCode,
      status: 'SUCCESS',
      requestPayload: body ? JSON.stringify(body).substring(0, 1500) : undefined,
      responsePayload: rawText.substring(0, 2000),
    });

    return {
      success: true,
      data: json,
      requestId,
      statusCode,
    };
  } catch (err: any) {
    const errorMsg = err.message || 'Falha de conexão com a Google Ads API';
    db.addApiLog({
      userId,
      customerId: customerId ? formatCustomerId(customerId) : undefined,
      endpoint,
      operation: operationName,
      requestId,
      statusCode: 500,
      status: 'ERROR',
      errorMessage: errorMsg,
      requestPayload: body ? JSON.stringify(body).substring(0, 1500) : undefined,
      responsePayload: errorMsg,
    });

    return {
      success: false,
      error: errorMsg,
      requestId,
      statusCode: 500,
    };
  }
}

/**
 * List all accessible Google Ads accounts for the authorized user
 */
export async function listAccessibleAccounts(accessToken: string, userId: string) {
  const result = await callGoogleAdsApi<{ resourceNames: string[] }>({
    endpoint: '/v18/customers:listAccessibleCustomers',
    method: 'GET',
    accessToken,
    userId,
    operationName: 'LIST_ACCESSIBLE_CUSTOMERS',
  });

  return result;
}

/**
 * Query detailed information about a customer account using GAQL
 */
export async function getCustomerDetails(accessToken: string, customerId: string, userId: string) {
  const cleanId = cleanCustomerId(customerId);
  const gaql = `
    SELECT 
      customer.id, 
      customer.descriptive_name, 
      customer.currency_code, 
      customer.time_zone, 
      customer.status, 
      customer.test_account 
    FROM customer
    LIMIT 1
  `.trim();

  const result = await callGoogleAdsApi({
    endpoint: `/v18/customers/${cleanId}/googleAds:search`,
    method: 'POST',
    accessToken,
    customerId: cleanId,
    userId,
    operationName: 'GET_CUSTOMER_DETAILS',
    body: { query: gaql },
  });

  return result;
}

/**
 * Execute full official publication sequence:
 * Campaign Budget -> Campaign (PAUSED) -> Ad Group -> Keywords -> Responsive Search Ad
 */
export async function publishCampaignOfficial(params: {
  userId: string;
  accessToken: string;
  customerId: string;
  campaignName: string;
  dailyBudget: number; // in BRL or Account Currency (e.g. 20.00)
  targetUrl: string;
  locationTarget: string;
  keywords: Array<{ text: string; matchType: 'BROAD' | 'PHRASE' | 'EXACT' }>;
  negativeKeywords: string[];
  headlines: string[];
  descriptions: string[];
}): Promise<{
  success: boolean;
  googleBudgetId?: string;
  googleCampaignId?: string;
  googleAdGroupId?: string;
  googleAdId?: string;
  createdKeywordsCount?: number;
  error?: string;
  errorDetails?: GoogleAdsErrorDetail[];
  requestId?: string;
}> {
  const {
    userId,
    accessToken,
    customerId,
    campaignName,
    dailyBudget,
    targetUrl,
    locationTarget,
    keywords,
    negativeKeywords,
    headlines,
    descriptions,
  } = params;

  const cleanId = cleanCustomerId(customerId);
  const budgetMicros = (Math.round(dailyBudget * 100) * 10000).toString(); // e.g. 20.00 -> 20,000,000 micros

  // Step 1: Create Campaign Budget
  const budgetRes = await callGoogleAdsApi({
    endpoint: `/v18/customers/${cleanId}/campaignBudgets:mutate`,
    method: 'POST',
    accessToken,
    customerId: cleanId,
    userId,
    operationName: 'CREATE_CAMPAIGN_BUDGET',
    body: {
      operations: [
        {
          create: {
            name: `Orçamento ${campaignName} - ${Date.now()}`,
            amountMicros: budgetMicros,
            deliveryMethod: 'STANDARD',
            explicitlyShared: false,
          },
        },
      ],
    },
  });

  if (!budgetRes.success || !budgetRes.data?.results?.[0]?.resourceName) {
    return {
      success: false,
      error: budgetRes.error || 'Não foi possível criar o orçamento da campanha no Google Ads.',
      errorDetails: budgetRes.errorDetails,
      requestId: budgetRes.requestId,
    };
  }

  const budgetResourceName = budgetRes.data.results[0].resourceName;
  const googleBudgetId = budgetResourceName.split('/').pop();

  // Step 2: Create Campaign (always PAUSED initially as mandated)
  const campaignRes = await callGoogleAdsApi({
    endpoint: `/v18/customers/${cleanId}/campaigns:mutate`,
    method: 'POST',
    accessToken,
    customerId: cleanId,
    userId,
    operationName: 'CREATE_CAMPAIGN',
    body: {
      operations: [
        {
          create: {
            name: campaignName,
            advertisingChannelType: 'SEARCH',
            status: 'PAUSED', // Mandatory initial paused status
            campaignBudget: budgetResourceName,
            networkSettings: {
              targetGoogleSearch: true,
              targetSearchNetwork: true,
              targetContentNetwork: false,
              targetPartnerSearchNetwork: false,
            },
            manualCpc: {
              enhancedCpcEnabled: false,
            },
          },
        },
      ],
    },
  });

  if (!campaignRes.success || !campaignRes.data?.results?.[0]?.resourceName) {
    return {
      success: false,
      googleBudgetId,
      error: campaignRes.error || 'Não foi possível criar a campanha no Google Ads.',
      errorDetails: campaignRes.errorDetails,
      requestId: campaignRes.requestId,
    };
  }

  const campaignResourceName = campaignRes.data.results[0].resourceName;
  const googleCampaignId = campaignResourceName.split('/').pop();

  // Step 3: Create Ad Group
  const adGroupRes = await callGoogleAdsApi({
    endpoint: `/v18/customers/${cleanId}/adGroups:mutate`,
    method: 'POST',
    accessToken,
    customerId: cleanId,
    userId,
    operationName: 'CREATE_AD_GROUP',
    body: {
      operations: [
        {
          create: {
            name: `Grupo Principal - ${campaignName}`,
            campaign: campaignResourceName,
            status: 'ENABLED',
            type: 'SEARCH_STANDARD',
            cpcBidMicros: '1500000', // R$ 1.50 default max bid
          },
        },
      ],
    },
  });

  if (!adGroupRes.success || !adGroupRes.data?.results?.[0]?.resourceName) {
    return {
      success: false,
      googleBudgetId,
      googleCampaignId,
      error: adGroupRes.error || 'Não foi possível criar o grupo de anúncios no Google Ads.',
      errorDetails: adGroupRes.errorDetails,
      requestId: adGroupRes.requestId,
    };
  }

  const adGroupResourceName = adGroupRes.data.results[0].resourceName;
  const googleAdGroupId = adGroupResourceName.split('/').pop();

  // Step 4: Add Keywords and Negative Keywords
  const keywordOperations: any[] = [];

  for (const kw of keywords) {
    if (!kw.text.trim()) continue;
    keywordOperations.push({
      create: {
        adGroup: adGroupResourceName,
        status: 'ENABLED',
        keyword: {
          text: kw.text.trim(),
          matchType: kw.matchType || 'BROAD',
        },
      },
    });
  }

  for (const neg of negativeKeywords) {
    if (!neg.trim()) continue;
    keywordOperations.push({
      create: {
        adGroup: adGroupResourceName,
        negative: true,
        keyword: {
          text: neg.trim(),
          matchType: 'BROAD',
        },
      },
    });
  }

  if (keywordOperations.length > 0) {
    const kwRes = await callGoogleAdsApi({
      endpoint: `/v18/customers/${cleanId}/adGroupCriteria:mutate`,
      method: 'POST',
      accessToken,
      customerId: cleanId,
      userId,
      operationName: 'CREATE_KEYWORDS',
      body: { operations: keywordOperations },
    });

    if (!kwRes.success) {
      console.warn('Warning during keyword creation:', kwRes.error);
    }
  }

  // Step 5: Create Responsive Search Ad (RSA)
  const formattedHeadlines = headlines
    .filter(h => h.trim().length > 0)
    .slice(0, 15)
    .map(h => ({ text: h.trim().substring(0, 30) }));

  const formattedDescriptions = descriptions
    .filter(d => d.trim().length > 0)
    .slice(0, 4)
    .map(d => ({ text: d.trim().substring(0, 90) }));

  // Fallback defaults if user provided too few
  if (formattedHeadlines.length < 3) {
    formattedHeadlines.push({ text: campaignName.substring(0, 30) });
    formattedHeadlines.push({ text: 'Atendimento Rápido e Seguro' });
    formattedHeadlines.push({ text: 'Conheça Nossas Soluções' });
  }

  if (formattedDescriptions.length < 2) {
    formattedDescriptions.push({ text: 'Descubra as melhores opções com qualidade e atendimento de excelência.' });
    formattedDescriptions.push({ text: 'Fale com nossa equipe e solicite mais informações pelo site oficial.' });
  }

  const adRes = await callGoogleAdsApi({
    endpoint: `/v18/customers/${cleanId}/adGroupAds:mutate`,
    method: 'POST',
    accessToken,
    customerId: cleanId,
    userId,
    operationName: 'CREATE_RESPONSIVE_SEARCH_AD',
    body: {
      operations: [
        {
          create: {
            adGroup: adGroupResourceName,
            status: 'ENABLED',
            ad: {
              finalUrls: [targetUrl],
              responsiveSearchAd: {
                headlines: formattedHeadlines,
                descriptions: formattedDescriptions,
              },
            },
          },
        },
      ],
    },
  });

  if (!adRes.success || !adRes.data?.results?.[0]?.resourceName) {
    return {
      success: false,
      googleBudgetId,
      googleCampaignId,
      googleAdGroupId,
      error: adRes.error || 'Não foi possível cadastrar os anúncios no Google Ads.',
      errorDetails: adRes.errorDetails,
      requestId: adRes.requestId,
    };
  }

  const googleAdId = adRes.data.results[0].resourceName.split('/').pop();

  return {
    success: true,
    googleBudgetId,
    googleCampaignId,
    googleAdGroupId,
    googleAdId,
    createdKeywordsCount: keywordOperations.length,
  };
}

/**
 * Update campaign status (ENABLE or PAUSE) via Google Ads API
 */
export async function updateCampaignStatusOfficial(params: {
  userId: string;
  accessToken: string;
  customerId: string;
  googleCampaignId: string;
  status: 'ENABLED' | 'PAUSED';
}): Promise<GoogleAdsApiResponse> {
  const { userId, accessToken, customerId, googleCampaignId, status } = params;
  const cleanId = cleanCustomerId(customerId);
  const resourceName = `customers/${cleanId}/campaigns/${googleCampaignId}`;

  return await callGoogleAdsApi({
    endpoint: `/v18/customers/${cleanId}/campaigns:mutate`,
    method: 'POST',
    accessToken,
    customerId: cleanId,
    userId,
    operationName: status === 'ENABLED' ? 'ENABLE_CAMPAIGN' : 'PAUSE_CAMPAIGN',
    body: {
      operations: [
        {
          updateMask: 'status',
          update: {
            resourceName,
            status,
          },
        },
      ],
    },
  });
}

/**
 * Fetch real metrics from Google Ads API using GAQL search
 */
export async function fetchGoogleAdsCampaignMetrics(params: {
  userId: string;
  accessToken: string;
  customerId: string;
  dateRange: 'TODAY' | 'LAST_7_DAYS' | 'LAST_30_DAYS' | 'LAST_90_DAYS';
}): Promise<GoogleAdsApiResponse> {
  const { userId, accessToken, customerId, dateRange } = params;
  const cleanId = cleanCustomerId(customerId);

  const gaql = `
    SELECT 
      campaign.id, 
      campaign.name, 
      campaign.status, 
      metrics.impressions, 
      metrics.clicks, 
      metrics.cost_micros, 
      metrics.conversions, 
      metrics.ctr, 
      metrics.average_cpc,
      segments.date 
    FROM campaign 
    WHERE segments.date DURING ${dateRange}
    ORDER BY segments.date DESC
  `.trim();

  return await callGoogleAdsApi({
    endpoint: `/v18/customers/${cleanId}/googleAds:search`,
    method: 'POST',
    accessToken,
    customerId: cleanId,
    userId,
    operationName: 'FETCH_CAMPAIGN_METRICS',
    body: { query: gaql },
  });
}
