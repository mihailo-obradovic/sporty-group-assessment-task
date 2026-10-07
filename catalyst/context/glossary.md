# Glossary

A **context document** (`references/project-documents.md`): the project's terms and what each one means, so one word means one thing across every feature document, decision record, and file name. It is never a contract — when it disagrees with a feature document or `architecture.md`, the contract wins and this file is updated to catch up.

**Loads when:** naming work — coining a term in a contract, renaming one, or settling what an existing word covers; and when a task's vocabulary is ambiguous enough that guessing would put two names on one thing.

Three rules, or it stops being useful:

- **A glossary and nothing else.** Terms and meanings. Not a spec, not a scratchpad, not a home for rules that failed to find a document.
- **A type is named as a pointer, never as the definition.** "`BuildState` — the shape the planner serialises" points at the type; restating its fields here creates a second definition that drifts, and the code's is the one that runs.
- **One home per term.** A transcribed reference — a vendor API, a spec, a game's own rules — never coins a term: the upstream document owns it, and the entry here points at that document instead of paraphrasing it. Where two sources compete, the upstream one wins.

## Terms

| Term           | Means                                                                                                                               |
| -------------- | ----------------------------------------------------------------------------------------------------------------------------------- |
| League         | One competition as TheSportsDB lists it: one row of the all-leagues response, identified by its league id                           |
| Sport          | The category a League belongs to (Soccer, Basketball, Motorsport …), as TheSportsDB names it; what the sport filter chooses between |
| Alternate name | A League's secondary name as TheSportsDB records it; may be empty or missing, and is never required to identify a League            |
| Season badge   | The image TheSportsDB holds for one season of a League; the app shows one per League on request, never a League's own logo          |
