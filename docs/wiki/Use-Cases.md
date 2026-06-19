# Real-life use cases

`agentic-scaffold` is useful when a repository needs durable context before an
AI agent starts changing code. The scaffold is intentionally boring: docs,
skills, hooks, scratchpads, history, memory search, and optional tool adapters.
The value comes from applying that baseline to real workflows.

## Scenario index

| Scenario | Run | What the scaffold adds | Skill examples |
|---|---|---|---|
| Greenfield SaaS app | `npx @yarkingulacti/agentic-scaffold --extras ci,contribute,ai-config,onboarding` | Architecture docs, ADRs, CI, PR templates, onboarding, slash commands | `/to-prd`, `/to-issues`, `/implement`, `/code-review` |
| Existing production web app | `npx ... --dry-run` then `npx ... --extras ai-config,rtk` | Non-destructive docs, memory index, local skill adapters, token filters | `/bugfix`, `/diagnose`, `/security-guidance`, `/playwright` |
| Web + mobile + C++/Godot monorepo | `npx ... --languages typescript,dart,kotlin,swift,cpp --extras all` | Shared repo memory, language-aware context, CI/contribution docs, project-wide lifecycle hooks | `/ubiquitous-language`, `/to-issues`, `/implement`, `/handoff` |
| Agency/client handoff | `npx ... --extras onboarding,contribute,ai-config` | Human onboarding, setup helper, contribution guide, decision records | `/fill-docs`, `/weekly`, `/summary`, `/handoff` |
| Open-source project | `npx ... --extras ci,contribute,ai-config` | Contributor guide, PR template, review guidance, skill commands | `/qa`, `/issue`, `/code-review`, `/rollback-drill` |
| Legacy modernization | `npx ... --extras ai-config,rtk` | Context docs, scratchpads, history, BM25 memory search, low-noise shell output | `/diagnose`, `/refactoring`, `/improve-codebase-architecture` |
| Security-sensitive product | `npx ... --extras ci,contribute,ai-config` | Review guidance, lifecycle hooks, security review skill access | `/security-guidance`, `/code-review`, `/rollback-drill` |
| AI/MCP platform work | `npx ... --extras ai-config,onboarding` | Agent instructions, local command adapters, architecture docs | `/mcp-builder`, `/tdd`, `/code-review`, `/claude-mem` |
| Documentation rescue | `npx ... --extras ai-config` | Fillable product/engineering docs plus `/fill-docs` adapters | `/fill-docs`, `/ubiquitous-language`, `/summary` |
| Incident follow-up | `npx ... --extras ai-config,rtk` | Timeline-friendly history, scratchpad investigation notes, searchable Markdown | `/diagnose`, `/bugfix`, `/handoff`, `/monthly` |
| Solo founder product | `npx ... --extras ai-config,onboarding` | Product rules, decision log, repeatable build/release notes | `/to-prd`, `/today`, `/status`, `/summary` |
| Enterprise platform team | `npx ... --extras ci,contribute,onboarding,ai-config` | Ownership docs, contribution gates, ADRs, cross-team handoffs | `/grill-me`, `/to-issues`, `/code-review`, `/weekly` |
| Regulated fintech/healthcare | `npx ... --extras ci,contribute,ai-config` | Trust-boundary docs, ADR trail, review workflows, rollback rehearsal | `/security-guidance`, `/rollback-drill`, `/handoff` |
| Data or ML pipeline repo | `npx ... --languages python,typescript --extras ai-config,rtk` | Pipeline context, experiment notes, memory index, low-noise logs | `/diagnose`, `/tdd`, `/summary`, `/monthly` |
| Desktop or Electron app | `npx ... --languages typescript,rust --extras ci,ai-config,onboarding` | Runtime notes, release checklist context, UI testing skill access | `/playwright`, `/bugfix`, `/code-review`, `/handoff` |
| Game studio repository | `npx ... --languages cpp,csharp,gdscript --extras ai-config,onboarding` | Gameplay language, engine/native context, asset-pipeline decisions | `/ubiquitous-language`, `/to-issues`, `/implement`, `/weekly` |
| Design system or UI kit | `npx ... --extras ai-config,contribute` | Contribution rules, visual review guidance, component decision history | `/frontend-design`, `/playwright`, `/code-review` |
| Internal tools/admin panel | `npx ... --extras ci,ai-config,rtk` | Auth/permission context, workflow docs, incident history | `/security-guidance`, `/bugfix`, `/diagnose` |
| API/SDK/library project | `npx ... --extras ci,contribute,ai-config` | Public contract docs, compatibility ADRs, review and release notes | `/tdd`, `/code-review`, `/issue`, `/summary` |
| Education/research lab repo | `npx ... --extras onboarding,ai-config` | Onboarding docs, reproducibility notes, searchable experiment history | `/fill-docs`, `/today`, `/weekly`, `/summary` |
| Hackathon prototype becoming real | `npx ... --extras all` | Fast capture of assumptions, setup, first ADRs, tracker-ready issues | `/to-prd`, `/to-issues`, `/grill-me`, `/implement` |
| Acquisition or due-diligence review | `npx ... --dry-run` then `npx ... --extras ai-config,rtk` | Read-only preview first, architecture/risk notes, searchable findings | `/fill-docs`, `/diagnose`, `/security-guidance`, `/summary` |
| Cloud migration or platform move | `npx ... --extras ci,contribute,ai-config,rtk` | Migration ADRs, rollback notes, build/deploy command context | `/diagnose`, `/to-issues`, `/rollback-drill`, `/handoff` |
| Multi-agent QA sprint | `npx ... --extras ai-config,rtk` | Shared findings, scratchpad test plans, low-noise test output | `/qa`, `/playwright`, `/issue`, `/code-review` |

## Detailed scenarios

### 1. Greenfield SaaS app

You are starting a product with a frontend, API, database migrations, and a small
team. The first risk is not code generation; it is agents inventing architecture
that the team never agreed to.

Use the scaffold to create:

- `BUSINESS_LOGIC.md` for product rules and user-facing invariants.
- ADR templates for database, auth, tenancy, and billing decisions.
- `.scratchpad/` plans for each feature slice.
- `.history/` summaries after shipped work.
- CI and contribution docs if the repository does not already have them.

Suggested flow:

```bash
npx @yarkingulacti/agentic-scaffold --extras ci,contribute,ai-config,onboarding
```

Then use `/to-prd` to capture the product shape, `/to-issues` to split it into
tracer-bullet issues, `/implement` for each slice, and `/code-review` before
merge.

### 2. Existing production web app

You already have code, CI, docs, and conventions. The scaffold should not fight
them. Start with a dry run, inspect conflicts, then add only the missing agentic
layer.

```bash
npx @yarkingulacti/agentic-scaffold --dry-run
npx @yarkingulacti/agentic-scaffold --extras ai-config,rtk
```

Useful additions:

- `.agentic-scaffold/docs/context/` for architecture notes agents should read.
- BM25 memory scripts for searching decisions and prior summaries.
- Tool-specific skill adapters so the same skill names work in Cursor, Claude
  Code, Gemini CLI, Codex, Deep Code, or Grok where supported.
- RTK filters for noisy test/build output.

Use `/diagnose` for hard regressions, `/security-guidance` for auth/input
changes, and `/playwright` for real browser checks.

### 3. Web + mobile + C++/Godot monorepo

A monorepo with web, mobile, and game/native code usually fails at shared
context: each subproject has different build tools, but product language and
release decisions must stay consistent.

```bash
npx @yarkingulacti/agentic-scaffold \
  --languages typescript,dart,kotlin,swift,cpp \
  --extras all
```

Use the scaffold as the cross-cutting layer:

- `BUSINESS_LOGIC.md` names gameplay/product rules once.
- `docs/context/` separates platform notes: web, mobile, Godot/native, backend.
- ADRs record shared choices such as auth, save data, networking, telemetry, and
  asset pipelines.
- `.history/` captures shipped changes that touched multiple targets.
- `.scratchpad/` keeps platform-specific implementation plans near the repo.

Skill pairing:

- `/ubiquitous-language` before splitting product/gameplay terms across teams.
- `/to-issues` to produce platform slices instead of one huge monorepo task.
- `/implement` for each independently testable slice.
- `/handoff` when a feature crosses web, mobile, and C++/Godot boundaries.

### 4. Agency or client handoff

Client work often has the same failure mode: the agency knows the system, the
client receives code, and the operating knowledge disappears. Scaffold before
handoff so future agents and humans inherit the context.

```bash
npx @yarkingulacti/agentic-scaffold --extras onboarding,contribute,ai-config
```

Fill:

- Product rules and non-obvious business exceptions.
- Setup instructions and environment assumptions.
- Support boundaries: what is generated, what is client-owned, what must not be
  changed without approval.
- A final `.history/` summary of delivered work.

Use `/fill-docs` to interview the team, `/weekly` or `/summary` to generate a
compact status report, and `/handoff` before the final delivery call.

### 5. Open-source project

Open-source maintainers need high-signal issues and reviews without forcing every
contributor to know the whole project.

```bash
npx @yarkingulacti/agentic-scaffold --extras ci,contribute,ai-config
```

The scaffold adds contributor-facing files plus local skills that help maintain
quality:

- `/qa` turns user reports into reproducible GitHub issues.
- `/issue` creates tracker issues with matching scratchpad detail.
- `/code-review` reviews diffs with confidence-scored findings.
- `/rollback-drill` practices recovery before risky releases.

### 6. Legacy modernization

For a mature codebase, do not begin by rewriting. Begin by making the implicit
system explicit.

```bash
npx @yarkingulacti/agentic-scaffold --extras ai-config,rtk
```

Use the scaffold to collect:

- Current architecture and known seams.
- Build/test commands that actually work.
- Risky areas and ownership notes.
- Previous migration attempts in `.history/`.
- Incremental refactor candidates in `.scratchpad/`.

Use `/diagnose` to understand current failures, `/refactoring` only after tests
are green, and `/improve-codebase-architecture` for larger module-boundary work.

### 7. Security-sensitive product

For auth, billing, healthcare, finance, internal admin panels, or anything with
private data, agents need explicit review rails.

```bash
npx @yarkingulacti/agentic-scaffold --extras ci,contribute,ai-config
```

Recommended practice:

- Document trust boundaries and sensitive data in `BUSINESS_LOGIC.md` and
  `docs/context/`.
- Record security-relevant decisions as ADRs.
- Use contribution docs and PR templates to require tests and review notes.
- Run `/security-guidance` on changes touching auth, input parsing, file paths,
  deserialization, secrets, IDs, permissions, or outbound requests.

Pair `/security-guidance` with `/code-review` before merge, then capture risky
release notes with `/handoff`.

### 8. AI tool, agent, or MCP server

Agent-facing platforms need especially clear tool contracts because small schema
mistakes become LLM failure modes.

```bash
npx @yarkingulacti/agentic-scaffold --extras ai-config,onboarding,contribute
```

Use:

- `/mcp-builder` for tool names, schemas, annotations, pagination, and evals.
- `/tdd` for schema and behavior tests.
- `/code-review` for diff review.
- `/claude-mem` or the generated memory scripts for continuity across sessions.

### 9. Documentation rescue

If a project has code but weak docs, scaffold the structure and let `/fill-docs`
interview the maintainer instead of inventing domain facts.

```bash
npx @yarkingulacti/agentic-scaffold --extras ai-config
```

Fill in this order:

1. `BUSINESS_LOGIC.md` — product rules and domain terms.
2. `docs/context/` — architecture, integrations, environments.
3. ADRs — decisions that explain why the current shape exists.
4. `.history/` — what changed and when.

Use `/ubiquitous-language` first when terminology is messy, then `/fill-docs`,
then `/summary` to produce a compact project overview.

### 10. Incident follow-up

After a production incident, the useful artifact is not just the patch. It is the
repro, root cause, prevention, and rollback path.

```bash
npx @yarkingulacti/agentic-scaffold --extras ai-config,rtk
```

Use:

- `/diagnose` to reproduce and isolate the failure.
- `/bugfix` for the smallest real fix plus regression coverage.
- `.history/` for the final incident summary.
- `/handoff` when another engineer or agent must continue the work.
- `/monthly` to roll repeated incidents into trend notes.

### 11. Solo founder product

A solo founder switches between product, engineering, support, and investor
updates. The risk is context loss between intense sessions.

```bash
npx @yarkingulacti/agentic-scaffold --extras ai-config,onboarding
```

Use `BUSINESS_LOGIC.md` for pricing, customer promises, and non-negotiable UX
rules. Keep `.scratchpad/` for one active bet at a time, then close each shipped
slice into `.history/`. `/today` turns the backlog into a daily plan, `/status`
checks drift against the roadmap, and `/summary` creates a compact all-time brief
when you need to re-enter the work after a break.

### 12. Enterprise platform team

Platform teams serve many application teams. Their real product is stable
contracts: commands, templates, deployment rules, and migration paths.

```bash
npx @yarkingulacti/agentic-scaffold --extras ci,contribute,onboarding,ai-config
```

Use ADRs for supported patterns and deprecation windows. Put ownership,
escalation, and compatibility rules in `docs/context/`. Use `/grill-me` before
publishing a new standard, `/to-issues` to slice migrations by consumer, and
`/weekly` to publish progress without forcing every stakeholder into the repo.

### 13. Regulated fintech or healthcare

Regulated projects need a visible trail for decisions and review, even when the
code change is small.

```bash
npx @yarkingulacti/agentic-scaffold --extras ci,contribute,ai-config
```

Use the scaffold to record data categories, retention rules, audit expectations,
and third-party integrations. Pair `/security-guidance` with `/code-review` for
changes touching permissions, identifiers, exports, reporting, billing, or PHI/PII.
Run `/rollback-drill` before migrations and use `/handoff` to capture release
risk, verification, and follow-up ownership.

### 14. Data or ML pipeline repo

Data repositories often break through silent schema drift, flaky jobs, and
missing experiment context.

```bash
npx @yarkingulacti/agentic-scaffold --languages python,typescript --extras ai-config,rtk
```

Document data sources, refresh cadence, quality gates, and model/report consumers
in `docs/context/`. Use `.history/` for experiment summaries that should survive
notebook churn. Use `/diagnose` for failing jobs, `/tdd` for parser/transform
invariants, `/summary` for project state, and `/monthly` for trend reporting.

### 15. Desktop or Electron app

Desktop apps mix web UI, local files, installers, OS permissions, and release
channels. Agents need those boundaries explicit.

```bash
npx @yarkingulacti/agentic-scaffold --languages typescript,rust --extras ci,ai-config,onboarding
```

Put update channels, filesystem locations, IPC boundaries, and installer notes in
`docs/context/`. Use `/playwright` for renderer flows, `/bugfix` for OS-specific
regressions, `/code-review` before releases, and `/handoff` when a bug depends on
a machine another maintainer owns.

### 16. Game studio repository

Game repos accumulate engine scripts, native plugins, assets, tools, and gameplay
rules. The shared language matters more than any one build target.

```bash
npx @yarkingulacti/agentic-scaffold --languages cpp,csharp,gdscript --extras ai-config,onboarding
```

Use `/ubiquitous-language` to define gameplay terms, currencies, progression,
entities, and save-data rules. Record engine/native boundaries and asset-pipeline
ADRs. Slice features with `/to-issues` so art, gameplay, backend, and native work
can move independently, then use `/weekly` to summarize cross-discipline status.

### 17. Design system or UI kit

A design system fails when every component has a different reason for existing.
The scaffold gives agents one place to find intent and review standards.

```bash
npx @yarkingulacti/agentic-scaffold --extras ai-config,contribute
```

Document tokens, accessibility rules, browser support, and release policy. Use
`/frontend-design` before adding a new component family, `/playwright` for visual
and interaction checks, and `/code-review` for API consistency and regressions.

### 18. Internal tools or admin panel

Internal tools look low risk until an agent changes permissions, exports, or a
bulk action. Treat them as security-sensitive products with operational context.

```bash
npx @yarkingulacti/agentic-scaffold --extras ci,ai-config,rtk
```

Record roles, approval flows, audit logs, destructive actions, and support playbooks.
Use `/security-guidance` for permission or data-export work, `/bugfix` for support
escalations, and `/diagnose` when a background job or admin workflow behaves
inconsistently.

### 19. API, SDK, or library project

Public libraries need compatibility discipline. Agents must know which behavior is
contract and which internals may change.

```bash
npx @yarkingulacti/agentic-scaffold --extras ci,contribute,ai-config
```

Use ADRs for breaking-change policy, versioning, supported runtimes, and generated
client behavior. Use `/tdd` for contract tests, `/code-review` for API surface
changes, `/issue` for reproducible consumer reports, and `/summary` before a
release train.

### 20. Education or research lab repo

Research repos need reproducibility and onboarding more than polish. New students
or collaborators should not depend on oral history.

```bash
npx @yarkingulacti/agentic-scaffold --extras onboarding,ai-config
```

Use `/fill-docs` to capture setup, datasets, expected outputs, hardware
assumptions, and paper/experiment links. Use `/today` and `/weekly` for lab work
planning, then `/summary` to produce a durable project overview for the next
cohort.

### 21. Hackathon prototype becoming real

A hackathon repo usually has working code and missing decisions. Scaffold before
people start layering production assumptions on top.

```bash
npx @yarkingulacti/agentic-scaffold --extras all
```

Capture what is intentionally temporary, what must be rewritten, and what already
has users. Use `/grill-me` to stress-test the product idea, `/to-prd` and
`/to-issues` to turn the prototype into slices, and `/implement` only after the
first real boundaries are written down.

### 22. Acquisition or due-diligence review

When reviewing a repo you do not own yet, start with a dry run. Do not write
files until you understand the project's current conventions.

```bash
npx @yarkingulacti/agentic-scaffold --dry-run
npx @yarkingulacti/agentic-scaffold --extras ai-config,rtk
```

Use `/fill-docs` to interview maintainers, `/diagnose` to reproduce known risks,
`/security-guidance` for sensitive areas, and `/summary` to produce a concise
technical-risk brief. Keep findings in `.scratchpad/` and promote confirmed facts
into `docs/context/`.

### 23. Cloud migration or platform move

Migrations fail when rollback, verification, and ownership are implicit.

```bash
npx @yarkingulacti/agentic-scaffold --extras ci,contribute,ai-config,rtk
```

Use ADRs for target architecture, staged cutover, data movement, and observability.
Use `/to-issues` for reversible slices, `/diagnose` for parity failures,
`/rollback-drill` before high-risk steps, and `/handoff` at every operator
boundary.

### 24. Multi-agent QA sprint

A QA sprint with several agents needs shared definitions of done and a place for
findings that outlive chat.

```bash
npx @yarkingulacti/agentic-scaffold --extras ai-config,rtk
```

Use `.scratchpad/` for test charters, `.history/` for final QA summaries, and the
memory index to search repeated findings. `/qa` turns reports into issues,
`/playwright` checks real browser flows, `/issue` files durable work, and
`/code-review` verifies fixes before merge.

## Choosing extras by situation

| Situation | Extras |
|---|---|
| Existing repo, minimal footprint | none, then add `ai-config` only if you want skill commands |
| Team project | `contribute,onboarding` |
| CI missing or inconsistent | `ci` |
| Cursor/Claude/Gemini/Codex skill command support | `ai-config` |
| Noisy shell output in agent sessions | `rtk` |
| New project or full standardization | `all` |

## How this connects to skills

The scaffold writes skills into the project; the wiki pages explain how to invoke
and choose them:

- **[AI Skill Commands](AI-Skill-Commands)** — which clients support local command
  adapters and where generated files go.
- **[AI Skills](AI-Skills)** — the full skill catalog and scenario examples.
- **[Components & Extras](Components-and-Extras)** — which scaffold pieces are
  core and which require `--extras`.
