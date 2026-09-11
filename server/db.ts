import fs from 'fs';
import path from 'path';

// Types matching Prisma Schema
export interface User {
  id: string;
  email: string;
  name: string;
  passwordHash?: string;
  role: 'USER' | 'ADMIN';
  googleId?: string;
  avatarUrl?: string;
  createdAt: string;
  updatedAt: string;
}

export interface GoogleOAuthConnection {
  id: string;
  userId: string;
  accessToken: string;
  refreshToken: string;
  tokenExpiry: string;
  scope: string;
  googleEmail?: string;
  isConnected: boolean;
  lastSyncedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface GoogleAdsAccount {
  id: string;
  userId: string;
  customerId: string; // e.g. 123-456-7890
  descriptiveName: string;
  currencyCode: string; // BRL, USD, EUR
  timeZone: string; // America/Sao_Paulo
  status: string; // ENABLED, SUSPENDED, CANCELLED
  isTestAccount: boolean;
  isSelected: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CampaignBudget {
  id: string;
  googleBudgetId?: string;
  amountMicros: string; // string representation of BigInt (e.g. 20000000)
  dailyAmount: number; // e.g. 20.00
  deliveryMethod: string;
  createdAt: string;
  updatedAt: string;
}

export type CampaignObjective = 'SELL_PRODUCTS' | 'GET_CLIENTS' | 'LEADS' | 'WEBSITE_VISITS' | 'BRAND_AWARENESS';
export type CampaignStatus = 'ENABLED' | 'PAUSED' | 'REMOVED';
export type KeywordMatchType = 'EXACT' | 'PHRASE' | 'BROAD';

export interface Campaign {
  id: string;
  userId: string;
  googleAdsAccountId: string;
  budgetId: string;
  googleCampaignId?: string; // Google Ads ID
  name: string;
  objective: CampaignObjective;
  targetUrl: string;
  locationTarget: string;
  status: CampaignStatus;
  servingStatus?: string;
  advertisingChannel: string;
  createdAt: string;
  updatedAt: string;
  
  // Populated relations when requested
  budget?: CampaignBudget;
  googleAdsAccount?: GoogleAdsAccount;
  adGroups?: AdGroup[];
  metrics?: CampaignMetric[];
}

export interface AdGroup {
  id: string;
  campaignId: string;
  googleAdGroupId?: string;
  name: string;
  status: string;
  cpcBidMicros?: string;
  createdAt: string;
  updatedAt: string;

  ads?: Ad[];
  keywords?: Keyword[];
  negativeKeywords?: NegativeKeyword[];
}

export interface Ad {
  id: string;
  adGroupId: string;
  googleAdId?: string;
  type: string; // RESPONSIVE_SEARCH_AD
  finalUrls: string[];
  headlines: string[];
  descriptions: string[];
  status: string;
  createdAt: string;
  updatedAt: string;
}

export interface Keyword {
  id: string;
  adGroupId: string;
  googleCriterionId?: string;
  text: string;
  matchType: KeywordMatchType;
  status: string;
  createdAt: string;
  updatedAt: string;
}

export interface NegativeKeyword {
  id: string;
  adGroupId: string;
  googleCriterionId?: string;
  text: string;
  matchType: KeywordMatchType;
  createdAt: string;
  updatedAt: string;
}

export interface CampaignMetric {
  id: string;
  campaignId: string;
  date: string; // YYYY-MM-DD
  impressions: number;
  clicks: number;
  costMicros: string;
  conversions: number;
  ctr: number;
  averageCpc: number;
  costPerConversion: number;
  createdAt: string;
}

export interface Plan {
  id: string;
  slug: 'free' | 'pro' | 'agency';
  name: string;
  priceMonthly: number;
  maxAccounts: number;
  maxCampaigns: number;
  hasAiFeatures: boolean;
  hasAdvancedReports: boolean;
  description: string;
  features: string[];
}

export interface Subscription {
  id: string;
  userId: string;
  planId: string;
  status: 'ACTIVE' | 'PAST_DUE' | 'CANCELED' | 'TRIALING';
  currentPeriodStart: string;
  currentPeriodEnd: string;
  createdAt: string;
  updatedAt: string;
}

export interface ApiLog {
  id: string;
  userId?: string;
  customerId?: string;
  endpoint: string;
  operation: string;
  requestId?: string;
  statusCode: number;
  status: 'SUCCESS' | 'ERROR';
  errorMessage?: string;
  requestPayload?: string;
  responsePayload?: string;
  timestamp: string;
}

export interface AppDatabase {
  users: User[];
  googleOAuthConnections: GoogleOAuthConnection[];
  googleAdsAccounts: GoogleAdsAccount[];
  campaignBudgets: CampaignBudget[];
  campaigns: Campaign[];
  adGroups: AdGroup[];
  ads: Ad[];
  keywords: Keyword[];
  negativeKeywords: NegativeKeyword[];
  campaignMetrics: CampaignMetric[];
  plans: Plan[];
  subscriptions: Subscription[];
  apiLogs: ApiLog[];
  systemConfig?: {
    clientId?: string;
    clientSecret?: string;
    developerToken?: string;
  };
}

const DB_FILE = path.join(process.cwd(), 'data-store.json');

const INITIAL_PLANS: Plan[] = [
  {
    id: 'plan-free',
    slug: 'free',
    name: 'Grátis',
    priceMonthly: 0,
    maxAccounts: 1,
    maxCampaigns: 2,
    hasAiFeatures: false,
    hasAdvancedReports: false,
    description: 'Perfeito para começar a anunciar sem custos fixos de plataforma.',
    features: [
      '1 conta Google Ads conectada',
      'Até 2 campanhas ativas',
      'Dashboard essencial com métricas reais',
      'Suporte via comunidade',
      'Publicação direta oficial no Google Ads',
    ],
  },
  {
    id: 'plan-pro',
    slug: 'pro',
    name: 'Pro',
    priceMonthly: 79,
    maxAccounts: 3,
    maxCampaigns: 15,
    hasAiFeatures: true,
    hasAdvancedReports: true,
    description: 'Para pequenas e médias empresas que desejam acelerar com IA.',
    features: [
      'Até 3 contas Google Ads',
      'Até 15 campanhas ativas',
      'Gerador de Anúncios com IA DivulgadorAds',
      'Sugestão automática de palavras-chave e negativas',
      'Relatórios avançados e exportação em CSV',
      'Suporte prioritário via WhatsApp e e-mail',
    ],
  },
  {
    id: 'plan-agency',
    slug: 'agency',
    name: 'Agência',
    priceMonthly: 199,
    maxAccounts: 20,
    maxCampaigns: 100,
    hasAiFeatures: true,
    hasAdvancedReports: true,
    description: 'Gestão multi-clientes para agências, gestores de tráfego e consultores.',
    features: [
      'Múltiplas contas de clientes ilimitadas',
      'Campanhas ilimitadas',
      'IA ilimitada para copy e palavras-chave',
      'Relatórios com white-label e exportação executiva',
      'Painel administrativo completo com logs de API',
      'Gerente de conta dedicado',
    ],
  },
];

class Database {
  private data: AppDatabase;

  constructor() {
    this.data = this.load();
  }

  private load(): AppDatabase {
    try {
      if (fs.existsSync(DB_FILE)) {
        const raw = fs.readFileSync(DB_FILE, 'utf-8');
        const parsed = JSON.parse(raw);
        // Ensure plans exist
        if (!parsed.plans || parsed.plans.length === 0) {
          parsed.plans = INITIAL_PLANS;
        }

        // Ensure João Pedro Mola Oliveira is configured as ADMIN
        const jpEmail = 'joaopedromolaoliveira800@gmail.com';
        let jpUser = parsed.users.find((u: any) => u.email.toLowerCase() === jpEmail.toLowerCase());
        if (!jpUser) {
          jpUser = {
            id: 'usr-admin-joaopedro',
            email: jpEmail,
            name: 'João Pedro Mola Oliveira',
            role: 'ADMIN',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          };
          parsed.users.unshift(jpUser);
          parsed.subscriptions.unshift({
            id: 'sub-admin-joaopedro',
            userId: jpUser.id,
            planId: 'plan-agency',
            status: 'ACTIVE',
            currentPeriodStart: new Date().toISOString(),
            currentPeriodEnd: new Date(Date.now() + 365 * 86400000).toISOString(),
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          });
        } else {
          jpUser.role = 'ADMIN';
        }

        return parsed;
      }
    } catch (e) {
      console.error('Error loading database file, initializing defaults:', e);
    }

    const joaoPedroAdmin: User = {
      id: 'usr-admin-joaopedro',
      email: 'joaopedromolaoliveira800@gmail.com',
      name: 'João Pedro Mola Oliveira',
      role: 'ADMIN',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const defaultAdmin: User = {
      id: 'usr-admin-01',
      email: 'localboostoficial.site@gmail.com',
      name: 'Gestor DivulgadorAds',
      role: 'ADMIN',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const initialDb: AppDatabase = {
      users: [joaoPedroAdmin, defaultAdmin],
      googleOAuthConnections: [],
      googleAdsAccounts: [],
      campaignBudgets: [],
      campaigns: [],
      adGroups: [],
      ads: [],
      keywords: [],
      negativeKeywords: [],
      campaignMetrics: [],
      plans: INITIAL_PLANS,
      subscriptions: [
        {
          id: 'sub-admin-joaopedro',
          userId: joaoPedroAdmin.id,
          planId: 'plan-agency',
          status: 'ACTIVE',
          currentPeriodStart: new Date().toISOString(),
          currentPeriodEnd: new Date(Date.now() + 365 * 86400000).toISOString(),
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        {
          id: 'sub-admin-01',
          userId: defaultAdmin.id,
          planId: 'plan-pro',
          status: 'ACTIVE',
          currentPeriodStart: new Date().toISOString(),
          currentPeriodEnd: new Date(Date.now() + 30 * 86400000).toISOString(),
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      ],
      apiLogs: [
        {
          id: 'log-seed-01',
          userId: defaultAdmin.id,
          endpoint: '/v18/customers:listAccessibleCustomers',
          operation: 'SYSTEM_BOOT',
          requestId: 'init-seed-req',
          statusCode: 200,
          status: 'SUCCESS',
          errorMessage: undefined,
          timestamp: new Date().toISOString(),
        },
      ],
    };

    this.save(initialDb);
    return initialDb;
  }

  private save(data?: AppDatabase) {
    try {
      fs.writeFileSync(DB_FILE, JSON.stringify(data || this.data, null, 2), 'utf-8');
    } catch (e) {
      console.error('Failed to write database to disk:', e);
    }
  }

  // Users
  getUsers() { return this.data.users; }
  getUserById(id: string) { return this.data.users.find(u => u.id === id); }
  getUserByEmail(email: string) { return this.data.users.find(u => u.email.toLowerCase() === email.toLowerCase()); }
  createUser(user: Omit<User, 'id' | 'createdAt' | 'updatedAt'>) {
    const isAdminTarget =
      user.email.toLowerCase() === 'joaopedromolaoliveira800@gmail.com' ||
      user.email.toLowerCase() === 'localboostoficial.site@gmail.com' ||
      user.email.toLowerCase().includes('admin');

    const role = isAdminTarget ? 'ADMIN' : user.role || 'USER';
    const planId = role === 'ADMIN' ? 'plan-agency' : 'plan-free';

    const newUser: User = {
      ...user,
      role,
      id: user.email.toLowerCase() === 'joaopedromolaoliveira800@gmail.com' 
        ? 'usr-admin-joaopedro' 
        : `usr-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    this.data.users.push(newUser);
    // assign plan subscription
    this.data.subscriptions.push({
      id: `sub-${Date.now()}`,
      userId: newUser.id,
      planId,
      status: 'ACTIVE',
      currentPeriodStart: new Date().toISOString(),
      currentPeriodEnd: new Date(Date.now() + (role === 'ADMIN' ? 365 : 30) * 86400000).toISOString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
    this.save();
    return newUser;
  }
  updateUser(id: string, updates: Partial<User>) {
    const u = this.getUserById(id);
    if (!u) return null;
    Object.assign(u, updates, { updatedAt: new Date().toISOString() });
    this.save();
    return u;
  }
  setUserRole(id: string, role: 'USER' | 'ADMIN') {
    return this.updateUser(id, { role });
  }
  promoteUserByEmail(email: string, role: 'USER' | 'ADMIN' = 'ADMIN') {
    let user = this.getUserByEmail(email);
    if (!user) {
      user = this.createUser({
        email,
        name: email.split('@')[0],
        role,
      });
    } else {
      user = this.updateUser(user.id, { role });
    }
    return user;
  }

  // OAuth Connections
  getOAuthConnection(userId: string) {
    return this.data.googleOAuthConnections.find(c => c.userId === userId);
  }
  saveOAuthConnection(conn: Omit<GoogleOAuthConnection, 'id' | 'createdAt' | 'updatedAt'>) {
    const existingIndex = this.data.googleOAuthConnections.findIndex(c => c.userId === conn.userId);
    const now = new Date().toISOString();
    if (existingIndex >= 0) {
      this.data.googleOAuthConnections[existingIndex] = {
        ...this.data.googleOAuthConnections[existingIndex],
        ...conn,
        updatedAt: now,
      };
      this.save();
      return this.data.googleOAuthConnections[existingIndex];
    } else {
      const newConn: GoogleOAuthConnection = {
        ...conn,
        id: `oauth-${Date.now()}`,
        createdAt: now,
        updatedAt: now,
      };
      this.data.googleOAuthConnections.push(newConn);
      this.save();
      return newConn;
    }
  }

  // Google Ads Accounts
  getAccountsByUserId(userId: string) {
    return this.data.googleAdsAccounts.filter(a => a.userId === userId);
  }
  getSelectedAccount(userId: string) {
    const accounts = this.getAccountsByUserId(userId);
    return accounts.find(a => a.isSelected) || accounts[0] || null;
  }
  setSelectedAccount(userId: string, accountId: string) {
    const accounts = this.getAccountsByUserId(userId);
    for (const a of accounts) {
      a.isSelected = (a.id === accountId || a.customerId === accountId);
      a.updatedAt = new Date().toISOString();
    }
    this.save();
    return this.getSelectedAccount(userId);
  }
  upsertGoogleAdsAccount(acc: Omit<GoogleAdsAccount, 'id' | 'createdAt' | 'updatedAt'>) {
    const existing = this.data.googleAdsAccounts.find(
      a => a.userId === acc.userId && a.customerId === acc.customerId
    );
    const now = new Date().toISOString();
    if (existing) {
      Object.assign(existing, acc, { updatedAt: now });
      this.save();
      return existing;
    } else {
      const isFirst = this.data.googleAdsAccounts.filter(a => a.userId === acc.userId).length === 0;
      const newAcc: GoogleAdsAccount = {
        ...acc,
        id: `acc-${Date.now()}-${Math.random().toString(36).substring(2, 5)}`,
        isSelected: acc.isSelected ?? isFirst,
        createdAt: now,
        updatedAt: now,
      };
      this.data.googleAdsAccounts.push(newAcc);
      this.save();
      return newAcc;
    }
  }

  // Budgets
  createBudget(b: Omit<CampaignBudget, 'id' | 'createdAt' | 'updatedAt'>) {
    const budget: CampaignBudget = {
      ...b,
      id: `bgt-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    this.data.campaignBudgets.push(budget);
    this.save();
    return budget;
  }

  // Campaigns
  getCampaigns(userId: string, accountId?: string) {
    let list = this.data.campaigns.filter(c => c.userId === userId);
    if (accountId) {
      list = list.filter(c => c.googleAdsAccountId === accountId);
    }
    return list.map(c => this.hydrateCampaign(c));
  }
  getCampaignById(id: string) {
    const c = this.data.campaigns.find(camp => camp.id === id);
    return c ? this.hydrateCampaign(c) : null;
  }
  private hydrateCampaign(c: Campaign): Campaign {
    const budget = this.data.campaignBudgets.find(b => b.id === c.budgetId);
    const account = this.data.googleAdsAccounts.find(a => a.id === c.googleAdsAccountId);
    const adGroups = this.data.adGroups.filter(g => g.campaignId === c.id).map(g => {
      const ads = this.data.ads.filter(a => a.adGroupId === g.id);
      const keywords = this.data.keywords.filter(k => k.adGroupId === g.id);
      const negativeKeywords = this.data.negativeKeywords.filter(k => k.adGroupId === g.id);
      return { ...g, ads, keywords, negativeKeywords };
    });
    const metrics = this.data.campaignMetrics.filter(m => m.campaignId === c.id);
    return {
      ...c,
      budget,
      googleAdsAccount: account,
      adGroups,
      metrics,
    };
  }

  createCampaign(c: Omit<Campaign, 'id' | 'createdAt' | 'updatedAt'>) {
    const newCamp: Campaign = {
      ...c,
      id: `cmp-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    this.data.campaigns.push(newCamp);
    this.save();
    return newCamp;
  }
  updateCampaign(id: string, updates: Partial<Campaign>) {
    const c = this.data.campaigns.find(item => item.id === id);
    if (!c) return null;
    Object.assign(c, updates, { updatedAt: new Date().toISOString() });
    this.save();
    return this.hydrateCampaign(c);
  }

  // AdGroups
  createAdGroup(g: Omit<AdGroup, 'id' | 'createdAt' | 'updatedAt'>) {
    const newGroup: AdGroup = {
      ...g,
      id: `adg-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    this.data.adGroups.push(newGroup);
    this.save();
    return newGroup;
  }

  // Ads
  createAd(a: Omit<Ad, 'id' | 'createdAt' | 'updatedAt'>) {
    const newAd: Ad = {
      ...a,
      id: `ad-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    this.data.ads.push(newAd);
    this.save();
    return newAd;
  }

  // Keywords
  addKeywords(adGroupId: string, keywords: Array<{ text: string; matchType: KeywordMatchType; googleCriterionId?: string }>) {
    const now = new Date().toISOString();
    const created: Keyword[] = [];
    for (const k of keywords) {
      const item: Keyword = {
        id: `kw-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        adGroupId,
        text: k.text,
        matchType: k.matchType,
        status: 'ENABLED',
        googleCriterionId: k.googleCriterionId,
        createdAt: now,
        updatedAt: now,
      };
      this.data.keywords.push(item);
      created.push(item);
    }
    this.save();
    return created;
  }

  // Negative Keywords
  addNegativeKeywords(adGroupId: string, keywords: Array<{ text: string; matchType: KeywordMatchType; googleCriterionId?: string }>) {
    const now = new Date().toISOString();
    const created: NegativeKeyword[] = [];
    for (const k of keywords) {
      const item: NegativeKeyword = {
        id: `nkw-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        adGroupId,
        text: k.text,
        matchType: k.matchType,
        googleCriterionId: k.googleCriterionId,
        createdAt: now,
        updatedAt: now,
      };
      this.data.negativeKeywords.push(item);
      created.push(item);
    }
    this.save();
    return created;
  }

  // Metrics
  addMetrics(metrics: Omit<CampaignMetric, 'id' | 'createdAt'>[]) {
    const now = new Date().toISOString();
    for (const m of metrics) {
      const existing = this.data.campaignMetrics.find(
        x => x.campaignId === m.campaignId && x.date === m.date
      );
      if (existing) {
        Object.assign(existing, m);
      } else {
        this.data.campaignMetrics.push({
          ...m,
          id: `met-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
          createdAt: now,
        });
      }
    }
    this.save();
  }

  // API Logs
  addApiLog(log: Omit<ApiLog, 'id' | 'timestamp'>) {
    const entry: ApiLog = {
      ...log,
      id: `log-${Date.now()}-${Math.random().toString(36).substring(2, 5)}`,
      timestamp: new Date().toISOString(),
    };
    this.data.apiLogs.unshift(entry);
    // keep max 200 logs
    if (this.data.apiLogs.length > 200) {
      this.data.apiLogs = this.data.apiLogs.slice(0, 200);
    }
    this.save();
    return entry;
  }
  getApiLogs(limit = 50) {
    return this.data.apiLogs.slice(0, limit);
  }

  // Plans & Subscriptions
  getPlans() { return this.data.plans; }
  getUserSubscription(userId: string) {
    const sub = this.data.subscriptions.find(s => s.userId === userId && s.status === 'ACTIVE');
    if (!sub) return null;
    const plan = this.data.plans.find(p => p.id === sub.planId);
    return { ...sub, plan };
  }
  setUserPlan(userId: string, planSlug: 'free' | 'pro' | 'agency') {
    const plan = this.data.plans.find(p => p.slug === planSlug);
    if (!plan) return null;
    let sub = this.data.subscriptions.find(s => s.userId === userId);
    const now = new Date().toISOString();
    if (sub) {
      sub.planId = plan.id;
      sub.status = 'ACTIVE';
      sub.updatedAt = now;
    } else {
      sub = {
        id: `sub-${Date.now()}`,
        userId,
        planId: plan.id,
        status: 'ACTIVE',
        currentPeriodStart: now,
        currentPeriodEnd: new Date(Date.now() + 30 * 86400000).toISOString(),
        createdAt: now,
        updatedAt: now,
      };
      this.data.subscriptions.push(sub);
    }
    this.save();
    return { ...sub, plan };
  }

  // Admin stats
  getAdminStats() {
    return {
      totalUsers: this.data.users.length,
      totalConnectedAccounts: this.data.googleAdsAccounts.length,
      totalCampaigns: this.data.campaigns.length,
      activeCampaigns: this.data.campaigns.filter(c => c.status === 'ENABLED').length,
      pausedCampaigns: this.data.campaigns.filter(c => c.status === 'PAUSED').length,
      totalApiLogs: this.data.apiLogs.length,
      apiErrorsCount: this.data.apiLogs.filter(l => l.status === 'ERROR').length,
      plansCount: this.data.plans.length,
      subscriptionsCount: this.data.subscriptions.length,
    };
  }

  // System credentials configuration override
  getSystemConfig(): { clientId?: string; clientSecret?: string; developerToken?: string } {
    return this.data.systemConfig || {};
  }

  saveSystemConfig(config: { clientId?: string; clientSecret?: string; developerToken?: string }) {
    this.data.systemConfig = {
      ...(this.data.systemConfig || {}),
      ...(config.clientId !== undefined ? { clientId: config.clientId.trim() } : {}),
      ...(config.clientSecret !== undefined ? { clientSecret: config.clientSecret.trim() } : {}),
      ...(config.developerToken !== undefined ? { developerToken: config.developerToken.trim() } : {}),
    };
    this.save();
    return this.data.systemConfig;
  }
}

export const db = new Database();
