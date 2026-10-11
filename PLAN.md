# NEXUS — Implementation Plan

Derived from the specification in [ideasv2.md](./ideasv2.md). This plan follows the
"Phase 0" and "Instructions for the Coding Agent" sections of that specification.

## Status

- **Phase 0** — completed (assessment below).
- **Phase 1** — implemented: functional frontend MVP covering the end-to-end flow with
  demo data, local persistence, and a GitHub Actions Pages workflow. Code was authored
  in an environment without Node.js, so `npm install`, `npm run typecheck`, `npm test`,
  and `npm run build` still need a local verification pass (see README).
- **Phases 2–4** (auth, hosted DB, live AI backend, data providers, email/CRM sync) —
  deferred by design.

## Phase 0 — Repository assessment (completed)

Findings:

- `company/portal/` contained only the spec documents (`ideas.md`, `ideasv2.md`); there
  was **no existing application code, configuration, or stack to preserve**.
- No `package.json`, no source tree, no tests, no CI.
- Therefore a clean scaffold is justified. There is nothing to break.

## Target architecture

- **Frontend (this repo):** React 18 + TypeScript + Vite, deployed as a static site to
  GitHub Pages. Uses hash routing so static hosting needs no server rewrite rules.
- **Backend (not in this milestone):** an external service for AI calls, secrets, and
  privileged data ingestion. The frontend never holds private keys.
- **Database (not in this milestone):** managed persistence (Supabase/Postgres). The
  MVP uses clearly-labelled demo data plus `localStorage`, with a `storage` abstraction
  designed to be swapped for a real backend later.

### Security rules honoured by this milestone

- No private API keys are read in the frontend; only `VITE_`-prefixed, browser-safe
  variables are used.
- Demo mode is labelled honestly throughout the UI.
- No fabricated company research is presented as real: all seed records carry a source
  and an explicit verification/evidence classification.

## P0 MVP deliverable (this pass)

A coherent, working frontend covering the end-to-end journey:

> Discover a company → Understand its business → Identify an opportunity → Prepare
> outreach → Schedule follow-up.

Included:

1. Application shell: persistent sidebar (desktop), responsive navigation (mobile),
   top bar, demo-mode banner.
2. Dashboard: summary metrics, priority opportunities, upcoming follow-ups, recent
   activity, recommended next actions.
3. Discover: searchable/filterable demo company directory (region, province, comune,
   industry, size, name) with saved searches.
4. Companies + Company Intelligence workspace: overview, sources, contacts, operations,
   financial records, supply-chain, and the AI business analysis panel with explicit
   evidence/confidence classifications.
5. Opportunities: prioritised list + lightweight pipeline stages.
6. Contacts: professional contact records with verification status.
7. Outreach Studio: template-based generation from selected context, editable drafts,
   revision history, copy/export (no live sending).
8. Tasks: CRUD with statuses, priority, due dates, and links to company/opportunity.
9. Goals & Reports: weekly targets computed from tracked activity events.
10. Settings, Integrations placeholder, and saved-search history.
11. `localStorage` persistence via a reducer-based store with a swappable storage layer.
12. Unit tests for the scoring, formatting, selector, and outreach-generation
    logic (four suites).
13. README, `.env.example`, `.gitignore`, and a GitHub Actions Pages workflow.

Explicitly deferred to later phases (per spec): real auth, hosted DB, live AI backend,
authorised company-data providers, email sending, CRM/calendar sync.

## Build order

1. Tooling + config (`package.json`, Vite, TS, Tailwind, tests).
2. Domain types, demo data, storage, scoring.
3. State store + routing + app shell.
4. Screens, from dashboard outward.
5. Docs, CI, tests.

## How to run

See [README.md](./README.md). Note: this workspace has no Node.js installed, so the
project files are authored but `npm install` / `npm run build` must be run in an
environment with Node 18+.
