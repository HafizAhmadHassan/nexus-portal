import { useEffect, useMemo, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import {
  Badge,
  Button,
  Card,
  CardBody,
  CardHeader,
  EmptyState,
  Field,
  Input,
  PageHeader,
  Select,
  Textarea,
} from '../components/ui'
import { EvidenceBadge } from '../components/badges'
import { Icon } from '../components/icons'
import { formatDateTime } from '../lib/format'
import { docTypeLabels, languageLabels, sourceKindLabels, toneLabels } from '../lib/labels'
import { GENERATION_NOTICE, generateOutreach, outreachFilename } from '../lib/outreach'
import { getCompany, getContact, getOpportunity, sourcesForCompany } from '../lib/selectors'
import { useApp } from '../state/AppState'
import type {
  OutreachDoc,
  OutreachDocType,
  OutreachLanguage,
  OutreachTone,
} from '../lib/types'

export function OutreachStudio() {
  const { state, dispatch } = useApp()
  const [searchParams] = useSearchParams()

  const presetCompany = searchParams.get('company') ?? ''
  const presetOpportunity = searchParams.get('opportunity') ?? ''

  // --- generator settings -----------------------------------------------------
  const [genCompanyId, setGenCompanyId] = useState(presetCompany)
  const [genContactId, setGenContactId] = useState('')
  const [genOpportunityId, setGenOpportunityId] = useState(presetOpportunity)
  const [docType, setDocType] = useState<OutreachDocType>('initial')
  const [language, setLanguage] = useState<OutreachLanguage>('it')
  const [tone, setTone] = useState<OutreachTone>('consultative')
  const [service, setService] = useState('')
  const [cta, setCta] = useState('')

  useEffect(() => {
    if (presetCompany) setGenCompanyId(presetCompany)
    if (presetOpportunity) setGenOpportunityId(presetOpportunity)
  }, [presetCompany, presetOpportunity])

  const companiesForGen = state.companies
  const contactsForGen = state.contacts.filter((c) => c.companyId === genCompanyId)
  const oppsForGen = state.opportunities.filter((o) => o.companyId === genCompanyId)

  useEffect(() => {
    if (!contactsForGen.some((c) => c.id === genContactId)) setGenContactId('')
  }, [contactsForGen, genContactId])

  useEffect(() => {
    if (!oppsForGen.some((o) => o.id === genOpportunityId)) setGenOpportunityId('')
  }, [oppsForGen, genOpportunityId])

  // Keep the service aligned with the selected opportunity when available.
  useEffect(() => {
    const opp = getOpportunity(state, genOpportunityId)
    if (opp && opp.service) setService(opp.service)
  }, [genOpportunityId, state])

  const genCompany = getCompany(state, genCompanyId)
  const genContact = getContact(state, genContactId)
  const genOpportunity = getOpportunity(state, genOpportunityId)

  const canGenerate = !!genCompanyId

  const generate = () => {
    if (!genCompany || !genCompanyId) return
    const output = generateOutreach({
      company: genCompany,
      contact: genContact,
      opportunity: genOpportunity,
      docType,
      language,
      tone,
      service: service.trim() || genOpportunity?.service || 'custom software & data services',
      callToAction: cta,
      sender: state.settings.sender,
      sources: sourcesForCompany(state, genCompanyId),
    })
    const doc: OutreachDoc = {
      id: `d_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 7)}`,
      companyId: genCompanyId,
      contactId: genContact?.id,
      opportunityId: genOpportunity?.id,
      docType,
      language,
      tone,
      service: service.trim() || genOpportunity?.service || '',
      ...output,
      versions: [
        {
          id: `v_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 7)}`,
          label: 'Generated draft',
          subject: output.subject,
          body: output.body,
          createdAt: new Date().toISOString(),
        },
      ],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
    dispatch({ type: 'ADD_OUTREACH', doc })
    setSelectedDocId(doc.id)
  }

  // --- editor -----------------------------------------------------------------
  const [selectedDocId, setSelectedDocId] = useState('')
  const [draft, setDraft] = useState({ subject: '', body: '' })
  const [dirty, setDirty] = useState(false)

  const docs = [...state.outreach].sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
  const selectedDoc = state.outreach.find((d) => d.id === selectedDocId)

  useEffect(() => {
    if (selectedDoc && (draft.subject !== selectedDoc.subject || draft.body !== selectedDoc.body)) {
      setDraft({ subject: selectedDoc.subject, body: selectedDoc.body })
      setDirty(false)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedDocId, selectedDoc?.subject, selectedDoc?.body])

  const updateDraft = (patch: Partial<{ subject: string; body: string }>) => {
    setDraft((d) => ({ ...d, ...patch }))
    if (selectedDoc) setDirty(patch.subject !== selectedDoc.subject || patch.body !== selectedDoc.body)
  }

  const saveRevision = () => {
    if (!selectedDoc) return
    dispatch({
      type: 'ADD_OUTREACH_VERSION',
      id: selectedDoc.id,
      version: {
        id: `v_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 7)}`,
        label: `Revision ${selectedDoc.versions.length}`,
        subject: draft.subject,
        body: draft.body,
        createdAt: new Date().toISOString(),
      },
    })
    dispatch({ type: 'UPDATE_OUTREACH', id: selectedDoc.id, patch: { ...draft } })
    setDirty(false)
  }

  const regenerate = () => {
    if (!selectedDoc) return
    const company = getCompany(state, selectedDoc.companyId)
    if (!company) return
    const contact = getContact(state, selectedDoc.contactId)
    const opportunity = getOpportunity(state, selectedDoc.opportunityId)
    const output = generateOutreach({
      company,
      contact,
      opportunity,
      docType: selectedDoc.docType,
      language: selectedDoc.language,
      tone: selectedDoc.tone,
      service: selectedDoc.service,
      callToAction: '',
      sender: state.settings.sender,
      sources: sourcesForCompany(state, selectedDoc.companyId),
    })
    dispatch({
      type: 'ADD_OUTREACH_VERSION',
      id: selectedDoc.id,
      version: {
        id: `v_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 7)}`,
        label: 'Regenerated draft',
        subject: output.subject,
        body: output.body,
        createdAt: new Date().toISOString(),
      },
    })
    dispatch({ type: 'UPDATE_OUTREACH', id: selectedDoc.id, patch: output })
    setDraft({ subject: output.subject, body: output.body })
    setDirty(false)
  }

  const markSent = () => {
    if (!selectedDoc) return
    if (!window.confirm('Confirm this draft as sent? This records the action and counts toward your weekly goal. No email is actually sent.')) return
    dispatch({ type: 'MARK_OUTREACH_SENT', id: selectedDoc.id })
  }

  const copyToClipboard = async () => {
    if (!selectedDoc) return
    const content = `Subject: ${selectedDoc.subject}\n\n${selectedDoc.body}`
    try {
      await navigator.clipboard.writeText(content)
      window.alert('Draft copied to clipboard.')
    } catch {
      window.alert('Clipboard unavailable in this browser — use Export instead.')
    }
  }

  const exportDoc = (format: 'txt' | 'md') => {
    if (!selectedDoc) return
    const filename = outreachFilename(
      getCompany(state, selectedDoc.companyId)?.name ?? 'outreach',
      selectedDoc.docType,
    )
    const heading = format === 'md' ? `# ${selectedDoc.subject}\n\n` : `Subject: ${selectedDoc.subject}\n\n`
    downloadText(`${filename}.${format}`, `${heading}${selectedDoc.body}`, format === 'md' ? 'text/markdown' : 'text/plain')
  }

  const restoreVersion = (version: { subject: string; body: string }) => {
    setDraft({ subject: version.subject, body: version.body })
    setDirty(true)
  }

  const docOpportunity = selectedDoc ? getOpportunity(state, selectedDoc.opportunityId) : undefined
  const usedSources = selectedDoc
    ? docOpportunity && (docOpportunity.sourceIds ?? []).length > 0
      ? sourcesForCompany(state, selectedDoc.companyId).filter((s) => docOpportunity.sourceIds.includes(s.id))
      : sourcesForCompany(state, selectedDoc.companyId)
    : []

  return (
    <div>
      <PageHeader
        title="Outreach Studio"
        description="Generate, edit, copy, and export personalised drafts. No live sending in this build."
      />

      <div className="mb-5 flex items-start gap-2 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-800">
        <Icon name="info" className="mt-0.5 h-4 w-4 shrink-0" />
        <p>{GENERATION_NOTICE}</p>
      </div>

      <div className="grid grid-cols-1 gap-5 xl:grid-cols-5">
        {/* Generation settings */}
        <Card className="xl:col-span-2">
          <CardHeader title="Generation settings" description="Choose the context; the demo generator assembles a draft." />
          <CardBody className="space-y-3">
            <Field label="Company">
              <Select value={genCompanyId} onChange={(e) => { setGenCompanyId(e.target.value); setGenContactId(''); setGenOpportunityId('') }}>
                <option value="">Select a company…</option>
                {companiesForGen.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </Select>
            </Field>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Recipient">
                <Select value={genContactId} onChange={(e) => setGenContactId(e.target.value)} disabled={!genCompanyId}>
                  <option value="">No specific person</option>
                  {contactsForGen.map((c) => (
                    <option key={c.id} value={c.id}>{c.name} — {c.role}</option>
                  ))}
                </Select>
              </Field>
              <Field label="Opportunity">
                <Select value={genOpportunityId} onChange={(e) => setGenOpportunityId(e.target.value)} disabled={!genCompanyId}>
                  <option value="">No linked opportunity</option>
                  {oppsForGen.map((o) => (
                    <option key={o.id} value={o.id}>{o.title}</option>
                  ))}
                </Select>
              </Field>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Document type">
                <Select value={docType} onChange={(e) => setDocType(e.target.value as OutreachDocType)}>
                  {(Object.keys(docTypeLabels) as OutreachDocType[]).map((t) => (
                    <option key={t} value={t}>{docTypeLabels[t]}</option>
                  ))}
                </Select>
              </Field>
              <Field label="Language">
                <Select value={language} onChange={(e) => setLanguage(e.target.value as OutreachLanguage)}>
                  <option value="it">Italian</option>
                  <option value="en">English</option>
                </Select>
              </Field>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Tone">
                <Select value={tone} onChange={(e) => setTone(e.target.value as OutreachTone)}>
                  {(Object.keys(toneLabels) as OutreachTone[]).map((t) => (
                    <option key={t} value={t}>{toneLabels[t]}</option>
                  ))}
                </Select>
              </Field>
              <Field label="Service">
                <Input
                  list="service-suggestions"
                  value={service}
                  onChange={(e) => setService(e.target.value)}
                  placeholder={genOpportunity?.service ?? 'e.g. Reporting automation'}
                />
                <datalist id="service-suggestions">
                  {state.settings.sender.services.map((s) => (
                    <option key={s} value={s} />
                  ))}
                </datalist>
              </Field>
            </div>
            <Field label="Call to action (optional)">
              <Input value={cta} onChange={(e) => setCta(e.target.value)} placeholder="Leave blank for a sensible default" />
            </Field>

            {genCompany ? (
              <div className="rounded-lg bg-slate-50 px-3 py-2 text-[11px] text-slate-500">
                <p className="font-medium text-slate-600">Context from selected records:</p>
                {genOpportunity ? (
                  <>
                    <p className="mt-1">{genOpportunity.problem}</p>
                    <p>Evidence: {genOpportunity.evidenceNote}</p>
                  </>
                ) : (
                  <p className="mt-1">{genCompany.description}</p>
                )}
                <p className="mt-1">
                  Sender: {state.settings.sender.name} · {state.settings.sender.company}
                </p>
              </div>
            ) : null}

            <Button variant="primary" className="w-full" onClick={generate} disabled={!canGenerate}>
              <Icon name="sparkles" className="h-4 w-4" />
              Generate draft
            </Button>
          </CardBody>
        </Card>

        {/* Editor */}
        <div className="space-y-5 xl:col-span-3">
          {docs.length > 0 ? (
            <Card>
              <div className="flex flex-wrap items-center gap-2 border-b border-slate-100 px-4 py-3">
                <span className="text-xs font-medium text-slate-500">Draft:</span>
                <Select
                  value={selectedDocId}
                  onChange={(e) => setSelectedDocId(e.target.value)}
                  className="w-auto min-w-52"
                  aria-label="Select a draft"
                >
                  <option value="">Choose a draft…</option>
                  {docs.map((doc) => (
                    <option key={doc.id} value={doc.id}>
                      {getCompany(state, doc.companyId)?.name ?? 'Company'} · {docTypeLabels[doc.docType]} ({languageLabels[doc.language]})
                    </option>
                  ))}
                </Select>
                {dirty ? <Badge tone="warning">Unsaved edits</Badge> : null}
              </div>

              {selectedDoc ? (
                <CardBody>
                  <div className="mb-3 flex flex-wrap items-center gap-2 text-xs text-slate-500">
                    <Badge tone="neutral">Updated {formatDateTime(selectedDoc.updatedAt)}</Badge>
                    <Badge tone="neutral">{selectedDoc.versions.length} version{selectedDoc.versions.length === 1 ? '' : 's'}</Badge>
                    {getCompany(state, selectedDoc.companyId) ? (
                      <Link
                        to={`/companies/${selectedDoc.companyId}`}
                        className="font-medium text-indigo-600 hover:underline"
                      >
                        View company
                      </Link>
                    ) : null}
                  </div>

                  <Field label="Subject">
                    <Input
                      value={draft.subject}
                      onChange={(e) => updateDraft({ subject: e.target.value })}
                      aria-label="Draft subject"
                    />
                  </Field>
                  <div className="mt-3">
                    <Field label="Body">
                      <Textarea
                        value={draft.body}
                        onChange={(e) => updateDraft({ body: e.target.value })}
                        className="min-h-72 font-mono text-xs leading-relaxed"
                        aria-label="Draft body"
                      />
                    </Field>
                  </div>

                  <div className="mt-3 flex flex-wrap gap-2">
                    <Button variant="primary" onClick={saveRevision} disabled={!dirty}>
                      Save revision
                    </Button>
                    <Button variant="secondary" onClick={regenerate}>
                      <Icon name="refresh" className="h-3.5 w-3.5" />
                      Regenerate draft
                    </Button>
                    <Button variant="secondary" onClick={copyToClipboard}>
                      <Icon name="copy" className="h-3.5 w-3.5" />
                      Copy
                    </Button>
                    <Button variant="secondary" onClick={() => exportDoc('md')}>
                      <Icon name="download" className="h-3.5 w-3.5" />
                      Export .md
                    </Button>
                    <Button variant="secondary" onClick={() => exportDoc('txt')}>
                      <Icon name="download" className="h-3.5 w-3.5" />
                      Export .txt
                    </Button>
                    <Button variant="ghost" onClick={markSent} title="Records the action for goals; no email is sent">
                      <Icon name="check" className="h-3.5 w-3.5" />
                      Mark as sent
                    </Button>
                  </div>

                  <p className="mt-2 text-[11px] text-slate-400">
                    Regeneration preserves every previous version in history below — your manual edits are never
                    silently destroyed.
                  </p>
                </CardBody>
              ) : (
                <CardBody>
                  <EmptyState title="Select a draft" description="Pick a draft above to edit it, or generate a new one from the settings." />
                </CardBody>
              )}
            </Card>
          ) : (
            <Card>
              <CardBody>
                <EmptyState
                  title="No drafts yet"
                  description="Set the context on the left and click Generate draft to create the first one."
                />
              </CardBody>
            </Card>
          )}

          {selectedDoc ? (
            <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
              <Card>
                <CardHeader title="Version history" description="Every revision is preserved and restorable." />
                <CardBody>
                  <ul className="space-y-2">
                    {selectedDoc.versions.map((version) => (
                      <li key={version.id} className="flex items-start justify-between gap-2 rounded-lg border border-slate-100 px-3 py-2 text-xs">
                        <div className="min-w-0">
                          <p className="font-medium text-slate-800">{version.label}</p>
                          <p className="text-slate-400">{formatDateTime(version.createdAt)}</p>
                        </div>
                        <Button
                          size="sm"
                          variant="ghost"
                          title="Load this version into the editor"
                          onClick={() => restoreVersion(version)}
                        >
                          Restore
                        </Button>
                      </li>
                    ))}
                  </ul>
                </CardBody>
              </Card>

              <Card>
                <CardHeader title="Sources used" description="Evidence behind the personalisation. No invented claims." />
                <CardBody>
                  {usedSources.length === 0 ? (
                    <p className="text-xs text-slate-500">No sources linked to this draft.</p>
                  ) : (
                    <ul className="space-y-2">
                      {usedSources.map((source) => (
                        <li key={source.id} className="flex items-start justify-between gap-2 text-xs">
                          <span>
                            <span className="font-medium text-slate-800">{source.label}</span>
                            {source.url ? (
                              <a href={source.url} target="_blank" rel="noreferrer noopener" className="ml-1 text-indigo-600 hover:underline">
                                open
                              </a>
                            ) : null}
                          </span>
                          <Badge tone="neutral">{sourceKindLabels[source.kind]}</Badge>
                        </li>
                      ))}
                    </ul>
                  )}
                  {docOpportunity ? (
                    <div className="mt-3 rounded-lg bg-slate-50 px-3 py-2 text-[11px] text-slate-500">
                      <p>Claims in this draft are grounded in the linked opportunity's evidence classification:</p>
                      <div className="mt-1">
                        <EvidenceBadge evidence={docOpportunity.evidence} />
                      </div>
                    </div>
                  ) : null}
                </CardBody>
              </Card>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  )
}

function downloadText(filename: string, content: string, mime: string): void {
  try {
    const blob = new Blob([content], { type: mime })
    const url = URL.createObjectURL(blob)
    const anchor = document.createElement('a')
    anchor.href = url
    anchor.download = filename
    document.body.appendChild(anchor)
    anchor.click()
    document.body.removeChild(anchor)
    URL.revokeObjectURL(url)
  } catch {
    window.alert('Download is not available in this browser — use Copy instead.')
  }
}