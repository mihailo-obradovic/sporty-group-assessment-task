<!-- catalyst:begin -->

## Catalyst

Agent guidance for this repository lives in `catalyst/`. Read `catalyst/AGENTS.md` first — it is the file index and says which documents load when.

Mandatory on every task: `catalyst/prime-directive.md`, `catalyst/architecture.md`, `catalyst/project-summary.md`.

Paths inside those documents are relative to `catalyst/`, not to this root.

This block is generated — edit `catalyst/AGENTS.md` instead. Anything outside the markers is yours and is never touched.
<!-- catalyst:end -->

## Agent skills

Installed pipeline: `mattpocock-skills`, adopted by [decision 001](catalyst/decisions/001_init-design_league-list.md). Its assumed paths are redirected into the bundle. On any conflict, Catalyst discipline wins: the feature document or decision record is the contract and its approval is the implementation gate, and no step is committed without the user approving it.

- **Domain docs** — `catalyst/agents/domain.md`, which also holds the full routing table. Glossary in `catalyst/context/glossary.md`, ADRs in `catalyst/decisions/`, specs in `catalyst/features/`; no `docs/`, no root `CONTEXT.md`.
- **Issue tracker** — none. Planning lives in `PLAN-sporty-leagues.md`, which is also the `/wayfinder` map; there are no GitHub Issues and no triage labels.
