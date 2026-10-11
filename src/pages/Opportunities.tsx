import { useMemo, useState } from 'react'
import { Card, CardHeader, EmptyState, PageHeader, Select } from '../components/ui'
import { OpportunityCard } from '../components/cards'
import { StageBadge } from '../components/badges'
import { categoryLabels, pipelineStages, stageLabels, terminalStages } from '../lib/labels'
import { effectivePriority, priorityTier } from '../lib/scoring'
import type { PriorityTier } from '../lib/scoring'
import { sortedOpportunities } from '../lib/selectors'
import { useApp } from '../state/AppState'
import type { OpportunityCategory, OpportunityStage } from '../lib/types'

const stageOptions = [...pipelineStages, ...terminalStages]

export function Opportunities() {
  const { state } = useApp()
  const [stage, setStage] = useState<OpportunityStage | ''>('')
  const [category, setCategory] = useState<OpportunityCategory | ''>('')
  const [tier, setTier] = useState<PriorityTier | ''>('')

  const all = useMemo(() => sortedOpportunities(state), [state])
  const weights = state.settings.weights

  const counts = useMemo(() => {
    const map: Record<string, number> = {}
    for (const opp of state.opportunities) map[opp.stage] = (map[opp.stage] ?? 0) + 1
    return map
  }, [state.opportunities])

  const results = useMemo(
    () =>
      all.filter((opp) => {
        if (stage && opp.stage !== stage) return false
        if (category && opp.category !== category) return false
        if (tier && priorityTier(effectivePriority(opp, weights)) !== tier) return false
        return true
      }),
    [all, stage, category, tier, weights],
  )

  const hasFilters = stage !== '' || category !== '' || tier !== ''

  return (
    <div>
      <PageHeader
        title="Opportunities"
        description="A single list of business hypotheses, ranked by a transparent weighted score."
      />

      <div className="mb-4 grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-9">
        {stageOptions.map((s) => (
          <button
            key={s}
            onClick={() => setStage(stage === s ? '' : s)}
            aria-pressed={stage === s}
            className={`rounded-lg border px-2 py-2 text-center transition-colors ${
              stage === s ? 'border-indigo-600 bg-indigo-50' : 'border-slate-200 bg-white hover:border-slate-300'
            }`}
          >
            <span className="block text-lg font-semibold text-slate-900">{counts[s] ?? 0}</span>
            <span className="block text-[10px] leading-tight text-slate-500">{stageLabels[s]}</span>
          </button>
        ))}
      </div>

      <Card className="mb-5">
        <CardHeader
          title="Filters"
          action={
            hasFilters ? (
              <button
                className="text-xs font-medium text-indigo-600 hover:underline"
                onClick={() => {
                  setStage('')
                  setCategory('')
                  setTier('')
                }}
              >
                Clear filters
              </button>
            ) : null
          }
        />
        <div className="flex flex-wrap gap-3 px-5 py-3">
          <Select value={stage} onChange={(e) => setStage(e.target.value as OpportunityStage | '')} className="w-auto">
            <option value="">All stages</option>
            {stageOptions.map((s) => (
              <option key={s} value={s}>{stageLabels[s]}</option>
            ))}
          </Select>
          <Select value={category} onChange={(e) => setCategory(e.target.value as OpportunityCategory | '')} className="w-auto">
            <option value="">All categories</option>
            {(Object.keys(categoryLabels) as OpportunityCategory[]).map((c) => (
              <option key={c} value={c}>{categoryLabels[c]}</option>
            ))}
          </Select>
          <Select value={tier} onChange={(e) => setTier(e.target.value as PriorityTier | '')} className="w-auto">
            <option value="">All priorities</option>
            <option value="high">High (≥75)</option>
            <option value="medium">Medium (50–74)</option>
            <option value="low">Low (&lt;50)</option>
          </Select>
          <span className="ml-auto self-center text-xs text-slate-500">
            {results.length} of {all.length} records
          </span>
        </div>
      </Card>

      {results.length === 0 ? (
        <EmptyState title="No opportunities match" description="Adjust the filters or record a new opportunity from a company profile." />
      ) : (
        <div className="space-y-3">
          {results.map((opp) => (
            <OpportunityCard key={opp.id} opportunity={opp} />
          ))}
        </div>
      )}

      <Card className="mt-6">
        <CardHeader title="How scoring works" description="The same transparent formula used everywhere in the app." />
        <div className="space-y-2 px-5 py-4 text-xs text-slate-600">
          <p>Each factor (impact, evidence strength, feasibility, strategic relevance) is scored 1–5 and normalised to 0–1.</p>
          <p>
            Score = impact×{weights.impact} + evidence×{weights.evidenceStrength} + feasibility×{weights.feasibility} +
            strategic×{weights.strategic}, rounded to 0–100.
          </p>
          <p className="flex items-center gap-2">
            Ranges: High ≥75 · Medium 50–74 · Low &lt;50
          </p>
          <p className="text-slate-400">
            Scores are planning aids, not objective measurements of a real outcome.
            Weights are configurable in Settings.
          </p>
        </div>
      </Card>
    </div>
  )
}