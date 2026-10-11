// Core domain types for the NEXUS demo MVP.
// These mirror the entities described in ideasv2.md §14 (Data Model).

export type Evidence = 'verified' | 'supported' | 'hypothesis' | 'unknown'
export type Confidence = 'high' | 'medium' | 'low'
export type Verification = 'verified' | 'unverified' | 'needs_check'
export type DataClassification = 'reported' | 'estimated' | 'calculated'

export type CompanySizeBand = 'micro' | 'small' | 'medium' | 'large'
export type ResearchStatus = 'new' | 'researching' | 'researched'

export type SourceKind =
  | 'registry'
  | 'website'
  | 'directory'
  | 'news'
  | 'financial'
  | 'other'

export type OpportunityCategory = 'software' | 'ai' | 'automation' | 'data'

export type OpportunityStage =
  | 'identified'
  | 'researching'
  | 'ready'
  | 'contacted'
  | 'meeting'
  | 'proposal'
  | 'won'
  | 'lost'
  | 'hold'

export type TaskStatus = 'todo' | 'in_progress' | 'waiting' | 'completed'
export type TaskPriority = 'low' | 'medium' | 'high'

export type GoalMetric =
  | 'companies_researched'
  | 'opportunities_validated'
  | 'contacts_verified'
  | 'outreach_drafts'
  | 'outreach_sent'
  | 'meetings'

export type ActivityType = GoalMetric | 'company_discovered' | 'note_added'

export type OutreachLanguage = 'it' | 'en'
export type OutreachTone = 'professional' | 'consultative' | 'concise' | 'technical'
export type OutreachDocType =
  | 'initial'
  | 'followup'
  | 'meeting_request'
  | 'service_intro'
  | 'discovery_agenda'
  | 'opportunity_summary'
  | 'proposal'

export interface CompanySource {
  id: string
  companyId: string
  label: string
  url?: string
  kind: SourceKind
  retrievedAt: string
}

export interface CompanyLocation {
  id: string
  companyId: string
  label: string
  region: string
  province: string
  comune: string
  address?: string
}

export interface FinancialRecord {
  id: string
  companyId: string
  metric: string
  value: number
  currency: 'EUR'
  period: string
  sourceId?: string
  publishedAt?: string
  retrievedAt: string
  classification: DataClassification
}

export interface Contact {
  id: string
  companyId: string
  name: string
  role: string
  relevance: string
  email?: string
  phone?: string
  sourceId?: string
  verification: Verification
  lastCheckedAt?: string
}

export interface SupplyChainLink {
  id: string
  companyId: string
  partner: string
  role: string
  evidence: Evidence
  sourceId?: string
}

export interface Opportunity {
  id: string
  companyId: string
  contactId?: string
  title: string
  problem: string
  category: OpportunityCategory
  service: string
  stage: OpportunityStage
  /** Manual priority override (0 = use computed score). */
  priorityOverride: number
  impact: number
  evidenceStrength: number
  feasibility: number
  strategic: number
  confidence: Confidence
  evidence: Evidence
  evidenceNote: string
  sourceIds: string[]
  validationQuestions: string[]
  nextAction: string
  notes: string
  createdAt: string
}

export interface OutreachVersion {
  id: string
  label: string
  subject: string
  body: string
  createdAt: string
}

export interface OutreachDoc {
  id: string
  companyId: string
  contactId?: string
  opportunityId?: string
  docType: OutreachDocType
  language: OutreachLanguage
  tone: OutreachTone
  service: string
  subject: string
  body: string
  /** Ordered newest-first. The last item is the original generated draft. */
  versions: OutreachVersion[]
  createdAt: string
  updatedAt: string
}

export interface Task {
  id: string
  title: string
  description: string
  priority: TaskPriority
  status: TaskStatus
  dueDate?: string
  companyId?: string
  contactId?: string
  opportunityId?: string
  notes?: string
  completedAt?: string
  createdAt: string
}

export interface WeeklyGoal {
  id: string
  label: string
  metric: GoalMetric
  target: number
}

export interface ActivityEvent {
  id: string
  type: ActivityType
  at: string
  companyId?: string
  label: string
}

export interface DiscoverQuery {
  text: string
  region: string
  province: string
  comune: string
  industry: string
  sizeBand: CompanySizeBand | ''
}

export interface SavedSearch {
  id: string
  label: string
  query: DiscoverQuery
  createdAt: string
}

export interface Company {
  id: string
  name: string
  industry: string
  description: string
  website?: string
  foundedYear?: number
  employeeRange: string
  sizeBand: CompanySizeBand
  group?: string
  region: string
  province: string
  comune: string
  status: ResearchStatus
  createdAt: string
}

/** Transparent, configurable weights used by the opportunity priority score. */
export interface ScoreWeights {
  impact: number
  evidenceStrength: number
  feasibility: number
  strategic: number
}

/** The user's own details, used to sign and personalize outreach drafts. */
export interface SenderProfile {
  name: string
  company: string
  email: string
  phone: string
  /** Services the user offers, offered as suggestions in the Outreach Studio. */
  services: string[]
}

export interface AppSettings {
  sender: SenderProfile
  weights: ScoreWeights
}

export interface AppState {
  companies: Company[]
  locations: CompanyLocation[]
  sources: CompanySource[]
  financials: FinancialRecord[]
  contacts: Contact[]
  supplyChain: SupplyChainLink[]
  opportunities: Opportunity[]
  outreach: OutreachDoc[]
  tasks: Task[]
  goals: WeeklyGoal[]
  activity: ActivityEvent[]
  savedSearches: SavedSearch[]
  settings: AppSettings
}
