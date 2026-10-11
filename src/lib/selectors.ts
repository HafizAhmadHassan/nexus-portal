import { effectivePriority } from './scoring'
import { daysBetween, startOfDay } from './format'
import type {
  ActivityEvent,
  AppState,
  Company,
  CompanySource,
  Contact,
  FinancialRecord,
  GoalMetric,
  Opportunity,
  SupplyChainLink,
  Task,
} from './types'

export function getCompany(state: AppState, id: string | undefined): Company | undefined {
  if (!id) return undefined
  return state.companies.find((c) => c.id === id)
}

export function getContact(state: AppState, id: string | undefined): Contact | undefined {
  if (!id) return undefined
  return state.contacts.find((c) => c.id === id)
}

export function getSource(state: AppState, id: string | undefined): CompanySource | undefined {
  if (!id) return undefined
  return state.sources.find((s) => s.id === id)
}

export function getOpportunity(state: AppState, id: string | undefined): Opportunity | undefined {
  if (!id) return undefined
  return state.opportunities.find((o) => o.id === id)
}

export function sourcesForCompany(state: AppState, companyId: string): CompanySource[] {
  return state.sources.filter((s) => s.companyId === companyId)
}

export function contactsForCompany(state: AppState, companyId: string): Contact[] {
  return state.contacts.filter((c) => c.companyId === companyId)
}

export function opportunitiesForCompany(state: AppState, companyId: string): Opportunity[] {
  return state.opportunities.filter((o) => o.companyId === companyId)
}

export function financialsForCompany(state: AppState, companyId: string): FinancialRecord[] {
  return state.financials.filter((f) => f.companyId === companyId)
}

export function supplyChainForCompany(state: AppState, companyId: string): SupplyChainLink[] {
  return state.supplyChain.filter((s) => s.companyId === companyId)
}

// --- metrics -----------------------------------------------------------------

export interface DashboardMetrics {
  companiesDiscovered: number
  companiesResearched: number
  opportunitiesIdentified: number
  contactsVerified: number
  outreachDrafts: number
  followupsDue: number
}

export function getMetrics(state: AppState, now: Date = new Date()): DashboardMetrics {
  const open = state.opportunities.filter((o) => o.stage !== 'lost')
  return {
    companiesDiscovered: state.companies.length,
    companiesResearched: state.companies.filter((c) => c.status === 'researched').length,
    opportunitiesIdentified: open.length,
    contactsVerified: state.contacts.filter((c) => c.verification === 'verified').length,
    outreachDrafts: state.outreach.length,
    followupsDue: state.tasks.filter(
      (t) => t.status !== 'completed' && !!t.dueDate && daysBetween(startOfDay(now), t.dueDate) <= 0,
    ).length,
  }
}

// --- weekly goals ------------------------------------------------------------

/** Monday 00:00 of the week containing `date`. */
export function startOfWeek(date: Date = new Date()): Date {
  const d = startOfDay(date)
  const day = (d.getDay() + 6) % 7 // 0 = Monday
  d.setDate(d.getDate() - day)
  return d
}

export interface GoalProgress {
  metric: GoalMetric
  label: string
  target: number
  count: number
  ratio: number
}

export function countActivityByType(state: AppState, from: Date, to: Date = new Date()): Record<GoalMetric, number> {
  const counts: Record<GoalMetric, number> = {
    companies_researched: 0,
    opportunities_validated: 0,
    contacts_verified: 0,
    outreach_drafts: 0,
    outreach_sent: 0,
    meetings: 0,
  }
  const fromTime = from.getTime()
  const toTime = to.getTime()
  for (const event of state.activity) {
    const t = new Date(event.at).getTime()
    if (t < fromTime || t > toTime) continue
    if (event.type in counts) {
      counts[event.type as GoalMetric] += 1
    }
  }
  return counts
}

export function getWeeklyProgress(state: AppState, now: Date = new Date()): GoalProgress[] {
  const counts = countActivityByType(state, startOfWeek(now), now)
  return state.goals.map((goal) => {
    const count = counts[goal.metric] ?? 0
    const ratio = goal.target > 0 ? Math.min(1, count / goal.target) : 0
    return { metric: goal.metric, label: goal.label, target: goal.target, count, ratio }
  })
}

// --- lists -------------------------------------------------------------------

export function priorityOpportunities(state: AppState, limit = 5): Opportunity[] {
  const weights = state.settings.weights
  return [...state.opportunities]
    .filter((o) => o.stage !== 'lost' && o.stage !== 'hold')
    .sort((a, b) => effectivePriority(b, weights) - effectivePriority(a, weights))
    .slice(0, limit)
}

/** All open opportunities sorted by effective priority (weighted). */
export function sortedOpportunities(state: AppState): Opportunity[] {
  const weights = state.settings.weights
  return [...state.opportunities].sort(
    (a, b) => effectivePriority(b, weights) - effectivePriority(a, weights),
  )
}

export function upcomingTasks(state: AppState, now: Date = new Date()): Task[] {
  return state.tasks
    .filter((t) => t.status !== 'completed' && !!t.dueDate)
    .sort((a, b) => new Date(a.dueDate!).getTime() - new Date(b.dueDate!).getTime())
}

export function overdueTasks(state: AppState, now: Date = new Date()): Task[] {
  return upcomingTasks(state, now).filter((t) => daysBetween(startOfDay(now), t.dueDate!) < 0)
}

export function recentActivity(state: AppState, limit = 8): ActivityEvent[] {
  return [...state.activity]
    .sort((a, b) => new Date(b.at).getTime() - new Date(a.at).getTime())
    .slice(0, limit)
}

export interface RecommendedAction {
  title: string
  description: string
  to: string
}

export function recommendedActions(state: AppState, now: Date = new Date()): RecommendedAction[] {
  const actions: RecommendedAction[] = []

  const overdue = overdueTasks(state, now)
  if (overdue.length > 0) {
    actions.push({
      title: `Resolve ${overdue.length} overdue task${overdue.length === 1 ? '' : 's'}`,
      description: 'Tasks past their due date need attention.',
      to: '/tasks',
    })
  }

  const unverified = state.contacts.filter((c) => c.verification !== 'verified')
  if (unverified.length > 0) {
    actions.push({
      title: `Verify ${unverified.length} contact${unverified.length === 1 ? '' : 's'}`,
      description: 'Contact details should be confirmed before outreach.',
      to: '/contacts',
    })
  }

  const unfinished = state.companies.filter((c) => c.status !== 'researched')
  if (unfinished.length > 0) {
    actions.push({
      title: `Complete analysis for ${unfinished.length} compan${unfinished.length === 1 ? 'y' : 'ies'}`,
      description: 'Finish researching companies with incomplete profiles.',
      to: '/companies',
    })
  }

  const ready = state.opportunities.filter((o) => o.stage === 'ready')
  if (ready.length > 0) {
    actions.push({
      title: `Prepare outreach for ${ready.length} ready opportunit${ready.length === 1 ? 'y' : 'ies'}`,
      description: 'Opportunities are validated and ready for a first message.',
      to: '/outreach',
    })
  }

  if (actions.length === 0) {
    actions.push({
      title: 'Discover new companies',
      description: 'Your pipeline is clear — start prospecting.',
      to: '/discover',
    })
  }

  return actions
}
