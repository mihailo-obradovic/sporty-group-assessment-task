# Architecture Guide

Applies across projects. Agents follow it unless the user explicitly changes the architecture. Adapt per project via decision records.

## How To Read This File

Three levels. Every rule appears at exactly one level.

| Level                     | Binds                                      | Changed by                             |
| ------------------------- | ------------------------------------------ | -------------------------------------- |
| Architecture Principles   | every project                              | never, in practice                     |
| Universal Rules           | every project, any stack                   | template release, user-approved — rare |
| Stack Modules (`stacks/`) | every project, one module per layer it has | per-project decision record            |

**Agents never change this file on their own initiative.** An agent may propose a change and draft the decision record; the user decides. This holds at every level.

Some Universal Rule sections are scoped by their subject: Client And UI binds projects with a frontend, Asynchronous Work binds projects with async work, Data Protection And Retention binds projects holding personal data. A project without the subject skips the section; no decision record needed.

Versions are minimums ("18+" = 18 or newer stable). New projects start on the newest stable that satisfies them; a major-version move on an existing project is an `upgrade` decision record. Minimums govern choice; builds are reproducible — projects pin exact runtime and dependency versions (lockfiles, image tags).

## Architecture Principles

- Keep business behavior explicit and testable.
- Prefer simple module boundaries over clever abstractions.
- A module owns its data; others access it through its interface, not its storage.
- Keep infrastructure behind interfaces when that eases testing or replacement.
- Do not add dependencies for problems the current stack already solves; when one is justified, prefer boring and stable over niche.
- Do not mix behavior changes with broad refactors unless the task requires it.
- Fail fast and explicitly.
- Operations that can be retried must be safe to retry.
- Configuration is explicit and centralized.

## Dependency Change Rule

Before adding any runtime dependency, framework, package pattern, build plugin, or test tool: check this file. Not allowed by the stack modules in use → get the user's explicit approval, then update `architecture.md` in the same change with the reason. Never add a dependency for one call site's convenience when stdlib or approved tools keep the code clear.

The record lives here, in one table: **one row per package the adopted modules' Approved Libraries do not already name.** A rule that says "update `architecture.md`" and names no shape gets a different shape per project, and none of them greppable.

| Package       | Layer    | Why it is needed                                                                                                                                                 | Approved by      |
| ------------- | -------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------- |
| `@pinia/nuxt` | Frontend | Pinia's Nuxt module; `@pinia/colada-nuxt` requires it to register Pinia, so it is how the approved Pinia is installed                                            | user, 2026-10-07 |
| `ofetch`      | Frontend | The fetcher and the error policy import it directly (`ofetch`, `FetchError`); already in the tree through Nuxt at the same version, named by `error-handling.md` | user, 2026-10-07 |

- **`Approved by` cites the gate**, not a person's taste: a decision or feature id, or `user, <date>` where the approval was direct.
- **A knowingly temporary dependency states its removal trigger inside `Why`** — "until `Temporal` reaches Baseline; the calling code is already written against the native API" — rather than in a column that would be empty for every other row.
- **An explicit negative row is worth writing** where a pairing table elsewhere might suggest a package the project deliberately does not use.
- **Considered and rejected packages go in prose below the table.** They have no other home, and the next person to propose one arrives with the same reasoning the last one did.

## Documentation Boundaries

This file holds technical structure and dependency choices; everything else routes per the file index (`AGENTS.md`) and Context Loading (`prime-directive.md`). One ownership rule lives here: a project's cross-cutting convention annexes are owned and indexed by this file (`references/project-documents.md`) — distinct from `conventions/`, Catalyst's own always-applied set that arrives with the bundle and upgrades with it.

## Universal Rules

Stack-neutral. Every project, every stack module.

### Layering

- Business rules live in domain/service code — never in UI, routes, transport, or storage-mapping layers.
- Dependencies point one way: transport → service → persistence. A lower layer never imports an upper one — except an interface the service owns and the persistence layer implements: that import is of the contract, and calls still run downward.
- **A backend's layout follows its domain count.** A domain is a business concept that owns its own tables; auth, health, and webhook receivers are plumbing and never count. Under three domains the backend lays out by role (one top-level folder per technical role); from three it lays out by module (one folder per domain, the layering above inside it). Another module is reached only through its public surface, which each backend module document defines — never through its transport layer or its tables directly. The shape is chosen at Init Design from the domains the feature documents name and recorded in the project's `architecture.md`; crossing the threshold is a named follow-up refactor on its own branch, never a mixed tree.
- **A module escalates on its trigger, never in case:** ports and adapters when it talks to more than two external systems or must swap one; an in-process event bus when side effects pile onto a core operation (cross-process delivery is Asynchronous Work); separate command and query paths when a service passes roughly ten write methods. The modular monolith is the default, not an escalation.
- A message consumer is a transport boundary: deserialize, validate, call a service, acknowledge. No business logic. Every rule written for routes applies to consumers unchanged.
- One application core per product: new deployables come from optional stack layers and job isolation (workers, consumers, DAG tasks) — splitting the product into separate services is a decision record with a stated trigger (independent release cadence, isolation requirement, team scaling), never an aesthetic.

### Conventions

- All timestamps UTC, ISO-8601, with explicit offset or `Z`.
- Event time and ingestion time are separate fields wherever both exist; never overwrite one with the other.
- Identifiers crossing a service boundary are opaque strings to the receiver.
- Money and physical quantities carry an explicit unit in name or type — never a bare `float value`; money is exact decimal or integer minor units, never binary floating point.

### Validation

- Structural validation at the transport boundary with declared schemas/DTOs — never inlined in endpoints or consumers.
- Business validation in services or domain code, not in schemas.
- Validation errors are clear and never leak internal detail.
- All external input is untrusted, including input from other internal services.

### Contracts

- The contract is written before the implementation and is the reviewed artifact. Minimum content — HTTP: paths, request/response schemas, error shapes, auth requirements. Messages: schema, topic/queue name, version. Tables: owning module, migration.
- Every list endpoint paginates; one pagination convention per project.
- A breaking change to a contract whose consumers do not deploy atomically with the producer ships behind a new version, and the old version gets a stated removal date. Where the producer and all consumers ship together (one app, one deploy), the contract may change in one change — the Same-Change Rule covers the documents.
- Additive changes (new optional field, ignorable enum member) are not breaking.
- Consumers ignore unknown fields.
- When the other side of a contract is another team, the contract lives where that team reads it and names an owner — a shape agreed in chat is not a contract.
- **A contract that crosses languages has one source type, a generated artefact committed beside it, and a freshness assertion in the producing language's test suite** — never a hand copy on the consuming side. Two definitions of one shape in two languages drift silently, because each side's tests pass against its own copy. The generated artefact is committed so the consumer needs no build step from another toolchain, and the assertion is what makes the drift fail: it belongs with the tests, so the gate rides on the test verb rather than needing a pipeline step of its own.

### Error Handling

- Expected errors map to correct status codes/error types through central error handling — one place, consistent shapes.
- Never swallow exceptions; never mask a failure with a fallback or null-ish value. Absence is a domain outcome, not a failure — a repository may return "not found"; unexpected errors always raise.
- Retryable and permanent failures are distinguishable without parsing a message string.

### Idempotency

- Any operation reachable more than once (retried request, redelivered message, re-run job) produces the same end state as one execution.
- Achieved with a natural key or explicit idempotency key — never by assuming exactly-once delivery.
- The deduplication window is documented in the owning feature document.

### Configuration And Secrets

- All environment access through one central configuration entry point; no scattered env reads.
- No hardcoded URLs, secrets, or API keys — in code, tests, or compose files.
- Configuration is validated at startup; a missing/malformed value stops the process. A default is allowed only for a value identical in every environment — port, log level, timeouts, pool size; secrets, credentials, URLs, hosts, and anything environment-specific never carry one.
- A committed `.env.example` lists every variable with a placeholder value; `.env` itself is gitignored.
- Secrets live in the consuming process's environment — never in task payloads, message payloads, or the database.

### Persistence

- A schema change ships with its migration in the same change.
- Migrations are forward-only in production; a rollback is a new migration.
- A destructive schema change — a drop, a rename, `NOT NULL` on an existing column, a narrowed type — ships as expand → migrate → contract in separate changes whenever old code can still run against the database (rolling deploys, several instances, workers on their own release, a rollback that redeploys old code): an additive migration, then the code and any backfill, then the destructive migration.
- Transaction boundaries live in the service layer.
- Business invariants that must hold under concurrency are enforced by the database — unique/check/FK constraints or explicit locking. A service-level check alone is a race, not enforcement (mirrors: hiding UI is not authorization).
- Explicit queries for complex reads.
- Every production datastore has automated backups with a stated schedule and retention — and a restore procedure that has actually been tested; an untested backup does not count as a backup.
- Restore rehearsal is repeated after material schema or infrastructure changes; point-in-time recovery is part of the procedure where the engine supports it.

### Asynchronous Work

- The producing side only enqueues/emits; work definitions and execution live in the consuming service.
- Job families are isolated: one family's backlog or failure never blocks another; each scales and fails independently.
- Concurrency and timeouts are explicit and matched to the workload (resource-heavy jobs: concurrency 1).
- Every consumer is idempotent — delivery is at-least-once.
- A job is enqueued after the transaction that motivates it commits, never inside it. When losing it after the commit is unacceptable, an outbox row is written in the same transaction and a relay enqueues it.
- A message that exhausts its retry budget goes to a dead letter destination with the failure reason; never dropped, never retried forever.
- Large payloads never travel inline — not in a broker message, task argument, or table column. The payload goes to object storage and the message carries the reference (claim check); the size threshold is stated in the owning feature document.

### Logging

- Standard logging facility, never print-style output.
- Log useful context, not noisy traces.
- Never log secrets, tokens, API keys, or full request bodies.

### Logging Format And Request Tracing

One field set across all services (APIs, workers, consumers, DAG tasks), written in one encoding per project. The default encoding is the bracketed line:

```text
[2026-07-03T08:31:35.123Z] [INFO] [api] [orders.service] [req 59e3cc] order paid orderId=8812 attempt=2
```

- UTC, ISO-8601, milliseconds.
- Fields in order: level, service name, logger name, request id, message. Structured context follows the message as space-separated `key=value` pairs, a value quoted when it contains a space; thread, task, partition, and DAG-run ids are ordinary keys.
- A stack trace sits on indented continuation lines under its record; a continuation line belongs to the record above it.
- JSON lines with the same keys, the trace in one `stack` field, is the other encoding — adopted by decision record when the project adopts a log aggregator, every service at once.
- The edge service accepts `X-Request-ID` or generates one; it propagates through every hop (HTTP headers, broker task/message headers, callback headers) so one request greps across all services.
- Records without request context log `[req -]`.

### Observability

- Every service answers a liveness check (process up) and a readiness check — distinct checks; the mechanism is a stack binding (HTTP endpoint, healthcheck command).
- Readiness fails only when the service cannot perform its core function; a temporarily degraded optional dependency does not fail readiness.
- Every service exposes metrics in one project-wide format: at minimum request/message rate, error rate, latency distribution.
- Metric labels have bounded cardinality; request ids, user ids, emails, and other unbounded values are never labels.
- Async consumers additionally expose backlog depth (queue length or consumer lag) and dead-letter count; backlog is the primary scaling and alerting signal.
- Metrics/health endpoints are never on the user-traffic auth seam and never publicly routable.
- Dashboards and alert rules are versioned files in the repository, provisioned on startup — never hand-built in a monitoring UI. Identifiers the provisioned files depend on (datasource UIDs) are pinned. At minimum, a service-down alert exists.

### Security

- Authentication and authorization centralized in one seam; never frontend-only checks.
- Bearer tokens are validated for signature, time bounds, issuer, **and audience** — a token minted for another client never passes.
- Hiding UI by role is UX, never authorization: the server is the only gate; every permission in the access matrix is enforced server-side.
- Keep per-user secrets out of the database when the design allows.
- Secrets, API keys, and signatures are compared in constant time.
- Service-to-service calls authenticate; the network perimeter is not the authorization boundary.
- Containers run as non-root with minimal privileges.
- Request and upload size limits are explicit at the edge.
- CORS is deny-by-default; the allowlist comes from configuration.
- Publicly exposed endpoints are rate limited at the edge; internal ones are not, by default. Naming the edge component is part of going public — a decision record.
- Outbound requests to user-supplied URLs are validated against an allowlist (SSRF).

### Data Protection And Retention

- Personal data is identified in the feature document that introduces it, with lawful basis and retention period.
- Every table, topic, and bucket holding personal data has an explicit retention/deletion policy; "keep forever" is a recorded decision.
- Subject-data deletion works across every tier that stores it (archives, caches, message logs). A tier that cannot honor deletion must not receive personal data.
- Non-production environments never receive production personal data unless anonymized or synthetic.
- Data classification (public/internal/personal/sensitive) is stated where the data is defined.

### Testing

- Unit-test services and repositories: fast, focused.
- Integration tests when behavior depends on framework wiring, transactions, serialization, or persistence.
- Integration tests run against the same engines as production (real database, real broker), never a lookalike substitute.
- Frontend tests exercise user-visible behavior, not implementation details; a project may trade automated frontend tests for the live browser walk (prime directive) — recorded per feature in its Tests section.
- A bug fix ships with a regression test that fails before it and passes after; where that is impractical, the fix states why (prime directive, Bug Fixes).

### Client And UI

- All frontend requests through a single API client wrapper (headers, base URL in one place); no inline HTTP in components.
- Server state and client state are distinct; server-owned data is never mirrored into local component state for parallel editing. An explicit form draft is client state until submit — a deliberate exception, not an accidental copy.
- Every async view has explicit loading and error states.
- Organize UI by functionality, not account type: one section per capability, role decides visibility and enabled options — never parallel per-role screens.
- Frontend configuration is injected at build time, never hardcoded.

## Stack Modules

The stack is a **selection** — one module per layer from the index below. A module names the concrete tools and binds the Universal Rules to them; it never restates a Universal Rule, and its tools are swappable per project by decision record. No layer has a default: the choice is made at Init Design. `project-summary.md` (Technical Stack) records what the project actually runs; each adopted module's document is normative.

A module is a single `<module>.md` or a `<module>/` directory: nested choice dirs (e.g. the frontend `ui/` libraries) are follow-up questions answered at spawn, an `addons/` dir holds optional add-on docs for that module (an addon may carry a sibling payload dir of the same name — extra docs and rules that travel with it), and a `rules/` dir is a per-rule payload loaded through the doc that routes it — a `performance.md` router, or the addon doc that owns the payload — never wholesale. `starter/` and `setup.py` are reserved inside a module for the app scaffold and its setup hook; neither is supported yet, and a module carrying one is copied for its documents alone, with a note.

**Module documents.** A module or tier holding more than its own contract document indexes the rest under a `## Module Documents` heading, three columns — Document, What it holds, Load. The Load cell is the trigger that loads that document — an imperative condition ("When defining or organizing types"), or "Always, with the module" for the contract document's own row, which holds "This document — the module contract and approved libraries" — never a second description. The Load cell is how a module document is reached; it takes no generated skill wrapper of its own (`references/agent-skills.md`). Header position is for machine-read fields only (`**Layer:**`/`**Tool:**` or `**Tier:**`, and `**Requires:**`, which any module or addon may declare); anything else a module depends on belongs in its body.

**Third-party material.** A module document built from someone else's skills is either vendored or adapted, and its `## Provenance` section (last) says which; a tier document that travels without its module contract carries its own. _Vendored_ material is copied with listed deviations and re-synced by `tools/sync_rules.py`: an `Upstream:` line (repository, path, commit, synced date), a deviations table, and a `Re-sync:` step. _Adapted_ material is rewritten once into Catalyst's structure, examples inline and never a `rules/` payload, and re-checked by hand: a `Source:` line (repository, path, commit, adapted date — never `Upstream:`), the license line, a skill → document table, a Departures list linking the Catalyst rule that wins each clash, companion reading, and a `Re-check:` step.

**Shared tiers.** Guidance that serves more than one module lives in underscore-prefixed tier directories under `stacks/` — `_lang/typescript/` and `_lang/python/` (language-level, any TS/JS or Python stack), `frontend/_react/` and `frontend/_vue/` (React- and Vue-general, one or the other per project), `frontend/_common/` (framework-agnostic frontend rules — component file naming, layout stability, scroll affordance, and the design-system template), and `frontend/_cross-framework/` (the Vue⇄React translation table, pulled in only by the `framework-mapping` addon). A tier is never a spawn question; a module or addon declares the tiers it needs with a `**Requires:** _lang/typescript · frontend/_react · frontend/_common` header, and the scaffolder copies them automatically whenever that module is chosen. Tier docs carry a `**Tier:**` header instead of Layer/Tool (validator R7); the wiring is checked both ways (R9).

| Layer                      | Options                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                            |
| -------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Backend                    | [python-fastapi](stacks/backend/python-fastapi.md) / [laravel](stacks/backend/laravel/laravel.md) (PHP) / [node-express](stacks/backend/node-express/node-express.md) (TypeScript). **node-express** — auth: [better-auth](stacks/backend/node-express/auth/better-auth.md); addons: [graphql](stacks/backend/node-express/addons/graphql.md). **laravel** — auth: [sanctum-session](stacks/backend/laravel/auth/sanctum-session.md) / [sanctum-token](stacks/backend/laravel/auth/sanctum-token.md); addons: [graphql](stacks/backend/laravel/addons/graphql.md)                                                                                                                                                                                                                                                                                                                                                                  |
| Frontend                   | [nextjs](stacks/frontend/nextjs/nextjs.md) (React) / [nuxt](stacks/frontend/nuxt/nuxt.md) (Vue). **nextjs** — UI: [shadcn](stacks/frontend/nextjs/ui/shadcn/shadcn.md) / [primeui](stacks/frontend/nextjs/ui/primeui.md); addons: [ssr](stacks/frontend/nextjs/addons/ssr.md), [state-management](stacks/frontend/nextjs/addons/state-management.md), [i18n](stacks/frontend/nextjs/addons/i18n.md), [framework-mapping](stacks/frontend/nextjs/addons/framework-mapping.md). **nuxt** — UI: [headless](stacks/frontend/nuxt/ui/headless.md) / [vuetify](stacks/frontend/nuxt/ui/vuetify/vuetify.md) / [nuxtui](stacks/frontend/nuxt/ui/nuxtui/nuxtui.md); addons: [ssr](stacks/frontend/nuxt/addons/ssr.md), [i18n](stacks/frontend/nuxt/addons/i18n.md), [graphql](stacks/frontend/nuxt/addons/graphql.md), [image](stacks/frontend/nuxt/addons/image.md), [framework-mapping](stacks/frontend/nuxt/addons/framework-mapping.md) |
| Background work (optional) | [celery](stacks/workers/celery.md) (Python) / [bullmq](stacks/workers/bullmq.md) (TypeScript)                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      |
| Persistence                | [postgres](stacks/database/postgres.md) / [mysql](stacks/database/mysql.md)                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                        |
| Deployment (optional)      | [docker-compose](stacks/deployment/docker-compose.md)                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                              |
| Identity (optional)        | [keycloak](stacks/identity/keycloak.md)                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                            |
| Maintenance (optional)     | [renovate](stacks/maintenance/renovate.md)                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                         |
| CI (optional)              | [github-actions](stacks/ci/github-actions.md)                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      |

The composition floor is **at least one of Backend and Frontend, and a backend brings Persistence with it** — a pure-backend service and a pure-frontend app are both valid shapes, and a frontend-only app carries no database. A product's apps share one repository; a second repository is a decision record with the triggers Layering names for splitting the product (independent release cadence, isolation requirement, team scaling). Every other layer is **optional**, adopted when its trigger fires, not in anticipation, and never replacing that floor. Background work: when work must run outside the request/response cycle — queues, scheduled jobs, fan-out — a synchronous handler covers everything else (`stacks/workers/celery.md`, `stacks/workers/bullmq.md`; Laravel keeps its own queue). Deployment: when the project needs a reproducible multi-service run or ship story rather than each service started by hand (`stacks/deployment/docker-compose.md`). Identity: when the product needs what only an identity provider gives — single sign-on across apps, federation, an admin console for users, or several backends sharing one user base. Below that, a backend's own `auth/` choice holds the accounts, and nobody hand-rolls auth to dodge either (`stacks/identity/keycloak.md`). Maintenance: once the project has a committed lockfile or pinned image tags to keep current (`stacks/maintenance/renovate.md`); pins stay exact, and bumping an existing dependency is not a way around the Dependency Change Rule, which still owns every _new_ one. CI: once the repository has a verification command someone must not forget to run, in practice the first push to a shared remote (`stacks/ci/github-actions.md`); it gates rather than ships, which is why it is not Deployment, and Maintenance leans on it — automerge without a gating pipeline is the mistake that layer's own `Avoid` names.
