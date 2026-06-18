# py-app

## Agent skills

### Project brain

Read `.agentic-scaffold/BUSINESS_LOGIC.md` first for product fundamentals, core domain concepts,
non-negotiable rules, and decision references. Future task plans must cite the
relevant `.agentic-scaffold/BUSINESS_LOGIC.md` section before implementation.

`CONTEXT.md` remains a generated historical mirror from the Obsidian vault. Use
`.agentic-scaffold/docs/context/INDEX.md` to locate narrow sections when old context is needed;
do not read the whole file by default.

### Issue tracker

Short implementation records live in Linear. Local, detailed planning lives in `.agentic-scaffold/.scratchpad/<feature>/`. See `.agentic-scaffold/docs/agents/issue-tracker.md`.

### Work history

Shipped work is summarized in `.agentic-scaffold/.history/DD.MM.YYYY/README.md`. Use separated
dated worklog files only; do not use issue comments as the project memory.
After every successful coding session, follow `.agentic-scaffold/docs/agents/session-close.md`.

### Agent lifecycle hooks

Pre/post lifecycle hooks live in `.agentic-scaffold/.agents/hooks/`. Implementation skills
reference them automatically. Available hooks:

- `.agentic-scaffold/.agents/hooks/pre-feature.md` — before implementing a feature
- `.agentic-scaffold/.agents/hooks/post-feature.md` — after implementing a feature
- `.agentic-scaffold/.agents/hooks/post-bugfix.md` — after fixing a bug
- `.agentic-scaffold/.agents/hooks/post-session.md` — after a coding session (canonical
  post-session workflow, replaces `.agentic-scaffold/docs/agents/session-close.md`)
- `.agentic-scaffold/.agents/hooks/scripts/` — executable helpers for the hooks above

### Domain docs

Use `.agentic-scaffold/BUSINESS_LOGIC.md`, `.agentic-scaffold/docs/`, and `.agentic-scaffold/docs/adr/` as tracked source material.
See `.agentic-scaffold/docs/agents/domain.md`.

### Coding principles

Follow `.agentic-scaffold/docs/CODING_PRINCIPLES.md`: simple direct code, YAGNI, KISS, pragmatic
DRY, existing conventions, explicit boundaries, fail-fast validation, and
focused tests.



### Script runtime

Memory and utility scripts use **node**.

### Agent memory

Use repo automation from `.agentic-scaffold/scripts/`:

- `.agentic-scaffold/scripts/memory_index.mjs` indexes project Markdown.
- `.agentic-scaffold/scripts/memory_search.mjs` searches indexed Markdown.
- `.agentic-scaffold/scripts/memory_bundle.mjs` writes a focused Markdown bundle for a task.
- `.agentic-scaffold/scripts/sync-context.sh` syncs the generated historical `CONTEXT.md`.

Generated memory files live under `.memory/` and are gitignored.
## Scaffold information

This project was bootstrapped with `@yarkingulacti/agentic-scaffold` v0.0.0-test.

Some files contain placeholder content that must be completed:
- **.agentic-scaffold/BUSINESS_LOGIC.md** — Core Domain Concepts, Non-Negotiable Rules, Architecture Decisions
- **.agentic-scaffold/docs/context/glossary.md** — domain term definitions
- **.agentic-scaffold/docs/product/README.md** — product spec descriptions
- **.agentic-scaffold/docs/engineering/README.md** — implementation conventions

To complete these, invoke the `fill-docs` skill:
`.agentic-scaffold/.agents/skills/fill-docs/SKILL.md`
