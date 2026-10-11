// Pure formatting and small helpers. Kept side-effect free so they are unit-testable.

export function formatCurrency(value: number, currency = 'EUR'): string {
  return new Intl.NumberFormat('en-GB', {
    style: 'currency',
    currency,
    maximumFractionDigits: 0,
  }).format(value)
}

export function formatCompactCurrency(value: number, currency = 'EUR'): string {
  return new Intl.NumberFormat('en-GB', {
    style: 'currency',
    currency,
    notation: 'compact',
    maximumFractionDigits: 1,
  }).format(value)
}

export function formatDate(iso: string | undefined): string {
  if (!iso) return '—'
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return '—'
  return new Intl.DateTimeFormat('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(d)
}

export function formatDateTime(iso: string | undefined): string {
  if (!iso) return '—'
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return '—'
  return new Intl.DateTimeFormat('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(d)
}

/** Whole-day difference between two dates (b - a). */
export function daysBetween(a: string | Date, b: string | Date): number {
  const da = typeof a === 'string' ? new Date(a) : a
  const db = typeof b === 'string' ? new Date(b) : b
  const ms = db.getTime() - da.getTime()
  return Math.round(ms / (1000 * 60 * 60 * 24))
}

/**
 * Human-friendly relative description of a date compared to `now`
 * (defaults to the current time).
 */
export function describeRelative(iso: string | undefined, now: Date = new Date()): string {
  if (!iso) return 'No date'
  const target = new Date(iso)
  if (Number.isNaN(target.getTime())) return 'No date'
  const diff = daysBetween(startOfDay(now), startOfDay(target))
  if (diff === 0) return 'Today'
  if (diff === 1) return 'Tomorrow'
  if (diff === -1) return 'Yesterday'
  if (diff > 1) return `In ${diff} days`
  return `${Math.abs(diff)} days ago`
}

export function startOfDay(d: Date): Date {
  const copy = new Date(d)
  copy.setHours(0, 0, 0, 0)
  return copy
}

/** ISO date (yyyy-mm-dd) for a Date, using the local calendar day. */
export function toDateInputValue(d: Date): string {
  const copy = startOfDay(d)
  const y = copy.getFullYear()
  const m = String(copy.getMonth() + 1).padStart(2, '0')
  const day = String(copy.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

export function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value))
}

export function titleCase(input: string): string {
  return input
    .split(/[\s_-]+/)
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')
}

export function initials(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p.charAt(0).toUpperCase())
    .join('')
}

let idCounter = 0
/** Small local id generator for optimistic/demo records. */
export function newId(prefix = 'id'): string {
  idCounter += 1
  const rand = Math.random().toString(36).slice(2, 7)
  return `${prefix}_${Date.now().toString(36)}_${idCounter}_${rand}`
}

export function pluralize(count: number, singular: string, plural?: string): string {
  return count === 1 ? singular : plural ?? `${singular}s`
}
