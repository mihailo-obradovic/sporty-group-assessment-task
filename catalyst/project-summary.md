# sporty-group-assessment-task

Catalyst version: 2.1.0

## Project Purpose

This project is a home assignment for a Frontend Engineer role at Sporty Group: a single-page application that lists sports leagues from TheSportsDB, filters them by name and by sport, and shows a season badge for a league on request. It focuses on component structure, state management, and API integration with cached responses, and it is delivered as a public, runnable repository with a deployed demo.

Context documents: `context/product-description.md`, `context/glossary.md` (`references/project-documents.md`)

Convention annexes: `annexes/design-system.md` — when writing or changing anything visual in `app/` (`references/project-documents.md`)

Agent adapters: `agents/domain.md` — when a mattpocock-skills skill asks for `CONTEXT.md`, `CONTEXT-MAP.md`, or `docs/adr/` (decision 001, `references/agent-skills.md`)

## Feature Index

| ### | Feature     | Status | Summary                                                                                                                                                                                                                                             | Document                                                   |
| --- | ----------- | ------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------- |
| 001 | League list | Active | The one screen: TheSportsDB Leagues with name search and Sport filter held in the URL, click-to-reveal Season badge, session cache, and a flagged fixture mode (Live / Sample toggle) for the degraded free tier, in the mockup's dark-only design. | [features/001_league-list.md](features/001_league-list.md) |

## Architecture Decision Record (ADR) Index

One line per record: type, status, title, link.

| ### | Type        | Status      | Decision                                                                                                                      | Document                                                                             |
| --- | ----------- | ----------- | ----------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------ |
| 001 | init-design | Implemented | Init design: Nuxt + Nuxt UI SPA, GitHub Actions, Vercel static hosting, fixture for the degraded free API, collapsed ceremony | [decisions/001_init-design_league-list.md](decisions/001_init-design_league-list.md) |
| 002 | bootstrap   | Implemented | Bootstrap: Nuxt + Nuxt UI skeleton, Pinia Colada data layer, Vitest + MSW, CI, Vercel static hosting                          | [decisions/002_bootstrap_nuxt-skeleton.md](decisions/002_bootstrap_nuxt-skeleton.md) |

## Domain Decision Index

Present only when the project has standing cross-cutting domain/method decisions (e.g. "negative values are signal, never clipped") — pre-resolved judgment calls the agent follows and never re-litigates (`references/project-documents.md`). One line each: decision + short rationale. A local decision graduates here when it proves cross-cutting.

| Decision                       | Rationale |
| ------------------------------ | --------- |
| _No documented decisions yet._ | -         |

## Protected Areas

Pointer index of protections declared in lazy-loaded feature/decision documents. One row per area: name + owning document — never the rule text. Folder-document protections are not indexed; they load with their folder.

**Declaring an area protected obliges a callable seam it can be tested through.** A format buried inside a composable that cannot be constructed without eight arguments is undefended whatever this table says — the protection is only as real as the narrowest thing a test can call.

| Area                                 | Owner |
| ------------------------------------ | ----- |
| _No documented protected areas yet._ | -     |

## Technical Stack

One row per layer: the module chosen from Catalyst's `stacks/`, plus UI choices, adopted addons, and any optional layer. Filled at spawn; tells an agent which stack documents apply (`architecture.md` has the index).

| Layer       | Module                                    |
| ----------- | ----------------------------------------- |
| ci          | github-actions                            |
| frontend    | nuxt                                      |
| frontend/ui | nuxtui                                    |
| hosting     | vercel (no Catalyst module; decision 001) |

## Status Values

Each index has its own status set — the validator rejects a row carrying another index's status.

**Features** (Feature Index):

- `Draft`: planned or partially specified; not yet approved.
- `Approved`: accepted as the contract; being implemented on a branch.
- `Active`: implemented and maintained.
- `Changing`: currently being redesigned or refactored.
- `Deprecated`: kept for compatibility but should not be expanded.
- `Removed`: intentionally removed; keep only if historical context matters.

**Decision records** (ADR Index): `Proposed` → `Accepted` → `Implemented`, plus `Superseded by <nnn>` when a later record replaces it.

## Summary Rules

Feature summaries: one to three sentences, specific enough to route an agent to the right document, free of implementation detail unless the boundary matters, updated when external behavior changes.

## Agent Usage

Use this file to decide which feature documents and decision records to load; never recursively load `features/` or `decisions/`.
