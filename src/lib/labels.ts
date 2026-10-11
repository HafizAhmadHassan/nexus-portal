import type {
  CompanySizeBand,
  Confidence,
  DataClassification,
  Evidence,
  GoalMetric,
  OpportunityCategory,
  OpportunityStage,
  OutreachDocType,
  OutreachLanguage,
  OutreachTone,
  ResearchStatus,
  SourceKind,
  TaskPriority,
  TaskStatus,
  Verification,
} from './types'

export type Tone = 'neutral' | 'info' | 'success' | 'warning' | 'danger'

export const evidenceLabels: Record<Evidence, string> = {
  verified: 'Verified fact',
  supported: 'Supported inference',
  hypothesis: 'Hypothesis',
  unknown: 'Unknown',
}

export const evidenceTone: Record<Evidence, Tone> = {
  verified: 'success',
  supported: 'info',
  hypothesis: 'warning',
  unknown: 'neutral',
}

export const confidenceLabels: Record<Confidence, string> = {
  high: 'High confidence',
  medium: 'Medium confidence',
  low: 'Low confidence',
}

export const confidenceTone: Record<Confidence, Tone> = {
  high: 'success',
  medium: 'info',
  low: 'warning',
}

export const verificationLabels: Record<Verification, string> = {
  verified: 'Verified',
  unverified: 'Unverified',
  needs_check: 'Needs check',
}

export const verificationTone: Record<Verification, Tone> = {
  verified: 'success',
  unverified: 'danger',
  needs_check: 'warning',
}

export const classificationLabels: Record<DataClassification, string> = {
  reported: 'Reported',
  estimated: 'Estimated',
  calculated: 'Calculated',
}

export const sizeBandLabels: Record<CompanySizeBand, string> = {
  micro: 'Micro',
  small: 'Small',
  medium: 'Medium',
  large: 'Large',
}

export const researchStatusLabels: Record<ResearchStatus, string> = {
  new: 'New',
  researching: 'Researching',
  researched: 'Researched',
}

export const researchStatusTone: Record<ResearchStatus, Tone> = {
  new: 'neutral',
  researching: 'warning',
  researched: 'success',
}

export const categoryLabels: Record<OpportunityCategory, string> = {
  software: 'Software development',
  ai: 'AI implementation',
  automation: 'Automation',
  data: 'Data & BI',
}

export const stageLabels: Record<OpportunityStage, string> = {
  identified: 'Identified',
  researching: 'Researching',
  ready: 'Ready for outreach',
  contacted: 'Contacted',
  meeting: 'Meeting scheduled',
  proposal: 'Proposal in progress',
  won: 'Won',
  lost: 'Lost',
  hold: 'On hold',
}

/** Ordered pipeline stages (excludes terminal "lost"/"hold"). */
export const pipelineStages: OpportunityStage[] = [
  'identified',
  'researching',
  'ready',
  'contacted',
  'meeting',
  'proposal',
  'won',
]

export const terminalStages: OpportunityStage[] = ['lost', 'hold']

export const taskStatusLabels: Record<TaskStatus, string> = {
  todo: 'To do',
  in_progress: 'In progress',
  waiting: 'Waiting for response',
  completed: 'Completed',
}

export const taskStatusTone: Record<TaskStatus, Tone> = {
  todo: 'neutral',
  in_progress: 'info',
  waiting: 'warning',
  completed: 'success',
}

export const taskPriorityLabels: Record<TaskPriority, string> = {
  low: 'Low',
  medium: 'Medium',
  high: 'High',
}

export const taskPriorityTone: Record<TaskPriority, Tone> = {
  low: 'neutral',
  medium: 'info',
  high: 'danger',
}

export const goalMetricLabels: Record<GoalMetric, string> = {
  companies_researched: 'Companies researched',
  opportunities_validated: 'Opportunities validated',
  contacts_verified: 'Contacts verified',
  outreach_drafts: 'Outreach drafts created',
  outreach_sent: 'Outreach confirmed as sent',
  meetings: 'Discovery meetings completed',
}

export const sourceKindLabels: Record<SourceKind, string> = {
  registry: 'Public registry',
  website: 'Company website',
  directory: 'Directory',
  news: 'News',
  financial: 'Financial filing',
  other: 'Other',
}

export const docTypeLabels: Record<OutreachDocType, string> = {
  initial: 'Initial outreach email',
  followup: 'Follow-up email',
  meeting_request: 'Meeting request',
  service_intro: 'Service introduction',
  discovery_agenda: 'Discovery agenda',
  opportunity_summary: 'Opportunity summary',
  proposal: 'Short consulting proposal',
}

export const languageLabels: Record<OutreachLanguage, string> = {
  it: 'Italian',
  en: 'English',
}

export const toneLabels: Record<OutreachTone, string> = {
  professional: 'Professional',
  consultative: 'Consultative',
  concise: 'Concise',
  technical: 'Technical',
}
