// User Types
export interface User {
  id: string;
  email: string;
  name: string;
  role: 'primary' | 'family' | 'advisor';
  familyId: string;
  avatarUrl?: string;
  createdAt: Date;
  lastLogin: Date;
}

// Family Types
export type PlanType = 'foundation' | 'growth' | 'legacy';

export interface Family {
  id: string;
  name: string;
  primaryUserId: string;
  plan: PlanType;
  stripeCustomerId?: string;
  stripeSubscriptionId?: string;
  onboardingCompleted?: boolean;
  createdAt: Date;
}

// Advisor Types
export type AdvisorSpecialty = 'cpa' | 'estate_attorney' | 'wealth_manager' | 'insurance' | 'banker' | 'other';

export interface Advisor {
  id: string;
  name: string;
  firm: string;
  email: string;
  phone: string;
  specialty: AdvisorSpecialty;
  notes: string;
  lastContactDate: Date | null;
  createdAt: Date;
  createdBy: string;
}

export const ADVISOR_SPECIALTY_LABELS: Record<AdvisorSpecialty, string> = {
  cpa: 'CPA / Accountant',
  estate_attorney: 'Estate Attorney',
  wealth_manager: 'Wealth Manager',
  insurance: 'Insurance Advisor',
  banker: 'Private Banker',
  other: 'Other'
};

// Deadline Types
export type DeadlineCategory = 'tax' | 'legal' | 'insurance' | 'trust' | 'investment' | 'other';
export type DeadlineStatus = 'upcoming' | 'due_soon' | 'overdue' | 'completed';
export type RecurrenceType = 'one_time' | 'annual' | 'quarterly' | 'monthly';

export interface Deadline {
  id: string;
  title: string;
  dueDate: Date;
  category: DeadlineCategory;
  recurrence: RecurrenceType;
  advisorId?: string;
  notes: string;
  status: DeadlineStatus;
  reminders: number[]; // Days before due date
  completedAt?: Date;
  createdAt: Date;
  createdBy: string;
}

export const DEADLINE_CATEGORY_LABELS: Record<DeadlineCategory, string> = {
  tax: 'Tax',
  legal: 'Legal',
  insurance: 'Insurance',
  trust: 'Trust',
  investment: 'Investment',
  other: 'Other'
};

export const RECURRENCE_LABELS: Record<RecurrenceType, string> = {
  one_time: 'One-time',
  annual: 'Annual',
  quarterly: 'Quarterly',
  monthly: 'Monthly'
};

// Document Types
export type DocumentFolder = 'estate_planning' | 'tax_returns' | 'insurance_policies' | 'investment_statements' | 'legal_documents' | 'property_records' | 'other';

export interface Document {
  id: string;
  filename: string;
  storagePath: string;
  downloadUrl?: string;
  folder: DocumentFolder;
  tags: string[];
  notes: string;
  advisorId?: string;
  uploadedBy: string;
  uploadedAt: Date;
  size: number;
  mimeType: string;
}

export const DOCUMENT_FOLDER_LABELS: Record<DocumentFolder, string> = {
  estate_planning: 'Estate Planning',
  tax_returns: 'Tax Returns',
  insurance_policies: 'Insurance Policies',
  investment_statements: 'Investment Statements',
  legal_documents: 'Legal Documents',
  property_records: 'Property Records',
  other: 'Other'
};

// Entity & Wealth Types
export type EntityType = 'personal' | 'trust' | 'llc' | 'foundation' | 'other';
export type AssetCategory = 'cash' | 'investments' | 'real_estate' | 'alternatives' | 'other';
export type LiabilityCategory = 'mortgage' | 'loan' | 'credit' | 'other';

export interface Entity {
  id: string;
  name: string;
  type: EntityType;
  createdAt: Date;
  createdBy: string;
}

export interface Asset {
  id: string;
  name: string;
  category: AssetCategory;
  value: number;
  notes: string;
  lastUpdated: Date;
}

export interface Liability {
  id: string;
  name: string;
  category: LiabilityCategory;
  balance: number;
  notes: string;
  lastUpdated: Date;
}

export interface NetWorthSnapshot {
  id: string;
  date: Date;
  totalNetWorth: number;
  byEntity: Record<string, number>;
  byCategory: Record<string, number>;
}

export const ENTITY_TYPE_LABELS: Record<EntityType, string> = {
  personal: 'Personal',
  trust: 'Trust',
  llc: 'LLC',
  foundation: 'Foundation',
  other: 'Other'
};

export const ASSET_CATEGORY_LABELS: Record<AssetCategory, string> = {
  cash: 'Cash & Equivalents',
  investments: 'Investments',
  real_estate: 'Real Estate',
  alternatives: 'Alternative Investments',
  other: 'Other Assets'
};

export const LIABILITY_CATEGORY_LABELS: Record<LiabilityCategory, string> = {
  mortgage: 'Mortgages',
  loan: 'Loans',
  credit: 'Credit',
  other: 'Other Liabilities'
};

// Meeting Types
export interface ActionItem {
  id: string;
  text: string;
  completed: boolean;
  dueDate?: Date;
}

export interface Meeting {
  id: string;
  date: Date;
  title: string;
  advisorIds: string[];
  familyMemberIds: string[];
  summary: string;
  actionItems: ActionItem[];
  followUpDate?: Date;
  documentIds: string[];
  createdAt: Date;
  createdBy: string;
}

// Activity Types
export type ActivityType =
  | 'advisor_added'
  | 'advisor_updated'
  | 'deadline_created'
  | 'deadline_completed'
  | 'document_uploaded'
  | 'meeting_logged'
  | 'wealth_updated'
  | 'family_member_invited'
  | 'onboarding_completed';

export interface Activity {
  id: string;
  type: ActivityType;
  description: string;
  userId: string;
  metadata?: Record<string, unknown>;
  createdAt: Date;
}

// Plan limits
export const PLAN_LIMITS: Record<PlanType, { familyMembers: number; advisors: number }> = {
  foundation: { familyMembers: 3, advisors: 10 },
  growth: { familyMembers: 8, advisors: Infinity },
  legacy: { familyMembers: Infinity, advisors: Infinity }
};

export const PLAN_PRICES: Record<PlanType, number> = {
  foundation: 2000,
  growth: 3500,
  legacy: 6000
};

// ============================================
// AgencyForge.ai Types (SEO/PPC Agency Reports)
// ============================================

// Agency Branding
export interface AgencyBranding {
  logoUrl?: string;
  primaryColor: string;
  secondaryColor: string;
  fontFamily: string;
  agencyName: string;
  agencyWebsite?: string;
  contactEmail?: string;
  contactPhone?: string;
  footerText?: string;
}

export const DEFAULT_AGENCY_BRANDING: AgencyBranding = {
  primaryColor: '#0f172a',
  secondaryColor: '#06b6d4',
  fontFamily: 'Inter, sans-serif',
  agencyName: 'Your Agency',
  footerText: 'Confidential - Prepared exclusively for client use'
};

// Client Project (replaces Family for agency context)
export type ProjectStatus = 'active' | 'paused' | 'completed' | 'archived';
export type IndustryType = 'ecommerce' | 'saas' | 'local_business' | 'healthcare' | 'finance' | 'real_estate' | 'legal' | 'education' | 'other';

export interface ClientProject {
  id: string;
  clientName: string;
  clientUrl: string;
  industry: IndustryType;
  status: ProjectStatus;
  targetKeywords: string[];
  competitors: string[];
  notes: string;
  monthlyBudget?: number;
  contractValue?: number;
  startDate: Date;
  createdAt: Date;
  createdBy: string;
}

export const INDUSTRY_LABELS: Record<IndustryType, string> = {
  ecommerce: 'E-commerce',
  saas: 'SaaS / Software',
  local_business: 'Local Business',
  healthcare: 'Healthcare',
  finance: 'Finance',
  real_estate: 'Real Estate',
  legal: 'Legal Services',
  education: 'Education',
  other: 'Other'
};

export const PROJECT_STATUS_LABELS: Record<ProjectStatus, string> = {
  active: 'Active',
  paused: 'Paused',
  completed: 'Completed',
  archived: 'Archived'
};

// Analytics Data (from GA/Search Console uploads)
export interface AnalyticsData {
  id: string;
  projectId: string;
  source: 'google_analytics' | 'search_console' | 'manual';
  dateRange: {
    start: Date;
    end: Date;
  };
  metrics: {
    sessions?: number;
    users?: number;
    pageviews?: number;
    bounceRate?: number;
    avgSessionDuration?: number;
    organicTraffic?: number;
    impressions?: number;
    clicks?: number;
    ctr?: number;
    avgPosition?: number;
  };
  topPages?: Array<{ url: string; sessions: number; conversions?: number }>;
  topKeywords?: Array<{ keyword: string; impressions: number; clicks: number; position: number }>;
  uploadedAt: Date;
  uploadedBy: string;
}

// SEO Audit Results
export interface SEOAuditResult {
  overallScore: number; // 0-100
  technicalScore: number;
  contentScore: number;
  backlinksScore: number;

  issues: SEOIssue[];
  opportunities: SEOOpportunity[];

  crawlData?: {
    totalPages: number;
    indexedPages: number;
    brokenLinks: number;
    missingMeta: number;
    slowPages: number;
    mobileIssues: number;
  };

  generatedAt: Date;
}

export interface SEOIssue {
  id: string;
  severity: 'critical' | 'warning' | 'info';
  category: 'technical' | 'content' | 'backlinks' | 'ux';
  title: string;
  description: string;
  affectedUrls?: string[];
  recommendation: string;
}

export interface SEOOpportunity {
  id: string;
  priority: 'high' | 'medium' | 'low';
  category: 'content' | 'keywords' | 'technical' | 'links';
  title: string;
  description: string;
  estimatedImpact: string;
  effort: 'low' | 'medium' | 'high';
}

// Competitor Analysis
export interface CompetitorAnalysis {
  competitorUrl: string;
  domainAuthority?: number;
  organicKeywords?: number;
  estimatedTraffic?: number;
  topKeywords: Array<{ keyword: string; position: number; volume?: number }>;
  contentGaps: string[];
  backlinksCount?: number;
}

// Content Calendar Item
export interface ContentCalendarItem {
  id: string;
  week: number;
  title: string;
  targetKeyword: string;
  secondaryKeywords: string[];
  searchIntent: 'informational' | 'navigational' | 'commercial' | 'transactional';
  contentType: 'blog_post' | 'landing_page' | 'pillar_page' | 'product_page' | 'guide' | 'case_study';
  wordCount: number;
  priority: 'high' | 'medium' | 'low';
  notes?: string;
  internalLinks?: string[];
}

export const CONTENT_TYPE_LABELS: Record<ContentCalendarItem['contentType'], string> = {
  blog_post: 'Blog Post',
  landing_page: 'Landing Page',
  pillar_page: 'Pillar Page',
  product_page: 'Product Page',
  guide: 'Comprehensive Guide',
  case_study: 'Case Study'
};

export const SEARCH_INTENT_LABELS: Record<ContentCalendarItem['searchIntent'], string> = {
  informational: 'Informational',
  navigational: 'Navigational',
  commercial: 'Commercial Investigation',
  transactional: 'Transactional'
};

// Report Types
export type ReportType = 'seo_audit' | 'content_strategy' | 'competitor_analysis' | 'monthly_performance' | 'quarterly_review';
export type ReportStatus = 'draft' | 'generating' | 'ready' | 'delivered' | 'archived';

export interface Report {
  id: string;
  projectId: string;
  type: ReportType;
  title: string;
  status: ReportStatus;

  // Report Content (AI-generated)
  executiveSummary?: string;
  seoAudit?: SEOAuditResult;
  competitorAnalysis?: CompetitorAnalysis[];
  contentCalendar?: ContentCalendarItem[];
  roiProjections?: {
    currentTraffic: number;
    projectedTraffic: number;
    trafficGrowth: string;
    estimatedRevenue: string;
    assumptions: string[];
  };
  recommendations?: string[];

  // PDF Output
  pdfUrl?: string;
  pdfGeneratedAt?: Date;

  // Metadata
  createdAt: Date;
  createdBy: string;
  deliveredAt?: Date;
  viewCount: number;
}

export const REPORT_TYPE_LABELS: Record<ReportType, string> = {
  seo_audit: 'SEO Audit Report',
  content_strategy: 'Content Strategy Plan',
  competitor_analysis: 'Competitor Analysis',
  monthly_performance: 'Monthly Performance Report',
  quarterly_review: 'Quarterly Business Review'
};

export const REPORT_STATUS_LABELS: Record<ReportStatus, string> = {
  draft: 'Draft',
  generating: 'Generating...',
  ready: 'Ready',
  delivered: 'Delivered',
  archived: 'Archived'
};

// Agency Plan (replaces Family plan for agencies)
export type AgencyPlanType = 'starter' | 'professional' | 'unlimited';

export interface Agency {
  id: string;
  name: string;
  primaryUserId: string;
  plan: AgencyPlanType;
  branding: AgencyBranding;
  stripeCustomerId?: string;
  stripeSubscriptionId?: string;
  onboardingCompleted?: boolean;
  createdAt: Date;
}

export const AGENCY_PLAN_LIMITS: Record<AgencyPlanType, { clients: number; reportsPerMonth: number; teamMembers: number }> = {
  starter: { clients: 5, reportsPerMonth: 10, teamMembers: 1 },
  professional: { clients: 25, reportsPerMonth: 50, teamMembers: 5 },
  unlimited: { clients: Infinity, reportsPerMonth: Infinity, teamMembers: Infinity }
};

export const AGENCY_PLAN_PRICES: Record<AgencyPlanType, number> = {
  starter: 297,
  professional: 597,
  unlimited: 997
};

// Activity Types for Agency
export type AgencyActivityType =
  | 'client_added'
  | 'client_updated'
  | 'report_generated'
  | 'report_delivered'
  | 'analytics_uploaded'
  | 'team_member_invited'
  | 'branding_updated';

export interface AgencyActivity {
  id: string;
  type: AgencyActivityType;
  description: string;
  userId: string;
  projectId?: string;
  reportId?: string;
  metadata?: Record<string, unknown>;
  createdAt: Date;
}
