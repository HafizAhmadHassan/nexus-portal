import { describe, expect, it } from 'vitest'
import { seedState } from './demoData'
import {
  countActivityByType,
  getMetrics,
  getWeeklyProgress,
  priorityOpportunities,
  recommendedActions,
  startOfWeek,
} from './selectors'
import { defaultWeights } from './scoring'

describe('getMetrics', () => {
  it('computes dashboard metrics from the seed', () => {
    const metrics = getMetrics(seedState)
    expect(metrics.companiesDiscovered).toBe(8)
    expect(metrics.companiesResearched).toBe(4)
    expect(metrics.opportunitiesIdentified).toBe(10)
    expect(metrics.contactsVerified).toBe(3)
    expect(metrics.outreachDrafts).toBe(1)
    expect(metrics.followupsDue).toBe(0)
  })
})

describe('startOfWeek', () => {
  it('returns the Monday of the same week', () => {
    // 14 October 2026 is a Wednesday.
    const monday = startOfWeek(new Date(2026, 9, 14, 12, 0, 0))
    expect(monday.getDate()).toBe(12)
    expect(monday.getDay()).toBe(1) // Monday
  })
})

describe('countActivityByType / goals', () => {
  it('counts every event when the window spans everything', () => {
    const counts = countActivityByType(seedState, new Date(0), new Date(3000, 0, 1))
    expect(counts.companies_researched).toBe(3)
    expect(counts.contacts_verified).toBe(3)
    expect(counts.opportunities_validated).toBe(1)
    expect(counts.outreach_drafts).toBe(2)
    expect(counts.outreach_sent).toBe(1)
    expect(counts.meetings).toBe(1)
  })

  it('shapes weekly progress consistently', () => {
    expect(getWeeklyProgress(seedState)).toHaveLength(seedState.goals.length)
    for (const goal of getWeeklyProgress(seedState)) {
      expect(goal.count).toBeGreaterThanOrEqual(0)
      expect(goal.ratio).toBeGreaterThanOrEqual(0)
      expect(goal.ratio).toBeLessThanOrEqual(1)
    }
  })
})

describe('priorityOpportunities', () => {
  it('orders by the weighted score with the strongest first', () => {
    const top = priorityOpportunities(seedState, 3)
    const scores = top.map((o) =>
      Math.round(
        (o.impact / 5) * defaultWeights.impact +
          (o.evidenceStrength / 5) * defaultWeights.evidenceStrength +
          (o.feasibility / 5) * defaultWeights.feasibility +
          (o.strategic / 5) * defaultWeights.strategic,
      ),
    )
    for (let i = 1; i < scores.length; i += 1) {
      expect(scores[i - 1]).toBeGreaterThanOrEqual(scores[i])
    }
    expect(top[0].id).toBe('o8')
  })
})

describe('recommendedActions', () => {
  it('derives actions from actual state', () => {
    const actions = recommendedActions(seedState)
    const titles = actions.map((a) => a.title)
    expect(titles.some((t) => t.includes('Verify 6 contacts'))).toBe(true)
    expect(titles.some((t) => t.includes('Complete analysis for 4 companies'))).toBe(true)
    expect(titles.some((t) => t.includes('Prepare outreach for 2 ready opportunities'))).toBe(true)
  })
})