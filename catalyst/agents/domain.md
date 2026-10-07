# Adapter: mattpocock-skills domain docs

**Trigger:** a mattpocock-skills skill (`/grilling`, `/domain-modeling`, `/grill-with-docs`, `/improve-codebase-architecture`, `/tdd`, `/diagnosing-bugs`, or any other) asks to read or write `CONTEXT.md`, `CONTEXT-MAP.md`, or `docs/adr/`.

This project runs those skills inside Catalyst (`references/agent-skills.md`, Third-party skill pipelines). The skills assume a root-level layout this repository does not have; this document says where each artifact lives instead. Never create the directories the skills name.

## Path routing

| The skill asks for          | Use instead                                                                                                          |
| --------------------------- | -------------------------------------------------------------------------------------------------------------------- |
| `CONTEXT.md` (the glossary) | `catalyst/context/glossary.md` — its own three rules apply (`references/project-documents.md`)                       |
| `CONTEXT-MAP.md`            | Nothing — the project is a single context                                                                            |
| `docs/adr/<nnnn>-<slug>.md` | `catalyst/decisions/<nnn>_<type>_<slug>.md`, from `decisions/_template.md`, run through the Decision Record workflow |
| The skill's ADR format      | The decision template; the skill's three-part test is subsumed by the worthiness test (`prime-directive.md`, ADR)    |
| A spec or PRD               | `catalyst/features/<nnn>_<slug>.md`, from `features/_template.md`                                                    |
| The issue tracker           | None — this project keeps no tracker; planning lives in the repository's `PLAN-sporty-leagues.md`                    |

## Skill routing

| The pipeline says                                   | What governs here                                                                                     |
| --------------------------------------------------- | ----------------------------------------------------------------------------------------------------- |
| `/grilling`, `/domain-modeling`, `/grill-with-docs` | Used to draft a feature document or decision record                                                   |
| Implement, `/tdd`                                   | Implementing A Plan (`prime-directive.md`): one step at a time, and every commit approved by the user |
| `/diagnosing-bugs`                                  | The Bug Fixes rules (`prime-directive.md`): root cause from a reproduction or evidence, never a guess |
| `/wayfinder`                                        | Its map is `PLAN-sporty-leagues.md`, not GitHub Issues                                                |
| Publish to the issue tracker, triage labels         | Not used — this project keeps no tracker                                                              |

## Reading before exploring

Read `catalyst/context/glossary.md` and the decision records that touch the area, as `project-summary.md` indexes them. If either is missing, proceed silently.

## Vocabulary and conflicts

Name domain concepts by the glossary's terms in every output — test names, commit messages, document headings. A concept the glossary lacks is either invented language (reconsider) or a real gap (add the term while drafting the document that needs it).

Output that contradicts an `Accepted` or `Implemented` decision record says so explicitly and names the record, rather than silently overriding it.
