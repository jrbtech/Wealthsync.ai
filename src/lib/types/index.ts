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
  | 'family_member_invited';

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
