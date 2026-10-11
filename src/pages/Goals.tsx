import { useMemo } from 'react'
import { Card, CardBody, CardHeader, EmptyState, PageHeader, ProgressBar } from '../components/ui'
import { BarChart } from '../components/charts'
import { countActivityByType, getWeeklyProgress, startOfWeek } from '../lib/selectors'
import { goalMetricLabels } from '../lib/labels'
import { useApp } from '../state/AppState'
import type { AppState, GoalMetric } from '../lib/types'

const metricOrder: GoalMetric[] = [
  'companies_researched',
  'opportunities_validated',
  'contacts_verified',
  'outreach_drafts',
  'outreach_sent',
  'meetings',
]

export function Goals() {
  const { state, dispatch } = useApp()
  const weekly = getWeeklyProgress(state)

  const history = useMemo(() => weeklyHistory(state, 8), [state])

  return (
    <div>
      <PageHeader
        title="Goals & reports"
        description="Weekly targets measured strictly from tracked activity events — no double counting."
      />

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        <Card>
          <CardHeader description="Edit the target value next to each goal." title="This week's progress" />
          <CardBody className="space-y-4">
            {weekly.map((goal) => {
              const goalId = state.goals.find((g) => g.metric === goal.metric)?.id ?? ''
              return (
                <div key={goal.metric}>
                  <div className="mb-1 flex items-center justify-between gap-3 text-xs">
                    <span className="font-medium text-slate-700">{goal.label}</span>
                    <span className="flex items-center gap-1.5 text-slate-500">
                      <span className="font-medium text-slate-700">{goal.count}</span>/ {goal.target}
                      <label className="sr-only" htmlFor={`goal-${goal.metric}`}>Target for {goal.label}</label>
                      <input
                        id={`goal-${goal.metric}`}
                        type="number"
                        min={0}
                        value={goal.target}
                        onChange={(e) =>
                          dispatch({ type: 'UPDATE_GOAL', id: goalId, target: Number(e.target.value) })
                        }
                        className="w-16 rounded-md border border-slate-300 px-1.5 py-1 text-xs text-slate-700"
                        aria-label={`Target for ${goal.label}`}
                      />
                    </span>
                  </div>
                  <ProgressBar value={goal.ratio} />
                </div>
              )
            })}
            {state.goals.length === 0 ? (
              <EmptyState title="No goals configured" description="Goals will appear here once defined." />
            ) : null}
          </CardBody>
        </Card>

        <Card>
          <CardHeader title="Activity trend" description="Total tracked events per week (last 8 weeks)." />
          <CardBody>
            <BarChart data={history} height={180} />
          </CardBody>
        </Card>
      </div>

      <Card className="mt-5">
        <CardHeader title="Weekly breakdown by metric" description="What actually counted toward each goal, this week and last week." />
        <CardBody>
          {weekly.length === 0 ? (
            <EmptyState title="Nothing to report yet" />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[560px] text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-100 text-slate-400">
                    <th className="py-2 pr-3 font-medium">Metric</th>
                    <th className="py-2 pr-3 font-medium">This week</th>
                    <th className="py-2 pr-3 font-medium">Last week</th>
                    <th className="py-2 pr-3 font-medium">Target</th>
                  </tr>
                </thead>
                <tbody>
                  {metricOrder.map((metric) => {
                    const goal = state.goals.find((g) => g.metric === metric)
                    const thisWeek = weekly.find((w) => w.metric === metric)
                    const lastWeek = countActivityByType(state, addDays(startOfWeek(), -7), addDays(startOfWeek(), -1))
                    return (
                      <tr key={metric} className="border-b border-slate-50">
                        <td className="py-2 pr-3 text-slate-700">{goalMetricLabels[metric]}</td>
                        <td className="py-2 pr-3 font-medium text-slate-900">{thisWeek?.count ?? 0}</td>
                        <td className="py-2 pr-3 text-slate-600">{lastWeek[metric]}</td>
                        <td className="py-2 pr-3 text-slate-500">{goal?.target ?? '—'}</td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}
        </CardBody>
      </Card>

      <Card className="mt-5">
        <CardHeader title="How goals are measured" />
        <CardBody className="space-y-2 text-xs text-slate-600">
          <p>
            Progress is derived exclusively from activity events recorded by real user actions (research completed,
            contact verified, stage validated, draft created, message confirmed as sent, meeting logged).
          </p>
          <p>
            A draft is never treated as a sent message, and a scheduled meeting is never treated as completed unless
            explicitly logged.
          </p>
        </CardBody>
      </Card>
    </div>
  )
}

function addDays(date: Date, days: number): Date {
  const d = new Date(date)
  d.setDate(d.getDate() + days)
  return d
}

function weeklyHistory(state: AppState, weeks: number) {
  const now = new Date()
  const thisWeekStart = startOfWeek(now)
  return Array.from({ length: weeks }, (_, i) => {
    const start = addDays(thisWeekStart, -7 * (weeks - 1 - i))
    const end = addDays(start, 7)
    const counts = countActivityByType(state, start, end)
    const total = Object.values(counts).reduce((sum, n) => sum + n, 0)
    return {
      label: `${start.getDate()}/${start.getMonth() + 1}`,
      sublabel: 'events',
      value: total,
    }
  })
}