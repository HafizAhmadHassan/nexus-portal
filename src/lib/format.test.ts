import { describe, expect, it } from 'vitest'
import {
  clamp,
  daysBetween,
  describeRelative,
  formatCurrency,
  formatDate,
  newId,
  pluralize,
  startOfDay,
  titleCase,
  toDateInputValue,
} from './format'

describe('formatCurrency', () => {
  it('formats whole euros with thousands separators', () => {
    expect(formatCurrency(42000000)).toContain('42,000,000')
    expect(formatCurrency(1)).toContain('1')
  })
})

describe('daysBetween / describeRelative', () => {
  const noon = (y: number, m: number, d: number) => new Date(y, m - 1, d, 12, 0, 0)

  it('labels today, tomorrow, and yesterday', () => {
    const now = noon(2026, 10, 11)
    expect(describeRelative(noon(2026, 10, 11).toISOString(), now)).toBe('Today')
    expect(describeRelative(noon(2026, 10, 12).toISOString(), now)).toBe('Tomorrow')
    expect(describeRelative(noon(2026, 10, 10).toISOString(), now)).toBe('Yesterday')
  })

  it('labels future and past days', () => {
    const now = noon(2026, 10, 11)
    expect(describeRelative(noon(2026, 10, 15).toISOString(), now)).toBe('In 4 days')
    expect(describeRelative(noon(2026, 10, 7).toISOString(), now)).toBe('4 days ago')
  })

  it('handles missing dates', () => {
    expect(describeRelative(undefined)).toBe('No date')
  })

  it('computes whole-day differences across midnight', () => {
    expect(daysBetween(noon(2026, 10, 1), noon(2026, 10, 4))).toBe(3)
  })
})

describe('startOfDay / toDateInputValue', () => {
  it('zeroes the time portion', () => {
    const day = startOfDay(new Date(2026, 9, 11, 15, 30, 45))
    expect(day.getHours()).toBe(0)
    expect(day.getMinutes()).toBe(0)
    expect(day.getDate()).toBe(11)
  })

  it('produces a yyyy-mm-dd input value', () => {
    expect(toDateInputValue(new Date(2026, 9, 4, 12, 0, 0))).toBe('2026-10-04')
  })
})

describe('misc helpers', () => {
  it('clamps', () => {
    expect(clamp(120, 0, 100)).toBe(100)
    expect(clamp(-5, 0, 100)).toBe(0)
    expect(clamp(50, 0, 100)).toBe(50)
  })

  it('title-cases and singularises', () => {
    expect(titleCase('ready_for-outreach')).toBe('Ready For Outreach')
    expect(pluralize(1, 'company')).toBe('company')
    expect(pluralize(2, 'company', 'companies')).toBe('companies')
    expect(pluralize(2, 'task')).toBe('tasks')
  })

  it('generates unique ids with a prefix', () => {
    const ids = new Set(Array.from({ length: 50 }, () => newId('o')))
    expect(ids.size).toBe(50)
    for (const id of ids) expect(id.startsWith('o_')).toBe(true)
  })

  it('formats dates safely', () => {
    expect(formatDate('not-a-date')).toBe('—')
    expect(formatDate(undefined)).toBe('—')
  })
})