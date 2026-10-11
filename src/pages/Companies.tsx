import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { Button, Card, EmptyState, Input, PageHeader, Select } from '../components/ui'
import { ResearchStatusBadge } from '../components/badges'
import { Icon } from '../components/icons'
import { opportunitiesForCompany, contactsForCompany } from '../lib/selectors'
import { useApp } from '../state/AppState'
import type { ResearchStatus } from '../lib/types'

const statusOptions: Array<{ value: ResearchStatus | ''; label: string }> = [
  { value: '', label: 'All statuses' },
  { value: 'new', label: 'New' },
  { value: 'researching', label: 'Researching' },
  { value: 'researched', label: 'Researched' },
]

export function Companies() {
  const { state } = useApp()
  const [text, setText] = useState('')
  const [status, setStatus] = useState<ResearchStatus | ''>('')
  const [region, setRegion] = useState('')

  const regions = useMemo(
    () => Array.from(new Set(state.companies.map((c) => c.region))).sort((a, b) => a.localeCompare(b)),
    [state.companies],
  )

  const companies = useMemo(() => {
    const need = text.trim().toLowerCase()
    return state.companies
      .filter((c) => {
        if (status && c.status !== status) return false
        if (region && c.region !== region) return false
        if (need) {
          const haystack = [c.name, c.industry, c.comune, c.province, c.description].join(' ').toLowerCase()
          if (!haystack.includes(need)) return false
        }
        return true
      })
      .sort((a, b) => a.name.localeCompare(b.name))
  }, [state.companies, text, status, region])

  return (
    <div>
      <PageHeader
        title="Companies"
        description="All companies in your research workspace, with research status."
      />

      <Card className="mb-5">
        <div className="flex flex-wrap items-center gap-3 px-4 py-3">
          <Input
            placeholder="Search name, industry, location…"
            value={text}
            onChange={(e) => setText(e.target.value)}
            className="max-w-xs"
          />
          <Select value={status} onChange={(e) => setStatus(e.target.value as ResearchStatus | '')} className="w-auto">
            {statusOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </Select>
          <Select value={region} onChange={(e) => setRegion(e.target.value)} className="w-auto">
            <option value="">All regions</option>
            {regions.map((r) => (
              <option key={r} value={r}>{r}</option>
            ))}
          </Select>
          <span className="ml-auto text-xs text-slate-500">
            {companies.length} of {state.companies.length}
          </span>
        </div>
      </Card>

      {companies.length === 0 ? (
        <EmptyState
          title="No companies found"
          description="Adjust the search or clear the filters."
          action={<Button size="sm" onClick={() => { setText(''); setStatus(''); setRegion('') }}>Clear filters</Button>}
        />
      ) : (
        <Card className="overflow-x-auto">
          <table className="w-full min-w-[720px] text-left">
            <thead>
              <tr className="border-b border-slate-100 text-xs text-slate-400">
                <th className="px-4 py-2.5 font-medium">Company</th>
                <th className="px-4 py-2.5 font-medium">Location</th>
                <th className="px-4 py-2.5 font-medium">Industry</th>
                <th className="px-4 py-2.5 font-medium">Status</th>
                <th className="px-4 py-2.5 font-medium">Opportunities</th>
                <th className="px-4 py-2.5 font-medium">Contacts</th>
                <th className="px-4 py-2.5 font-medium" />
              </tr>
            </thead>
            <tbody>
              {companies.map((company) => {
                const oppCount = opportunitiesForCompany(state, company.id).length
                const contactCount = contactsForCompany(state, company.id).length
                return (
                  <tr key={company.id} className="border-b border-slate-100 last:border-0 hover:bg-slate-50/60">
                    <td className="px-4 py-3">
                      <Link to={`/companies/${company.id}`} className="text-sm font-medium text-slate-900 hover:text-indigo-700">
                        {company.name}
                      </Link>
                      <p className="text-xs text-slate-400">{company.employeeRange} employees</p>
                    </td>
                    <td className="px-4 py-3 text-xs text-slate-600">
                      {company.comune} ({company.province})
                      <p className="text-slate-400">{company.region}</p>
                    </td>
                    <td className="px-4 py-3 text-xs text-slate-600">{company.industry}</td>
                    <td className="px-4 py-3"><ResearchStatusBadge status={company.status} /></td>
                    <td className="px-4 py-3 text-xs text-slate-600">{oppCount}</td>
                    <td className="px-4 py-3 text-xs text-slate-600">{contactCount}</td>
                    <td className="px-4 py-3 text-right">
                      <Link
                        to={`/companies/${company.id}`}
                        className="inline-flex items-center gap-1 text-xs font-medium text-indigo-600 hover:underline"
                      >
                        Open
                        <Icon name="arrowRight" className="h-3.5 w-3.5" />
                      </Link>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </Card>
      )}
    </div>
  )
}