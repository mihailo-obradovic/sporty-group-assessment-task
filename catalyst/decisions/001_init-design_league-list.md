# Decision: Init design — sports league list

## Status

Accepted

## Type

init-design

## Task Weight

Medium

## Context

New project: the Sporty Group frontend home assignment (`context/product-description.md`). A single-page app lists TheSportsDB leagues, filters them by name and Sport, and shows a Season badge for a League on request. The brief allows Vue, React or Angular, expects about 90 minutes of work, and asks for a public runnable repository with notes on AI tools and design decisions. There is no backend, no account, and no data of our own.

Two facts shaped the design. The repository already had mattpocock-skills installed, a skill pipeline with its own document layout. And the free API tier behind key `3` does not serve what the brief describes: on 2026-10-07 the all-leagues endpoint returned five Soccer leagues with no alternate-name field, so the sport filter and the Alternate name column cannot be shown working against live data.

## Decision

**Stack.** `frontend/nuxt` with `frontend/ui=nuxtui` and no addons, plus `ci/github-actions`. Vue over React was the author's choice. Nuxt UI over headless primitives buys accessible select, input, and card components inside the time budget. The module's SPA posture (`ssr: false`) matches the brief, which asks for an SPA.

| Layer      | Verdict     | Why                                                                                |
| ---------- | ----------- | ---------------------------------------------------------------------------------- |
| Backend    | none        | The app reads a public API directly; CORS is open                                  |
| Database   | none        | A frontend-only app carries none                                                   |
| CI         | **adopted** | The repository is public from the first push; lint, typecheck, test, build gate it |
| Deployment | none        | Its trigger is a multi-service run; one static site has none to orchestrate        |
| Others     | none        | No identity, background work, or lockfile automation the brief calls for           |

**Hosting.** Vercel, static output (`nuxt generate`), connected through Vercel's Git integration: production from `master`, a preview per branch. Catalyst has no hosting module, so the choice is recorded here. The brief needs only a runnable repository; a deployed demo lets a reviewer click through without installing anything.

**Degraded API.** Code is written against the documented full response shape, with Alternate name optional. A hand-written fixture in that same shape, switchable at runtime and flagged on screen whenever it is active, lets a reviewer see the filters work across several Sports. The fixture is registered in `KNOWN_FAKES.md` when it lands, with removal on a premium key or a restored free tier. The feature document owns its behaviour.

**Tooling.** The AI tool is Claude Code. mattpocock-skills stays installed and is routed into the bundle by `agents/domain.md`: its glossary is `context/glossary.md`, its ADRs are these records, its specs are feature documents, and its issue tracker is dropped in favour of `PLAN-sporty-leagues.md`.

**Collapsed ceremony.** Every Catalyst document and the validator apply in full. One feature document and one feature branch cover the whole app, since it is one screen. Commits still land one approved step at a time, and the UI is still verified in a browser.

## Scope

Design only: this record, the Technical Stack table in `project-summary.md`, and the pipeline link in the root `AGENTS.md`. The skeleton is the follow-up bootstrap record (002). No behaviour contracts exist yet.

## Consequences

The bootstrap scaffolds Nuxt with Nuxt UI, the data layer, the test stack, CI, and the Vercel connection in one record, followed by one feature. Phone width is the layout baseline from the first screen. The stock Nuxt UI look is a first pass; a designed look is later work under its own record.

The fixture is the one piece of synthetic data and carries the loud-flag and register obligations of Honest Inputs. Setting a premium key (`NUXT_PUBLIC_SPORTSDB_API_KEY`) is a configuration change, not a code change, and triggers the fixture's removal.

## Contracts Touched

- `project-summary.md` — ADR index row; Technical Stack table already matches.
- Root `AGENTS.md` — the Agent skills section links this record as the one adopting the pipeline.

## Open Questions

## Verification

The bootstrap record (002) lands the skeleton: the dev server starts, the empty test suite runs, `nuxt generate` succeeds, CI is green, and a Vercel preview deployment serves the app.
