import {
  User,
  GoogleAdsStatus,
  GoogleAdsAccount,
  Campaign,
  MetricsSummary,
  ChartDataPoint,
  Plan,
  Subscription,
  ApiLog,
  GeneratedAdCopy,
} from '../types';

const API_BASE = '/api';

function getAuthHeader(): Record<string, string> {
  const token = localStorage.getItem('divulgador_token');
  return token ? { Authorization: `Bearer ${token}` } : {};
}

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const res = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeader(),
      ...(options.headers || {}),
    },
  });

  const data = await res.json();
  if (!res.ok) {
    const errorMsg = data.error || data.message || `Erro HTTP ${res.status}`;
    const err: any = new Error(errorMsg);
    err.status = res.status;
    err.data = data;
    throw err;
  }
  return data as T;
}

export const api = {
  // Auth
  async getMe(): Promise<{ user: User; subscription: Subscription; googleAdsConnected: boolean; selectedAccount: GoogleAdsAccount | null }> {
    return request('/auth/me');
  },

  async login(email: string, password?: string): Promise<{ token: string; user: User }> {
    const data = await request<{ token: string; user: User }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    localStorage.setItem('divulgador_token', data.token);
    return data;
  },

  async register(name: string, email: string, password?: string): Promise<{ token: string; user: User }> {
    const data = await request<{ token: string; user: User }>('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ name, email, password }),
    });
    localStorage.setItem('divulgador_token', data.token);
    return data;
  },

  logout(): void {
    localStorage.removeItem('divulgador_token');
  },

  // Google Ads Integration
  async getGoogleAdsStatus(): Promise<GoogleAdsStatus> {
    return request('/integrations/google-ads/status');
  },

  async getGoogleOAuthUrl(redirectUri?: string): Promise<{
    configured: boolean;
    url?: string;
    redirectUri?: string;
    error?: string;
    invalidFormat?: boolean;
    isClientIdValidFormat?: boolean;
    currentValue?: string;
    warning?: string;
  }> {
    const query = redirectUri ? `?redirect_uri=${encodeURIComponent(redirectUri)}` : '';
    return request(`/auth/google/url${query}`);
  },

  async updateGoogleAdsConfig(config: {
    clientId?: string;
    clientSecret?: string;
    developerToken?: string;
  }): Promise<{ success: boolean; config: any }> {
    return request('/integrations/google-ads/config', {
      method: 'POST',
      body: JSON.stringify(config),
    });
  },

  async exchangeOAuthCode(code: string, redirectUri: string): Promise<any> {
    return request('/auth/google/exchange', {
      method: 'POST',
      body: JSON.stringify({ code, redirectUri }),
    });
  },

  async selectAccount(accountId: string): Promise<{ success: boolean; selectedAccount: GoogleAdsAccount }> {
    return request('/google-ads/accounts/select', {
      method: 'POST',
      body: JSON.stringify({ accountId }),
    });
  },

  async connectManualAccount(account: {
    customerId: string;
    descriptiveName: string;
    currencyCode?: string;
    timeZone?: string;
    isTestAccount?: boolean;
  }): Promise<{ success: boolean; account: GoogleAdsAccount }> {
    return request('/google-ads/accounts/connect-account', {
      method: 'POST',
      body: JSON.stringify(account),
    });
  },

  async syncAccounts(): Promise<{ success: boolean; accounts: GoogleAdsAccount[]; selectedAccount: GoogleAdsAccount | null }> {
    return request('/google-ads/accounts/sync', {
      method: 'POST',
    });
  },

  // Campaigns
  async getCampaigns(): Promise<{ campaigns: Campaign[] }> {
    return request('/campaigns');
  },

  async getCampaign(id: string): Promise<{ campaign: Campaign }> {
    return request(`/campaigns/${id}`);
  },

  async publishCampaign(campaignData: {
    objective: string;
    name: string;
    targetUrl: string;
    locationTarget: string;
    dailyBudget: number;
    keywords: Array<{ text: string; matchType: 'BROAD' | 'PHRASE' | 'EXACT' }>;
    negativeKeywords: string[];
    headlines: string[];
    descriptions: string[];
  }): Promise<{
    success: boolean;
    message: string;
    campaign: Campaign;
    googleCampaignId?: string;
    status: string;
    requestId?: string;
    error?: string;
    googleMessage?: string;
  }> {
    return request('/campaigns/publish', {
      method: 'POST',
      body: JSON.stringify(campaignData),
    });
  },

  async updateCampaignStatus(id: string, status: 'ENABLED' | 'PAUSED'): Promise<{ success: boolean; campaign: Campaign }> {
    return request(`/campaigns/${id}/status`, {
      method: 'POST',
      body: JSON.stringify({ status }),
    });
  },

  // Reports
  async getReports(range: 'TODAY' | 'LAST_7_DAYS' | 'LAST_30_DAYS' | 'LAST_90_DAYS' = 'LAST_30_DAYS'): Promise<{
    connected: boolean;
    apiError?: string;
    requestId?: string;
    account?: GoogleAdsAccount;
    metricsSummary: MetricsSummary;
    chartData: ChartDataPoint[];
    campaignsList: Array<{
      id: string;
      name: string;
      status: string;
      cost: number;
      clicks: number;
      impressions: number;
      conversions: number;
      ctr: number;
      averageCpc: number;
      cpa: number;
    }>;
  }> {
    return request(`/reports?range=${range}`);
  },

  // AI Generator
  async generateAdWithAi(input: {
    empresa: string;
    produto?: string;
    servico?: string;
    publico: string;
    diferencial: string;
    site: string;
  }): Promise<{ success: boolean; data: GeneratedAdCopy }> {
    return request('/ai/generate-ad', {
      method: 'POST',
      body: JSON.stringify(input),
    });
  },

  // Plans & Admin
  async getPlans(): Promise<{ plans: Plan[] }> {
    return request('/plans');
  },

  async changeSubscription(planSlug: 'free' | 'pro' | 'agency'): Promise<{ success: boolean; subscription: Subscription }> {
    return request('/subscription/change', {
      method: 'POST',
      body: JSON.stringify({ planSlug }),
    });
  },

  async getAdminOverview(): Promise<{
    stats: {
      totalUsers: number;
      totalConnectedAccounts: number;
      totalCampaigns: number;
      activeCampaigns: number;
      pausedCampaigns: number;
      totalApiLogs: number;
      apiErrorsCount: number;
      plansCount: number;
      subscriptionsCount: number;
    };
    logs: ApiLog[];
    users: User[];
    plans: Plan[];
  }> {
    return request('/admin/overview');
  },

  async updateUserRole(userId: string, role: 'USER' | 'ADMIN'): Promise<{ success: boolean; user: User }> {
    return request(`/admin/users/${userId}/role`, {
      method: 'POST',
      body: JSON.stringify({ role }),
    });
  },

  async promoteUserByEmail(email: string, role: 'USER' | 'ADMIN' = 'ADMIN'): Promise<{ success: boolean; user: User }> {
    return request('/admin/users/promote', {
      method: 'POST',
      body: JSON.stringify({ email, role }),
    });
  },
};
