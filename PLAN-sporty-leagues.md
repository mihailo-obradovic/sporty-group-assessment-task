# PLAN — Sporty Group league list

The working plan for this assessment, agreed with the AI agent before any code was written, and kept in the repository to show how the work was organised. Each stage is one agent session, in order. Read this whole file first, then only the Catalyst documents the stage points at. Every stage runs under Catalyst discipline once the bundle exists: ask before every commit, run `python3 catalyst/tools/validate.py .` before any commit touching documents, keep the default branch green.

Catalyst is a personal rule set for AI agents. Its rule documents stay on the author's machine and are not committed, so links into `catalyst/` resolve only to the project's own documents there (`project-summary.md`, `architecture.md`, `context/`, `decisions/`, `features/`).

## Destination

A public, 100% runnable repo at `mihailo-obradovic/sporty-group-assessment-task` deployed as a static site on Vercel: a Nuxt 4 SPA listing TheSportsDB leagues with name search and sport filter, click-to-reveal season badge, cached responses, tests, CI, and a README section on AI tools and design decisions, all documented through Catalyst (init-design record, bootstrap record, one feature document). The assignment PDF is kept locally and not committed; its requirements are restated in `catalyst/context/product-description.md`.

## Notes (standing preferences for every session)

- Catalyst template: version 2.1.0, checked out locally at `/home/mihailo/Projects/catalyst`. Bundle lands at `catalyst/`, private (excluded via `.git/info/exclude`); the project's own documents inside it are tracked.
- Collapsed ceremony, agreed with the user: full documents and validator; one feature document and one feature branch cover the whole app; still one approved commit per step; browser verification kept.
- Skills: `/mattpocock-skills:grilling` + `/mattpocock-skills:domain-modeling` for any new decision; mattpocock routing per the table that stage 1 writes into the root `AGENTS.md` (Catalyst wins on conflict).
- UI: stock Nuxt UI components first, no custom styling beyond layout. Mobile-friendly from the first commit: phone-width layout is the baseline, every feature step is verified at a phone viewport as well as desktop, no horizontal scroll, touch-sized targets. A Claude Design mockup pass comes later (see Later plans).
- Honest Inputs: the free API is degraded (see Facts). Never silently fake data; the fixture is a flagged, registered mode.
- Package manager pnpm (pinned in `packageManager`), Node LTS via `mise.toml`, oxlint + oxfmt; all from the TypeScript tier the Nuxt module requires.
- Glossary terms settled: **League** (one row of the all-leagues response), **Sport** (the category a League belongs to; source of the dropdown), **Alternate name** (a League's secondary name, may be empty or absent), **Season badge** (the image for one season of a League). Written to `catalyst/context/glossary.md` in stage 1.

## Facts (verified 2026-10-07)

| Endpoint                                 | Assignment expects                                 | Live free tier (keys `3` and `123`)                                                                                                                                                     |
| ---------------------------------------- | -------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `all_leagues.php`                        | many leagues, several sports, `strLeagueAlternate` | 10 leagues, all Soccer; fields `idLeague`, `strLeague`, `strSport` only (5 on first check; 10 on recheck the same day)                                                                  |
| `search_all_seasons.php?badge=1&id=<id>` | seasons with badges                                | works for every sport's real ids: always 5 seasons, oldest first, `strBadge` may be `null`; unknown id → `{"seasons":null}`, bad id → a string; rate limit → Cloudflare 429, plain text |

TheSportsDB docs: free tier caps all_leagues at 10 results and the seasons lookup at 5; premium raises both. CORS is open (`access-control-allow-origin: *`). The repo is on `master` with remote `origin` on GitHub.

## Progress

- Stage 1 done: Catalyst adopted, mattpocock-skills routed.
- Stage 2 done: decision 001 (init design) `Accepted`.
- Stage 3 done: decision 002 (bootstrap) `Implemented` and merged to `master`, decision 001 `Implemented`. The skeleton is live on Vercel; choices and issues met on the way are in the record's "As built" paragraph and `catalyst/operations.md`.
- Stage 4 ready: feature 001 `Approved` on `master` and its steps planned below; next is step 1 on a new branch `feature/001-league-list`.

## Stages

### Stage 1 — Adopt Catalyst and route the mattpocock pipeline

Run from the Catalyst repo (adoption mode is automatic because the destination already has files; git is left untouched, the user reviews and commits):

```
python3 tools/new_project.py sporty-group-assessment-task \
  --dest /home/mihailo/Projects/sporty-group-assessment-task \
  --choice frontend=nuxt --choice frontend/ui=nuxtui --choice frontend/addons=none \
  --choice ci=github-actions \
  --context product-description,glossary \
  --no-versioning --no-experiments --no-hooks --private
```

Check `--list` first if any flag name has drifted. Then:

1. Review the diff: root `AGENTS.md` gains a Catalyst block; `CLAUDE.md`, `.claude/skills/`, `.editorconfig`, `.vscode/*`, `mise.toml`, `.oxlintrc.json`, `.oxfmtrc.json`, `.gitignore` appended. Paste the printed blurb into `README.md`.
2. Fill `catalyst/context/product-description.md` from the PDF (requirements, API URLs, delivery rules, 90-minute framing). Fill `catalyst/context/glossary.md` with the four terms above.
3. Route mattpocock-skills (rules: `catalyst/references/agent-skills.md`, "Third-party skill pipelines"): move `docs/agents/domain.md` to `catalyst/agents/domain.md` rewritten so `CONTEXT.md` → `catalyst/context/glossary.md` and `docs/adr/` → `catalyst/decisions/`; delete `docs/agents/issue-tracker.md` and `docs/agents/triage-labels.md` and the `docs/` dir; rewrite the user-owned section of root `AGENTS.md` as a routing table (grilling/domain-modeling → feature or decision drafting; spec → feature document; ADR → decision record; implement → Implementing A Plan, one approved commit per step; issue tracker → none) closing with "on any conflict Catalyst discipline wins". List the adapter on the Agent adapters line of `catalyst/project-summary.md`.
4. Validate, then one commit on `master` (ask first): "Adopt Catalyst 2.1.0 and route mattpocock-skills into the bundle".

### Stage 2 — Init-design decision record

Flow: `catalyst/workflows/init-design.md`; template `catalyst/decisions/_template.md`; sample `catalyst/examples/decisions/001_init-design_telemetry.md`. Write `catalyst/decisions/001_init-design_league-list.md` covering:

- Stack: frontend nuxt + nuxtui, no addons; ci github-actions; every other layer none. Technical Stack table in `project-summary.md` updated.
- Hosting: Vercel static output (`nuxt generate`, `ssr: false`) through Vercel's Git integration from `master`, preview per branch. Outside the module set (Catalyst has no Vercel module), so recorded here. A short `operations.md` follows in stage 3.
- Tooling: mattpocock-skills installed and routed (stage 1); Claude Code as the AI tool, disclosed in README.
- Collapsed ceremony statement (see Notes) and the ordering: stock scaffold is created under the bootstrap record after this record is accepted.
- Degraded free API (Facts) and the response: code against the documented full shape with Alternate name optional; runtime fixture mode `?source=fixture` with a visible banner, default settable by env; registered in `KNOWN_FAKES.md`; removal condition "premium key (`NUXT_PUBLIC_SPORTSDB_API_KEY`) or free tier restored".
- Open Questions empty at approval. Status `Proposed` → `Accepted` on `master` after the user approves; it flips to `Implemented` when stage 3 lands.

In the same change, link the record from the "Installed pipeline" line of the root `AGENTS.md` ("adopted by [decision 001](catalyst/decisions/001_init-design_league-list.md)") and name it on the Agent adapters line of `project-summary.md`.

Commit (ask first) the record and its `project-summary.md` row on `master`.

### Stage 3 — Bootstrap record and the Nuxt scaffold

Flow: `catalyst/workflows/bootstrap.md` (weight `Medium`). Record `catalyst/decisions/002_bootstrap_nuxt-skeleton.md`, branch `decision/002-bootstrap-nuxt-skeleton`. Plan, get approval, then one approved commit per step:

1. `pnpm create nuxt@latest` into the repo root (app files beside the existing README and `catalyst/`), choosing Nuxt UI and pnpm in the prompt; honour `catalyst/stacks/frontend/nuxt/nuxt.md` (`ssr: false`, `nuxt.config.ts` key order, `srcDir` if the module says so) and the TypeScript tier (`packageManager` pin, `pnpm-workspace.yaml`).
2. Data layer scaffolding per `catalyst/stacks/frontend/nuxt/data-layer.md`: `@pinia/colada-nuxt`, Zod, `colada.options.ts`, `useAppQuery` wrapper, error handling per `error-handling.md`. No product behaviour yet.
3. Tests: Vitest + `@nuxt/test-utils` + Testing Library + MSW, empty suite running. Lint/format: oxlint and oxfmt scripts; remove any ESLint/Prettier the scaffold added (the adoption report lists them).
4. CI: `.github/workflows/` per `catalyst/stacks/ci/github-actions.md` (frozen install, lint, typecheck, test, build).
5. Vercel: connect the GitHub repo through the Vercel Git integration (static output; `nuxt generate`), set `NUXT_PUBLIC_SPORTSDB_API_KEY` default `3` in `.env.example`; write a short `catalyst/operations.md` (where hosted, redeploy, rollback) per `catalyst/references/project-documents.md`.
6. Folder documents for `components/`, `pages/`, `composables/` per bootstrap step 5.
7. Smoke check (dev server starts, empty suite passes, `nuxt generate` succeeds, Vercel preview builds). Merge to `master`, flip 002 to `Implemented` and 001 to `Implemented`.

### Stage 4 — Feature: league list with filters and season badge

Contract: [`catalyst/features/001_league-list.md`](catalyst/features/001_league-list.md), `Approved` on `master` (a7ff0d9). Branch `feature/001-league-list` from `master` **after** the bootstrap branch merges. One approved commit per step; every step runs `pnpm lint`, `pnpm format:check`, `pnpm typecheck`, `pnpm test` before its commit is proposed. Tests are `*.test.ts`, colocated.

Settled after approval (2026-10-07), folded into the document in step 1 (Same-Change Rule):

- Both filters write the URL with `replace`, never `push` (`stacks/frontend/nuxt/routing.md`, Search params); the document's `router.push` for Sport is corrected.
- The document's test paths say `.spec.ts`; the project uses `.test.ts`.
- Debounce comes from `@vueuse/core`, an approved library of the Nuxt module; it is added to `package.json` directly.

Steps:

1. **Schemas, service, pure logic.** `app/services/leagues.api.ts`: Zod schemas (`leagues` nullable; `seasons` nullable, a string fails parsing; `strBadge` nullable; `strLeagueAlternate` optional), `fetchAllLeagues(signal)`, `fetchSeasons(idLeague, signal)`. `app/utils/filterLeagues.ts`: sort, search, Sport filter, Sport options, badge pick (most recent non-null). `filterLeagues.test.ts`. The document corrections above.
2. **URL state and config.** `app/composables/useLeagueFilters.ts` (`q`, `sport`, `source` with `.catch()` defaults; `replace`; a source switch clears `sport`). Public runtime config `leagueSource` from `NUXT_PUBLIC_LEAGUE_SOURCE` (default `live`), validated in `app/plugins/validateConfig.ts`; `.env.example`. `useLeagueFilters.test.ts`. (`@vueuse/core` moved to step 4: the debounce sits on the search input, its first use.)
3. **Queries and fixture.** `app/fixtures/leagues.ts`, lazy-imported: a verbatim transcription of `lookupleague.php` for the document's 19 ids (`idLeague`, `strLeague`, `strSport`, `strLeagueAlternate`), shaped `{ leagues: [...] }`, first line a `// !` comment naming its source and capture date; regenerate it from the live endpoint with a script and verify it field by field, never type it by hand. `app/services/queries/useLeagueQueries.ts`: key map, `useLeaguesQuery(source)`, `useSeasonBadgeQuery(idLeague, enabled)`, `staleTime: Infinity` and `gcTime: false` (Pinia Colada's documented "never collect") with the reason in a comment (`data-layer.md`). `catalyst/KNOWN_FAKES.md` row. `useLeagueQueries.test.ts` (MSW): one request across remounts, none for the fixture list, seasons once across sources, string `seasons` and a plain-text 429 surface as errors.
4. **List and filters UI.** `app/components/league/` `LeagueFilters`, `LeagueList`, `LeagueCard` (collapsed); `app/pages/index.vue` with loading skeletons, error + Retry, both empty states; single column at phone width, grid from tablet up. `@vueuse/core` added for the search debounce. Every Nuxt UI component rendered gets its vendored theme in `app/config/nuxt-ui/` (`customization.md`), the skeleton's `main` and `container` included, with `UMain`'s height-chain link (user, 2026-10-07). `LeagueList.test.ts` with filters applied.
5. **Badge and banner.** Card expansion with `LeagueBadgePanel` (loading, badge + season label, no badge, image failure, error + Retry) and `FixtureBanner`; extend the component test. Update the `app/` folder document for `services/`, `fixtures/`, `components/league/`.
6. **README.** "AI tools" and "Design decisions" sections.
7. **Verify and merge.** Push; walk every Examples row on the Vercel preview at phone and desktop widths; fill the document's Verification section; flip it to `Active`; merge to `master`, delete the branch, update Progress.

## Decisions so far

Everything above was settled in the grilling session on 2026-10-07. Rejected alternatives worth remembering: Next.js (user chose Vue), headless UI (time budget), persisted cache (no invalidation rules asked for), modal badge (inline expansion chosen), build-time-only fixture switch (reviewer must see both modes on one deployment), GitHub Issues for planning (dropped in favour of this file).

## Later plans (out of scope for this map)

- Claude Design mockup pass: replace the stock Nuxt UI look with a designed layout; its own feature or decision record when it starts. The mockup is done (2026-10-07): the interactive board is at https://claude.ai/artifact/MYKxZ1kE9qLBxN71Q1Y7Qt (private until shared) and a self-contained copy is committed at `design/league-list-mockup.html` — open it in a browser. It shows the desktop and phone frames, every state the feature document names, and a Tokens section (colors, type scale, rules) that maps onto `app/app.config.ts` and the Nuxt UI theme. Direction: dark-first stadium navy with one signal-red accent used only on action (card blade on hover/expand, Retry, focus), green for the live source and amber for the fixture banner, Barlow with the condensed italic weight for league names, counts, and season labels, and the slant as the one brand move (wordmark bar, card blade, sport tag); a light theme is included. The badge shield in the mockup stands in for the TheSportsDB image.
- Premium TheSportsDB key: set `NUXT_PUBLIC_SPORTSDB_API_KEY` on Vercel, remove the fixture and its `KNOWN_FAKES.md` row.
