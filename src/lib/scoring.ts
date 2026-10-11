import { clamp } from './format'
import type { Opportunity, ScoreWeights } from './types'

export type { ScoreWeights }

/** Transparent, configurable weights (should sum to 100). */
export const defaultWeights: ScoreWeights = {
  impact: 35,
  evidenceStrength: 25,
  feasibility: 20,
  strategic: 20,
}

function normalise(value: number): number {
  return clamp(value, 1, 5) / 5
}

/**
 * Priority score (0–100) from four 1–5 factors using the supplied weights.
 * Kept deterministic and transparent — the weights are shown in the UI.
 */
export function computeOpportunityScore(
  opp: Pick<Opportunity, 'impact' | 'evidenceStrength' | 'feasibility' | 'strategic'>,
  weights: ScoreWeights = defaultWeights,
): number {
  const raw =
    normalise(opp.impact) * weights.impact +
    normalise(opp.evidenceStrength) * weights.evidenceStrength +
    normalise(opp.feasibility) * weights.feasibility +
    normalise(opp.strategic) * weights.strategic
  return Math.round(clamp(raw, 0, 100))
}

/** Uses the manual override when set (0 means "use the computed score"). */
export function effectivePriority(opp: Opportunity, weights: ScoreWeights = defaultWeights): number {
  if (opp.priorityOverride > 0) return clamp(Math.round(opp.priorityOverride), 0, 100)
  return computeOpportunityScore(opp, weights)
}

export type PriorityTier = 'high' | 'medium' | 'low'

export function priorityTier(score: number): PriorityTier {
  if (score >= 75) return 'high'
  if (score >= 50) return 'medium'
  return 'low'
}

export const priorityTierLabels: Record<PriorityTier, string> = {
  high: 'High priority',
  medium: 'Medium priority',
  low: 'Low priority',
}

/** Sort helper: highest effective priority first. */
export function byPriorityDesc(weights: ScoreWeights = defaultWeights) {
  return (a: Opportunity, b: Opportunity) => effectivePriority(b, weights) - effectivePriority(a, weights)
}
