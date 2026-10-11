import { seedState } from './demoData'
import type { AppState } from './types'

const STORAGE_KEY = 'nexus.state.v1'
const SCHEMA_VERSION = 1

interface Persisted {
  version: number
  state: AppState
}

function clone<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T
}

function hasStorage(): boolean {
  try {
    return typeof window !== 'undefined' && !!window.localStorage
  } catch {
    return false
  }
}

/**
 * Loads persisted state, falling back to the demo seed. Missing collections are
 * filled from the seed so an older/partial payload never crashes the app.
 */
export function loadState(): AppState {
  if (!hasStorage()) return clone(seedState)
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (!raw) return clone(seedState)
    const parsed = JSON.parse(raw) as Partial<Persisted>
    if (!parsed || parsed.version !== SCHEMA_VERSION || !parsed.state) {
      return clone(seedState)
    }
    // Merge over the seed so records added in later schema versions (e.g.
    // settings) still have valid defaults when an older payload is loaded.
    return {
      ...clone(seedState),
      ...parsed.state,
      settings: { ...clone(seedState).settings, ...parsed.state.settings },
    }
  } catch {
    return clone(seedState)
  }
}

export function saveState(state: AppState): void {
  if (!hasStorage()) return
  try {
    const payload: Persisted = { version: SCHEMA_VERSION, state }
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(payload))
  } catch {
    // Storage full or unavailable — the app still works, just without persistence.
  }
}

export function clearState(): void {
  if (!hasStorage()) return
  try {
    window.localStorage.removeItem(STORAGE_KEY)
  } catch {
    // ignore
  }
}

export function getSeedState(): AppState {
  return clone(seedState)
}

export { STORAGE_KEY }
