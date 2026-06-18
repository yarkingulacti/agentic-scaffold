# What an AI Agent Acquires From This Scaffold

After running `npx @yarkingulacti/agentic-scaffold` in a project, the project
gains an AI-native foundation. An AI coding agent working in the project
acquires the following capabilities:

## 1. Domain Mastery

The agent reads `BUSINESS_LOGIC.md` first — before any planning or coding — to
understand product fundamentals, core domain concepts, non-negotiable rules,
and architecture decisions.

- `AGENTS.md` / `CLAUDE.md` instruct the agent: "Read BUSINESS_LOGIC.md first."
- Task plans must cite the relevant BUSINESS_LOGIC.md section before coding.

## 2. 19 Drop-in Skills

Pre-built workflows organized under `.agents/skills/`, each self-contained in a
`SKILL.md` file:

| Skill | Purpose |
|-------|---------|
| `implement` | Implement from a short issue + detailed scratchpad plan |
| `bugfix` | Diagnose and fix a described bug with regression test |
| `diagnose` | Full disciplined debug loop (build feedback loop → reproduce → hypothesise → instrument → fix → regression test) |
| `tdd` | Red-green-refactor TDD with vertical slicing. Includes supporting docs on tests, mocking, refactoring, deep modules, and interface design |
| `issue` | Create issue + matching scratchpad detail file |
| `to-issues` | Break a plan/PRD into independently-grabbable vertical-slice issues |
| `to-prd` | Synthesize conversation context into a PRD and publish to issue tracker |
| `qa` | Interactive QA session — user reports bugs conversationally, agent files GitHub issues |
| `caveman` | Ultra-compressed token-efficient communication mode (~75% fewer tokens) |
| `grill-me` | Interview the user relentlessly about a plan/design until shared understanding |
| `handoff` | Compact conversation into a handoff document for another agent |
| `improve-codebase-architecture` | Find deepening opportunities, produce HTML report with before/after diagrams |
| `ubiquitous-language` | Extract DDD-style glossary from conversation, flag ambiguities |
| `status` | Compare current work against roadmap |
| `today` | Create today's plan from roadmap, scratchpad, history, and vector memory |
| `weekly` | Create weekly project summary |
| `monthly` | Create monthly project summary |
| `summary` | Create all-time project summary |
| `obsidian-vault` | Search, create, and manage notes in an Obsidian vault |

## 3. Coding Discipline

`docs/CODING_PRINCIPLES.md` constrains the agent with explicit operating rules:

- YAGNI, KISS, pragmatic DRY
- Simple direct code over speculative extensibility
- Fail-fast validation, explicit boundaries
- Keep HTTP/request concerns out of domain logic
- Components with one clear responsibility
- Review checklist for agent self-checking

## 4. Decision Awareness

`docs/adr/` — Architecture Decision Records. The agent reads existing ADRs to
understand why past decisions were made and does not re-litigate them.

- `TEMPLATE.md` provides the format (Context → Decision → Consequences → Alternatives)
- Agents flag contradictions: "Contradicts ADR-XXXX — but worth reopening because..."

## 5. Persistent Memory

`scripts/` — A local vector database for project knowledge:

- `memory_index.mjs` — Indexes all project Markdown into a flat-file keyword index.
- `memory_search.mjs` — Search by query with keyword overlap scoring.
- `memory_bundle.mjs` — Write a focused Markdown bundle from search results

The agent can retrieve relevant context across sessions without human hand-holding.

## 6. Standard Operating Procedures

- **Session close** (`docs/agents/session-close.md`): 8-step post-coding workflow
  (tests → build → history → re-index → update scratchpad → commit → push → PR)
- **Issue tracker conventions** (`docs/agents/issue-tracker.md`): Short tracker
  issues, detailed plans in `.scratchpad/`, no issue comments as project memory
- **Triage labels** (`docs/agents/triage-labels.md`): `needs-triage`, `ready-for-agent`,
  `ready-for-human`, `wontfix`
- **Domain docs consumption** (`docs/agents/domain.md`): Read BUSINESS_LOGIC.md
  first, use INDEX.md for CONTEXT.md sections, flag ADR conflicts

## 7. Workspace Conventions

- `.scratchpad/` — Local detailed planning (per-feature/issue detail files)
- `.history/` — Shipped work summaries by date (`.history/DD.MM.YYYY/README.md`)
- `.memory/` — Generated memory database (gitignored)
- `.agents/skills/` — Agent skill definitions
