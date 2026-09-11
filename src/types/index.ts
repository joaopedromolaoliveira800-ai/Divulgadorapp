export interface User {
  id: string;
  name: string;
  email: string;
  role: 'USER' | 'ADMIN';
  avatarUrl?: string;
}

export interface GoogleAdsAccount {
  id: string;
  userId: string;
  customerId: string; // e.g. 123-456-7890
  descriptiveName: string;
  currencyCode: string;
  timeZone: string;
  status: string;
  isTestAccount: boolean;
  isSelected: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface GoogleAdsStatus {
  isConfigured: boolean;
  missingEnvVars: string[];
  developerToken: string;
  hasDeveloperToken: boolean;
  clientIdConfigured: boolean;
  clientSecretConfigured: boolean;
  clientIdSample?: string;
  isClientIdValidFormat?: boolean;
  clientIdFormatWarning?: string;
  redirectUri: string;
  isConnected: boolean;
  googleEmail?: string;
  lastSyncedAt?: string;
  accounts: GoogleAdsAccount[];
  selectedAccount: GoogleAdsAccount | null;
}

export type CampaignObjective = 'SELL_PRODUCTS' | 'GET_CLIENTS' | 'LEADS' | 'WEBSITE_VISITS' | 'BRAND_AWARENESS';
export type CampaignStatus = 'ENABLED' | 'PAUSED' | 'REMOVED';
export type KeywordMatchType = 'EXACT' | 'PHRASE' | 'BROAD';

export interface Keyword {
  id?: string;
  text: string;
  matchType: KeywordMatchType;
  status?: string;
  googleCriterionId?: string;
}

export interface CampaignBudget {
  id?: string;
  dailyAmount: number;
  amountMicros?: string;
  deliveryMethod?: string;
}

export interface Ad {
  id?: string;
  finalUrls: string[];
  headlines: string[];
  descriptions: string[];
  status?: string;
  googleAdId?: string;
}

export interface Campaign {
  id: string;
  name: string;
  objective: CampaignObjective;
  targetUrl: string;
  locationTarget: string;
  status: CampaignStatus;
  servingStatus?: string;
  googleCampaignId?: string;
  createdAt: string;
  updatedAt: string;
  budget?: CampaignBudget;
  googleAdsAccount?: GoogleAdsAccount;
  adGroups?: Array<{
    id: string;
    name: string;
    googleAdGroupId?: string;
    ads?: Ad[];
    keywords?: Keyword[];
    negativeKeywords?: Keyword[];
  }>;
  metrics?: Array<{
    date: string;
    impressions: number;
    clicks: number;
    costMicros: string;
    conversions: number;
    ctr: number;
    averageCpc: number;
  }>;
}

export interface MetricsSummary {
  investment: number;
  impressions: number;
  clicks: number;
  ctr: number;
  averageCpc: number;
  conversions: number;
  costPerConversion: number;
}

export interface ChartDataPoint {
  date: string;
  cost: number;
  clicks: number;
  impressions: number;
  conversions: number;
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
  plan?: Plan;
  status: 'ACTIVE' | 'PAST_DUE' | 'CANCELED' | 'TRIALING';
  currentPeriodStart: string;
  currentPeriodEnd: string;
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

export interface GeneratedAdCopy {
  headlines: string[];
  descriptions: string[];
  callToActions: string[];
  keywords: Array<{
    text: string;
    matchType: KeywordMatchType;
  }>;
  negativeKeywords: string[];
}
