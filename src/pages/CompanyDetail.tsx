import { useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import {
  Badge,
  Button,
  Card,
  CardBody,
  CardHeader,
  EmptyState,
  Field,
  Input,
  Modal,
  PageHeader,
  Select,
  Textarea,
} from '../components/ui'
import {
  CategoryBadge,
  ClassificationBadge,
  ConfidenceBadge,
  EvidenceBadge,
  ResearchStatusBadge,
  StageBadge,
  VerificationBadge,
} from '../components/badges'
import { BarChart } from '../components/charts'
import { ContactRow, OpportunityCard } from '../components/cards'
import { Icon } from '../components/icons'
import { formatCompactCurrency, formatCurrency, formatDate, newId } from '../lib/format'
import { sourceKindLabels } from '../lib/labels'
import {
  contactsForCompany,
  financialsForCompany,
  getCompany,
  opportunitiesForCompany,
  sourcesForCompany,
  supplyChainForCompany,
} from '../lib/selectors'
import { useApp } from '../state/AppState'
import type {
  CompanySource,
  Contact,
  Opportunity,
  OpportunityCategory,
  OpportunityStage,
  Verification,
} from '../lib/types'

type Tab = 'overview' | 'contacts' | 'opportunities' | 'financials' | 'supply'

const tabs: Array<{ id: Tab; label: string }> = [
  { id: 'overview', label: 'Intelligence' },
  { id: 'contacts', label: 'Contacts' },
  { id: 'opportunities', label: 'Opportunities' },
  { id: 'financials', label: 'Financials' },
  { id: 'supply', label: 'Supply chain' },
]

export function CompanyDetail() {
  const { companyId } = useParams<{ companyId: string }>()
  const { state, dispatch } = useApp()
  const [tab, setTab] = useState<Tab>('overview')
  const [contactOpen, setContactOpen] = useState(false)
  const [oppOpen, setOppOpen] = useState(false)

  const company = getCompany(state, companyId)

  const contacts = useMemo(() => (company ? contactsForCompany(state, company.id) : []), [state, company])
  const sources = useMemo(() => (company ? sourcesForCompany(state, company.id) : []), [state, company])
  const opportunities = useMemo(
    () => (company ? opportunitiesForCompany(state, company.id) : []),
    [state, company],
  )
  const financials = useMemo(() => (company ? financialsForCompany(state, company.id) : []), [state, company])
  const supply = useMemo(() => (company ? supplyChainForCompany(state, company.id) : []), [state, company])

  if (!company) {
    return (
      <div>
        <PageHeader title="Company not found" />
        <EmptyState
          title="No company with this id"
          description="It may have been removed or the link is incorrect."
          action={<Link to="/companies"><Button>Back to companies</Button></Link>}
        />
      </div>
    )
  }

  const revenueSeries = financials
    .filter((f) => f.metric === 'Revenue')
    .sort((a, b) => a.period.localeCompare(b.period))

  const researchComplete = company.status === 'researched'

  return (
    <div>
      <div className="mb-4">
        <Link to="/companies" className="text-xs font-medium text-indigo-600 hover:underline">
          ← All companies
        </Link>
      </div>

      <Card className="mb-5">
        <CardBody>
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-xl font-semibold tracking-tight text-slate-900">{company.name}</h1>
                <ResearchStatusBadge status={company.status} />
              </div>
              <p className="mt-1 text-sm text-slate-500">
                {company.industry} · {company.comune} ({company.province}) · {company.region}
              </p>
              <div className="mt-2 flex flex-wrap items-center gap-1.5 text-xs">
                <Badge tone="neutral">{company.employeeRange} employees</Badge>
                {company.foundedYear ? <Badge tone="neutral">Founded {company.foundedYear}</Badge> : null}
                {company.group ? <Badge tone="neutral">Group: {company.group}</Badge> : null}
                {company.website ? (
                  <a
                    href={company.website}
                    target="_blank"
                    rel="noreferrer noopener"
                    className="inline-flex items-center gap-1 font-medium text-indigo-600 hover:underline"
                  >
                    Website
                    <Icon name="external" className="h-3.5 w-3.5" />
                  </a>
                ) : null}
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              {!researchComplete ? (
                <Button
                  variant="primary"
                  onClick={() => dispatch({ type: 'UPDATE_COMPANY', id: company.id, patch: { status: 'researched' } })}
                >
                  <Icon name="check" className="h-4 w-4" />
                  Mark researched
                </Button>
              ) : null}
              <Button
                variant="secondary"
                onClick={() => {
                  dispatch({
                    type: 'LOG_ACTIVITY',
                    event: {
                      id: newId('a'),
                      type: 'meetings',
                      at: new Date().toISOString(),
                      companyId: company.id,
                      label: `Discovery meeting with ${company.name}`,
                    },
                  })
                }}
              >
                <Icon name="calendar" className="h-4 w-4" />
                Log meeting
              </Button>
              <Link to={`/outreach?company=${company.id}`}>
                <Button variant="secondary">
                  <Icon name="outreach" className="h-4 w-4" />
                  Prepare outreach
                </Button>
              </Link>
            </div>
          </div>
        </CardBody>
      </Card>

      <div className="mb-4 flex gap-1 overflow-x-auto border-b border-slate-200" role="tablist" aria-label="Company sections">
        {tabs.map((t) => (
          <button
            key={t.id}
            role="tab"
            aria-selected={tab === t.id}
            onClick={() => setTab(t.id)}
            className={`whitespace-nowrap border-b-2 px-3 pb-2 pt-1 text-sm font-medium ${
              tab === t.id
                ? 'border-indigo-600 text-indigo-700'
                : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === 'overview' ? (
        <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
          <div className="space-y-5">
            <Card>
              <CardHeader title="Company overview" description="Every sourced field is traceable below." />
              <CardBody className="space-y-4">
                <p className="text-sm leading-relaxed text-slate-700">{company.description}</p>
                <dl className="grid grid-cols-2 gap-3 text-xs sm:grid-cols-3">
                  <Fact label="Industry" value={company.industry} />
                  <Fact label="Founded" value={company.foundedYear ? String(company.foundedYear) : 'Unknown'} />
                  <Fact label="Employees" value={company.employeeRange} />
                  <Fact label="HQ comune" value={`${company.comune}`} />
                  <Fact label="Province" value={company.province} />
                  <Fact label="Region" value={company.region} />
                  {company.group ? <Fact label="Corporate group" value={company.group} /> : null}
                  {company.website ? <Fact label="Website" value={company.website} link={company.website} /> : null}
                </dl>
              </CardBody>
            </Card>

            <Card>
              <CardHeader title="Locations" description="Recorded sites, including secondary facilities." />
              <CardBody>
                <ul className="space-y-2">
                  <LocationRow label="Headquarters" region={company.region} province={company.province} comune={company.comune} />
                  {state.locations
                    .filter((loc) => loc.companyId === company.id)
                    .map((loc) => (
                      <LocationRow key={loc.id} label={loc.label} region={loc.region} province={loc.province} comune={loc.comune} address={loc.address} />
                    ))}
                </ul>
              </CardBody>
            </Card>

            <Card>
              <CardHeader title="Sources" description="Origin and retrieval date for every record." />
              <CardBody>
                {sources.length === 0 ? (
                  <EmptyState title="No sources recorded" description="Add research provenance during investigation." />
                ) : (
                  <ul className="space-y-2">
                    {sources.map((source) => (
                      <SourceRow key={source.id} source={source} />
                    ))}
                  </ul>
                )}
              </CardBody>
            </Card>

            <Card>
              <CardHeader
                title="AI business analysis"
                description="Structured hypotheses from recorded evidence — not unverified claims."
                action={
                  <Badge tone="info">
                    <Icon name="sparkles" className="h-3.5 w-3.5" />
                    Demo analysis
                  </Badge>
                }
              />
              <CardBody className="space-y-4">
                {opportunities.length === 0 ? (
                  <EmptyState
                    title="No analysis recorded"
                    description="Add an opportunity to seed the evidence-linked analysis for this company."
                    action={<Button size="sm" onClick={() => setOppOpen(true)}>Add opportunity</Button>}
                  />
                ) : (
                  opportunities.map((opp) => (
                    <div key={opp.id} className="rounded-lg border border-slate-100 p-3">
                      <div className="flex items-start justify-between gap-2">
                        <p className="text-sm font-medium text-slate-900">{opp.title}</p>
                        <StageBadge stage={opp.stage} />
                      </div>
                      <p className="mt-1 text-xs text-slate-600">{opp.problem}</p>
                      <div className="mt-2 flex flex-wrap gap-1.5">
                        <CategoryBadge category={opp.category} />
                        <EvidenceBadge evidence={opp.evidence} />
                        <ConfidenceBadge confidence={opp.confidence} />
                      </div>
                      <p className="mt-2 text-[11px] text-slate-500">
                        <span className="font-medium text-slate-600">Evidence:</span> {opp.evidenceNote}
                      </p>
                      {opp.validationQuestions.length > 0 ? (
                        <ul className="mt-2 space-y-1">
                          {opp.validationQuestions.map((q) => (
                            <li key={q} className="flex gap-1.5 text-[11px] text-slate-500">
                              <Icon name="info" className="mt-0.5 h-3 w-3 shrink-0 text-indigo-400" />
                              {q}
                            </li>
                          ))}
                        </ul>
                      ) : null}
                      <p className="mt-2 text-[11px] font-medium text-slate-600">Next action: {opp.nextAction}</p>
                    </div>
                  ))
                )}
              </CardBody>
            </Card>
          </div>

          <div className="space-y-5">
            <Card>
              <CardHeader
                title="Contacts"
                description="Professional contacts with verification status."
                action={
                  <Button size="sm" onClick={() => setContactOpen(true)}>
                    <Icon name="plus" className="h-3.5 w-3.5" />
                    Add contact
                  </Button>
                }
              />
              <CardBody className="space-y-2">
                {contacts.length === 0 ? (
                  <EmptyState title="No contacts recorded" description="Research public roles before adding anyone." />
                ) : (
                  contacts.map((contact) => (
                    <div key={contact.id} className="flex items-start justify-between gap-2 rounded-lg border border-slate-100 px-3 py-2">
                      <div>
                        <p className="text-sm font-medium text-slate-900">{contact.name}</p>
                        <p className="text-xs text-slate-500">{contact.role}</p>
                        <p className="mt-0.5 text-[11px] text-slate-400">{contact.relevance}</p>
                        {contact.email ? <p className="text-[11px] text-slate-400">{contact.email}</p> : null}
                      </div>
                      <VerificationBadge verification={contact.verification} />
                    </div>
                  ))
                )}
              </CardBody>
            </Card>

            <Card>
              <CardHeader title="Supply-chain intelligence" description="Relationships shown only where evidence exists." />
              <CardBody>
                {supply.length === 0 ? (
                  <div className="space-y-2 text-xs text-slate-500">
                    <p>No documented relationships for this company.</p>
                    <Badge tone="neutral">Unknown relationship — not inferred from industry stereotypes</Badge>
                  </div>
                ) : (
                  <ul className="space-y-2">
                    {supply.map((link) => (
                      <li key={link.id} className="flex items-start justify-between gap-2 rounded-lg border border-slate-100 px-3 py-2 text-xs">
                        <div>
                          <p className="font-medium text-slate-800">{link.partner}</p>
                          <p className="text-slate-500">{link.role}</p>
                        </div>
                        <EvidenceBadge evidence={link.evidence} />
                      </li>
                    ))}
                  </ul>
                )}
              </CardBody>
            </Card>
          </div>
        </div>
      ) : null}

      {tab === 'contacts' ? (
        <ContactsTable
          contacts={contacts}
          sources={sources}
          onAdd={() => setContactOpen(true)}
        />
      ) : null}

      {tab === 'opportunities' ? (
        <div>
          <div className="mb-3 flex items-center justify-between">
            <p className="text-sm text-slate-500">
              {opportunities.length} recorded opportunit{opportunities.length === 1 ? 'y' : 'ies'}.
            </p>
            <Button size="sm" onClick={() => setOppOpen(true)}>
              <Icon name="plus" className="h-3.5 w-3.5" />
              Add opportunity
            </Button>
          </div>
          {opportunities.length === 0 ? (
            <EmptyState title="No opportunities" description="Record the first business hypothesis for this company." />
          ) : (
            <div className="space-y-3">
              {opportunities.map((opp) => (
                <OpportunityCard key={opp.id} opportunity={opp} />
              ))}
            </div>
          )}
        </div>
      ) : null}

      {tab === 'financials' ? (
        <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
          <Card>
            <CardHeader title="Financial records" description="Values keep their reporting period and classification." />
            <CardBody>
              {financials.length === 0 ? (
                <EmptyState title="No financial records" description="Reported figures are not invented without a source." />
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="border-b border-slate-100 text-slate-400">
                        <th className="py-2 pr-3 font-medium">Metric</th>
                        <th className="py-2 pr-3 font-medium">Value</th>
                        <th className="py-2 pr-3 font-medium">Period</th>
                        <th className="py-2 pr-3 font-medium">Class</th>
                      </tr>
                    </thead>
                    <tbody>
                      {financials.map((record) => (
                        <tr key={record.id} className="border-b border-slate-50">
                          <td className="py-2 pr-3 text-slate-700">{record.metric}</td>
                          <td className="py-2 pr-3 font-medium text-slate-900">
                            {record.metric === 'Revenue' || record.metric === 'Net profit' || record.metric === 'EBITDA'
                              ? formatCurrency(record.value)
                              : record.value.toLocaleString()}
                          </td>
                          <td className="py-2 pr-3 text-slate-500">{record.period}</td>
                          <td className="py-2"><ClassificationBadge classification={record.classification} /></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardBody>
          </Card>

          <Card>
            <CardHeader title="Revenue history" description="Chart shown only when comparable periods exist." />
            <CardBody>
              <BarChart
                data={revenueSeries.map((r) => ({
                  label: r.period,
                  value: r.value,
                  sublabel: r.classification,
                }))}
                formatValue={(v) => formatCompactCurrency(v)}
                height={180}
              />
            </CardBody>
          </Card>
        </div>
      ) : null}

      {tab === 'supply' ? (
        <Card>
          <CardHeader title="Supply-chain relationships" description="Only documented links are visualised; the rest remain explicitly unknown." />
          <CardBody>
            <ul className="space-y-2">
              {supply.map((link) => (
                <li key={link.id} className="flex items-start justify-between gap-3 rounded-lg border border-slate-100 px-3 py-2.5 text-sm">
                  <div>
                    <p className="font-medium text-slate-900">{link.partner}</p>
                    <p className="text-xs text-slate-500">{link.role}</p>
                  </div>
                  <EvidenceBadge evidence={link.evidence} />
                </li>
              ))}
            </ul>
            {supply.length === 0 ? (
              <EmptyState title="No documented relationships" description="Unknown by design — not invented from industry stereotypes." />
            ) : null}
          </CardBody>
        </Card>
      ) : null}

      <AddContactModal open={contactOpen} onClose={() => setContactOpen(false)} companyId={company.id} />
      <AddOpportunityModal open={oppOpen} onClose={() => setOppOpen(false)} companyId={company.id} />
    </div>
  )
}

function Fact({ label, value, link }: { label: string; value: string; link?: string }) {
  return (
    <div>
      <dt className="text-slate-400">{label}</dt>
      <dd className="mt-0.5 font-medium text-slate-800">
        {link ? (
          <a href={link} target="_blank" rel="noreferrer noopener" className="text-indigo-600 hover:underline">
            {value}
          </a>
        ) : (
          value
        )}
      </dd>
    </div>
  )
}

function LocationRow({
  label,
  region,
  province,
  comune,
  address,
}: {
  label: string
  region: string
  province: string
  comune: string
  address?: string
}) {
  return (
    <li className="flex items-start gap-2 text-xs">
      <Icon name="building" className="mt-0.5 h-3.5 w-3.5 shrink-0 text-slate-400" />
      <span>
        <span className="font-medium text-slate-700">{label}:</span>{' '}
        <span className="text-slate-600">
          {comune} ({province}), {region}
          {address ? ` — ${address}` : ''}
        </span>
      </span>
    </li>
  )
}

function SourceRow({ source }: { source: CompanySource }) {
  return (
    <li className="flex items-start justify-between gap-2 text-xs">
      <div className="flex items-start gap-2">
        <Icon name="link" className="mt-0.5 h-3.5 w-3.5 shrink-0 text-slate-400" />
        <span>
          <span className="font-medium text-slate-700">{source.label}</span>
          {source.url ? (
            <a href={source.url} target="_blank" rel="noreferrer noopener" className="ml-1 text-indigo-600 hover:underline">
              source
            </a>
          ) : null}
          <span className="block text-slate-400">Retrieved {formatDate(source.retrievedAt)}</span>
        </span>
      </div>
      <Badge tone="neutral">{sourceKindLabels[source.kind]}</Badge>
    </li>
  )
}

function ContactsTable({
  contacts,
  sources,
  onAdd,
}: {
  contacts: Contact[]
  sources: CompanySource[]
  onAdd: () => void
}) {
  return (
    <Card className="overflow-x-auto">
      <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3">
        <p className="text-sm text-slate-500">{contacts.length} contacts</p>
        <Button size="sm" onClick={onAdd}>
          <Icon name="plus" className="h-3.5 w-3.5" />
          Add contact
        </Button>
      </div>
      {contacts.length === 0 ? (
        <div className="p-4">
          <EmptyState title="No contacts" description="Contact records are added only from reliable research." />
        </div>
      ) : (
        <table className="w-full min-w-[640px] text-left">
          <thead>
            <tr className="border-b border-slate-100 text-xs text-slate-400">
              <th className="px-3 py-2.5 font-medium">Contact</th>
              <th className="px-3 py-2.5 font-medium">Verification</th>
              <th className="px-3 py-2.5 font-medium">Source</th>
            </tr>
          </thead>
          <tbody>
            {contacts.map((contact) => {
              const source = sources.find((s) => s.id === contact.sourceId)
              return (
                <tr key={contact.id} className="border-b border-slate-50">
                  <td className="px-3 py-2.5">
                    <p className="text-sm font-medium text-slate-900">{contact.name}</p>
                    <p className="text-xs text-slate-500">{contact.role} · {contact.relevance}</p>
                    {contact.email ? <p className="text-[11px] text-slate-400">{contact.email}</p> : null}
                  </td>
                  <td className="px-3 py-2.5"><VerificationBadge verification={contact.verification} /></td>
                  <td className="px-3 py-2.5 text-xs text-slate-500">{source?.label ?? '—'}</td>
                </tr>
              )
            })}
          </tbody>
        </table>
      )}
    </Card>
  )
}

function AddContactModal({ open, onClose, companyId }: { open: boolean; onClose: () => void; companyId: string }) {
  const { dispatch } = useApp()
  const [form, setForm] = useState({ name: '', role: '', relevance: '', email: '', verification: 'unverified' as Verification })

  const invalid = !form.name.trim() || !form.role.trim()

  const submit = () => {
    if (invalid) return
    const contact: Contact = {
      id: newId('p'),
      companyId,
      name: form.name.trim(),
      role: form.role.trim(),
      relevance: form.relevance.trim() || 'Relevance not yet recorded.',
      email: form.email.trim() || undefined,
      verification: form.verification,
    }
    dispatch({ type: 'ADD_CONTACT', contact })
    setForm({ name: '', role: '', relevance: '', email: '', verification: 'unverified' })
    onClose()
  }

  return (
    <Modal
      open={open}
      title="Add contact"
      onClose={onClose}
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>Cancel</Button>
          <Button variant="primary" onClick={submit} disabled={invalid}>Add contact</Button>
        </>
      }
    >
      <div className="space-y-3">
        <p className="text-xs text-slate-500">
          Record only professional contacts found in reliable public sources. New contacts start as{' '}
          <Badge tone="danger">Unverified</Badge>.
        </p>
        <Field label="Name">
          <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="e.g. Mario Verdi" />
        </Field>
        <Field label="Role">
          <Input value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })} placeholder="e.g. Operations Manager" />
        </Field>
        <Field label="Relevance to your services">
          <Input value={form.relevance} onChange={(e) => setForm({ ...form, relevance: e.target.value })} placeholder="Why this person matters" />
        </Field>
        <Field label="Public business email">
          <Input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="name@company.it (optional)" />
        </Field>
      </div>
    </Modal>
  )
}

function AddOpportunityModal({ open, onClose, companyId }: { open: boolean; onClose: () => void; companyId: string }) {
  const { dispatch } = useApp()
  const [form, setForm] = useState({
    title: '',
    problem: '',
    category: 'automation' as OpportunityCategory,
    service: '',
    evidence: 'hypothesis' as Opportunity['evidence'],
    confidence: 'low' as Opportunity['confidence'],
    impact: 3,
    evidenceStrength: 2,
    feasibility: 3,
    strategic: 3,
    stage: 'identified' as OpportunityStage,
    nextAction: '',
    validationQuestions: '',
  })

  const invalid = !form.title.trim() || !form.problem.trim() || !form.service.trim()

  const submit = () => {
    if (invalid) return
    const opportunity: Opportunity = {
      id: newId('o'),
      companyId,
      title: form.title.trim(),
      problem: form.problem.trim(),
      category: form.category,
      service: form.service.trim(),
      stage: form.stage,
      priorityOverride: 0,
      impact: form.impact,
      evidenceStrength: form.evidenceStrength,
      feasibility: form.feasibility,
      strategic: form.strategic,
      confidence: form.confidence,
      evidence: form.evidence,
      evidenceNote: 'Recorded manually; classify evidence honestly before adding.',
      sourceIds: [],
      validationQuestions: form.validationQuestions
        .split('\n')
        .map((q) => q.trim())
        .filter(Boolean),
      nextAction: form.nextAction.trim() || 'Validate the hypothesis before outreach.',
      notes: '',
      createdAt: new Date().toISOString(),
    }
    dispatch({ type: 'ADD_OPPORTUNITY', opportunity })
    onClose()
  }

  return (
    <Modal
      open={open}
      title="Add opportunity"
      onClose={onClose}
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>Cancel</Button>
          <Button variant="primary" onClick={submit} disabled={invalid}>Add opportunity</Button>
        </>
      }
    >
      <div className="space-y-3">
        <p className="text-xs text-slate-500">
          Every opportunity carries an explicit evidence and confidence classification. New entries
          default to <EvidenceBadge evidence="hypothesis" /> — upgrade to <Badge tone="success">Verified fact</Badge> only
          when a source supports it.
        </p>
        <Field label="Title">
          <Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="e.g. Automate production reporting" />
        </Field>
        <Field label="Problem hypothesis">
          <Textarea value={form.problem} onChange={(e) => setForm({ ...form, problem: e.target.value })} placeholder="What problem could your service solve?" />
        </Field>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Category">
            <Select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value as OpportunityCategory })}>
              <option value="software">Software development</option>
              <option value="ai">AI implementation</option>
              <option value="automation">Automation</option>
              <option value="data">Data & BI</option>
            </Select>
          </Field>
          <Field label="Proposed service">
            <Input value={form.service} onChange={(e) => setForm({ ...form, service: e.target.value })} placeholder="e.g. Reporting automation" />
          </Field>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Evidence classification">
            <Select value={form.evidence} onChange={(e) => setForm({ ...form, evidence: e.target.value as Opportunity['evidence'] })}>
              <option value="verified">Verified fact</option>
              <option value="supported">Supported inference</option>
              <option value="hypothesis">Hypothesis</option>
              <option value="unknown">Unknown</option>
            </Select>
          </Field>
          <Field label="Confidence">
            <Select value={form.confidence} onChange={(e) => setForm({ ...form, confidence: e.target.value as Opportunity['confidence'] })}>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </Select>
          </Field>
        </div>
        <div className="grid grid-cols-4 gap-3">
          {(['impact', 'evidenceStrength', 'feasibility', 'strategic'] as const).map((key) => (
            <Field key={key} label={key}>
              <Select
                value={form[key]}
                onChange={(e) => setForm({ ...form, [key]: Number(e.target.value) })}
              >
                {[1, 2, 3, 4, 5].map((n) => (
                  <option key={n} value={n}>{n}</option>
                ))}
              </Select>
            </Field>
          ))}
        </div>
        <Field label="Validation questions (one per line)">
          <Textarea value={form.validationQuestions} onChange={(e) => setForm({ ...form, validationQuestions: e.target.value })} placeholder={'How is this done today?\nWho owns the process?'} />
        </Field>
        <Field label="Next action">
          <Input value={form.nextAction} onChange={(e) => setForm({ ...form, nextAction: e.target.value })} placeholder="e.g. Book a discovery call" />
        </Field>
      </div>
    </Modal>
  )
}