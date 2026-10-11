import { useMemo, useState } from 'react'
import { Button, Card, CardBody, EmptyState, Field, Input, Modal, PageHeader, Select } from '../components/ui'
import { Badge, ResearchStatusBadge } from '../components/badges'
import { CompanyCard } from '../components/cards'
import { Icon } from '../components/icons'
import { DEMO_DATA_NOTICE, getComuneOptions, getIndustryOptions, getProvinceOptions, getRegionOptions } from '../lib/demoData'
import { newId } from '../lib/format'
import { opportunitiesForCompany, sourcesForCompany } from '../lib/selectors'
import { useApp } from '../state/AppState'
import type { Company, CompanySizeBand, SavedSearch } from '../lib/types'

const pageSize = 9

function matchesQuery(company: Company, query: DiscoverForm): boolean {
  const text = query.text.trim().toLowerCase()
  if (text) {
    const haystack = [company.name, company.industry, company.description, company.comune, company.province]
      .join(' ')
      .toLowerCase()
    if (!haystack.includes(text)) return false
  }
  if (query.region && company.region !== query.region) return false
  if (query.province && company.province !== query.province) return false
  if (query.comune && company.comune !== query.comune) return false
  if (query.industry && company.industry !== query.industry) return false
  if (query.sizeBand && company.sizeBand !== query.sizeBand) return false
  return true
}

interface DiscoverForm {
  text: string
  region: string
  province: string
  comune: string
  industry: string
  sizeBand: CompanySizeBand | ''
}

const emptyForm: DiscoverForm = {
  text: '',
  region: '',
  province: '',
  comune: '',
  industry: '',
  sizeBand: '',
}

function relevanceFor(company: Company, state: ReturnType<typeof useApp>['state']): string {
  const parts: string[] = []
  const opps = opportunitiesForCompany(state, company.id)
  const srcs = sourcesForCompany(state, company.id)
  if (opps.length > 0) parts.push(`${opps.length} opportunity record${opps.length === 1 ? '' : 's'}`)
  if (srcs.length > 0) parts.push(`${srcs.length} source${srcs.length === 1 ? '' : 's'} on file`)
  if (company.status !== 'researched') parts.push('research incomplete')
  return parts.length > 0 ? parts.join(' · ') : 'No research recorded yet'
}

export function Discover() {
  const { state, dispatch } = useApp()
  const [form, setForm] = useState<DiscoverForm>(emptyForm)
  const [view, setView] = useState<'grid' | 'list'>('grid')
  const [sort, setSort] = useState<'name' | 'size' | 'newest'>('name')
  const [page, setPage] = useState(1)
  const [addOpen, setAddOpen] = useState(false)

  const regions = getRegionOptions(state)
  const provinces = getProvinceOptions(state, form.region || undefined)
  const comunes = getComuneOptions(state, form.province || undefined)
  const industries = getIndustryOptions(state)

  const results = useMemo(() => {
    const filtered = state.companies.filter((c) => matchesQuery(c, form))
    const sorted = [...filtered].sort((a, b) => {
      if (sort === 'size') return b.employeeRange.localeCompare(a.employeeRange)
      if (sort === 'newest') return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      return a.name.localeCompare(b.name)
    })
    return sorted
  }, [state.companies, form, sort])

  const pageCount = Math.max(1, Math.ceil(results.length / pageSize))
  const safePage = Math.min(page, pageCount)
  const visible = results.slice((safePage - 1) * pageSize, safePage * pageSize)

  const set = (patch: Partial<DiscoverForm>) => {
    setForm((f) => ({ ...f, ...patch }))
    setPage(1)
  }

  const hasFilters = form.text || form.region || form.province || form.comune || form.industry || form.sizeBand

  const saveCurrentSearch = () => {
    const label = window.prompt('Name this saved search:', `${form.region || 'All regions'} · ${form.industry || 'all industries'}`)
    if (!label) return
    const search: SavedSearch = { id: newId('ss'), label, query: form, createdAt: new Date().toISOString() }
    dispatch({ type: 'ADD_SAVED_SEARCH', search })
  }

  const applySaved = (search: SavedSearch) => {
    setForm({ ...emptyForm, ...search.query })
  }

  const resetForm = () => {
    setForm(emptyForm)
    setPage(1)
  }

  return (
    <div>
      <PageHeader
        title="Business discovery"
        description="Search a clearly-labelled demo dataset of Italian companies by location and industry."
        action={
          <Button variant="primary" onClick={() => setAddOpen(true)}>
            <Icon name="plus" className="h-4 w-4" />
            Add company
          </Button>
        }
      />

      <div className="mb-5 flex items-start gap-2 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-800">
        <Icon name="info" className="mt-0.5 h-4 w-4 shrink-0" />
        <p>{DEMO_DATA_NOTICE}</p>
      </div>

      <Card className="mb-5">
        <CardBody>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3 lg:grid-cols-6">
            <div className="sm:col-span-3 lg:col-span-2">
              <Field label="Search">
                <Input
                  placeholder="Company name, industry, comune…"
                  value={form.text}
                  onChange={(e) => set({ text: e.target.value })}
                />
              </Field>
            </div>
            <Field label="Region">
              <Select value={form.region} onChange={(e) => set({ region: e.target.value, province: '', comune: '' })}>
                <option value="">All regions</option>
                {regions.map((r) => (
                  <option key={r} value={r}>{r}</option>
                ))}
              </Select>
            </Field>
            <Field label="Province">
              <Select
                value={form.province}
                onChange={(e) => set({ province: e.target.value, comune: '' })}
                disabled={!form.region}
              >
                <option value="">All provinces</option>
                {provinces.map((p) => (
                  <option key={p} value={p}>{p}</option>
                ))}
              </Select>
            </Field>
            <Field label="Comune">
              <Select value={form.comune} onChange={(e) => set({ comune: e.target.value })} disabled={!form.province}>
                <option value="">All comunes</option>
                {comunes.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </Select>
            </Field>
            <Field label="Industry">
              <Select value={form.industry} onChange={(e) => set({ industry: e.target.value })}>
                <option value="">All industries</option>
                {industries.map((ind) => (
                  <option key={ind} value={ind}>{ind}</option>
                ))}
              </Select>
            </Field>
            <Field label="Size band">
              <Select value={form.sizeBand} onChange={(e) => set({ sizeBand: e.target.value as CompanySizeBand | '' })}>
                <option value="">Any size</option>
                <option value="micro">Micro</option>
                <option value="small">Small</option>
                <option value="medium">Medium</option>
                <option value="large">Large</option>
              </Select>
            </Field>
          </div>

          <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
            <div className="flex flex-wrap items-center gap-2">
              <Select value={sort} onChange={(e) => setSort(e.target.value as typeof sort)} className="w-auto">
                <option value="name">Sort by name</option>
                <option value="size">Sort by size</option>
                <option value="newest">Sort by newest</option>
              </Select>
              <Button variant="ghost" size="sm" onClick={resetForm} disabled={!hasFilters}>
                <Icon name="refresh" className="h-3.5 w-3.5" />
                Clear filters
              </Button>
              <Button variant="ghost" size="sm" onClick={saveCurrentSearch} disabled={!hasFilters}>
                <Icon name="plus" className="h-3.5 w-3.5" />
                Save search
              </Button>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-500">
                {results.length} result{results.length === 1 ? '' : 's'}
              </span>
              <div className="flex rounded-lg border border-slate-300 p-0.5">
                <button
                  type="button"
                  onClick={() => setView('grid')}
                  aria-pressed={view === 'grid'}
                  className={`rounded-md px-2 py-1 text-xs ${view === 'grid' ? 'bg-indigo-600 text-white' : 'text-slate-500 hover:bg-slate-100'}`}
                >
                  Grid
                </button>
                <button
                  type="button"
                  onClick={() => setView('list')}
                  aria-pressed={view === 'list'}
                  className={`rounded-md px-2 py-1 text-xs ${view === 'list' ? 'bg-indigo-600 text-white' : 'text-slate-500 hover:bg-slate-100'}`}
                >
                  List
                </button>
              </div>
            </div>
          </div>
        </CardBody>
      </Card>

      {state.savedSearches.length > 0 ? (
        <div className="mb-5 flex flex-wrap items-center gap-2">
          <span className="text-xs font-medium text-slate-500">Saved searches:</span>
          {state.savedSearches.map((search) => (
            <span key={search.id} className="inline-flex items-center gap-1 rounded-full border border-slate-200 bg-white py-0.5 pl-2.5 pr-1 text-xs text-slate-600">
              <button type="button" className="hover:text-indigo-600" onClick={() => applySaved(search)}>
                {search.label}
              </button>
              <button
                type="button"
                aria-label={`Delete saved search ${search.label}`}
                className="rounded-full p-0.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
                onClick={() => dispatch({ type: 'REMOVE_SAVED_SEARCH', id: search.id })}
              >
                <Icon name="close" className="h-3 w-3" />
              </button>
            </span>
          ))}
        </div>
      ) : null}

      {results.length === 0 ? (
        <EmptyState
          title="No matching companies"
          description="Try clearing some filters or adjusting the geographic/industry selections."
          action={
            <Button size="sm" onClick={resetForm}>Clear filters</Button>
          }
        />
      ) : (
        <>
          <div className={view === 'grid' ? 'grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3' : 'space-y-3'}>
            {visible.map((company) => (
              <CompanyCard
                key={company.id}
                company={company}
                relevance={relevanceFor(company, state)}
                actions={<ResearchStatusBadge status={company.status} />}
              />
            ))}
          </div>

          {pageCount > 1 ? (
            <nav className="mt-5 flex items-center justify-center gap-2" aria-label="Pagination">
              <Button size="sm" variant="secondary" onClick={() => setPage(safePage - 1)} disabled={safePage <= 1}>
                Previous
              </Button>
              <span className="text-xs text-slate-500">
                Page {safePage} of {pageCount}
              </span>
              <Button size="sm" variant="secondary" onClick={() => setPage(safePage + 1)} disabled={safePage >= pageCount}>
                Next
              </Button>
            </nav>
          ) : null}
        </>
      )}

      <AddCompanyModal open={addOpen} onClose={() => setAddOpen(false)} />
    </div>
  )
}

// --- Add company -------------------------------------------------------------

function AddCompanyModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { dispatch } = useApp()
  const [form, setForm] = useState({
    name: '',
    industry: '',
    region: '',
    province: '',
    comune: '',
    employeeRange: '',
    sizeBand: 'small' as CompanySizeBand,
    website: '',
    description: '',
  })

  const invalid = !form.name.trim() || !form.industry.trim() || !form.region.trim() || !form.province.trim() || !form.comune.trim()

  const submit = () => {
    if (invalid) return
    const company: Company = {
      id: newId('c'),
      name: form.name.trim(),
      industry: form.industry.trim(),
      description: form.description.trim() || 'No description recorded yet.',
      website: form.website.trim() || undefined,
      employeeRange: form.employeeRange.trim() || 'Not disclosed',
      sizeBand: form.sizeBand,
      region: form.region.trim(),
      province: form.province.trim(),
      comune: form.comune.trim(),
      status: 'new',
      createdAt: new Date().toISOString(),
    }
    dispatch({ type: 'ADD_COMPANY', company })
    dispatch({
      type: 'LOG_ACTIVITY',
      event: {
        id: newId('a'),
        type: 'company_discovered',
        at: new Date().toISOString(),
        companyId: company.id,
        label: `Discovered ${company.name}`,
      },
    })
    setForm({
      name: '',
      industry: '',
      region: '',
      province: '',
      comune: '',
      employeeRange: '',
      sizeBand: 'small',
      website: '',
      description: '',
    })
    onClose()
  }

  return (
    <Modal
      open={open}
      title="Add company record"
      onClose={onClose}
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>Cancel</Button>
          <Button variant="primary" onClick={submit} disabled={invalid}>Add company</Button>
        </>
      }
    >
      <div className="space-y-3">
        <p className="text-xs text-slate-500">
          Adds a record to the local demo dataset. Mark it <Badge tone="warning">New</Badge> until research
          is recorded — never invent real facts.
        </p>
        <Field label="Company name">
          <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="e.g. Officina Meccanica S.r.l." />
        </Field>
        <Field label="Industry">
          <Input value={form.industry} onChange={(e) => setForm({ ...form, industry: e.target.value })} placeholder="e.g. Metalworking" />
        </Field>
        <div className="grid grid-cols-3 gap-3">
          <Field label="Region">
            <Input value={form.region} onChange={(e) => setForm({ ...form, region: e.target.value })} placeholder="Veneto" />
          </Field>
          <Field label="Province">
            <Input value={form.province} onChange={(e) => setForm({ ...form, province: e.target.value })} placeholder="Treviso" />
          </Field>
          <Field label="Comune">
            <Input value={form.comune} onChange={(e) => setForm({ ...form, comune: e.target.value })} placeholder="Mogliano" />
          </Field>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Employee range">
            <Input value={form.employeeRange} onChange={(e) => setForm({ ...form, employeeRange: e.target.value })} placeholder="e.g. 10–19" />
          </Field>
          <Field label="Size band">
            <Select value={form.sizeBand} onChange={(e) => setForm({ ...form, sizeBand: e.target.value as CompanySizeBand })}>
              <option value="micro">Micro</option>
              <option value="small">Small</option>
              <option value="medium">Medium</option>
              <option value="large">Large</option>
            </Select>
          </Field>
        </div>
        <Field label="Website">
          <Input value={form.website} onChange={(e) => setForm({ ...form, website: e.target.value })} placeholder="https://…" />
        </Field>
        <Field label="Description">
          <Input value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="What the company does (optional)" />
        </Field>
      </div>
    </Modal>
  )
}