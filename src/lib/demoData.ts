import type {
  ActivityEvent,
  AppState,
  AppSettings,
  Company,
  CompanyLocation,
  CompanySource,
  Contact,
  FinancialRecord,
  Opportunity,
  OutreachDoc,
  SavedSearch,
  SupplyChainLink,
  Task,
  WeeklyGoal,
} from './types'
import { defaultWeights } from './scoring'

// --- date helpers (relative to "now" so the demo always looks current) ---
const now = new Date()
function iso(d: Date): string {
  return d.toISOString()
}
function daysAgo(n: number): string {
  const d = new Date(now)
  d.setDate(d.getDate() - n)
  return iso(d)
}
function daysAhead(n: number): string {
  const d = new Date(now)
  d.setDate(d.getDate() + n)
  return iso(d)
}

// ---------------------------------------------------------------------------
// Companies — SAMPLE DATA ONLY. Every claim below is demo content, not a real
// company profile. Sources are illustrative placeholders.
// ---------------------------------------------------------------------------

const companies: Company[] = [
  {
    id: 'c1',
    name: 'Meccanica Treviso S.p.A.',
    industry: 'Industrial machinery',
    description:
      'Designs and manufactures specialised packaging machinery for food and beverage producers. Operates two production plants with CNC machining and final assembly.',
    website: 'https://example.com/meccanica-treviso',
    foundedYear: 1978,
    employeeRange: '120–250',
    sizeBand: 'medium',
    region: 'Veneto',
    province: 'Treviso',
    comune: 'Treviso',
    status: 'researched',
    createdAt: daysAgo(40),
  },
  {
    id: 'c2',
    name: 'Calzaturificio Brenta S.r.l.',
    industry: 'Footwear manufacturing',
    description:
      'Produces leather footwear components and finished shoes for domestic and export markets. Family-owned with a strong artisanal tradition.',
    website: 'https://example.com/calzaturificio-brenta',
    foundedYear: 1961,
    employeeRange: '20–49',
    sizeBand: 'small',
    region: 'Veneto',
    province: 'Padova',
    comune: 'Vigonza',
    status: 'researching',
    createdAt: daysAgo(12),
  },
  {
    id: 'c3',
    name: 'Dolciaria Emiliana S.p.A.',
    industry: 'Food & confectionery',
    description:
      'Manufactures baked goods and confectionery for large retail chains. Runs multiple production lines with seasonal demand peaks.',
    website: 'https://example.com/dolciaria-emiliana',
    foundedYear: 1954,
    employeeRange: '80–150',
    sizeBand: 'medium',
    group: 'Emiliana Food Group',
    region: 'Emilia-Romagna',
    province: 'Bologna',
    comune: 'Bologna',
    status: 'researched',
    createdAt: daysAgo(30),
  },
  {
    id: 'c4',
    name: 'Logistica Adriatica S.r.l.',
    industry: 'Logistics & warehousing',
    description:
      'Third-party logistics provider offering warehousing, distribution, and last-mile delivery across north-east Italy.',
    website: 'https://example.com/logistica-adriatica',
    foundedYear: 2004,
    employeeRange: '50–79',
    sizeBand: 'medium',
    region: 'Veneto',
    province: 'Venezia',
    comune: 'Porto Marghera',
    status: 'new',
    createdAt: daysAgo(5),
  },
  {
    id: 'c5',
    name: 'Tessitura Lombarda S.p.A.',
    industry: 'Textiles',
    description:
      'Weaves technical and fashion fabrics for apparel and industrial customers, with an extensive catalogue and complex order configuration.',
    website: 'https://example.com/tessitura-lombarda',
    foundedYear: 1948,
    employeeRange: '250–500',
    sizeBand: 'large',
    region: 'Lombardia',
    province: 'Milano',
    comune: 'Legnano',
    status: 'researched',
    createdAt: daysAgo(25),
  },
  {
    id: 'c6',
    name: 'Automazione Piemonte S.r.l.',
    industry: 'Industrial automation',
    description:
      'Integrates control systems and robotics for manufacturing clients, with an ongoing service and spare-parts business.',
    website: 'https://example.com/automazione-piemonte',
    foundedYear: 1999,
    employeeRange: '10–19',
    sizeBand: 'small',
    region: 'Piemonte',
    province: 'Torino',
    comune: 'Torino',
    status: 'researching',
    createdAt: daysAgo(9),
  },
  {
    id: 'c7',
    name: 'Farmaceutica Toscana S.p.A.',
    industry: 'Pharmaceuticals',
    description:
      'Contract manufacturer of pharmaceutical and nutraceutical products, operating under strict documentation and quality requirements.',
    website: 'https://example.com/farmaceutica-toscana',
    foundedYear: 1982,
    employeeRange: '500+',
    sizeBand: 'large',
    region: 'Toscana',
    province: 'Firenze',
    comune: 'Sesto Fiorentino',
    status: 'researched',
    createdAt: daysAgo(22),
  },
  {
    id: 'c8',
    name: 'Mobilificio Veneto S.r.l.',
    industry: 'Furniture',
    description:
      'Manufactures contract furniture for hotels and offices, coordinating a network of suppliers and installers.',
    website: 'https://example.com/mobilificio-veneto',
    foundedYear: 1975,
    employeeRange: '30–49',
    sizeBand: 'small',
    region: 'Veneto',
    province: 'Treviso',
    comune: 'San Biagio di Callalta',
    status: 'researching',
    createdAt: daysAgo(15),
  },
]

// ---------------------------------------------------------------------------
// Secondary locations (HQ lives on the Company record itself)
// ---------------------------------------------------------------------------

const locations: CompanyLocation[] = [
  {
    id: 'loc1',
    companyId: 'c1',
    label: 'Production plant',
    region: 'Veneto',
    province: 'Treviso',
    comune: 'Paese',
    address: 'Via dell’Industria 12',
  },
  {
    id: 'loc2',
    companyId: 'c5',
    label: 'Weaving mill',
    region: 'Lombardia',
    province: 'Varese',
    comune: 'Gallarate',
  },
  {
    id: 'loc3',
    companyId: 'c7',
    label: 'Quality & R&D',
    region: 'Toscana',
    province: 'Firenze',
    comune: 'Firenze',
  },
]

// ---------------------------------------------------------------------------
// Sources — every record keeps an origin and retrieval date.
// ---------------------------------------------------------------------------

const sources: CompanySource[] = [
  { id: 's1', companyId: 'c1', label: 'Company website — About us', url: 'https://example.com/meccanica-treviso', kind: 'website', retrievedAt: daysAgo(20) },
  { id: 's2', companyId: 'c1', label: 'Chamber of Commerce registry extract', kind: 'registry', retrievedAt: daysAgo(21) },
  { id: 's3', companyId: 'c1', label: 'Industry directory listing', kind: 'directory', retrievedAt: daysAgo(20) },
  { id: 's4', companyId: 'c2', label: 'Company website — Products', url: 'https://example.com/calzaturificio-brenta', kind: 'website', retrievedAt: daysAgo(12) },
  { id: 's5', companyId: 'c3', label: 'Company website — Production', url: 'https://example.com/dolciaria-emiliana', kind: 'website', retrievedAt: daysAgo(14) },
  { id: 's6', companyId: 'c3', label: 'Annual financial filing', kind: 'financial', retrievedAt: daysAgo(14) },
  { id: 's7', companyId: 'c4', label: 'Company website — Services', url: 'https://example.com/logistica-adriatica', kind: 'website', retrievedAt: daysAgo(5) },
  { id: 's8', companyId: 'c5', label: 'Company website — Capabilities', url: 'https://example.com/tessitura-lombarda', kind: 'website', retrievedAt: daysAgo(18) },
  { id: 's9', companyId: 'c5', label: 'Trade press article', kind: 'news', retrievedAt: daysAgo(17) },
  { id: 's10', companyId: 'c6', label: 'Company website — Solutions', url: 'https://example.com/automazione-piemonte', kind: 'website', retrievedAt: daysAgo(9) },
  { id: 's11', companyId: 'c7', label: 'Company website — Quality', url: 'https://example.com/farmaceutica-toscana', kind: 'website', retrievedAt: daysAgo(16) },
  { id: 's12', companyId: 'c7', label: 'Regulatory certification note', kind: 'registry', retrievedAt: daysAgo(16) },
  { id: 's13', companyId: 'c8', label: 'Company website — Projects', url: 'https://example.com/mobilificio-veneto', kind: 'website', retrievedAt: daysAgo(15) },
  { id: 's14', companyId: 'c8', label: 'LinkedIn company page (public)', kind: 'directory', retrievedAt: daysAgo(15) },
]

// ---------------------------------------------------------------------------
// Financial records — with explicit data classification.
// ---------------------------------------------------------------------------

const financials: FinancialRecord[] = [
  { id: 'f1', companyId: 'c1', metric: 'Revenue', value: 42000000, currency: 'EUR', period: 'FY2024', sourceId: 's2', publishedAt: daysAgo(200), retrievedAt: daysAgo(21), classification: 'reported' },
  { id: 'f2', companyId: 'c1', metric: 'Net profit', value: 3100000, currency: 'EUR', period: 'FY2024', sourceId: 's2', publishedAt: daysAgo(200), retrievedAt: daysAgo(21), classification: 'reported' },
  { id: 'f3', companyId: 'c3', metric: 'Revenue', value: 28000000, currency: 'EUR', period: 'FY2024', sourceId: 's6', publishedAt: daysAgo(180), retrievedAt: daysAgo(14), classification: 'reported' },
  { id: 'f4', companyId: 'c3', metric: 'EBITDA', value: 2500000, currency: 'EUR', period: 'FY2024', sourceId: 's6', publishedAt: daysAgo(180), retrievedAt: daysAgo(14), classification: 'reported' },
  { id: 'f5', companyId: 'c5', metric: 'Revenue', value: 96000000, currency: 'EUR', period: 'FY2024', sourceId: 's9', publishedAt: daysAgo(150), retrievedAt: daysAgo(17), classification: 'reported' },
  { id: 'f6', companyId: 'c5', metric: 'Employees', value: 410, currency: 'EUR', period: 'FY2024', sourceId: 's9', publishedAt: daysAgo(150), retrievedAt: daysAgo(17), classification: 'estimated' },
  { id: 'f7', companyId: 'c7', metric: 'Revenue', value: 130000000, currency: 'EUR', period: 'FY2024', sourceId: 's12', publishedAt: daysAgo(160), retrievedAt: daysAgo(16), classification: 'reported' },
]

// ---------------------------------------------------------------------------
// Contacts — with verification status. Nothing here is a real person.
// ---------------------------------------------------------------------------

const contacts: Contact[] = [
  { id: 'p1', companyId: 'c1', name: 'Marco Rossi', role: 'IT Manager', relevance: 'Owns application landscape and integration decisions.', email: 'm.rossi@example.com', sourceId: 's1', verification: 'verified', lastCheckedAt: daysAgo(4) },
  { id: 'p2', companyId: 'c1', name: 'Elena Bianchi', role: 'Operations Manager', relevance: 'Accountable for production reporting accuracy.', sourceId: 's3', verification: 'needs_check', lastCheckedAt: daysAgo(10) },
  { id: 'p3', companyId: 'c2', name: 'Luca Ferrari', role: 'Managing Director', relevance: 'Decision maker for operational tooling.', sourceId: 's4', verification: 'unverified' },
  { id: 'p4', companyId: 'c3', name: 'Giulia Romano', role: 'Digital Transformation Lead', relevance: 'Drives reporting and automation initiatives.', email: 'g.romano@example.com', sourceId: 's5', verification: 'verified', lastCheckedAt: daysAgo(3) },
  { id: 'p5', companyId: 'c4', name: 'Andrea Conti', role: 'Logistics Director', relevance: 'Owns warehouse operations and visibility.', sourceId: 's7', verification: 'unverified' },
  { id: 'p6', companyId: 'c5', name: 'Francesca Greco', role: 'IT Manager', relevance: 'Manages legacy systems and integration projects.', sourceId: 's8', verification: 'needs_check', lastCheckedAt: daysAgo(6) },
  { id: 'p7', companyId: 'c6', name: 'Davide Russo', role: 'Production Manager', relevance: 'Planning and scheduling for client projects.', sourceId: 's10', verification: 'unverified' },
  { id: 'p8', companyId: 'c7', name: 'Chiara Marino', role: 'Chief Information Officer', relevance: 'Controls IT strategy and validated systems.', email: 'c.marino@example.com', sourceId: 's11', verification: 'verified', lastCheckedAt: daysAgo(8) },
  { id: 'p9', companyId: 'c8', name: 'Stefano Gallo', role: 'Managing Director', relevance: 'Owner-operator, decides supplier tooling.', sourceId: 's13', verification: 'unverified' },
]

// ---------------------------------------------------------------------------
// Supply-chain relationships — only where evidence exists.
// ---------------------------------------------------------------------------

const supplyChain: SupplyChainLink[] = [
  { id: 'sc1', companyId: 'c1', partner: 'Regional steel supplier network', role: 'Raw materials supply', evidence: 'supported', sourceId: 's3' },
  { id: 'sc2', companyId: 'c3', partner: 'Retail distribution chains', role: 'Downstream distribution', evidence: 'verified', sourceId: 's5' },
  { id: 'sc3', companyId: 'c5', partner: 'Garment manufacturers', role: 'Downstream customers', evidence: 'supported', sourceId: 's8' },
]

// ---------------------------------------------------------------------------
// Opportunities — evidence-linked, with transparent scoring inputs.
// ---------------------------------------------------------------------------

const opportunities: Opportunity[] = [
  {
    id: 'o1',
    companyId: 'c1',
    contactId: 'p1',
    title: 'Automate production reporting',
    problem: 'Reporting is assembled manually from machine logs, which is slow and error-prone.',
    category: 'automation',
    service: 'Process automation & reporting',
    stage: 'ready',
    priorityOverride: 0,
    impact: 5,
    evidenceStrength: 4,
    feasibility: 4,
    strategic: 4,
    confidence: 'high',
    evidence: 'supported',
    evidenceNote: 'Website and directory describe multiple CNC lines and manual quality checks.',
    sourceIds: ['s1', 's2', 's3'],
    validationQuestions: [
      'How are daily production figures currently collected?',
      'How long does a reporting cycle take today?',
      'Which systems hold the machine data?',
    ],
    nextAction: 'Book a discovery call with the IT Manager.',
    notes: 'Strong fit; contact already verified.',
    createdAt: daysAgo(6),
  },
  {
    id: 'o2',
    companyId: 'c1',
    contactId: 'p1',
    title: 'Integrate order and ERP data',
    problem: 'Orders, production, and finance appear to live in different systems.',
    category: 'software',
    service: 'ERP/CRM integration',
    stage: 'researching',
    priorityOverride: 0,
    impact: 4,
    evidenceStrength: 3,
    feasibility: 3,
    strategic: 4,
    confidence: 'medium',
    evidence: 'supported',
    evidenceNote: 'Inferred from described order complexity; needs validation.',
    sourceIds: ['s2'],
    validationQuestions: ['Which ERP is in use?', 'Where do orders originate?'],
    nextAction: 'Confirm current systems during discovery.',
    notes: '',
    createdAt: daysAgo(5),
  },
  {
    id: 'o3',
    companyId: 'c2',
    contactId: 'p3',
    title: 'Digitise order management',
    problem: 'Order tracking likely relies on spreadsheets for a small export business.',
    category: 'automation',
    service: 'Order & workflow automation',
    stage: 'identified',
    priorityOverride: 0,
    impact: 3,
    evidenceStrength: 2,
    feasibility: 4,
    strategic: 3,
    confidence: 'low',
    evidence: 'hypothesis',
    evidenceNote: 'Small footwear producer; process details not yet documented.',
    sourceIds: ['s4'],
    validationQuestions: ['How are orders recorded today?', 'Who manages the order book?'],
    nextAction: 'Qualify before investing effort.',
    notes: '',
    createdAt: daysAgo(4),
  },
  {
    id: 'o4',
    companyId: 'c4',
    contactId: 'p5',
    title: 'Warehouse KPI dashboard',
    problem: 'No documented operational visibility across warehouse and last-mile delivery.',
    category: 'data',
    service: 'KPI dashboard & analytics',
    stage: 'researching',
    priorityOverride: 0,
    impact: 4,
    evidenceStrength: 3,
    feasibility: 4,
    strategic: 3,
    confidence: 'medium',
    evidence: 'supported',
    evidenceNote: 'Services page describes multi-site operations without reporting.',
    sourceIds: ['s7'],
    validationQuestions: ['Which KPIs matter most?', 'Where does operational data live?'],
    nextAction: 'Draft a discovery agenda.',
    notes: 'Company is new; needs research.',
    createdAt: daysAgo(3),
  },
  {
    id: 'o5',
    companyId: 'c5',
    contactId: 'p6',
    title: 'Modernise legacy order configuration',
    problem: 'Complex fabric catalogue and order configuration may rely on ageing tooling.',
    category: 'software',
    service: 'Legacy application modernisation',
    stage: 'contacted',
    priorityOverride: 0,
    impact: 5,
    evidenceStrength: 4,
    feasibility: 3,
    strategic: 5,
    confidence: 'high',
    evidence: 'supported',
    evidenceNote: 'Large catalogue and trade press note integration challenges.',
    sourceIds: ['s8', 's9'],
    validationQuestions: ['What tooling configures orders today?', 'What is the modernisation appetite?'],
    nextAction: 'Confirm scope in a technical workshop.',
    notes: 'High strategic value; large account.',
    createdAt: daysAgo(7),
  },
  {
    id: 'o6',
    companyId: 'c5',
    contactId: 'p6',
    title: 'Internal knowledge assistant',
    problem: 'Product knowledge is spread across documents and experienced staff.',
    category: 'ai',
    service: 'Internal knowledge assistant',
    stage: 'identified',
    priorityOverride: 0,
    impact: 4,
    evidenceStrength: 3,
    feasibility: 4,
    strategic: 4,
    confidence: 'medium',
    evidence: 'hypothesis',
    evidenceNote: 'Plausible given catalogue breadth; no direct evidence yet.',
    sourceIds: ['s8'],
    validationQuestions: ['Which knowledge is hardest to find?', 'What documents exist?'],
    nextAction: 'Validate search pain during discovery.',
    notes: '',
    createdAt: daysAgo(6),
  },
  {
    id: 'o7',
    companyId: 'c6',
    contactId: 'p7',
    title: 'Demand forecasting for service parts',
    problem: 'Spare-parts demand affects service commitments and stock levels.',
    category: 'data',
    service: 'Demand forecasting',
    stage: 'researching',
    priorityOverride: 0,
    impact: 3,
    evidenceStrength: 3,
    feasibility: 3,
    strategic: 3,
    confidence: 'medium',
    evidence: 'supported',
    evidenceNote: 'Service business described on site implies spare-parts planning.',
    sourceIds: ['s10'],
    validationQuestions: ['How is stock planned today?', 'Is historical data available?'],
    nextAction: 'Check data availability.',
    notes: 'Forecasting only if suitable data exists.',
    createdAt: daysAgo(4),
  },
  {
    id: 'o8',
    companyId: 'c7',
    contactId: 'p8',
    title: 'Document understanding & extraction',
    problem: 'Strict documentation and quality processes create heavy manual paperwork.',
    category: 'ai',
    service: 'Document understanding',
    stage: 'ready',
    priorityOverride: 0,
    impact: 5,
    evidenceStrength: 5,
    feasibility: 3,
    strategic: 5,
    confidence: 'high',
    evidence: 'verified',
    evidenceNote: 'Quality pages document extensive controlled documentation.',
    sourceIds: ['s11', 's12'],
    validationQuestions: ['Which documents are most burdensome?', 'What validation is required?'],
    nextAction: 'Prepare a compliant pilot proposal.',
    notes: 'High value but regulated; handle carefully.',
    createdAt: daysAgo(8),
  },
  {
    id: 'o9',
    companyId: 'c3',
    contactId: 'p4',
    title: 'Reporting infrastructure refresh',
    problem: 'Seasonal demand makes consistent reporting difficult.',
    category: 'data',
    service: 'Reporting infrastructure',
    stage: 'contacted',
    priorityOverride: 0,
    impact: 4,
    evidenceStrength: 4,
    feasibility: 4,
    strategic: 4,
    confidence: 'high',
    evidence: 'supported',
    evidenceNote: 'Production lines and seasonal demand documented on site.',
    sourceIds: ['s5', 's6'],
    validationQuestions: ['What reporting breaks under peak load?', 'Which teams consume reports?'],
    nextAction: 'Follow up on the introduction email.',
    notes: '',
    createdAt: daysAgo(5),
  },
  {
    id: 'o10',
    companyId: 'c8',
    contactId: 'p9',
    title: 'Supplier & installer portal',
    problem: 'Contract furniture relies on coordinating many suppliers and installers.',
    category: 'software',
    service: 'Supplier/customer portal',
    stage: 'identified',
    priorityOverride: 0,
    impact: 4,
    evidenceStrength: 3,
    feasibility: 3,
    strategic: 4,
    confidence: 'medium',
    evidence: 'supported',
    evidenceNote: 'Project portfolio implies multi-party coordination.',
    sourceIds: ['s13', 's14'],
    validationQuestions: ['How is coordination handled today?', 'How many active partners?'],
    nextAction: 'Validate coordination pain.',
    notes: '',
    createdAt: daysAgo(2),
  },
]

// ---------------------------------------------------------------------------
// A single sample outreach draft so the Outreach Studio is not empty.
// ---------------------------------------------------------------------------

const outreach: OutreachDoc[] = [
  {
    id: 'd1',
    companyId: 'c3',
    contactId: 'p4',
    opportunityId: 'o9',
    docType: 'initial',
    language: 'it',
    tone: 'consultative',
    service: 'Reporting infrastructure',
    subject: 'Dolciaria Emiliana e la reportistica nei picchi stagionali',
    body: `Gentile Giulia Romano,

ho visto che Dolciaria Emiliana gestisce più linee di produzione con picchi stagionali. In contesti simili, la reportistica costruita a mano tende a diventare fragile proprio quando il volume cresce.

Aiutiamo aziende manifatturiere a costruire una base di reportistica stabile e verificabile, così le informazioni arrivano puntuali anche nei periodi di maggiore attività.

Sarebbe utile un confronto di 20 minuti per capire dove i report attuali rallentano?

Un saluto,
[Il tuo nome]`,
    versions: [
      {
        id: 'd1v1',
        label: 'Generated draft',
        subject: 'Dolciaria Emiliana e la reportistica nei picchi stagionali',
        body: `Gentile Giulia Romano,

ho visto che Dolciaria Emiliana gestisce più linee di produzione con picchi stagionali. In contesti simili, la reportistica costruita a mano tende a diventare fragile proprio quando il volume cresce.

Aiutiamo aziende manifatturiere a costruire una base di reportistica stabile e verificabile, così le informazioni arrivano puntuali anche nei periodi di maggiore attività.

Sarebbe utile un confronto di 20 minuti per capire dove i report attuali rallentano?

Un saluto,
[Il tuo nome]`,
        createdAt: daysAgo(2),
      },
    ],
    createdAt: daysAgo(2),
    updatedAt: daysAgo(2),
  },
]

// ---------------------------------------------------------------------------
// Tasks
// ---------------------------------------------------------------------------

const tasks: Task[] = [
  {
    id: 't1',
    title: 'Follow up on production reporting proposal',
    description: 'Send a short follow-up and propose a discovery call.',
    priority: 'high',
    status: 'todo',
    dueDate: daysAhead(2),
    companyId: 'c1',
    contactId: 'p1',
    opportunityId: 'o1',
    createdAt: daysAgo(3),
  },
  {
    id: 't2',
    title: 'Verify CIO contact details',
    description: 'Confirm role and public business contact for Farmaceutica Toscana.',
    priority: 'medium',
    status: 'waiting',
    dueDate: daysAhead(1),
    companyId: 'c7',
    contactId: 'p8',
    createdAt: daysAgo(2),
  },
  {
    id: 't3',
    title: 'Prepare discovery agenda for Tessitura Lombarda',
    description: 'Outline questions on legacy order configuration and integration.',
    priority: 'high',
    status: 'in_progress',
    dueDate: daysAhead(4),
    companyId: 'c5',
    contactId: 'p6',
    opportunityId: 'o5',
    createdAt: daysAgo(2),
  },
  {
    id: 't4',
    title: 'Draft follow-up for Dolciaria Emiliana',
    description: 'Follow up on the introduction email sent this week.',
    priority: 'medium',
    status: 'todo',
    dueDate: daysAhead(3),
    companyId: 'c3',
    contactId: 'p4',
    opportunityId: 'o9',
    createdAt: daysAgo(1),
  },
  {
    id: 't5',
    title: 'Complete company analysis for Logistica Adriatica',
    description: 'Research operations and identify reporting gaps.',
    priority: 'medium',
    status: 'todo',
    dueDate: daysAhead(5),
    companyId: 'c4',
    contactId: 'p5',
    opportunityId: 'o4',
    createdAt: daysAgo(3),
  },
  {
    id: 't6',
    title: 'Research Dolciaria Emiliana',
    description: 'Initial company research completed.',
    priority: 'low',
    status: 'completed',
    dueDate: daysAgo(1),
    companyId: 'c3',
    completedAt: daysAgo(1),
    createdAt: daysAgo(4),
  },
]

// ---------------------------------------------------------------------------
// Weekly goals — targets the user configures; progress derives from activity.
// ---------------------------------------------------------------------------

const goals: WeeklyGoal[] = [
  { id: 'g1', label: 'Companies researched', metric: 'companies_researched', target: 5 },
  { id: 'g2', label: 'Opportunities validated', metric: 'opportunities_validated', target: 4 },
  { id: 'g3', label: 'Contacts verified', metric: 'contacts_verified', target: 5 },
  { id: 'g4', label: 'Outreach drafts created', metric: 'outreach_drafts', target: 6 },
  { id: 'g5', label: 'Outreach confirmed as sent', metric: 'outreach_sent', target: 3 },
  { id: 'g6', label: 'Discovery meetings', metric: 'meetings', target: 2 },
]

// ---------------------------------------------------------------------------
// Activity events — the source of truth for goal progress (no double counting).
// ---------------------------------------------------------------------------

const activity: ActivityEvent[] = [
  { id: 'a1', type: 'company_discovered', at: daysAgo(5), companyId: 'c4', label: 'Discovered Logistica Adriatica S.r.l.' },
  { id: 'a2', type: 'companies_researched', at: daysAgo(5), companyId: 'c1', label: 'Researched Meccanica Treviso S.p.A.' },
  { id: 'a3', type: 'companies_researched', at: daysAgo(4), companyId: 'c3', label: 'Researched Dolciaria Emiliana S.p.A.' },
  { id: 'a4', type: 'contacts_verified', at: daysAgo(4), companyId: 'c1', label: 'Verified contact Marco Rossi' },
  { id: 'a5', type: 'companies_researched', at: daysAgo(3), companyId: 'c7', label: 'Researched Farmaceutica Toscana S.p.A.' },
  { id: 'a6', type: 'contacts_verified', at: daysAgo(3), companyId: 'c3', label: 'Verified contact Giulia Romano' },
  { id: 'a7', type: 'opportunities_validated', at: daysAgo(2), companyId: 'c1', label: 'Validated opportunity: Automate production reporting' },
  { id: 'a8', type: 'outreach_drafts', at: daysAgo(2), companyId: 'c3', label: 'Created outreach draft for Dolciaria Emiliana' },
  { id: 'a9', type: 'outreach_sent', at: daysAgo(1), companyId: 'c3', label: 'Outreach confirmed as sent to Dolciaria Emiliana' },
  { id: 'a10', type: 'meetings', at: daysAgo(1), companyId: 'c5', label: 'Discovery meeting with Tessitura Lombarda' },
  { id: 'a11', type: 'contacts_verified', at: daysAgo(1), companyId: 'c7', label: 'Verified contact Chiara Marino' },
  { id: 'a12', type: 'outreach_drafts', at: daysAgo(2), companyId: 'c5', label: 'Created outreach draft for Tessitura Lombarda' },
]

// ---------------------------------------------------------------------------
// Saved searches
// ---------------------------------------------------------------------------

const savedSearches: SavedSearch[] = [
  {
    id: 'ss1',
    label: 'Machinery makers in Treviso',
    query: { text: '', region: 'Veneto', province: 'Treviso', comune: '', industry: 'Industrial machinery', sizeBand: '' },
    createdAt: daysAgo(4),
  },
  {
    id: 'ss2',
    label: 'Large employers in the north',
    query: { text: '', region: '', province: '', comune: '', industry: '', sizeBand: 'large' },
    createdAt: daysAgo(2),
  },
]

export const seedSettings: AppSettings = {
  sender: {
    name: 'Your name',
    company: 'Your consultancy',
    email: 'you@example.com',
    phone: '',
    services: [
      'Process automation & reporting',
      'ERP/CRM integration',
      'Legacy application modernisation',
      'KPI dashboard & analytics',
      'Internal knowledge assistant',
      'Document understanding',
      'Demand forecasting',
      'Supplier/customer portal',
    ],
  },
  weights: defaultWeights,
}

export const seedState: AppState = {
  companies,
  locations,
  sources,
  financials,
  contacts,
  supplyChain,
  opportunities,
  outreach,
  tasks,
  goals,
  activity,
  savedSearches,
  settings: seedSettings,
}

export const DEMO_DATA_NOTICE =
  'Sample dataset for demonstration only. Company, contact, and financial details are illustrative placeholders — not real-world data.'

/** Geographic + industry option lists derived from the demo dataset. */
export function getRegionOptions(state: AppState): string[] {
  return unique(state.companies.map((c) => c.region))
}
export function getProvinceOptions(state: AppState, region?: string): string[] {
  const list = region ? state.companies.filter((c) => c.region === region) : state.companies
  return unique(list.map((c) => c.province))
}
export function getComuneOptions(state: AppState, province?: string): string[] {
  const list = province ? state.companies.filter((c) => c.province === province) : state.companies
  return unique(list.map((c) => c.comune))
}
export function getIndustryOptions(state: AppState): string[] {
  return unique(state.companies.map((c) => c.industry))
}

function unique(values: string[]): string[] {
  return Array.from(new Set(values.filter(Boolean))).sort((a, b) => a.localeCompare(b))
}
