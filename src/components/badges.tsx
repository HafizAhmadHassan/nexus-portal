import type { ReactNode } from 'react'
import { Badge } from './ui'
export { Badge }
import type { Tone } from '../lib/labels'
import {
  categoryLabels,
  classificationLabels,
  confidenceLabels,
  confidenceTone,
  evidenceLabels,
  evidenceTone,
  researchStatusLabels,
  researchStatusTone,
  stageLabels,
  taskPriorityLabels,
  taskPriorityTone,
  taskStatusLabels,
  taskStatusTone,
  verificationLabels,
  verificationTone,
} from '../lib/labels'
import { priorityTier, priorityTierLabels } from '../lib/scoring'
import type {
  Confidence,
  DataClassification,
  Evidence,
  OpportunityCategory,
  OpportunityStage,
  ResearchStatus,
  TaskPriority,
  TaskStatus,
  Verification,
} from '../lib/types'

function smallBadge(tone: Tone, children: ReactNode, title?: string) {
  return (
    <Badge tone={tone} title={title}>
      {children}
    </Badge>
  )
}

export function ResearchStatusBadge({ status }: { status: ResearchStatus }) {
  return smallBadge(researchStatusTone[status], researchStatusLabels[status])
}

export function EvidenceBadge({ evidence }: { evidence: Evidence }) {
  return smallBadge(evidenceTone[evidence], evidenceLabels[evidence], evidence)
}

export function ConfidenceBadge({ confidence }: { confidence: Confidence }) {
  return smallBadge(confidenceTone[confidence], confidenceLabels[confidence])
}

export function VerificationBadge({ verification }: { verification: Verification }) {
  return smallBadge(verificationTone[verification], verificationLabels[verification])
}

export function ClassificationBadge({ classification }: { classification: DataClassification }) {
  return smallBadge(
    classification === 'reported'
      ? 'success'
      : classification === 'estimated'
        ? 'warning'
        : 'info',
    classificationLabels[classification],
  )
}

const stageTone: Record<OpportunityStage, Tone> = {
  identified: 'warning',
  researching: 'warning',
  ready: 'info',
  contacted: 'info',
  meeting: 'info',
  proposal: 'info',
  won: 'success',
  lost: 'danger',
  hold: 'neutral',
}

export function StageBadge({ stage }: { stage: OpportunityStage }) {
  return smallBadge(stageTone[stage], stageLabels[stage])
}

const categoryTone: Record<OpportunityCategory, Tone> = {
  software: 'info',
  ai: 'warning',
  automation: 'success',
  data: 'info',
}

export function CategoryBadge({ category }: { category: OpportunityCategory }) {
  return smallBadge(categoryTone[category], categoryLabels[category])
}

const priorityTone: Record<'high' | 'medium' | 'low', Tone> = {
  high: 'danger',
  medium: 'info',
  low: 'neutral',
}

export function PriorityBadge({ score }: { score: number }) {
  const tier = priorityTier(score)
  return smallBadge(
    priorityTone[tier],
    priorityTierLabels[tier],
    `Priority score ${score}/100`,
  )
}

export function TaskStatusBadge({ status }: { status: TaskStatus }) {
  return smallBadge(taskStatusTone[status], taskStatusLabels[status])
}

export function TaskPriorityBadge({ priority }: { priority: TaskPriority }) {
  return smallBadge(taskPriorityTone[priority], taskPriorityLabels[priority])
}