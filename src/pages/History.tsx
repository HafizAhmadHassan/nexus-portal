import { useMemo, useState } from 'react'
import { Button, Card, CardBody, CardHeader, EmptyState, Input, PageHeader } from '../components/ui'
import { Icon } from '../components/icons'
import { formatDateTime } from '../lib/format'
import { recentActivity } from '../lib/selectors'
import { useApp } from '../state/AppState'

export function History() {
  const { state, dispatch } = useApp()
  const [filter, setFilter] = useState('')

  const events = useMemo(() => {
    const need = filter.trim().toLowerCase()
    return recentActivity(state, 200).filter((e) => {
      if (!need) return true
      return e.label.toLowerCase().includes(need) || e.type.toLowerCase().includes(need)
    })
  }, [state, filter])

  return (
    <div>
      <PageHeader
        title="Research history"
        description="Every meaningful action with a timestamp — the source of truth for goal progress."
      />

      <Card className="mb-5">
        <div className="flex flex-wrap items-center gap-3 px-4 py-3">
          <Input placeholder="Filter activity…" value={filter} onChange={(e) => setFilter(e.target.value)} className="max-w-xs" />
          <span className="ml-auto text-xs text-slate-500">{events.length} events</span>
        </div>
      </Card>

      {events.length === 0 ? (
        <EmptyState title="No activity yet" description="Actions such as research, verification, and outreach will appear here." />
      ) : (
        <Card>
          <CardBody>
            <ul className="space-y-1.5">
              {events.map((event, index) => (
                <li key={event.id} className="flex items-baseline gap-3 py-1.5 text-sm">
                  <span className="w-28 shrink-0 text-xs text-slate-400">{formatDateTime(event.at)}</span>
                  {index === 0 ? (
                    <span className="h-1.5 w-1.5 shrink-0 self-center rounded-full bg-indigo-500" />
                  ) : (
                    <span className="w-1.5 shrink-0" />
                  )}
                  <span className="min-w-0 text-slate-700">
                    <span className="font-medium text-slate-900">{event.label}</span>
                    <span className="ml-2 text-xs text-slate-400">{event.type}</span>
                  </span>
                </li>
              ))}
            </ul>
          </CardBody>
        </Card>
      )}

      <Card className="mt-5">
        <CardHeader title="Saved searches" description="Reusable discovery filters." />
        <CardBody>
          {state.savedSearches.length === 0 ? (
            <EmptyState title="No saved searches" description="Save a filter combination from the Discover page." />
          ) : (
            <ul className="space-y-2">
              {state.savedSearches.map((search) => (
                <li key={search.id} className="flex items-center justify-between gap-3 rounded-lg border border-slate-100 px-3 py-2 text-sm">
                  <div>
                    <p className="font-medium text-slate-900">{search.label}</p>
                    <p className="text-xs text-slate-500">{describeQuery(search.query)}</p>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => dispatch({ type: 'REMOVE_SAVED_SEARCH', id: search.id })}
                    aria-label={`Delete ${search.label}`}
                  >
                    <Icon name="trash" className="h-3.5 w-3.5" />
                  </Button>
                </li>
              ))}
            </ul>
          )}
        </CardBody>
      </Card>
    </div>
  )
}

function describeQuery(query: { text: string; region: string; province: string; comune: string; industry: string; sizeBand: string }): string {
  const parts = [query.region, query.province, query.comune, query.industry, query.sizeBand ? `${query.sizeBand} size` : '', query.text]
    .filter(Boolean)
  return parts.length > 0 ? parts.join(' · ') : 'All companies (no filters)'
}