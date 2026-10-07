# Feature: League list

## Status

Active

## Task Weight

Medium

## Purpose

The app's one screen: browse TheSportsDB Leagues, narrow them by name and Sport, and reveal a League's Season badge on request. The free tier lists only Soccer and omits Alternate names (decision 001), so a flagged fixture mode lets a reviewer see the filters work across several Sports on the same deployment.

## Inputs

| Input                       | Type                | Source                           | Constraints                                                                   |
| --------------------------- | ------------------- | -------------------------------- | ----------------------------------------------------------------------------- |
| `q`                         | string              | URL query                        | name search; absent → `''`; trimmed before matching                           |
| `sport`                     | string              | URL query                        | absent → All; any string is kept, even one absent from the data               |
| `source`                    | `live` \| `fixture` | URL query                        | absent or invalid → the env default                                           |
| All-leagues response        | JSON                | `all_leagues.php` or the fixture | `{ leagues: League[] \| null }`; `strLeagueAlternate` optional                |
| Seasons response            | JSON                | `search_all_seasons.php?badge=1` | `{ seasons: { strSeason, strBadge: string \| null }[] \| null }`; always live |
| `NUXT_PUBLIC_LEAGUE_SOURCE` | `live` \| `fixture` | public runtime config            | default `live`; validated at startup                                          |

## Outputs And Side Effects

| Output / Side Effect | Type | Description                                                                                |
| -------------------- | ---- | ------------------------------------------------------------------------------------------ |
| League list          | UI   | one card per matching League: name, Sport, Alternate name (blank when empty or absent)     |
| Filter controls      | UI   | search input + Sport select, mirrored into the URL query                                   |
| Season badge panel   | UI   | inside an expanded card: loading, badge with its season label, "no badge", or error        |
| Fixture banner       | UI   | persistent while `source=fixture`; says the list is sample data and links to `source=live` |
| Source toggle        | UI   | Live / Sample switch in the top bar beside the wordmark; shows and sets `source`           |
| Result count         | UI   | the number of Leagues the filters leave, in the filter bar                                 |

## Scope And Non-Goals

In scope: everything below, the `KNOWN_FAKES.md` row, the README "AI tools" and "Design decisions" sections, and the visual design of `design/league-list-mockup.html`, dark only, with its tokens and rules in `annexes/design-system.md`.

Non-goals: matching the Alternate name in search (the brief says name; the live tier omits the field); pagination (10 live Leagues, 19 fixture); a League's own logo or detail page; a cache surviving a reload; sorting controls; a light theme or a theme toggle; the mockup's Retry on an empty list and its blank Alternate name line.

## User / System Behavior

- On load the page gets all Leagues for the active source once; loading shows skeleton cards.
- Leagues sort by name, case-insensitive. Search matches a case-insensitive substring of the League name after trimming. The Sport select offers "All" plus the distinct Sports in the loaded data, sorted; a `sport` value absent from the data still shows as selected. Filters combine (AND).
- Typing updates `q`, debounced ~250 ms; choosing a Sport updates `sport` at once. Both replace the history entry, never push one, so Back leaves the page rather than stepping through filters. Reload, bookmark, and shared link restore both.
- No match → an empty state with "Clear filters", which removes `q` and `sport`.
- Clicking a card expands it and looks up that League's seasons. The badge shown is the **most recent** season with a non-null `strBadge` (the API lists oldest first), labelled with its `strSeason`. A second click collapses. Several cards may be open. Re-expanding shows the cached result without a request.
- `source=fixture` replaces only the all-leagues list with the fixture and shows the banner; badges still come from the live seasons lookup. The banner link and the top bar's Live / Sample toggle set `source` explicitly, so they work whatever the env default is; the toggle marks the active source (`aria-pressed`). Switching source keeps `q` and resets `sport`.
- The filter bar shows how many Leagues the filters leave and stays in view while the list scrolls.
- Phone width: single-column cards, stacked filters; a grid from tablet up. No horizontal scroll; touch-sized targets.

## Roles And Access

Not role-specific.

## Examples

| Input                                     | Expected Output                                                                       | Notes                            |
| ----------------------------------------- | ------------------------------------------------------------------------------------- | -------------------------------- |
| `/` (live free tier)                      | 10 Soccer Leagues; Alternate name blank; Sports: All, Soccer                          | degraded tier                    |
| `/?source=fixture`                        | 19 Leagues across 5 Sports; banner visible; count 19; Sample pressed                  | fixture mode                     |
| `/?source=fixture&q=LEAGUE`               | Leagues whose name contains "league", any case                                        | any case                         |
| `/?source=fixture&sport=Basketball&q=nba` | Basketball Leagues whose name contains "nba"; count 2                                 | AND                              |
| `/?q=league&sport=Soccer`, press Sample   | `?q=league&source=fixture`; banner visible; Sample pressed                            | toggle keeps `q`, resets `sport` |
| `/?sport=Basketball` (live)               | empty state with Clear filters; select shows Basketball                               | unknown Sport kept               |
| `/?source=bogus`                          | env-default source                                                                    | `.catch()` default               |
| expand 4328 (English Premier League)      | loading plate, then the latest badged season's image + label                          |                                  |
| expand 4329 (no season has a badge)       | "No badge for this League"                                                            | real live case                   |
| expand, collapse, expand                  | badge shown, no second request                                                        | cached per League                |
| expand in fixture, switch to live, expand | no second request                                                                     | key is `idLeague`                |
| badge image fails to load                 | "No badge" with "image could not load"                                                | no retry, no toast               |
| seasons request fails or 429              | in-card error with Retry; toast                                                       | other cards unaffected           |
| seasons request answers 429 (plain text)  | toast "TheSportsDB is rate limiting requests. Try again in a minute."; no URL or body | toast text                       |

## Business Rules

- Queries use `staleTime: Infinity` and no garbage collection for the session. All-leagues key: `source`; seasons key: `idLeague` (always live). Filters stay out of keys: filtering is client-side, the API has no filter parameters.
- No automatic retry beyond the fetcher's one 5xx retry; Retry buttons refetch.
- Live and fixture data pass the same Zod schemas.
- The fixture is lazy-imported, so the live path never loads it. It is a transcription of real `lookupleague.php` responses (id, name, Sport, Alternate name as returned, `""` included) for 19 real Leagues — Soccer 4328, 4329, 4331, 4332, 4334, 4335, 4337, 4338, 4346; Basketball 4387, 4388, 4408; Ice Hockey 4380, 4419; Rugby 4414, 4430, 4446; Motorsport 4370, 4373 — with no edited values and no synthetic ids.

## Edge Cases

- Alternate name `""`, `null`, or missing → blank, never "null".
- `leagues: null` or `[]` → "No leagues available" (no Clear filters).
- `seasons: null`, or every `strBadge` null → "no badge".
- `seasons` as a string ("Invalid League ID passed") → shape failure → in-card error.
- Cloudflare 429 (plain-text body) → the normal error state; the raw body is never shown.

## Invariants

- Filter and source state live only in the URL query, through `useLeagueFilters`; no component reads `route.query`.
- The fixture list is never shown without the banner.
- Every badge shown comes from the live API.

## Error Handling

- Any request or shape failure (`ResponseShapeError` included) → the list's or the card's error state with Retry, plus one toast through the central policy (decision 002).
- The toast speaks the user's terms: a 429 says "TheSportsDB is rate limiting requests. Try again in a minute.", any other request failure the generic message. It never shows a URL, a status line, or a response body.
- Badge image load failure → "no badge" with a note; no toast.

## Entry Points

- `app/pages/index.vue`: the screen.
- `app/composables/useLeagueFilters.ts`: URL state schema and setters.
- `app/types/league.ts`: League and Season schemas and their types.
- `app/services/leagues.api.ts`: response envelope schemas and fetch functions.
- `app/services/queries/useLeagueQueries.ts`: `useLeaguesQuery(source)`, `useSeasonBadgeQuery(idLeague, { enabled })`.
- `app/utils/filterLeagues.ts`: pure sort, filter, Sport options, badge pick.
- `app/components/league/`: card, list, filters, badge panel, fixture banner.
- `app/fixtures/leagues.ts`: the fixture list (`KNOWN_FAKES.md`).

## Dependencies

- Decision 002's data layer: `fetcher`, `useAppQuery`, `handleApiError`, `parseResponse`.
- TheSportsDB v1 free tier, key from `NUXT_PUBLIC_SPORTSDB_API_KEY`.
- `@vueuse/core` for the search debounce (an approved library of the Nuxt module).
- Decision 001: fixture mode, removed on a premium key or a restored free tier.

## Open Questions

## Tests

- `app/utils/filterLeagues.test.ts`: sort; trimmed case-insensitive substring; Sport filter; AND; unknown Sport; distinct sorted options; badge pick (most recent non-null, all null, no seasons).
- `app/services/leagues.api.test.ts` (MSW): blank Alternate name (missing, `null`, `""`); `leagues: null` and `seasons: null` → none; string `seasons` and a League missing a field → `ResponseShapeError`.
- `app/composables/useLeagueFilters.test.ts`: defaults and `.catch()` fallbacks; both filters `replace`, never `push`; source switch clears `sport`.
- `app/services/queries/useLeagueQueries.test.ts` (MSW): one all-leagues request across remounts; fixture source makes no all-leagues request; seasons once per League across sources; string `seasons` and 429 surface as errors.
- `app/utils/handleApiError.test.ts`: a 429 toasts the rate-limit message and other failures the generic one, never ofetch's request line or the body; one toast per error.
- `app/components/league/LeagueList.test.ts` (the page, MSW): with filters applied only matches render, and the count follows; unknown Sport kept; both empty states and Clear filters; debounced search reaches the URL; error and Retry; badge panel states; banner; the source toggle.
- Browser walk of the Examples on the Vercel preview at phone and desktop widths.

## Verification

2026-10-07, branch `feature/001-league-list`: 56 tests (Vitest, Testing Library, MSW) cover every Examples row; lint, format, typecheck, and `pnpm generate` pass.
Walked every Examples row in Chrome on the `pnpm generate` build served locally, live API, at 1280 and 390 wide: all pass. The image failure and the 429 were simulated in the browser (a dispatched `error` event; `fetch` returning a plain-text 429), since neither can be triggered live. Reflow checked at 320, 375, 768, 1024, 1280, 1536: no horizontal scroll. The fixture is a separate lazy chunk, absent from the entry bundle.
The walk found the toast showing ofetch's request line with the API key; fixed with a regression test confirmed failing first.
Risks: the branch was not pushed before the merge, so CI and a Vercel preview first ran on `master`; badges on the free tier are the most recent of its five oldest seasons.
