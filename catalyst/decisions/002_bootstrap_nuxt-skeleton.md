# Decision: Bootstrap — Nuxt skeleton

## Status

Accepted

## Type

bootstrap

## Task Weight

Medium

## Context

Decision 001 fixed the stack: Nuxt 4 with Nuxt UI as an SPA, GitHub Actions, and Vercel static hosting. This record is the reviewed plan for the skeleton those choices describe. It adds no product behaviour; the league list is the feature that follows.

## Decision

The skeleton is built strictly per `architecture.md` and the Nuxt module, one approved commit per step, on `decision/002-bootstrap-nuxt-skeleton`:

1. **Scaffold.** `pnpm create nuxt` with the Nuxt UI starter, generated in a scratch directory and copied to the repository root so the existing files are untouched. Default `srcDir` (`app/`), which the generated oxfmt paths already assume. `ssr: false`, `nuxt.config.ts` in the module's key order, the TypeScript tier's compiler options, `packageManager` and `engines` pins, `pnpm-workspace.yaml` with the install cooldown, `.nuxtrc` committed. The Lucide icon collection is installed, the one icon set allowed. Any ESLint or Prettier the starter brings is removed.
2. **Data layer.** Pinia, `@pinia/colada-nuxt` with a stated `colada.options.ts`, Zod, the fetcher, the central error policy, and the `useAppQuery` wrapper, per `data-layer.md` and `error-handling.md`. The fetcher reads the base URL and the API key (`NUXT_PUBLIC_SPORTSDB_API_KEY`, default `3`) from public runtime config. `error.vue` per the module.
3. **Tests and toolchain.** Vitest with `@nuxt/test-utils`, Testing Library, Vue Test Utils, and MSW, colocated beside the code; one smoke test proves the suite runs. The six script verbs, with the Vue tier's SFC size check appended to `lint`.
4. **CI.** One TypeScript job from the module recipe: lint, format check, typecheck, test.
5. **Hosting.** The Vercel project is connected to the GitHub repository and builds static output. The exact build settings are checked against Vercel's documentation at this step and recorded in `operations.md`.
6. **Orientation.** One folder document for `app/`, pointing into the bundle documents that govern its components, pages, composables, and types. `.env.example` names the one variable.

Two module defaults change because TheSportsDB is a public, cookie-free API. The fetcher sends **no credentials**: the API answers `Access-Control-Allow-Origin: *`, which browsers reject for credentialed requests. It sends **no CSRF header** and has no CSRF retry, since nothing mutates. The error policy's table is written for this app: there is no 401 or 403 path, so every failure becomes one toast plus the query's own error state.

CI choices the module leaves to this record: `pull_request` beside `push`, so a pull request is gated too; `concurrency` with cancel-in-progress; no path filters, since there is one tier; actions pinned to major tags. There is **no build job**: Vercel builds every push and is the build of record, so a failed Vercel build is the gate.

As built, where the steps left a choice: the base URL sits in `runtimeConfig` beside the key, overridable as `NUXT_PUBLIC_SPORTSDB_BASE_URL`, since it is the same in every environment. Tests run on jsdom, not happy-dom, whose `Headers` lose every header through Node's `fetch`. MSW's lifecycle lives in the shared server module, because the Nuxt environment loads a `setupFiles` entry in a separate module graph. msw stays on 2.x for Vitest 5's peer range.

Regle is not installed: the app has no form to validate, only a search field. It joins under the Dependency Change Rule if a form ever appears.

## Scope

Repository root configuration, `app/` skeleton files, `.github/workflows/ci.yml`, `operations.md`, `.env.example`, and the Vercel project. Bootstrap step 4's seed and reset scripts and compose profiles do not apply: there is no service and no data of our own. No behaviour contracts exist yet.

## Consequences

The feature branch starts from a green, deployed skeleton, so its first commit is product code. Vercel previews give every branch a shareable URL for browser verification. Pushing to GitHub happens at step 5, since CI and Vercel need the remote; each push is confirmed first. The shell's skip-to-content link (`vue-style.md`) is left to the league-list feature.

## Contracts Touched

- `project-summary.md` — ADR index row.
- `operations.md` — new, with a Vercel section.
- `app/CLAUDE.md` — new folder document.

## Open Questions

## Verification

To be filled when the skeleton lands: dev server starts, the smoke test passes, `nuxt generate` succeeds, CI is green on the branch, and a Vercel preview serves the app at phone and desktop widths.
