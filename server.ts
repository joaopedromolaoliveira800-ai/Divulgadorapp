import express from 'express';
import path from 'path';
import dotenv from 'dotenv';
import { createServer as createViteServer } from 'vite';
import { db } from './server/db.js';
import {
  getGoogleAdsConfig,
  isGoogleAdsConfigured,
  exchangeOAuthCode,
  refreshAccessToken,
  listAccessibleAccounts,
  getCustomerDetails,
  publishCampaignOfficial,
  updateCampaignStatusOfficial,
  fetchGoogleAdsCampaignMetrics,
  cleanCustomerId,
  formatCustomerId,
} from './server/googleAds.js';
import { generateAdWithAi } from './server/gemini.js';

dotenv.config();

const app = express();
const PORT = 3000;

app.set('trust proxy', 1);
app.use(express.json());

// Current session user helper (prioritize Joao Pedro Mola Oliveira as master admin)
function getAuthenticatedUserId(req: express.Request): string {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.replace('Bearer ', '').trim();
    const user = db.getUserById(token);
    if (user) return user.id;
  }
  // Default to primary master administrator João Pedro Mola Oliveira
  const users = db.getUsers();
  const jp = users.find(u => u.email.toLowerCase() === 'joaopedromolaoliveira800@gmail.com');
  if (jp) return jp.id;
  const anyAdmin = users.find(u => u.role === 'ADMIN');
  return anyAdmin?.id || users[0]?.id || 'usr-admin-joaopedro';
}

// ----------------------------------------------------
// AUTHENTICATION & USER ROUTES
// ----------------------------------------------------

app.get('/api/auth/me', (req, res) => {
  const userId = getAuthenticatedUserId(req);
  const user = db.getUserById(userId);
  if (!user) return res.status(401).json({ error: 'Não autenticado' });

  const subscription = db.getUserSubscription(userId);
  const oauthConn = db.getOAuthConnection(userId);
  const selectedAccount = db.getSelectedAccount(userId);

  res.json({
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      avatarUrl: user.avatarUrl,
    },
    subscription,
    googleAdsConnected: !!(oauthConn && oauthConn.isConnected),
    selectedAccount,
  });
});

app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body;
  if (!email) return res.status(400).json({ error: 'E-mail é obrigatório' });

  const isSpecialAdmin = 
    email.toLowerCase() === 'joaopedromolaoliveira800@gmail.com' ||
    email.toLowerCase() === 'localboostoficial.site@gmail.com' ||
    email.toLowerCase().includes('admin');

  let user = db.getUserByEmail(email);
  if (!user) {
    // If not found, create seamless initial user
    user = db.createUser({
      email,
      name: email.toLowerCase() === 'joaopedromolaoliveira800@gmail.com'
        ? 'João Pedro Mola Oliveira'
        : email.split('@')[0],
      role: isSpecialAdmin ? 'ADMIN' : 'USER',
    });
  } else if (isSpecialAdmin && user.role !== 'ADMIN') {
    db.updateUser(user.id, { role: 'ADMIN' });
    user.role = 'ADMIN';
  }

  res.json({
    token: user.id,
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
    },
  });
});

app.post('/api/auth/register', (req, res) => {
  const { name, email, password } = req.body;
  if (!email || !name) return res.status(400).json({ error: 'Nome e e-mail são obrigatórios' });

  const existing = db.getUserByEmail(email);
  if (existing) {
    return res.status(400).json({ error: 'Já existe uma conta com este e-mail' });
  }

  const user = db.createUser({
    name,
    email,
    role: 'USER',
  });

  res.json({
    token: user.id,
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
    },
  });
});

// ----------------------------------------------------
// GOOGLE ADS OAUTH & INTEGRATIONS ROUTES
// ----------------------------------------------------

function getAppRedirectUri(req: express.Request, clientRedirectUri?: string): string {
  if (clientRedirectUri && clientRedirectUri.startsWith('http')) {
    return clientRedirectUri;
  }
  const proto = (req.headers['x-forwarded-proto'] as string) || req.protocol || 'https';
  const host = (req.headers['x-forwarded-host'] as string) || req.get('host') || 'localhost:3000';
  const autoRedirectUri = `${proto}://${host}/auth/callback`;

  // Use GOOGLE_REDIRECT_URI if it explicitly includes /auth/callback
  if (process.env.GOOGLE_REDIRECT_URI && process.env.GOOGLE_REDIRECT_URI.includes('/auth/callback')) {
    return process.env.GOOGLE_REDIRECT_URI;
  }
  return autoRedirectUri;
}

app.get('/api/integrations/google-ads/status', (req, res) => {
  const userId = getAuthenticatedUserId(req);
  const config = getGoogleAdsConfig();
  const check = isGoogleAdsConfigured();
  const oauthConn = db.getOAuthConnection(userId);
  const accounts = db.getAccountsByUserId(userId);
  const selectedAccount = db.getSelectedAccount(userId);

  const redirectUri = getAppRedirectUri(req);
  const rawClientId = config.clientId?.trim() || '';
  const isClientIdValidFormat = rawClientId ? rawClientId.includes('.apps.googleusercontent.com') : false;
  const clientIdFormatWarning = rawClientId && !isClientIdValidFormat
    ? `O Client ID configurado ("${rawClientId}") parece ser o ID do Projeto GCP e não um ID de cliente OAuth 2.0. Um Client ID válido termina com ".apps.googleusercontent.com".`
    : undefined;

  res.json({
    isConfigured: check.configured,
    missingEnvVars: check.missing,
    developerToken: config.developerToken ? '••••••••' + config.developerToken.slice(-4) : '',
    hasDeveloperToken: !!config.developerToken,
    clientIdConfigured: !!config.clientId,
    clientSecretConfigured: !!config.clientSecret,
    clientIdSample: rawClientId ? (rawClientId.length > 30 ? rawClientId.substring(0, 16) + '...' + rawClientId.slice(-12) : rawClientId) : '',
    isClientIdValidFormat,
    clientIdFormatWarning,
    redirectUri,
    isConnected: !!(oauthConn && oauthConn.isConnected),
    googleEmail: oauthConn?.googleEmail,
    lastSyncedAt: oauthConn?.lastSyncedAt,
    accounts,
    selectedAccount,
  });
});

// Update custom Google Ads credentials in database
app.post('/api/integrations/google-ads/config', (req, res) => {
  const { clientId, clientSecret, developerToken } = req.body;
  const updated = db.saveSystemConfig({ clientId, clientSecret, developerToken });
  res.json({ success: true, config: updated });
});

// OAuth authorization URL generation
app.get('/api/auth/google/url', (req, res) => {
  const config = getGoogleAdsConfig();
  const rawClientId = config.clientId?.trim() || '';
  const clientRedirect = req.query.redirect_uri as string | undefined;
  const redirectUri = getAppRedirectUri(req, clientRedirect);

  if (!rawClientId) {
    return res.json({
      configured: false,
      error: 'GOOGLE_CLIENT_ID não configurado. Por favor, adicione as credenciais no painel de configurações.',
    });
  }

  const isClientIdValidFormat = rawClientId.includes('.apps.googleusercontent.com');

  const params = new URLSearchParams({
    client_id: rawClientId,
    redirect_uri: redirectUri,
    response_type: 'code',
    scope: 'https://www.googleapis.com/auth/adwords openid email profile',
    access_type: 'offline',
    prompt: 'consent',
  });

  const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
  res.json({
    configured: true,
    url: authUrl,
    redirectUri,
    isClientIdValidFormat,
    currentValue: rawClientId,
    warning: !isClientIdValidFormat
      ? `O GOOGLE_CLIENT_ID atual ("${rawClientId}") parece ser o ID do Projeto GCP e não o ID do Cliente OAuth 2.0. No Google Cloud Console, crie/copie o "ID do cliente OAuth 2.0" (que termina com .apps.googleusercontent.com).`
      : undefined,
  });
});

// OAuth popup callback endpoint
app.get(['/auth/callback', '/auth/callback/'], async (req, res) => {
  const { code, error } = req.query;

  if (error) {
    return res.send(`
      <!DOCTYPE html>
      <html>
        <head><meta charset="UTF-8"><title>Erro de Autenticação</title></head>
        <body style="font-family: system-ui; background: #020617; color: #f8fafc; display: flex; align-items: center; justify-content: center; height: 100vh; margin: 0;">
          <div style="background: #0f172a; padding: 32px; border-radius: 12px; border: 1px solid #ef4444; max-width: 420px; text-align: center;">
            <h3 style="color: #ef4444; margin-top: 0;">Falha na Autorização</h3>
            <p style="color: #94a3b8; font-size: 14px;">O Google retornou o erro: <strong>${error}</strong></p>
            <script>
              if (window.opener) {
                window.opener.postMessage({ type: 'OAUTH_AUTH_ERROR', error: "${error}" }, '*');
                setTimeout(() => window.close(), 3000);
              }
            </script>
          </div>
        </body>
      </html>
    `);
  }

  if (!code) {
    return res.send(`
      <!DOCTYPE html>
      <html>
        <body style="font-family: system-ui; background: #020617; color: #f8fafc; padding: 20px;">
          <p>Nenhum código de autorização recebido.</p>
        </body>
      </html>
    `);
  }

  res.send(`
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="UTF-8">
        <title>Google Ads Conectado - DivulgadorAds</title>
      </head>
      <body style="font-family: system-ui; background: #020617; color: #f8fafc; display: flex; align-items: center; justify-content: center; height: 100vh; margin: 0;">
        <div style="background: #0f172a; padding: 32px; border-radius: 12px; border: 1px solid #334155; max-width: 440px; text-align: center; box-shadow: 0 10px 25px rgba(0,0,0,0.5);">
          <div style="width: 48px; height: 48px; border-radius: 50%; background: #0284c7; margin: 0 auto 16px; display: flex; align-items: center; justify-content: center;">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6L9 17l-5-5"/></svg>
          </div>
          <h2 style="font-size: 20px; margin: 0 0 8px 0; font-weight: 700;">Conta Autorizada!</h2>
          <p style="color: #94a3b8; font-size: 14px; margin: 0 0 20px 0;">Finalizando conexão segura com a Google Ads API...</p>
          <div style="font-size: 12px; color: #64748b;">Esta janela será fechada automaticamente.</div>
        </div>
        <script>
          if (window.opener) {
            window.opener.postMessage({ type: 'OAUTH_AUTH_SUCCESS', code: "${code}" }, '*');
            setTimeout(() => { window.close(); }, 1200);
          } else {
            window.location.href = '/integrations/google-ads';
          }
        </script>
      </body>
    </html>
  `);
});

// Exchange code sent from client
app.post('/api/auth/google/exchange', async (req, res) => {
  const userId = getAuthenticatedUserId(req);
  const { code, redirectUri } = req.body;

  if (!code) {
    return res.status(400).json({ error: 'Código de autorização ausente' });
  }

  try {
    const tokens = await exchangeOAuthCode(code, redirectUri);
    const expiryDate = new Date(Date.now() + (tokens.expiresIn || 3600) * 1000).toISOString();

    const connection = db.saveOAuthConnection({
      userId,
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
      tokenExpiry: expiryDate,
      scope: tokens.scope,
      googleEmail: tokens.googleEmail,
      isConnected: true,
      lastSyncedAt: new Date().toISOString(),
    });

    // Query accessible customers via Google Ads API v18
    let accountsFound: any[] = [];
    try {
      const listRes = await listAccessibleAccounts(tokens.accessToken, userId);
      if (listRes.success && listRes.data?.resourceNames) {
        for (const resName of listRes.data.resourceNames) {
          // format: customers/1234567890
          const customerId = resName.replace('customers/', '');
          // Query details
          const detailsRes = await getCustomerDetails(tokens.accessToken, customerId, userId);
          const cust = detailsRes.data?.results?.[0]?.customer;

          const savedAcc = db.upsertGoogleAdsAccount({
            userId,
            customerId: formatCustomerId(customerId),
            descriptiveName: cust?.descriptiveName || `Conta Google Ads (${formatCustomerId(customerId)})`,
            currencyCode: cust?.currencyCode || 'BRL',
            timeZone: cust?.timeZone || 'America/Sao_Paulo',
            status: cust?.status || 'ENABLED',
            isTestAccount: cust?.testAccount ?? false,
            isSelected: accountsFound.length === 0,
          });
          accountsFound.push(savedAcc);
        }
      }
    } catch (apiErr) {
      console.warn('Could not auto-list Google Ads accounts:', apiErr);
    }

    res.json({
      success: true,
      googleEmail: tokens.googleEmail,
      accounts: db.getAccountsByUserId(userId),
      selectedAccount: db.getSelectedAccount(userId),
    });
  } catch (err: any) {
    console.error('Error exchanging Google OAuth code:', err);
    res.status(500).json({ error: err.message || 'Falha ao trocar código pelo token do Google' });
  }
});

// Select active Google Ads account
app.post('/api/google-ads/accounts/select', (req, res) => {
  const userId = getAuthenticatedUserId(req);
  const { accountId } = req.body;
  if (!accountId) return res.status(400).json({ error: 'accountId é obrigatório' });

  const selected = db.setSelectedAccount(userId, accountId);
  res.json({ success: true, selectedAccount: selected });
});

// Add / connect a Google Ads account manually (useful for Test Accounts / Client Accounts)
app.post('/api/google-ads/accounts/connect-account', (req, res) => {
  const userId = getAuthenticatedUserId(req);
  const { customerId, descriptiveName, currencyCode, timeZone, isTestAccount } = req.body;

  if (!customerId || !descriptiveName) {
    return res.status(400).json({ error: 'Customer ID e Nome da conta são obrigatórios' });
  }

  const cleaned = cleanCustomerId(customerId);
  if (cleaned.length !== 10) {
    return res.status(400).json({ error: 'Customer ID deve conter exatamente 10 dígitos numéricos (ex: 123-456-7890)' });
  }

  const formatted = formatCustomerId(cleaned);
  const account = db.upsertGoogleAdsAccount({
    userId,
    customerId: formatted,
    descriptiveName: descriptiveName.trim(),
    currencyCode: currencyCode || 'BRL',
    timeZone: timeZone || 'America/Sao_Paulo',
    status: 'ENABLED',
    isTestAccount: !!isTestAccount,
    isSelected: true,
  });

  res.json({ success: true, account });
});

// Sync accounts using official Google Ads API
app.post('/api/google-ads/accounts/sync', async (req, res) => {
  const userId = getAuthenticatedUserId(req);
  const conn = db.getOAuthConnection(userId);

  if (!conn || !conn.isConnected) {
    return res.status(400).json({
      success: false,
      error: 'Integração não configurada. Conecte sua conta Google Ads via OAuth primeiro.',
    });
  }

  let token = conn.accessToken;
  // Refresh token if needed
  if (new Date(conn.tokenExpiry).getTime() <= Date.now() + 60000 && conn.refreshToken) {
    try {
      token = await refreshAccessToken(conn.refreshToken);
      db.saveOAuthConnection({ ...conn, accessToken: token, tokenExpiry: new Date(Date.now() + 3600000).toISOString() });
    } catch (e: any) {
      return res.status(401).json({ success: false, error: 'Token expirado. Reconecte sua conta Google Ads.' });
    }
  }

  const listRes = await listAccessibleAccounts(token, userId);
  if (!listRes.success) {
    return res.status(400).json({
      success: false,
      error: listRes.error || 'Não foi possível consultar as contas acessíveis na Google Ads API.',
      errorDetails: listRes.errorDetails,
      requestId: listRes.requestId,
    });
  }

  const syncedAccounts: any[] = [];
  if (listRes.data?.resourceNames) {
    for (const resName of listRes.data.resourceNames) {
      const customerId = resName.replace('customers/', '');
      const detailsRes = await getCustomerDetails(token, customerId, userId);
      const cust = detailsRes.data?.results?.[0]?.customer;

      const acc = db.upsertGoogleAdsAccount({
        userId,
        customerId: formatCustomerId(customerId),
        descriptiveName: cust?.descriptiveName || `Conta Google Ads (${formatCustomerId(customerId)})`,
        currencyCode: cust?.currencyCode || 'BRL',
        timeZone: cust?.timeZone || 'America/Sao_Paulo',
        status: cust?.status || 'ENABLED',
        isTestAccount: cust?.testAccount ?? false,
        isSelected: syncedAccounts.length === 0,
      });
      syncedAccounts.push(acc);
    }
  }

  res.json({
    success: true,
    accounts: db.getAccountsByUserId(userId),
    selectedAccount: db.getSelectedAccount(userId),
  });
});

// ----------------------------------------------------
// AI GENERATOR ROUTE
// ----------------------------------------------------

app.post('/api/ai/generate-ad', async (req, res) => {
  const { empresa, produto, servico, publico, diferencial, site } = req.body;

  if (!empresa || !publico || !diferencial || !site) {
    return res.status(400).json({
      error: 'Preencha Empresa, Público-Alvo, Diferencial e Site para gerar com IA.',
    });
  }

  try {
    const result = await generateAdWithAi({
      empresa,
      produto,
      servico,
      publico,
      diferencial,
      site,
    });

    res.json({ success: true, data: result });
  } catch (err: any) {
    console.error('AI Generator Error:', err);
    res.status(500).json({
      success: false,
      error: err.message || 'Erro ao gerar anúncios com inteligência artificial.',
    });
  }
});

// ----------------------------------------------------
// CAMPAIGNS & PUBLICATION ROUTES
// ----------------------------------------------------

// Get user campaigns
app.get('/api/campaigns', (req, res) => {
  const userId = getAuthenticatedUserId(req);
  const selectedAccount = db.getSelectedAccount(userId);
  const campaigns = db.getCampaigns(userId, selectedAccount?.id);
  res.json({ campaigns });
});

// Get single campaign details
app.get('/api/campaigns/:id', (req, res) => {
  const campaign = db.getCampaignById(req.params.id);
  if (!campaign) return res.status(404).json({ error: 'Campanha não encontrada' });
  res.json({ campaign });
});

// Official Publication Route
app.post('/api/campaigns/publish', async (req, res) => {
  const userId = getAuthenticatedUserId(req);
  const {
    objective,
    name,
    targetUrl,
    locationTarget,
    dailyBudget,
    keywords,
    negativeKeywords,
    headlines,
    descriptions,
  } = req.body;

  // 1. Rigorous Validation
  if (!name || !targetUrl || !dailyBudget) {
    return res.status(400).json({
      success: false,
      error: 'Campos obrigatórios ausentes: Nome, URL final ou Orçamento diário.',
    });
  }

  if (Number(dailyBudget) < 5) {
    return res.status(400).json({
      success: false,
      error: 'O orçamento mínimo aceito pelo Google Ads é de R$ 5,00/dia.',
    });
  }

  // 2. Integration check
  const config = getGoogleAdsConfig();
  const oauthConn = db.getOAuthConnection(userId);
  const selectedAccount = db.getSelectedAccount(userId);

  if (!oauthConn || !oauthConn.isConnected || !oauthConn.accessToken) {
    return res.status(400).json({
      success: false,
      error: 'Integração não configurada.',
      details: 'Você precisa conectar sua conta Google Ads através de "Integrações" antes de poder publicar campanhas reais.',
      requiresIntegration: true,
    });
  }

  if (!selectedAccount) {
    return res.status(400).json({
      success: false,
      error: 'Nenhuma conta Google Ads selecionada.',
      details: 'Selecione a conta de anúncios de destino na tela de integrações.',
      requiresAccount: true,
    });
  }

  // Refresh token if needed
  let accessToken = oauthConn.accessToken;
  if (new Date(oauthConn.tokenExpiry).getTime() <= Date.now() + 60000 && oauthConn.refreshToken) {
    try {
      accessToken = await refreshAccessToken(oauthConn.refreshToken);
      db.saveOAuthConnection({
        ...oauthConn,
        accessToken,
        tokenExpiry: new Date(Date.now() + 3600000).toISOString(),
      });
    } catch (e: any) {
      return res.status(401).json({
        success: false,
        error: 'Sessão do Google Ads expirada. Reconecte sua conta nas Integrações.',
      });
    }
  }

  // 3. Call Official Google Ads API v18 Publication Flow
  // Sequence: Budget -> Campaign (PAUSED) -> Ad Group -> Keywords -> Responsive Search Ad
  const publishResult = await publishCampaignOfficial({
    userId,
    accessToken,
    customerId: selectedAccount.customerId,
    campaignName: name,
    dailyBudget: Number(dailyBudget),
    targetUrl,
    locationTarget: locationTarget || 'Brasil',
    keywords: Array.isArray(keywords) ? keywords : [],
    negativeKeywords: Array.isArray(negativeKeywords) ? negativeKeywords : [],
    headlines: Array.isArray(headlines) ? headlines : [],
    descriptions: Array.isArray(descriptions) ? descriptions : [],
  });

  if (!publishResult.success) {
    return res.status(400).json({
      success: false,
      error: 'Não foi possível publicar sua campanha.',
      googleMessage: publishResult.error,
      errorDetails: publishResult.errorDetails,
      requestId: publishResult.requestId,
    });
  }

  // 4. Save confirmed IDs into local database
  const budgetMicros = (Math.round(Number(dailyBudget) * 100) * 10000).toString();
  const savedBudget = db.createBudget({
    googleBudgetId: publishResult.googleBudgetId,
    amountMicros: budgetMicros,
    dailyAmount: Number(dailyBudget),
    deliveryMethod: 'STANDARD',
  });

  const savedCampaign = db.createCampaign({
    userId,
    googleAdsAccountId: selectedAccount.id,
    budgetId: savedBudget.id,
    googleCampaignId: publishResult.googleCampaignId,
    name,
    objective: objective || 'GET_CLIENTS',
    targetUrl,
    locationTarget: locationTarget || 'Brasil',
    status: 'PAUSED', // Always PAUSED initially for safety
    servingStatus: 'PAUSED',
    advertisingChannel: 'SEARCH',
  });

  const savedAdGroup = db.createAdGroup({
    campaignId: savedCampaign.id,
    googleAdGroupId: publishResult.googleAdGroupId,
    name: `Grupo Principal - ${name}`,
    status: 'ENABLED',
    cpcBidMicros: '1500000',
  });

  if (Array.isArray(keywords) && keywords.length > 0) {
    db.addKeywords(savedAdGroup.id, keywords);
  }

  if (Array.isArray(negativeKeywords) && negativeKeywords.length > 0) {
    db.addNegativeKeywords(savedAdGroup.id, negativeKeywords.map((k: string) => ({ text: k, matchType: 'BROAD' })));
  }

  db.createAd({
    adGroupId: savedAdGroup.id,
    googleAdId: publishResult.googleAdId,
    type: 'RESPONSIVE_SEARCH_AD',
    finalUrls: [targetUrl],
    headlines: headlines || [],
    descriptions: descriptions || [],
    status: 'ENABLED',
  });

  res.json({
    success: true,
    message: 'Campanha criada com sucesso no Google Ads!',
    campaign: db.getCampaignById(savedCampaign.id),
    googleCampaignId: publishResult.googleCampaignId,
    status: 'PAUSED',
    requestId: publishResult.requestId,
  });
});

// Update campaign status (PAUSE or ENABLE via official Google Ads API)
app.post('/api/campaigns/:id/status', async (req, res) => {
  const userId = getAuthenticatedUserId(req);
  const { id } = req.params;
  const { status } = req.body;

  if (status !== 'ENABLED' && status !== 'PAUSED') {
    return res.status(400).json({ error: 'Status deve ser ENABLED ou PAUSED' });
  }

  const campaign = db.getCampaignById(id);
  if (!campaign) return res.status(404).json({ error: 'Campanha não encontrada' });

  const oauthConn = db.getOAuthConnection(userId);
  const account = campaign.googleAdsAccount || db.getSelectedAccount(userId);

  if (campaign.googleCampaignId && oauthConn && oauthConn.accessToken && account) {
    let accessToken = oauthConn.accessToken;
    if (new Date(oauthConn.tokenExpiry).getTime() <= Date.now() + 60000 && oauthConn.refreshToken) {
      try {
        accessToken = await refreshAccessToken(oauthConn.refreshToken);
      } catch (e) {
        console.warn('Could not refresh token for status update:', e);
      }
    }

    const apiRes = await updateCampaignStatusOfficial({
      userId,
      accessToken,
      customerId: account.customerId,
      googleCampaignId: campaign.googleCampaignId,
      status,
    });

    if (!apiRes.success) {
      return res.status(400).json({
        success: false,
        error: `Não foi possível alterar o status no Google Ads: ${apiRes.error}`,
        errorDetails: apiRes.errorDetails,
      });
    }
  }

  // Update in database
  const updated = db.updateCampaign(id, {
    status,
    servingStatus: status,
  });

  res.json({ success: true, campaign: updated });
});

// ----------------------------------------------------
// METRICS & REPORTS ROUTE (Official Google Ads API)
// ----------------------------------------------------

app.get('/api/reports', async (req, res) => {
  const userId = getAuthenticatedUserId(req);
  const { range = 'LAST_30_DAYS' } = req.query;

  const validRanges = ['TODAY', 'LAST_7_DAYS', 'LAST_30_DAYS', 'LAST_90_DAYS'];
  const dateRange = validRanges.includes(String(range)) ? (range as any) : 'LAST_30_DAYS';

  const oauthConn = db.getOAuthConnection(userId);
  const selectedAccount = db.getSelectedAccount(userId);

  if (!oauthConn || !oauthConn.isConnected || !selectedAccount) {
    return res.json({
      connected: false,
      message: 'Integração com Google Ads não conectada.',
      metricsSummary: {
        investment: 0,
        impressions: 0,
        clicks: 0,
        ctr: 0,
        averageCpc: 0,
        conversions: 0,
        costPerConversion: 0,
      },
      chartData: [],
      campaignsList: [],
    });
  }

  let accessToken = oauthConn.accessToken;
  if (new Date(oauthConn.tokenExpiry).getTime() <= Date.now() + 60000 && oauthConn.refreshToken) {
    try {
      accessToken = await refreshAccessToken(oauthConn.refreshToken);
    } catch (e) {
      console.warn('Token refresh error in reports:', e);
    }
  }

  const apiRes = await fetchGoogleAdsCampaignMetrics({
    userId,
    accessToken,
    customerId: selectedAccount.customerId,
    dateRange,
  });

  if (!apiRes.success) {
    return res.json({
      connected: true,
      apiError: apiRes.error,
      requestId: apiRes.requestId,
      metricsSummary: {
        investment: 0,
        impressions: 0,
        clicks: 0,
        ctr: 0,
        averageCpc: 0,
        conversions: 0,
        costPerConversion: 0,
      },
      chartData: [],
      campaignsList: [],
    });
  }

  // Process real GAQL rows
  const rows = apiRes.data?.results || [];
  let totalCostMicros = 0;
  let totalImpressions = 0;
  let totalClicks = 0;
  let totalConversions = 0;

  const dateMap: Record<string, { date: string; cost: number; clicks: number; impressions: number; conversions: number }> = {};
  const campaignMap: Record<string, any> = {};

  for (const row of rows) {
    const cost = Number(row.metrics?.costMicros || 0) / 1000000;
    const clicks = Number(row.metrics?.clicks || 0);
    const impressions = Number(row.metrics?.impressions || 0);
    const conversions = Number(row.metrics?.conversions || 0);
    const date = row.segments?.date || 'Hoje';

    totalCostMicros += Number(row.metrics?.costMicros || 0);
    totalImpressions += impressions;
    totalClicks += clicks;
    totalConversions += conversions;

    if (!dateMap[date]) {
      dateMap[date] = { date, cost: 0, clicks: 0, impressions: 0, conversions: 0 };
    }
    dateMap[date].cost += cost;
    dateMap[date].clicks += clicks;
    dateMap[date].impressions += impressions;
    dateMap[date].conversions += conversions;

    const campId = row.campaign?.id;
    if (campId) {
      if (!campaignMap[campId]) {
        campaignMap[campId] = {
          id: campId,
          name: row.campaign?.name || `Campanha ${campId}`,
          status: row.campaign?.status || 'UNKNOWN',
          cost: 0,
          clicks: 0,
          impressions: 0,
          conversions: 0,
        };
      }
      campaignMap[campId].cost += cost;
      campaignMap[campId].clicks += clicks;
      campaignMap[campId].impressions += impressions;
      campaignMap[campId].conversions += conversions;
    }
  }

  const totalCost = totalCostMicros / 1000000;
  const ctr = totalImpressions > 0 ? (totalClicks / totalImpressions) * 100 : 0;
  const avgCpc = totalClicks > 0 ? totalCost / totalClicks : 0;
  const cpa = totalConversions > 0 ? totalCost / totalConversions : 0;

  const chartData = Object.values(dateMap).sort((a, b) => a.date.localeCompare(b.date));
  const campaignsList = Object.values(campaignMap).map(c => ({
    ...c,
    ctr: c.impressions > 0 ? (c.clicks / c.impressions) * 100 : 0,
    averageCpc: c.clicks > 0 ? c.cost / c.clicks : 0,
    cpa: c.conversions > 0 ? c.cost / c.conversions : 0,
  }));

  res.json({
    connected: true,
    account: selectedAccount,
    metricsSummary: {
      investment: totalCost,
      impressions: totalImpressions,
      clicks: totalClicks,
      ctr,
      averageCpc: avgCpc,
      conversions: totalConversions,
      costPerConversion: cpa,
    },
    chartData,
    campaignsList,
  });
});

// ----------------------------------------------------
// PLANS & SUBSCRIPTIONS
// ----------------------------------------------------

app.get('/api/plans', (req, res) => {
  res.json({ plans: db.getPlans() });
});

app.post('/api/subscription/change', (req, res) => {
  const userId = getAuthenticatedUserId(req);
  const { planSlug } = req.body;
  if (!planSlug) return res.status(400).json({ error: 'planSlug é obrigatório' });

  const sub = db.setUserPlan(userId, planSlug);
  res.json({ success: true, subscription: sub });
});

// ----------------------------------------------------
// ADMIN DASHBOARD & LOGS
// ----------------------------------------------------

app.get('/api/admin/overview', (req, res) => {
  const userId = getAuthenticatedUserId(req);
  const user = db.getUserById(userId);

  // Require admin role
  if (user && user.role !== 'ADMIN') {
    return res.status(403).json({ error: 'Acesso restrito para administradores.' });
  }

  const stats = db.getAdminStats();
  const logs = db.getApiLogs(50);
  const users = db.getUsers().map(u => ({
    id: u.id,
    name: u.name,
    email: u.email,
    role: u.role,
    createdAt: u.createdAt,
  }));

  res.json({
    stats,
    logs,
    users,
    plans: db.getPlans(),
  });
});

app.post('/api/admin/users/:id/role', (req, res) => {
  const adminId = getAuthenticatedUserId(req);
  const admin = db.getUserById(adminId);
  if (admin && admin.role !== 'ADMIN') {
    return res.status(403).json({ error: 'Acesso restrito para administradores.' });
  }

  const { id } = req.params;
  const { role } = req.body;
  if (role !== 'USER' && role !== 'ADMIN') {
    return res.status(400).json({ error: 'Função inválida. Use USER ou ADMIN.' });
  }

  const updated = db.setUserRole(id, role);
  if (!updated) {
    return res.status(404).json({ error: 'Usuário não encontrado.' });
  }

  res.json({ success: true, user: updated });
});

app.post('/api/admin/users/promote', (req, res) => {
  const adminId = getAuthenticatedUserId(req);
  const admin = db.getUserById(adminId);
  if (admin && admin.role !== 'ADMIN') {
    return res.status(403).json({ error: 'Acesso restrito para administradores.' });
  }

  const { email, role = 'ADMIN' } = req.body;
  if (!email) {
    return res.status(400).json({ error: 'E-mail é obrigatório.' });
  }

  const promoted = db.promoteUserByEmail(email, role);
  res.json({ success: true, user: promoted });
});

// ----------------------------------------------------
// SERVER START & VITE MIDDLEWARE
// ----------------------------------------------------

async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`DivulgadorAds Server listening on http://0.0.0.0:${PORT}`);
  });
}

startServer();
