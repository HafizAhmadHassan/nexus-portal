# NEXUS — AI Business Intelligence & Sales Intelligence Platform

> From company data to commercial opportunities.

NEXUS is an AI-assisted B2B prospecting workspace for Italian companies. It helps a
consultant **discover** relevant companies, **understand** each business from sourced
evidence, **identify** service opportunities, **prepare** personalized outreach, and
**follow up** — all in one connected workflow.

This repository contains the **P0 MVP frontend**: a functional demo that runs
entirely in the browser with clearly-labelled sample data and local persistence. Live
AI, authentication, hosted data, and sending integrations are planned for later phases
(see [PLAN.md](./PLAN.md) and [ideasv2.md](./ideasv2.md)).

## Status: demo mode

- All company, contact, financial, and opportunity records are **sample data**, labelled
  as such in the UI.
- Persistence uses the browser's `localStorage`.
- No email is ever sent. Outreach documents can be generated, edited, copied, and
  exported only.
- No private API keys are read in the browser. Only `VITE_`-prefixed, browser-safe values
  are used (see `.env.example`).

## What the P0 demo includes

The end-to-end workflow is implemented:

> **Discover a company → Understand its business → Identify an opportunity → Prepare
> outreach → Schedule follow-up.**

1. **Overview** — summary metrics, weekly goal progress, priority opportunities,
   upcoming follow-ups, recent activity, and recommended next actions.
2. **Discover** — searchable/filterable demo directory (region → province → comune,
   industry, size, free text), list/grid views, pagination, and saved searches.
3. **Companies / Company intelligence** — sourced overview, locations, sources with
   retrieval dates, contacts with verification status, financial records with data
   classification and a revenue chart, supply-chain links shown only where evidence
   exists, and an evidence-linked **AI business analysis** panel.
4. **Opportunities** — a single pipeline with transparent, configurable weighted
   scoring, stage counts, filters, and validation questions per hypothesis.
5. **Contacts** — professional contacts with honest verification states (nothing
   plausible-looking is presented as real).
6. **Outreach Studio** — template-based draft generation (Italian/English, four tones,
   seven document types) from the selected company/contact/opportunity context,
   an editable preview that never silently discards manual edits (every revision is
   stored), copy and `.md`/`.txt` export, version history with restore, and the
   sources used behind each draft. No live sending.
7. **Tasks** — list and Kanban views with priority, due dates, and links to companies
   and opportunities.
8. **Goals & Reports** — weekly targets computed strictly from tracked activity events,
   editable targets, last-8-week activity trend, and a per-metric breakdown.
9. **Settings** — sender profile and the public scoring weights (sum to 100).
10. **Integrations & History** — honest placeholders for future services and a full
    activity log with saved-search management.

## Tech stack

- React 18 + TypeScript
- Vite (build + dev server)
- Tailwind CSS v4 (via `@tailwindcss/vite`)
- React Router (hash routing, GitHub Pages friendly)
- Vitest (unit tests)

## Getting started

Requires **Node.js 18+**.

```bash
npm install
npm run dev        # start the dev server
npm run build      # type-check and build to ./dist
npm run preview    # preview the production build
npm run test       # run unit tests
npm run typecheck  # type-check only
```

> This project was authored in an environment without Node.js available, so dependencies
> have not been installed or built here. Run the commands above locally to install and
> verify.

## Configuration

Copy `.env.example` to `.env` and adjust if needed. Only public, browser-safe values
belong here — **never** put private keys in the frontend.

## Deployment (GitHub Pages)

The workflow at `.github/workflows/deploy.yml` builds and publishes the static frontend.

1. Push to `main`.
2. In the repository's **Settings → Pages**, set the source to **GitHub Actions**.
3. The site is published at `https://<user>.github.io/<repo>/`.

The app uses hash-based routing and a relative asset `base`, so it works from a
repository subpath without extra configuration.

## Project structure

```
src/
  components/     reusable UI + layout
  lib/            types, demo data, formatting, scoring, storage
  pages/          one component per route
  state/          reducer-based store with persistence
  App.tsx         routes
  main.tsx        entry point
```

## Principles

- **Evidence before assumptions** — every important claim carries a source and an
  evidence/confidence classification.
- **Intelligence before automation** — understand the prospect before recommending.
- **Human control** — the user approves communications and external actions.
- **Progressive integration** — useful in demo mode; integrations added incrementally.
- **One connected workflow** — companies, opportunities, outreach, and tasks share context.
