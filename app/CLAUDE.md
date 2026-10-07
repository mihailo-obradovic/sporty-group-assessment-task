# app/ — Nuxt source directory

The whole frontend: a Nuxt 4 + Nuxt UI single-page app (`ssr: false`) built to static files and served by Vercel. It reads TheSportsDB straight from the browser; there is no backend of our own. Configuration lives at the repository root: `nuxt.config.ts`, `colada.options.ts` (Pinia Colada defaults), `vitest.config.ts`.

## Structure

- `app.vue` — the shell: `<u-app>` around `<u-main>` around the page.
- `error.vue` — the one fatal-error page; renders what the raising site passes in `data`.
- `pages/` — file-based routes; `index.vue` is the only page.
- `composables/useAppQuery.ts` — the query wrapper every server read goes through.
- `utils/fetcher.ts` — the single HTTP client: base URL and API key from public runtime config.
- `utils/parseResponse.ts` — Zod parse at the boundary; a mismatch throws `ResponseShapeError`.
- `utils/handleApiError.ts` — the central error policy, a pure function.
- `plugins/validateConfig.ts` — validates the public runtime config at startup.
- `types/` — shared types (`api.d.ts`) and the Pinia Colada error-type augmentation.
- `assets/styles/main.css` — the global stylesheet (Tailwind + Nuxt UI); `.oxfmtrc.json` points at this path.
- `testing/mswServer.ts` — the MSW server and its lifecycle, imported by any test that touches the network.

Feature code adds `components/`, `services/<resource>.api.ts`, and `services/queries/use<Resource>Queries.ts` as it needs them.

## Governing documents

- Components (naming, grouping, file names) → `catalyst/stacks/frontend/_common/component-naming.md`, `catalyst/stacks/frontend/_vue/component-naming.md`
- Every `.vue` file (template, script order, auto-imports, size) → `catalyst/stacks/frontend/_vue/vue-style.md`
- Nuxt UI components, theming, page composition → `catalyst/stacks/frontend/nuxt/ui/nuxtui/nuxtui.md` and its `customization.md`, `composition.md`
- Pages, layouts, URL filter state → `catalyst/stacks/frontend/nuxt/routing.md`; page height and scrolling → `catalyst/stacks/frontend/nuxt/page-layout.md`
- Services, query composables, cache keys → `catalyst/stacks/frontend/nuxt/data-layer.md`
- Response schemas → `catalyst/stacks/frontend/nuxt/validation.md`
- The fetcher and the error policy → `catalyst/stacks/frontend/nuxt/error-handling.md`
- Stores and shared composables → `catalyst/stacks/frontend/nuxt/client-state.md`; composable folders → `catalyst/stacks/frontend/nuxt/nuxt.md` (Grouping composables)
- `types/` → `catalyst/stacks/_lang/typescript/typescript-types.md`
- Comments → `catalyst/conventions/code-annotations.md`
- Why the fetcher, tests, and hosting are shaped as they are → `catalyst/decisions/002_bootstrap_nuxt-skeleton.md`

## Data flow

A component calls a query composable from `services/queries/`. The composable is built on `useAppQuery`, and its query function calls a service in `services/`. The service calls `fetcher`, which requests `<base URL>/<API key>/<path>`, and parses the body with `parseResponse`. A failure surfaces twice: on the query's own `error` state, and as one toast from `handleApiError`.

## Local invariants

- No network call outside `utils/fetcher.ts`, and the fetcher sends no credentials and no CSRF header (decision 002).
- Server reads go through `useAppQuery`, never raw `useQuery`, and every response is parsed, never asserted with a generic (`nuxt.md`).
- Configuration is read through `useRuntimeConfig()` only; `plugins/validateConfig.ts` stops the app on a blank or malformed value.
- Tests sit beside the code as `*.test.ts` and get MSW by importing `@/testing/mswServer`, never through a Vitest `setupFiles` entry (decision 002).

## Entry points

- `pnpm dev` — dev server on port 3000.
- `pnpm test`, `pnpm lint`, `pnpm format:check`, `pnpm typecheck` — the checks CI runs.
- `pnpm generate` — the static build Vercel runs (`catalyst/operations.md`).
