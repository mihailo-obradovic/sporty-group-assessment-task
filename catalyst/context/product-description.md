# Product Description

A **context document** (`references/project-documents.md`): background depth behind the one-paragraph purpose in `project-summary.md`. It records product vision and intent — _not_ behavior. It is never a contract: when it disagrees with a feature document or `architecture.md`, the contract wins and this file is updated to catch up. Keep it scannable; trim to what shapes decisions and link out for the rest.

**Loads when:** product-shaping work — drafting or estimating a feature document, a product-motivated decision record, Init Design input-gathering, brownfield prioritization, an experiment's Success Bar or graduation, or any task touching product scope, phases, or priorities.

## Vision

A home assignment for a Frontend Engineer role at Sporty Group: a single-page application that simulates one component of an online bookmaker platform — a browsable list of sports leagues. The assignment evaluates component-based design, state management, and API integration, and its brief says the focus is understanding product logic and implementation, not whether everything is handcrafted. AI tools are explicitly allowed, provided their use is disclosed.

## Users

- **The reviewer** at Sporty Group: clones the public repository, runs it, reads the code and notes, and judges product logic, structure, and honesty about trade-offs.
- **A bookmaker-site visitor** (simulated): wants to find a league quickly by name or sport, on a phone as often as on a desktop.

## Scope And Non-Goals

In scope (from the brief):

- Fetch and display the list of sports leagues, showing each league's name, sport, and alternate name.
- A search bar filtering leagues by name.
- A dropdown filtering by sport (e.g. Soccer, Basketball, Motorsport).
- Leagues respond to clicks by fetching and showing a season badge image (any season, or the first in the response).
- Responses cached so repeat calls are avoided.
- Component-based architecture; responsive and functional first, visual polish if time allows.

Non-goals:

- Accounts, betting, odds, or any bookmaker behaviour beyond the league list — the brief scopes one component.
- A designed visual identity in the first pass — stock component-library styling first, a design pass later.
- A backend of our own — the app talks to the public API directly.

## Phases And Priorities

| Phase          | Focus                                                                  | Priority |
| -------------- | ---------------------------------------------------------------------- | -------- |
| Requirements   | Everything under "In scope", mobile-friendly, tests, CI, deployed demo | must     |
| Delivery notes | README section on AI tools used and design decisions                   | must     |
| Visual design  | A designed layout replacing stock component styling                    | later    |

The brief expects about 90 minutes of work; anything unfinished is explained in the delivery notes rather than hidden.

## Key Integrations

- `TheSportsDB v1 API` (https://www.thesportsdb.com/free_sports_api): the only data source. The brief names two endpoints — all leagues (`/api/v1/json/3/all_leagues.php`) and the season badge lookup (`/api/v1/json/3/search_all_seasons.php?badge=1&id=<id>`). The free tier behind key `3` is limited: as checked on 2026-10-07 it returns only ten Soccer leagues, without the alternate-name field, and caps the badge lookup at five seasons, oldest first. The single-league lookup (`lookupleague.php`) and the badge lookup do answer for leagues of every sport.

## Success Signals

- The repository is public and runs with one documented command, with no manual setup beyond installing dependencies.
- Every requirement in the brief is demonstrably met, or its gap is explained in the delivery notes.
- The reviewer can follow why the app is built the way it is from the README and the linked decision and feature documents.
