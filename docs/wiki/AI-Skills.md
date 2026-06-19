# AI Skills

`agentic-scaffold` ships **31 agent skills** into every scaffolded project under
`.agentic-scaffold/.agents/skills/<name>/SKILL.md`. A skill is a small Markdown
playbook an agent reads and follows. With the `ai-config` extra, each skill also
gets a per-tool adapter so it can be invoked as a slash/skill command (e.g.
`/refactoring`, `$code-review`) — see **[AI Skill Commands](AI-Skill-Commands)**
for the per-tool invocation table.

This page explains the skills in topics: **What it does**, **How to use**, and
**When to use**. The seven most recently added skills are documented in full
below; the complete catalog follows.

## Skill examples by use case

The skills are most useful when paired with a concrete repository situation:

| Use case | Start with | Then use | Full example |
|---|---|---|---|
| Greenfield SaaS | `to-prd`, `to-issues` | `implement`, `code-review` | [Greenfield SaaS app](Use-Cases#1-greenfield-saas-app) |
| Production web app | `diagnose` | `security-guidance`, `playwright` | [Existing production web app](Use-Cases#2-existing-production-web-app) |
| Web + mobile + C++/Godot monorepo | `ubiquitous-language` | `to-issues`, `implement`, `handoff` | [Monorepo scenario](Use-Cases#3-web--mobile--cppgodot-monorepo) |
| Agency/client handoff | `fill-docs` | `weekly`, `summary`, `handoff` | [Agency handoff](Use-Cases#4-agency-or-client-handoff) |
| Open source | `qa`, `issue` | `code-review`, `rollback-drill` | [Open-source project](Use-Cases#5-open-source-project) |
| Legacy modernization | `diagnose` | `refactoring`, `improve-codebase-architecture` | [Legacy modernization](Use-Cases#6-legacy-modernization) |
| Security-sensitive product | `security-guidance` | `code-review`, `handoff` | [Security-sensitive product](Use-Cases#7-security-sensitive-product) |
| AI/MCP platform | `mcp-builder` | `tdd`, `code-review`, `claude-mem` | [AI/MCP platform](Use-Cases#8-ai-tool-agent-or-mcp-server) |
| Documentation rescue | `ubiquitous-language` | `fill-docs`, `summary` | [Documentation rescue](Use-Cases#9-documentation-rescue) |
| Incident follow-up | `diagnose`, `bugfix` | `handoff`, `monthly` | [Incident follow-up](Use-Cases#10-incident-follow-up) |

---

## Newly added skills

### frontend-design

- **What it does** — Guides distinctive, intentional visual design (palette,
  typography, layout, motion, and copy) so the result doesn't read as a templated
  AI default. Pushes you to ground the design in the subject, pick a single
  signature element, and self-critique against the common "AI look" defaults.
- **How to use** — Invoke it when starting UI work; it has you produce a compact
  token system (color/type/layout/signature), review that plan against the brief,
  then build only after confirming the design isn't generic.
- **When to use** — Building or restyling a frontend, designing a landing/hero
  page, or any time the user wants a non-generic, branded look.

### mcp-builder

- **What it does** — A four-phase guide (research → implement → review/test →
  evaluate) for building high-quality MCP servers in TypeScript (MCP SDK) or
  Python (FastMCP): tool naming, input/output schemas, annotations, pagination,
  and a 10-question evaluation harness.
- **How to use** — Follow the phases while wrapping an API as agent tools; use it
  as a checklist for schemas, error messages, and transport choice, then generate
  evaluations to prove an LLM can actually drive the server.
- **When to use** — Creating or reviewing an MCP server, or exposing an external
  service to agents as tools.

### refactoring

- **What it does** — Refactoring assessment for already-tested code: commit-before-
  refactoring discipline, priority classification (Critical/High/Nice/Skip),
  "DRY = knowledge not code", and an explicit list of when **not** to refactor.
- **How to use** — Run it after tests are green (the REFACTOR step of TDD). It has
  you commit the working baseline first, then make structure-only changes that keep
  behavior unchanged, committed separately from features.
- **When to use** — The user asks to refactor/clean up/simplify tested code, or as
  the refactor step in a TDD loop. For large architectural change use
  `improve-codebase-architecture`; for untested code, add tests first.

### security-guidance

- **What it does** — A three-layer security review of changes: fast pattern checks
  for known-dangerous calls, a diff review across the common web-vulnerability
  classes (injection, XSS, SSRF, secrets, IDOR, auth bypass, unsafe
  deserialization, path traversal), and cross-file data-flow tracing for
  multi-file vulnerabilities.
- **How to use** — Point it at a diff/PR; it flags patterns, reviews the hunks with
  context, traces data flow for higher-severity changes, and reports findings by
  severity with concrete fixes. Honors project security-policy notes and inline
  justifications.
- **When to use** — Reviewing a diff for security, after generating code that
  touches input handling, auth, deserialization, or outbound requests, or when the
  user asks for a security check.

### playwright

- **What it does** — General-purpose browser automation and end-to-end testing:
  the agent writes and runs custom Playwright scripts on demand (page tests,
  multi-step flows, form submission, responsive/visual checks, link/asset
  validation), visible browser by default, returning console output and
  screenshots.
- **How to use** — Describe the browser task in plain language; the skill turns it
  into a Playwright script using role/text selectors and condition-based waits,
  runs it, and reports. Requires Playwright + Chromium in the project.
- **When to use** — Testing a web page or flow in a real browser, automating UI
  interactions, capturing screenshots, or validating frontend behavior.

### code-review

- **What it does** — Reviews a pull request or diff from several independent angles
  (convention compliance, bug detection, git-history context, prior PR comments,
  code-comment accuracy), scores each finding by confidence, and surfaces only the
  high-confidence ones to cut false positives.
- **How to use** — Run it on a branch/PR; it skips PRs that don't need review,
  reports findings with location + suggested fix ordered by severity, and can focus
  on security/performance/accessibility or adjust the confidence threshold.
- **When to use** — Reviewing a PR/branch before merge. For conversational bug
  intake that files issues use `qa`; the `superpowers` review phase can dispatch
  this skill.

### claude-mem

- **What it does** — Persistent cross-session memory: capture what happened during
  a session, compress it into semantic summaries, and inject the relevant ones at
  the start of future sessions, so an agent keeps continuity of project knowledge.
- **How to use** — Capture decisions/rationale (not transcripts), compress away
  noise with progressive disclosure, and surface prior summaries narrowly by topic
  next session. In a scaffolded project it complements the `.history/` worklog and
  the `scripts/` BM25 memory index rather than replacing them.
- **When to use** — The user wants continuity across sessions, asks to
  remember/recall project context, or wants to set up cross-session memory.

---

## Full skill catalog

### Build & implement

| Skill | What it does |
|---|---|
| `implement` | Use a short issue plus a `.scratchpad/` plan, then implement the smallest complete slice. |
| `bugfix` | Diagnose and fix a described bug, following the lifecycle hooks. |
| `tdd` | Test-driven development with the red → green → refactor loop. |
| `refactoring` | Assess and apply structure-only refactors to tested code (the REFACTOR step). |
| `diagnose` | Disciplined loop for hard bugs / perf regressions: reproduce → minimise → hypothesise → instrument → fix → regression-test. |
| `improve-codebase-architecture` | Find architectural deepening opportunities; present an HTML report and grill the chosen candidate. |
| `frontend-design` | Distinctive, intentional UI design that avoids generic AI defaults. |
| `mcp-builder` | Build high-quality MCP servers (TS/Python) with good tool design and evaluations. |
| `playwright` | Write and run custom browser automation / e2e tests with Playwright. |

### Review & quality

| Skill | What it does |
|---|---|
| `code-review` | Multi-angle PR/diff review with confidence-scored, high-signal findings. |
| `security-guidance` | Three-layer security review (patterns, diff classes, cross-file data-flow). |
| `qa` | Interactive QA session that files durable, user-focused GitHub issues. |
| `grill-me` | Interview the user relentlessly to stress-test a plan or design. |

### Planning & issues

| Skill | What it does |
|---|---|
| `to-prd` | Turn the current context into a PRD and publish it to the tracker. |
| `to-issues` | Break a plan/PRD into independently-grabbable issues via tracer-bullet slices. |
| `issue` | Create a tracker issue plus a matching `.scratchpad/` detail file. |
| `next` | Scan work history to pick the next task; otherwise enter planning. |
| `superpowers` | Spec-first methodology: brainstorm → plan → subagent-driven dev → TDD → review → finish. |
| `ubiquitous-language` | Extract a DDD-style ubiquitous-language glossary from the conversation. |

### Memory, history & reporting

| Skill | What it does |
|---|---|
| `claude-mem` | Persistent cross-session memory: capture → compress → inject. |
| `handoff` | Compact the current conversation into a handoff document. |
| `today` | Create today's plan from the roadmap, `.scratchpad/`, and `.history/`. |
| `status` | Compare current work against the roadmap. |
| `weekly` | Create a weekly project summary. |
| `monthly` | Create a monthly project summary. |
| `summary` | Create an all-time project summary. |
| `obsidian-vault` | Search, create, and manage Obsidian notes with wikilinks. |

### Workflow & meta

| Skill | What it does |
|---|---|
| `fill-docs` | Complete scaffold-generated docs by interviewing the user. |
| `create-hook` | Interview for a new lifecycle hook, create it, and wire it into skills. |
| `rollback-drill` | Practice rolling back a change safely. |
| `caveman` | Ultra-compressed communication mode (~75% fewer tokens). |

---

## A note on overlapping skills

When two skills would do the same job, the scaffold keeps the stronger one:

- The standalone **`refactoring`** skill replaced the `tdd` skill's old
  `refactoring.md` reference. `tdd` now points at `refactoring` for the REFACTOR
  step, so there is one canonical home for refactor discipline.
- **`refactoring`** (micro: structure-only changes to tested code) and
  **`improve-codebase-architecture`** (macro: deepening shallow modules) are kept
  separate because they operate at different altitudes.
- **`code-review`** (review an existing diff/PR) and **`qa`** (conversational bug
  intake that files issues) are kept separate because they solve different problems.

## Credits

`frontend-design` and `mcp-builder` are adapted from
[anthropics/skills](https://github.com/anthropics/skills) (MIT);
`security-guidance` and `code-review` from Anthropic's Claude Code plugins;
`playwright` from [lackeyjb/playwright-skill](https://github.com/lackeyjb/playwright-skill)
(MIT); `refactoring` from [citypaul/.dotfiles](https://github.com/citypaul/.dotfiles)
(Paul Hammond); `claude-mem` from
[thedotmack/claude-mem](https://github.com/thedotmack/claude-mem) (Apache-2.0); and
`superpowers` from [obra/superpowers](https://github.com/obra/superpowers) (MIT).
Each is a condensed skill that credits its source in its own `SKILL.md`; install the
originals for their full implementations.
