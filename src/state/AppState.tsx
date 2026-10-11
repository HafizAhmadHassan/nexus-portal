import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useReducer,
} from 'react'
import type { Dispatch, ReactNode } from 'react'
import { newId } from '../lib/format'
import { clearState, getSeedState, loadState, saveState } from '../lib/storage'
import type {
  ActivityEvent,
  ActivityType,
  AppSettings,
  AppState,
  Company,
  CompanySource,
  Contact,
  FinancialRecord,
  Opportunity,
  OpportunityStage,
  OutreachDoc,
  OutreachVersion,
  SavedSearch,
  SupplyChainLink,
  Task,
  WeeklyGoal,
} from '../lib/types'

export type Action =
  | { type: 'ADD_TASK'; task: Task }
  | { type: 'UPDATE_TASK'; id: string; patch: Partial<Task> }
  | { type: 'ADD_CONTACT'; contact: Contact }
  | { type: 'UPDATE_CONTACT'; id: string; patch: Partial<Contact> }
  | { type: 'ADD_OPPORTUNITY'; opportunity: Opportunity }
  | { type: 'UPDATE_OPPORTUNITY'; id: string; patch: Partial<Opportunity> }
  | { type: 'SET_OPPORTUNITY_STAGE'; id: string; stage: OpportunityStage }
  | { type: 'ADD_OUTREACH'; doc: OutreachDoc }
  | { type: 'UPDATE_OUTREACH'; id: string; patch: Partial<OutreachDoc> }
  | { type: 'ADD_OUTREACH_VERSION'; id: string; version: OutreachVersion }
  | { type: 'MARK_OUTREACH_SENT'; id: string }
  | { type: 'ADD_COMPANY'; company: Company }
  | { type: 'UPDATE_COMPANY'; id: string; patch: Partial<Company> }
  | { type: 'ADD_SOURCE'; source: CompanySource }
  | { type: 'ADD_FINANCIAL'; record: FinancialRecord }
  | { type: 'ADD_SUPPLY_LINK'; link: SupplyChainLink }
  | { type: 'UPDATE_GOAL'; id: string; target: number }
  | { type: 'ADD_SAVED_SEARCH'; search: SavedSearch }
  | { type: 'REMOVE_SAVED_SEARCH'; id: string }
  | { type: 'LOG_ACTIVITY'; event: ActivityEvent }
  | { type: 'UPDATE_SETTINGS'; patch: Partial<AppSettings> }
  | { type: 'RESET' }

const VALIDATED_STAGES: OpportunityStage[] = ['ready', 'contacted', 'meeting', 'proposal', 'won']

function pushActivity(
  state: AppState,
  type: ActivityType,
  label: string,
  companyId?: string,
): AppState {
  const event: ActivityEvent = {
    id: newId('a'),
    type,
    at: new Date().toISOString(),
    companyId,
    label,
  }
  return { ...state, activity: [event, ...state.activity] }
}

function updateById<T extends { id: string }>(list: T[], id: string, patch: Partial<T>): T[] {
  return list.map((item) => (item.id === id ? { ...item, ...patch } : item))
}

export function reducer(state: AppState, action: Action): AppState {
  switch (action.type) {
    case 'ADD_TASK':
      return { ...state, tasks: [action.task, ...state.tasks] }

    case 'UPDATE_TASK':
      return { ...state, tasks: updateById(state.tasks, action.id, action.patch) }

    case 'ADD_CONTACT':
      return { ...state, contacts: [action.contact, ...state.contacts] }

    case 'UPDATE_CONTACT': {
      const existing = state.contacts.find((c) => c.id === action.id)
      const next = updateById(state.contacts, action.id, action.patch)
      let result: AppState = { ...state, contacts: next }
      if (
        action.patch.verification === 'verified' &&
        existing &&
        existing.verification !== 'verified'
      ) {
        result = pushActivity(
          result,
          'contacts_verified',
          `Verified contact ${existing.name}`,
          existing.companyId,
        )
      }
      return result
    }

    case 'ADD_OPPORTUNITY':
      return { ...state, opportunities: [action.opportunity, ...state.opportunities] }

    case 'UPDATE_OPPORTUNITY':
      return {
        ...state,
        opportunities: updateById(state.opportunities, action.id, action.patch),
      }

    case 'SET_OPPORTUNITY_STAGE': {
      const opp = state.opportunities.find((o) => o.id === action.id)
      let result: AppState = {
        ...state,
        opportunities: updateById(state.opportunities, action.id, { stage: action.stage }),
      }
      if (
        opp &&
        VALIDATED_STAGES.includes(action.stage) &&
        !VALIDATED_STAGES.includes(opp.stage)
      ) {
        result = pushActivity(
          result,
          'opportunities_validated',
          `Validated opportunity: ${opp.title}`,
          opp.companyId,
        )
      }
      return result
    }

    case 'ADD_OUTREACH': {
      const result: AppState = { ...state, outreach: [action.doc, ...state.outreach] }
      return pushActivity(
        result,
        'outreach_drafts',
        `Created outreach draft for ${companyName(state, action.doc.companyId)}`,
        action.doc.companyId,
      )
    }

    case 'UPDATE_OUTREACH':
      return { ...state, outreach: updateById(state.outreach, action.id, action.patch) }

    case 'ADD_OUTREACH_VERSION':
      return {
        ...state,
        outreach: state.outreach.map((doc) =>
          doc.id === action.id
            ? {
                ...doc,
                versions: [action.version, ...doc.versions],
                updatedAt: new Date().toISOString(),
              }
            : doc,
        ),
      }

    case 'MARK_OUTREACH_SENT': {
      const doc = state.outreach.find((d) => d.id === action.id)
      if (!doc) return state
      const labelled: OutreachDoc = {
        ...doc,
        versions: [
          {
            id: newId('v'),
            label: 'Marked as sent',
            subject: doc.subject,
            body: doc.body,
            createdAt: new Date().toISOString(),
          },
          ...doc.versions,
        ],
        updatedAt: new Date().toISOString(),
      }
      const result: AppState = {
        ...state,
        outreach: updateById(state.outreach, action.id, {
          versions: labelled.versions,
          updatedAt: labelled.updatedAt,
        }),
      }
      return pushActivity(
        result,
        'outreach_sent',
        `Outreach confirmed as sent to ${companyName(state, doc.companyId)}`,
        doc.companyId,
      )
    }

    case 'ADD_COMPANY':
      return { ...state, companies: [action.company, ...state.companies] }

    case 'UPDATE_COMPANY': {
      const existing = state.companies.find((c) => c.id === action.id)
      const next = updateById(state.companies, action.id, action.patch)
      let result: AppState = { ...state, companies: next }
      if (
        action.patch.status === 'researched' &&
        existing &&
        existing.status !== 'researched'
      ) {
        result = pushActivity(
          result,
          'companies_researched',
          `Researched ${existing.name}`,
          existing.id,
        )
      }
      return result
    }

    case 'ADD_SOURCE':
      return { ...state, sources: [action.source, ...state.sources] }

    case 'ADD_FINANCIAL':
      return { ...state, financials: [action.record, ...state.financials] }

    case 'ADD_SUPPLY_LINK':
      return { ...state, supplyChain: [action.link, ...state.supplyChain] }

    case 'UPDATE_GOAL':
      return { ...state, goals: updateById(state.goals, action.id, { target: action.target }) }

    case 'ADD_SAVED_SEARCH':
      return {
        ...state,
        savedSearches: [action.search, ...state.savedSearches.filter((s) => s.label !== action.search.label)],
      }

    case 'REMOVE_SAVED_SEARCH':
      return { ...state, savedSearches: state.savedSearches.filter((s) => s.id !== action.id) }

    case 'LOG_ACTIVITY':
      return { ...state, activity: [action.event, ...state.activity] }

    case 'UPDATE_SETTINGS':
      return { ...state, settings: { ...state.settings, ...action.patch } }

    case 'RESET':
      return getSeedState()

    default:
      return state
  }
}

function companyName(state: AppState, companyId: string): string {
  return state.companies.find((c) => c.id === companyId)?.name ?? 'company'
}

interface AppContextValue {
  state: AppState
  dispatch: Dispatch<Action>
  resetDemo: () => void
}

const AppContext = createContext<AppContextValue | null>(null)

export function AppStateProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, undefined, loadState)

  useEffect(() => {
    saveState(state)
  }, [state])

  const resetDemo = useCallback(() => {
    clearState()
    dispatch({ type: 'RESET' })
  }, [])

  const value = useMemo<AppContextValue>(
    () => ({ state, dispatch, resetDemo }),
    [state, resetDemo],
  )

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>
}

export function useApp(): AppContextValue {
  const ctx = useContext(AppContext)
  if (!ctx) throw new Error('useApp must be used within an AppStateProvider')
  return ctx
}

export { VALIDATED_STAGES }
