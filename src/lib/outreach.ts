import type {
  Company,
  CompanySource,
  Contact,
  Opportunity,
  OutreachDocType,
  OutreachLanguage,
  OutreachTone,
  SenderProfile,
} from './types'

export interface OutreachInput {
  company: Company
  contact?: Contact
  opportunity?: Opportunity
  docType: OutreachDocType
  language: OutreachLanguage
  tone: OutreachTone
  service: string
  callToAction: string
  sender: SenderProfile
  /** Company sources available in the workspace; used when no opportunity is linked. */
  sources: CompanySource[]
}

export interface OutreachOutput {
  subject: string
  body: string
  /** Source ids behind the draft, so the UI can show provenance for every claim. */
  usedSourceIds: string[]
}

/** Shown in the Outreach Studio; keeps the demo honest about what happens here. */
export const GENERATION_NOTICE =
  'Demo mode: drafts are assembled locally from your stored records by deterministic templates — no AI model runs and nothing is sent. Treat each draft as a starting point: verify every claim, then copy or export it into your own email client.'

// --- bilingual template fragments (it / en) ----------------------------------

const docTypeIntro: Record<OutreachDocType, { it: string; en: string }> = {
  initial: {
    it: 'Le scrivo per una breve presentazione e per capire se c’è spazio per una collaborazione.',
    en: 'I am writing with a brief introduction, to see whether there is room for a conversation.',
  },
  followup: {
    it: 'Torno sulla mia precedente comunicazione con un breve aggiornamento.',
    en: 'I am following up on my previous message with a brief update.',
  },
  meeting_request: {
    it: 'Vorrei proporre una breve call di approfondimento.',
    en: 'I would like to propose a short call to explore this further.',
  },
  service_intro: {
    it: 'Vorrei presentare brevemente i nostri servizi.',
    en: 'I would like to briefly introduce our services.',
  },
  discovery_agenda: {
    it: 'Di seguito i punti che propongo per la nostra call di approfondimento:',
    en: 'Here are the points I propose for our discovery call:',
  },
  opportunity_summary: {
    it: 'Riassumo l’opportunità individuata e le evidenze che la supportano.',
    en: 'Here is a summary of the opportunity identified and the evidence behind it.',
  },
  proposal: {
    it: 'Propongo un piccolo progetto pilota, con obiettivi chiari e misurabili.',
    en: 'I propose a small pilot project, with clear and measurable objectives.',
  },
}

const toneIntro: Record<OutreachTone, { it: string; en: string }> = {
  professional: {
    it: 'Le scrivo in modo professionale e diretto, per presentare come possiamo essere utili.',
    en: 'I am writing directly and professionally, to present how we can be useful.',
  },
  consultative: {
    it: 'Il mio intento è un confronto, senza alcuna pressione commerciale.',
    en: 'My intention is a conversation, with no commercial pressure.',
  },
  concise: {
    it: 'Vado dritto al punto.',
    en: 'I will get straight to the point.',
  },
  technical: {
    it: 'Interveniamo a livello tecnico su integrazioni e dati.',
    en: 'We work at a technical level on integrations and data.',
  },
}

const agendaPoints: Record<OutreachLanguage, string> = {
  it: '- Situazione attuale e strumenti in uso\n- Criticità e priorità\n- Dati disponibili\n- Possibile pilota, obiettivi e tempi',
  en: '- Current situation and tools in use\n- Pain points and priorities\n- Available data\n- Possible pilot, objectives and timing',
}

// --- generation --------------------------------------------------------------

/**
 * Deterministic, template-based outreach generation for the demo.
 * No model is called: everything is assembled from the stored context
 * (company, opportunity, sources, sender profile), so a claim can always be
 * traced back to a record the user already has. Nothing is sent.
 */
export function generateOutreach(input: OutreachInput): OutreachOutput {
  const {
    company,
    contact,
    opportunity,
    docType,
    language,
    tone,
    service,
    callToAction,
    sender,
    sources,
  } = input

  const it = language === 'it'
  const L = (pair: { it: string; en: string }): string => (it ? pair.it : pair.en)

  const greeting = it
    ? contact
      ? `Gentile ${contact.name},`
      : 'Gentile ufficio,'
    : contact
      ? `Dear ${contact.name},`
      : 'Dear team,'

  const context = it
    ? `${company.name} opera nel settore ${company.industry.toLowerCase()}${
        company.comune || company.province
          ? ` ed è localizzata a ${company.comune || company.province}`
          : ''
      }.`
    : `${company.name} operates in ${company.industry.toLowerCase()}${
        company.comune || company.province
          ? ` and is based in ${company.comune || company.province}`
          : ''
      }.`

  const subjectTarget = opportunity
    ? opportunity.title
    : service.trim() || 'outreach'
  const subject = `${company.name} — ${subjectTarget}`

  const cta =
    callToAction.trim() ||
    (it
      ? 'Sarebbe utile un breve confronto, quando può tornare comodo?'
      : 'Would a brief conversation be useful, whenever it suits you?')

  const signature = [sender.name, sender.company, sender.email, sender.phone]
    .map((line) => line.trim())
    .filter(Boolean)
    .join('\n')

  const usedSourceIds =
    opportunity && opportunity.sourceIds.length > 0
      ? opportunity.sourceIds
      : sources.map((s) => s.id)

  const paragraphs: string[] = []
  paragraphs.push(greeting)
  paragraphs.push(docTypeIntro[docType][language])
  paragraphs.push(context)

  if (opportunity) {
    paragraphs.push(
      it
        ? `Un’area di possibile lavoro riguarda: ${opportunity.title} — ${opportunity.problem}`
        : `One possible area of work is: ${opportunity.title} — ${opportunity.problem}`,
    )
    paragraphs.push(
      it
        ? `Questa ipotesi si basa sulle informazioni finora raccolte: ${opportunity.evidenceNote}`
        : `This is based on the information gathered so far: ${opportunity.evidenceNote}`,
    )
  }

  paragraphs.push(toneIntro[tone][language])
  paragraphs.push(
    it
      ? `Il nostro ambito di riferimento è: ${service.trim() || 'servizi software e data'}.`
      : `Our area of focus is: ${service.trim() || 'software and data services'}.`,
  )

  if (docType === 'discovery_agenda') paragraphs.push(agendaPoints[language])

  paragraphs.push(cta)
  paragraphs.push(it ? 'Un saluto,' : 'Kind regards,')
  paragraphs.push(signature)

  return { subject, body: paragraphs.join('\n\n'), usedSourceIds }
}

/** Slugified company name plus doc type, for exported drafts. e.g. `meccanica-treviso-s-p-a-initial`. */
export function outreachFilename(companyName: string, docType: OutreachDocType): string {
  const slug = companyName
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
  return `${slug}-${docType}`
}