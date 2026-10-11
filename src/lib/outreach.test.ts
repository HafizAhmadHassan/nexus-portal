import { describe, expect, it } from 'vitest'
import { seedState } from './demoData'
import { generateOutreach, outreachFilename } from './outreach'
import type { Company, Contact, Opportunity } from './types'

const state = seedState
const company = state.companies.find((c) => c.id === 'c1') as Company
const contact = state.contacts.find((c) => c.companyId === 'c1') as Contact
const opportunity = state.opportunities.find((o) => o.id === 'o1') as Opportunity

const baseInput = {
  company,
  contact,
  opportunity,
  docType: 'initial' as const,
  language: 'it' as const,
  tone: 'consultative' as const,
  service: 'Process automation & reporting',
  callToAction: '',
  sender: state.settings.sender,
  sources: state.sources.filter((s) => s.companyId === company.id),
}

describe('generateOutreach', () => {
  it('produces a subject and a body referencing the company', () => {
    const output = generateOutreach(baseInput)
    expect(output.subject.length).toBeGreaterThan(0)
    expect(output.body).toContain(company.name)
    expect(output.body).toContain(contact.name)
  })

  it('keeps the evidence classification grounded in stored context', () => {
    const output = generateOutreach(baseInput)
    expect(output.body).toContain(opportunity.evidenceNote)
  })

  it('respects language (Italian vs English)', () => {
    const it_out = generateOutreach({ ...baseInput, language: 'it' })
    const en_out = generateOutreach({ ...baseInput, language: 'en' })
    expect(it_out.body).toContain('Gentile')
    expect(en_out.body).toContain('Dear')
  })

  it('references the opportunity sources when available', () => {
    const output = generateOutreach(baseInput)
    expect(output.usedSourceIds).toEqual(opportunity.sourceIds)
  })

  it('never fabricates: no invented figures appear in a generated draft', () => {
    const output = generateOutreach({ ...baseInput, opportunity: undefined, contact: undefined })
    expect(output.body).not.toMatch(/\b\d+(\.\d+)?%\b/)
    expect(output.body).not.toMatch(/€\s*\d/)
  })

  it('signs drafts with the sender profile', () => {
    const output = generateOutreach(baseInput)
    expect(output.body).toContain(state.settings.sender.company)
  })
})

describe('outreachFilename', () => {
  it('slugifies the company name and appends the doc type', () => {
    expect(outreachFilename(company.name, 'initial')).toBe('meccanica-treviso-s-p-a-initial')
  })
})