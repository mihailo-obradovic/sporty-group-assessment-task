# Sporty Leagues

A single-page app for the Sporty Group frontend assignment: browse TheSportsDB's sports leagues, narrow them by name and by sport, and open a league to see its season badge.

**Live demo:** https://sporty-group-assessment-task.vercel.app — and with the sample list: https://sporty-group-assessment-task.vercel.app/?source=fixture

## Run it

Requirements: Node 24 (pinned in `mise.toml`) and pnpm 12.9.1 (pinned in `package.json`; `corepack enable` provides it).

```bash
pnpm install
pnpm dev          # http://localhost:3000
```

No setup beyond that: the defaults in `nuxt.config.ts` work as they are. `.env.example` lists the two optional variables:

| Variable                       | Default | What it does                                                                                      |
| ------------------------------ | ------- | ------------------------------------------------------------------------------------------------- |
| `NUXT_PUBLIC_SPORTSDB_API_KEY` | `3`     | TheSportsDB API key. `3` is the public free tier; a premium key lifts its limits (see below).     |
| `NUXT_PUBLIC_LEAGUE_SOURCE`    | `live`  | Which list the page shows when the URL has no `source`: `live`, or `fixture` for the sample list. |

The checks CI runs on every push, and the static build Vercel deploys:

```bash
pnpm lint && pnpm format:check && pnpm typecheck && pnpm test
pnpm generate
```

## What it does

- Lists the leagues from `all_leagues.php`, sorted by name: each card shows the name, the sport, and the alternate name when there is one.
- Search filters by name (case-insensitive, after a short pause in typing); the sport dropdown offers every sport in the list. Both live in the URL, so a reload, a bookmark, or a shared link keeps them.
- Clicking a card reveals that league's badge from `search_all_seasons.php`: the most recent season that has one, with its season label. Several cards can be open at once, and a league's seasons are fetched once per visit, however often it is reopened.
- Loading, empty, and error states are explicit; a failed request shows an inline error with Retry plus one toast.

**The free API tier is degraded**, and the app is honest about it. Key `3` returns 10 Soccer leagues with no alternate names, so the sport filter has only one sport to offer on live data. The **Sample** toggle in the top bar (or `?source=fixture`) swaps in a list of 19 real leagues across 5 sports, generated from TheSportsDB's own `lookupleague.php` by `scripts/capture-league-fixture.ts`. A banner stays on screen whenever the sample list is showing, and the badges still come from the live API. The sample list is registered as a known fake in `catalyst/KNOWN_FAKES.md`, to be removed once a premium key is set.

The badge lookup has a limit of its own: the free tier returns only the **five oldest** seasons. "Most recent season with a badge" is therefore the most recent of those five, which for the Premier League is 1996–1997. A premium key returns every season, and the same code then shows the current badge.

## Design decisions

Each one links to the document that records it; `catalyst/` holds the full contracts.

- **Nuxt 4 as a static SPA, with Nuxt UI, on Vercel.** The brief asks for an SPA and a public, runnable repository; Nuxt UI gives accessible inputs, selects, and cards inside the time budget, and a static build needs no server. ([decision 001](catalyst/decisions/001_init-design_league-list.md), [decision 002](catalyst/decisions/002_bootstrap_nuxt-skeleton.md))
- **The URL is the filter state.** `useLeagueFilters` parses `q`, `sport`, and `source` from the query with a schema whose fields fall back to defaults, so a hand-edited URL never errors, and it writes with `replace`, so Back leaves the page instead of stepping through every keystroke. No component reads the route directly. ([feature 001](catalyst/features/001_league-list.md))
- **Server state in Pinia Colada, cached for the visit.** Both queries use `staleTime: Infinity` and no garbage collection: the data changes a few times a year and the page has no refresh button. The all-leagues key is the source; the seasons key is the league id alone, so a badge fetched from the sample list is reused on the live list. Filters stay out of the keys because filtering is client-side; the API has no filter parameters.
- **One HTTP client, parsed responses, one error policy.** Every request goes through `utils/fetcher.ts`, every response through a Zod schema, so the API's quirks become typed outcomes: `leagues: null` means none, and `seasons: "Invalid League ID passed"` becomes a shape error rather than a crash. Failures surface twice, as the inline error state and as one toast from `handleApiError`.
- **Pure logic, kept apart.** Sorting, search, the sport list, and the badge pick are plain functions in `utils/filterLeagues.ts`, tested without a DOM.
- **Tests exercise the page, not the internals.** Vitest with Testing Library renders the real page against MSW-mocked responses: filters and the count, both empty states, debounced search reaching the URL, the badge panel's states, the banner, the source toggle, and a rate-limited 429, plus the error policy's toast messages. 56 tests; CI runs them with lint, format, and typecheck.
- **A designed, dark-only look.** The visual design comes from a mockup committed at `design/league-list-mockup.html` (open it in a browser). Its tokens live in [`catalyst/annexes/design-system.md`](catalyst/annexes/design-system.md): Tailwind's red, green, amber, and slate under Nuxt UI's colour aliases, Barlow and Barlow Condensed self-hosted, and the slant as the one brand move. Contrast was measured from the actual token values, which changed two things from the mockup: red buttons carry dark text (white on red fails AA), and input outlines are lighter than its line colour. Touch targets are 44px.
- **Nuxt UI themes are vendored.** Every component the app renders has its upstream 4.11.3 theme copied into `app/config/nuxt-ui/`, with each deviation annotated beside the default it replaces, so a reviewer sees exactly what the project changed.
- **Mobile first.** One column with stacked filters on phones, two columns from 768px, three from 1024px; checked with no horizontal scroll at 320, 375, 768, 1024, 1280, and 1536px.

## AI tools

AI was used throughout, as the brief allows. **Claude Code** (Anthropic's agentic coding tool, in the terminal) wrote most of the code and documents. The author made the decisions and approved each step: the plan was agreed before any code (`PLAN-sporty-leagues.md`), every commit was proposed by the agent with what it changed and how it was verified, and none landed without the author's approval.

- **Catalyst**, the author's own rule set for AI agents, governed the work: a feature or decision document approved before implementation, one approved commit per step, tests and documentation in the same change, and no fabricated data. Its rule documents stay on the author's machine (see below); the project documents it produced are committed under `catalyst/`.
- **mattpocock-skills** (agent skills for Claude Code) supported planning: a grilling session settled the scope and the open decisions before the first commit.
- **Claude Design** produced the visual mockup in `design/`, which was then implemented by Claude Code against the tokens annex.
- **MCP servers** gave the agent current sources rather than memory: the Nuxt UI MCP server for component APIs and themes, Context7 for library documentation (Pinia Colada, `@nuxt/fonts`), and Chrome DevTools for checking every UI step in a real browser at phone and desktop widths.

Where the agent and the plan disagreed, the record says so: for example the debounce library moved to the step that first used it, `gcTime: false` replaced the planned `Infinity` after reading the installed library's source, and the design dropped two of the mockup's behaviours by the author's choice.

## Limits

- The live list has one sport (Soccer) and no alternate names; the sample list shows the filters properly. Both limits lift with a premium API key.
- Badges on the free tier are the most recent of the five oldest seasons.
- Dark theme only, by design; there is no light theme or theme toggle.
- The search matches league names only, as the brief asks; alternate names are not searched.

## The catalyst/ Directory

`catalyst/` is this repository's Catalyst rule set — the documents an agent reads before it changes anything here, adopted into this repository from the Catalyst template. They are contracts, not descriptions: `catalyst/prime-directive.md` says how work runs (task weights, the feature and decision gates, branch and commit discipline), `catalyst/architecture.md` says what this system may be built from, and `catalyst/project-summary.md` indexes this project's own features and decisions. Start at `catalyst/AGENTS.md` — it is the file index, and everything else loads on demand.

The project's own documents are written inside the bundle (`catalyst/features/`, `catalyst/decisions/`), never in root-level directories. The rule set is upgraded in place from the Catalyst repository, so `catalyst/` is edited deliberately and never reorganized.

The rule documents themselves are a personal set kept on the author's machine and are not committed. What this repository tracks under `catalyst/` is the project's own: the summary, architecture, context, decision records, and feature documents.
