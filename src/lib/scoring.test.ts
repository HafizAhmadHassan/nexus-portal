import { describe, expect, it } from 'vitest'
import {
  byPriorityDesc,
  computeOpportunityScore,
  defaultWeights,
  effectivePriority,
  priorityTier,
} from './scoring'
import type { Opportunity } from './types'

const allFive: Pick<Opportunity, 'impact' | 'evidenceStrength' | 'feasibility' | 'strategic'> = {
  impact: 5,
  evidenceStrength: 5,
  feasibility: 5,
  strategic: 5,
}

const allThree: Pick<Opportunity, 'impact' | 'evidenceStrength' | 'feasibility' | 'strategic'> = {
  impact: 3,
  evidenceStrength: 3,
  feasibility: 3,
  strategic: 3,
}

function makeOpp(overrides: Partial<Opportunity> = {}): Opportunity {
  return {
    id: 'o_x',
    companyId: 'c_x',
    title: 'Test',
    problem: 'Test problem',
    category: 'automation',
    service: 'Test service',
    stage: 'identified',
    priorityOverride: 0,
    impact: 1,
    evidenceStrength: 1,
    feasibility: 1,
    strategic: 1,
    confidence: 'low',
    evidence: 'hypothesis',
    evidenceNote: 'Note',
    sourceIds: [],
    validationQuestions: [],
    nextAction: 'Next',
    notes: '',
    createdAt: '2026-01-01T00:00:00.000Z',
    ...overrides,
  }
}

describe('computeOpportunityScore', () => {
  it('returns 100 for maxed factors', () => {
    expect(computeOpportunityScore(allFive, defaultWeights)).toBe(100)
  })

  it('returns 60 for mid factors with default weights', () => {
    expect(computeOpportunityScore(allThree, defaultWeights)).toBe(60)
  })

  it('respects custom weights', () => {
    const score = computeOpportunityScore(
      { impact: 5, evidenceStrength: 1, feasibility: 1, strategic: 1 },
      { impact: 100, evidenceStrength: 0, feasibility: 0, strategic: 0 },
    )
    expect(score).toBe(100)
  })

  it('clamps out-of-range factor values', () => {
    const score = computeOpportunityScore(
      { impact: 9, evidenceStrength: 0, feasibility: 6, strategic: -2 },
      defaultWeights,
    )
    expect(score).toBeGreaterThanOrEqual(0)
    expect(score).toBeLessThanOrEqual(100)
  })
})

describe('effectivePriority', () => {
  it('uses the manual override when set', () => {
    const opp = makeOpp({ priorityOverride: 80 })
    expect(effectivePriority(opp, defaultWeights)).toBe(80)
  })

  it('falls back to the computed score when override is 0', () => {
    const opp = makeOpp({ impact: 5, evidenceStrength: 5, feasibility: 5, strategic: 5 })
    expect(effectivePriority(opp, defaultWeights)).toBe(100)
  })
})

describe('priorityTier', () => {
  it('classifies boundaries', () => {
    expect(priorityTier(100)).toBe('high')
    expect(priorityTier(75)).toBe('high')
    expect(priorityTier(74)).toBe('medium')
    expect(priorityTier(50)).toBe('medium')
    expect(priorityTier(49)).toBe('low')
  })
})

describe('byPriorityDesc', () => {
  it('sorts highest priority first', () => {
    const low = makeOpp({ id: 'a', impact: 1 })
    const high = makeOpp({ id: 'b', impact: 5, evidenceStrength: 5, feasibility: 5, strategic: 5 })
    const sorted = [low, high].sort(byPriorityDesc(defaultWeights))
    expect(sorted[0].id).toBe('b')
  })
})