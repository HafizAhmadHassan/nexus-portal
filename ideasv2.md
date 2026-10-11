I can create a stronger `ideas.md` v2 that turns your original concept into a more focused, implementation-ready product specification, with a distinctive product identity, a realistic MVP, and a clear technical roadmap.

I can also generate a visual for the project, but image generation and editing require you to log in first. Once you're logged in, I can create a visual concept for the portal.

# `ideas.md` — Version 2.0

Writing

# NEXUS — AI Business Intelligence & Sales Intelligence Platform

**Version:** 2.0\
**Product type:** AI-powered B2B SaaS\
**Primary market:** Italian businesses and sales prospects\
**Deployment target:** GitHub Pages + external backend services\
**Status:** Product specification and implementation blueprint

---

## 1\. Vision

NEXUS is an AI-powered business intelligence and sales prospecting platform that transforms public company information into actionable commercial opportunities.

Instead of switching between company directories, search engines, spreadsheets, financial reports, CRM tools, and email applications, users can conduct their prospecting workflow from one workspace.

NEXUS should help users answer five fundamental questions:

1. Which companies should I approach?
2. What does each company actually do?
3. Which business challenges could my services solve?
4. Who is the appropriate person to contact?
5. How can I turn this research into a personalized sales conversation?

The initial focus is Italian companies, with geographic discovery down to the comune level.

### Product philosophy

- **Evidence before assumptions:** Every important claim should have a source or an explicit uncertainty label.
- **Intelligence before automation:** Understand the prospect before recommending a service.
- **Human control:** Users approve communications and important external actions.
- **Progressive integration:** The application remains useful in demo mode while integrations are introduced incrementally.
- **One connected workflow:** Research, opportunities, contacts, outreach, and follow-ups share the same company context.

The product should feel like a combination of a business intelligence terminal, a research assistant, and a lightweight sales workspace.

---

## 2\. Product Identity

**Product name:** NEXUS

**Tagline:** From company data to commercial opportunities.

**Alternative tagline:** Know the business. Find the opportunity. Start the conversation.

### Target users

- Software development agencies.
- AI implementation and automation consultants.
- Digital transformation providers.
- B2B sales professionals.
- Business development representatives.
- Independent technology consultants.
- Small and medium-sized consulting businesses.

### Primary use case

A technology consultant wants to find manufacturing companies in Treviso that could benefit from production reporting automation.

Using NEXUS, the consultant can:

1. Search manufacturers in the target area.
2. Review matching companies and available sources.
3. Open a company intelligence profile.
4. Examine verified facts and potential business opportunities.
5. Prioritize the most promising opportunity.
6. Identify an appropriate professional contact.
7. Generate and edit an Italian outreach email.
8. Save the draft and create a follow-up task.
9. Track the prospect through a simple sales pipeline.

The entire journey should preserve the selected company's context.

---

## 3\. Scope and Priorities

Build a functional product rather than a collection of attractive but disconnected screens.

### P0 — Essential MVP

- Responsive application shell and navigation.
- Dashboard with activity metrics and weekly goals.
- Business discovery using a clearly labelled demo dataset.
- Search by Italian location and industry.
- Company profiles with source attribution.
- Evidence-based AI analysis interface.
- Opportunity prioritization.
- Personalized outreach generation and editing.
- Saved companies and notes.
- Tasks and follow-up reminders.
- Local demo persistence.
- GitHub Pages deployment.
- README, environment template, and basic tests.

### P1 — Persistent production features

- Real authentication.
- Hosted database and user-specific persistence.
- Secure AI service integration.
- Authorized company-data providers.
- Saved searches and research history.
- Contact management.
- Document version history.
- CSV and document exports.

### P2 — Advanced intelligence

- Historical financial analysis.
- Supply-chain relationship visualization.
- CRM synchronization.
- Approved email integrations.
- Calendar integration.
- Team workspaces and shared research.
- Advanced reporting and usage analytics.

P2 features must not delay delivery of a coherent MVP.

---

## 4\. Technical Architecture

Inspect the existing repository before selecting or replacing technologies.

### Preferred stack

- Frontend: React, TypeScript, and Vite.
- Styling: Tailwind CSS or the repository's existing styling system.
- Components: Reusable accessible UI components.
- Charts: Recharts.
- Forms and validation: Typed schemas and form validation.
- Routing: React Router with a GitHub Pages-compatible configuration.
- Authentication: Supabase Auth or an equivalent managed provider.
- Database: PostgreSQL through Supabase or an equivalent hosted service.
- AI: Provider-independent service interface connected to a secure backend.
- Testing: Vitest and React Testing Library, plus browser-level tests where practical.
- Deployment: GitHub Actions and GitHub Pages.

Do not introduce dependencies unnecessarily if the existing project already provides suitable alternatives.

### Architecture boundaries

**Frontend — GitHub Pages**

Responsible for:

- Rendering the application.
- Navigation and forms.
- Interactive charts and visualizations.
- User-approved editing and export workflows.
- Calling authorized external services.
- Displaying loading, success, and error states.

**Backend — external service**

Responsible for:

- Secure AI provider calls.
- Secret management.
- Protected business-data ingestion.
- Authorization of private operations.
- Rate limiting and usage controls.
- Sensitive third-party integrations.
- Server-side validation of privileged actions.

**Database — managed persistence**

Responsible for:

- User profiles.
- Saved companies and searches.
- Research records.
- Contacts and opportunities.
- Outreach drafts and revisions.
- Tasks, goals, and activity history.

GitHub Pages must never be treated as a secure backend.

### Required security rules

- No private API keys in browser bundles.
- No database service-role credentials in frontend configuration.
- Public environment variables must contain only values safe for browser exposure.
- Private database records must be protected with server-side authorization and appropriate row-level security policies.
- Every AI request must be validated and rate-limited.
- External content must be treated as untrusted input.
- Production integrations must fail clearly when configuration is missing.
- Never commit secrets or real credentials.

---

## 5\. Application Navigation

Use a persistent left sidebar on desktop and a compact navigation pattern on mobile.

### Primary navigation

1. Overview
2. Discover
3. Companies
4. Opportunities
5. Contacts
6. Outreach Studio
7. Tasks
8. Goals & Reports

### Secondary navigation

- Research history.
- Saved searches.
- Integrations.
- Settings.

Company-specific screens should provide contextual navigation between company intelligence, contacts, opportunities, and outreach.

Avoid unnecessary duplicate pages. For example, company research should be accessible from both Discover and Companies without implementing separate versions of the same profile.

---

## 6\. Dashboard

The dashboard should answer three questions immediately:

- What have I accomplished?
- Which opportunities deserve attention?
- What should I do next?

### Summary metrics

- Companies discovered.
- Companies researched.
- Opportunities identified.
- Contacts verified.
- Outreach drafts created.
- Follow-ups due.

Distinguish drafts from messages confirmed as sent. Never infer completed actions from the mere existence of a document.

### Dashboard sections

**Weekly progress**

Show user-defined targets and completion progress.

**Priority opportunities**

Display a short list of high-priority companies and their most relevant opportunities.

**Upcoming follow-ups**

Show overdue and upcoming tasks, with links to their associated companies.

**Recent activity**

Display meaningful user actions with timestamps.

**Recommended next actions**

Suggest useful actions based on actual application state, such as reviewing an unverified contact or completing an unfinished company analysis.

Use realistic seed data in demo mode and visibly label it as sample data.

---

## 7\. Business Discovery

Create a searchable directory of companies with geographic and industry filters.

### Search capabilities

- Italian comune.
- City or municipality.
- Province.
- Region.
- Industry.
- Company name.
- Available employee-count ranges.
- Other reliable attributes provided by the connected data source.

Allow combinations of filters and provide clear filter-reset controls.

### Italian geography

Support a hierarchy of:

Region → Province → Comune

Store stable geographic identifiers where available rather than relying exclusively on display names.

Support Italian names, accents, and common spelling variations.

### Search results

Each result should contain:

- Company name.
- Industry.
- Comune and province.
- Website, if verified.
- Available size indicators.
- Research status.
- A concise, evidence-based relevance explanation.
- A link to the company profile.

Support list and grid views, sorting, pagination, and saved searches.

Provide a map only when suitable geographic coordinates and mapping services are available.

### Data-source rules

Use authorized APIs, public registries, legitimate directories, and company websites where permitted.

Every sourced record should preserve its origin and retrieval date.

Never invent companies, employee counts, websites, or financial metrics.

If live discovery is unavailable, use a small, clearly labelled sample dataset rather than pretending a search returned current real-world results.

---

## 8\. Company Intelligence Workspace

The company workspace is the central research screen.

Use two primary columns on desktop:

- Left: Company Intelligence.
- Right: AI Business Analysis.

On mobile, stack the sections vertically and preserve clear navigation between them.

### 8.1 Company overview

Show:

- Company name and available branding.
- Website and headquarters.
- Geographic locations.
- Industry classification.
- Company description.
- Products and services.
- Founding year, if verified.
- Employee range, if supported.
- Corporate group or ownership information, when lawfully available.

Every sourced field should be traceable to its source.

### 8.2 Company contacts

Show relevant professional contacts when reliable information is available.

Possible roles include managing director, IT manager, operations manager, production manager, and digital transformation lead.

Each record should include:

- Name and role.
- Company affiliation.
- Professional relevance.
- Public business contact details, if available.
- Source.
- Verification status.
- Last-checked date.

Do not generate plausible-looking contact details and present them as real.

Provide a manual research and verification workflow when information is missing.

### 8.3 Operations and business model

Summarize available information about:

- Main products and services.
- Customer segments.
- Business model.
- Manufacturing or service delivery processes.
- Geographic markets.
- Publicly documented technology systems.
- Publicly documented partnerships.

Distinguish documented operations from inferred workflows.

### 8.4 Financial intelligence

Show available financial records with their reporting periods and provenance.

Potential metrics include revenue, profit or loss, EBITDA, assets, liabilities, and employee count.

For each record, store:

- Metric name.
- Value and currency.
- Reporting period.
- Source URL or source identifier.
- Publication date, when available.
- Retrieval date.
- Data classification: reported, estimated, or calculated.

Display historical charts only when sufficient compatible data exists.

Never silently interpolate missing values or combine incompatible reporting periods.

If reliable data is unavailable, explain the limitation and identify the information that would be needed for further analysis.

### 8.5 Supply-chain intelligence

Where evidence exists, visualize relationships among suppliers, production, logistics, warehousing, and distribution.

Represent unknown relationships explicitly.

Do not manufacture a complete supply chain from industry stereotypes.

---

## 9\. AI Business Analysis Engine

The AI engine should turn available research into a structured, reviewable set of business hypotheses and recommendations.

### 9.1 Analysis workflow

1. Collect available company records and sources.
2. Normalize and deduplicate the information.
3. Identify facts, missing information, and potential contradictions.
4. Generate relevant business hypotheses.
5. Link hypotheses to supporting evidence.
6. Evaluate business value and implementation feasibility.
7. Produce recommendations.
8. Allow the user to validate, reject, or investigate each recommendation.

### 9.2 Opportunity categories

Analyze relevant possibilities across:

**Software development**

- Internal business applications.
- ERP and CRM integrations.
- Supplier or customer portals.
- Legacy application modernization.
- Custom reporting tools.

**AI implementation**

- Internal knowledge assistants.
- Document understanding and extraction.
- Search over company documents.
- Customer support assistance.
- Forecasting where suitable data exists.

**Automation**

- Document processing.
- Order management.
- Workflow approvals.
- Reporting.
- Notifications.
- Repetitive administrative tasks.

**Data and business intelligence**

- KPI dashboards.
- Data quality improvement.
- Reporting infrastructure.
- Demand forecasting.
- Sales and operational analytics.

Only recommend categories relevant to the evidence and the user's services.

### 9.3 Opportunity record

Each opportunity must include:

- Title.
- Problem hypothesis.
- Supporting evidence.
- Evidence source references.
- Confidence classification.
- Potential business impact.
- Proposed solution.
- Implementation complexity.
- Validation questions.
- Recommended next action.

### 9.4 Evidence and confidence

Use consistent classifications:

- **Verified fact:** Directly supported by a reliable source.
- **Supported inference:** Reasonable interpretation of documented evidence.
- **Hypothesis:** Plausible opportunity requiring validation.
- **Unknown:** Insufficient information.

Confidence should reflect evidence quality and completeness, not the model's writing style.

### 9.5 Prioritization

Rank opportunities using:

- Potential business impact.
- Evidence strength.
- Implementation feasibility.
- Strategic relevance to the user's services.

Keep the scoring formula transparent and configurable.

Do not invent precise ROI percentages or present arbitrary scores as objective measurements.

### 9.6 Commercial validation

For potentially valuable opportunities, generate:

- Discovery questions.
- Information needed to validate the problem.
- A suggested pilot.
- Indicative implementation assumptions.
- Potential success metrics.
- Major risks and dependencies.

Where financial calculations are possible, display the assumptions and formula alongside the result.

---

## 10\. Sales Strategy

For each selected opportunity, generate a practical sales brief.

Include:

- Recommended initial contact role.
- Most relevant service.
- Evidence-based reason for contacting the company.
- Proposed conversation opener.
- Discovery questions.
- Likely objections and respectful responses.
- Suggested demonstration.
- Pilot-project proposal.
- Clear next step.

Generate two pitches:

**Elevator pitch:** A concise explanation suitable for an initial conversation.

**Meeting pitch:** A more detailed explanation connecting the documented business context to the proposed solution.

The objective is to start a relevant business conversation, not to claim that the prospect has problems that have never been verified.

---

## 11\. Outreach Studio

Create a focused workspace for generating, editing, and managing business communications.

### Supported document types

- Initial outreach emails.
- Follow-up emails.
- Meeting requests.
- Service introductions.
- Discovery agendas.
- Opportunity summaries.
- Short consulting proposals.

### Generation inputs

- Selected company.
- Recipient and professional role.
- Selected opportunity.
- Proposed service.
- Relevant company evidence.
- Language: Italian or English.
- Tone: professional, consultative, concise, or technical.
- Call to action.
- Optional sender profile and portfolio references.

### Editing experience

Use a two-panel layout where practical:

- Left: Generation settings and context.
- Right: Editable document preview.

Users must be able to:

- Edit the subject and body.
- Regenerate selected sections.
- Create alternative drafts.
- Save revisions.
- Restore previous versions.
- Copy the document.
- Export supported formats.
- View the sources used to personalize the message.

Preserve user edits and never silently replace a manually edited document during regeneration.

### Quality rules

- Avoid generic praise.
- Avoid unsupported claims about the prospect.
- Never invent previous interactions.
- Do not invent mutual connections or referrals.
- Use only appropriate professional contact details.
- Respect the selected language and tone.
- Avoid manipulative urgency and misleading personalization.

### Sending policy

The initial MVP should not send email.

Provide copy and export functionality first.

A later email integration must use an authorized provider, secure token handling, explicit confirmation, and a clear delivery status.

---

## 12\. Opportunities and Lightweight CRM

Create a unified opportunity list connected to companies, contacts, and tasks.

Each opportunity should have:

- Company.
- Title.
- Description.
- Proposed service.
- Evidence and validation status.
- Priority.
- Estimated effort.
- Sales stage.
- Next action.
- Related contact.
- Notes.

Suggested stages:

- Identified.
- Researching.
- Ready for outreach.
- Contacted.
- Meeting scheduled.
- Proposal in progress.
- Won.
- Lost.
- On hold.

Users should be able to move opportunities between stages and filter by status, priority, location, or industry.

Do not imply that a company has been contacted merely because a draft exists.

---

## 13\. Tasks and Weekly Goals

### Task management

Each task should support:

- Title.
- Description.
- Priority.
- Due date.
- Status.
- Related company.
- Related contact.
- Related opportunity.
- Notes.
- Completion timestamp.

Statuses:

- To do.
- In progress.
- Waiting for response.
- Completed.

Provide list and Kanban views.

Allow quick task creation from a company, opportunity, or outreach document.

### Weekly goals

Users can create configurable targets for activities such as:

- Companies researched.
- Opportunities validated.
- Contacts verified.
- Outreach drafts created.
- Outreach messages confirmed as sent.
- Discovery meetings completed.

Track the underlying events so the same action is not accidentally counted twice.

Let users define which events count toward each goal.

Display current progress, historical performance, and weekly summaries.

Do not automatically mark a meeting as completed or an email as sent without a corresponding confirmed action or integration event.

---

## 14\. Data Model

Use stable IDs, typed entities, explicit relationships, and reproducible database migrations.

Core entities:

- UserProfiles
- Companies
- CompanyLocations
- CompanySources
- FinancialRecords
- Contacts
- SupplyChainRelationships
- ResearchRuns
- BusinessAnalyses
- BusinessOpportunities
- OutreachDocuments
- OutreachVersions
- Tasks
- WeeklyGoals
- ActivityEvents
- SavedSearches
- IntegrationConnections

### Provenance

Research-related records should retain appropriate source URLs, retrieval dates, verification states, and reporting periods.

AI-generated insights should reference the evidence used to produce them.

### Privacy

User-owned notes, tasks, drafts, and private research must be isolated from unrelated users.

Apply authorization and row-level security where supported.

Define data retention and deletion behavior for user-generated content and external research.

Avoid storing unnecessary personal information.

---

## 15\. Design System

NEXUS should feel like a premium, information-dense enterprise SaaS product.

### Visual direction

- Light theme by default.
- Deep navy typography.
- Neutral gray surfaces.
- Restrained cobalt or indigo accents.
- Optional dark theme.
- Clear borders and subtle shadows.
- Compact, consistent spacing.
- Strong typographic hierarchy.
- Minimal decorative gradients.

### Layout

Use a persistent sidebar on desktop, a responsive mobile navigation pattern, and a consistent content container.

Company intelligence should favor readable data layouts over oversized promotional cards.

### Component patterns

Create reusable components for:

- Navigation.
- Search and filters.
- Company summary.
- Source attribution.
- Verification status.
- Opportunity cards.
- Financial tables.
- Charts.
- Editable documents.
- Task lists.
- Progress indicators.
- Empty and error states.

### Accessibility

- Keyboard-accessible interactions.
- Visible focus indicators.
- Accessible form labels.
- Appropriate contrast.
- Responsive text and layouts.
- Clear status messages.

Every primary interaction must have a working behavior. Avoid decorative controls that look functional but do nothing.

---

## 16\. GitHub Pages Deployment

Use GitHub Actions to build and deploy the static frontend.

Requirements:

- Configure the Vite base path for the repository.
- Configure routing for static hosting.
- Build and validate production assets.
- Deploy after successful workflow execution.
- Document GitHub Pages settings.
- Include an `.env.example` with placeholders only.
- Include local development and deployment instructions.
- Verify that the production frontend contains no private credentials.

Use hash-based routing if it is the simplest reliable option for the existing application.

Document any environment variables that must be configured during the build.

The application must work in demo mode without optional production integrations.

Clearly distinguish demo capabilities from live services.

---

## 17\. Implementation Plan

### Phase 0 — Repository assessment

Before changing files:

1. Inspect the project structure.
2. Read existing documentation and configuration.
3. Identify the current stack.
4. Run the existing application and tests when possible.
5. Record existing functionality that must be preserved.
6. Identify deployment and integration constraints.

Do not replace the repository with a new scaffold without a clear reason.

### Phase 1 — Functional frontend MVP

Implement:

- Application shell.
- Navigation and responsive layout.
- Dashboard.
- Business discovery.
- Company profiles.
- Opportunity workspace.
- Outreach Studio.
- Tasks and goals.
- Demo data.
- Local demo persistence.
- GitHub Pages deployment.

AI analysis may initially use clearly labelled deterministic sample outputs or a mock service.

The UI should communicate demo mode honestly.

### Phase 2 — Research and persistence

Implement:

- Authentication.
- Database schema and migrations.
- User-specific persistence.
- Authorized company-data sources.
- Research provenance.
- Contact verification.
- Secure AI backend.

### Phase 3 — Intelligence and outreach

Implement:

- Structured AI analysis.
- Evidence-linked opportunities.
- Opportunity prioritization.
- Outreach revision history.
- Financial calculations where data permits.
- Export functionality.
- More comprehensive tests.

### Phase 4 — Integrations and refinement

Implement:

- Optional email provider integration.
- Reminders.
- Advanced analytics.
- CRM integrations where justified.
- Performance and accessibility improvements.
- Usage limits and cost monitoring.

Complete and verify each phase before expanding scope.

---

## 18\. Testing and Acceptance Criteria

The MVP is ready when:

- The project installs and starts using documented commands.
- All primary navigation destinations work.
- Company search supports the configured demo filters.
- Selecting a company opens its intelligence profile.
- Company facts and AI hypotheses are visually distinguishable.
- Research claims show source information where available.
- Opportunities can be reviewed and prioritized.
- Outreach drafts can be generated, edited, copied, and saved.
- Editing a draft does not silently destroy the user's changes.
- Tasks can be created, updated, and completed.
- Weekly goals reflect correctly tracked activities.
- Missing integrations produce useful messages.
- The production build succeeds.
- GitHub Pages deployment is documented and reproducible.
- No private API keys are exposed.
- Core interactions have automated tests or documented manual verification steps.

Production authentication and persistence must be tested separately from demo mode.

---

## 19\. Instructions for the Coding Agent

Act as a senior full-stack engineer, product designer, and AI application architect.

First inspect the repository and prepare a concise implementation plan.

Then build the product incrementally, preserving existing working functionality.

Prioritize the end-to-end user journey:

**Discover a company → Understand its business → Identify an opportunity → Prepare outreach → Schedule follow-up.**

For every implementation phase:

1. Make the smallest coherent set of changes.
2. Use reusable components and typed interfaces.
3. Handle loading, error, empty, and success states.
4. Test the changed functionality.
5. Run the production build.
6. Fix errors before proceeding.
7. Update the README and configuration examples.
8. Summarize what works, what remains, and which integrations are required.

Do not claim that mocked functionality is live.

Do not fabricate company research, contact details, financial figures, or verified business opportunities.

Do not spend time integrating every external service before the core workflow works.

### Final objective

Deliver NEXUS as a professional, coherent AI-assisted prospecting workspace that helps users identify the right Italian companies, understand their businesses, develop evidence-based service opportunities, prepare personalized communications, and consistently execute their sales workflow.

The first release should be small enough to complete, useful enough to demonstrate, and architected well enough to grow into a production SaaS application.

## What makes v2 better

- More achievable: It prioritizes one complete prospecting workflow instead of building every integration at once.
- More trustworthy: It introduces explicit evidence classifications and source provenance throughout the product.
- More maintainable: It establishes clear boundaries between the static frontend, backend services, and database.
- More useful for sales: It connects companies, opportunities, outreach, and follow-up tasks into a single workflow.
- Better for an OpenCode agent: It gives concrete phases, acceptance criteria, and instructions to inspect and preserve the existing repository.

My recommendation: Use this as the new `ideas.md`, replacing the previous specification rather than appending another long section. Keep the initial milestone focused on a polished, working demo that can be deployed to GitHub Pages, and add real authentication, AI, and business-data integrations once the core workflow is stable.