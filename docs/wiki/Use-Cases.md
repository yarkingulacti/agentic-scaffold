# Real-life use cases

`agentic-scaffold` is useful when a repository needs durable context before an
AI agent starts changing code. The scaffold is intentionally boring: docs,
skills, hooks, scratchpads, history, memory search, and optional tool adapters.
The value comes from applying that baseline to real workflows.

Use this page as a field guide. Each scenario names the operational problem, the
safe scaffold command, what to fill first, which generated skills to invoke, and
what a good handoff looks like.

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

## What to fill first

| Scaffold artifact | Fill with | Good enough when |
|---|---|---|
| `BUSINESS_LOGIC.md` | Domain language, invariants, customer promises, policy exceptions, sensitive workflows | A new agent can tell which behavior is product-critical and which behavior is incidental implementation detail |
| `docs/context/` | Architecture, integrations, environments, deployment paths, ownership, local commands | A new agent can choose the right subsystem and test command without guessing |
| `docs/adr/` | Decisions that explain why the current shape exists | A future maintainer can avoid reopening settled tradeoffs |
| `.scratchpad/` | Active plans, investigations, QA charters, migration slices | Work in progress is discoverable without polluting permanent docs |
| `.history/` | Shipped changes, incident summaries, release notes, handoffs | Memory search can answer what changed, why, and what remains risky |
| Generated skill adapters | Local commands for supported clients | Agents can invoke the same workflow by name across Cursor, Claude Code, Gemini CLI, Codex, Deep Code, or Grok where supported |

## Detailed scenarios

### 1. Greenfield SaaS app

You are starting a product with a frontend, API, database migrations, billing,
auth, and a small team. The first risk is not code generation; it is agents
inventing architecture that the team never agreed to.

```bash
npx @yarkingulacti/agentic-scaffold --extras ci,contribute,ai-config,onboarding
```

Use the scaffold to create:

- `BUSINESS_LOGIC.md` for product rules, pricing promises, tenancy boundaries,
  entitlement logic, and user-facing invariants.
- ADRs for database, auth, tenancy, billing, deployment, feature flags, and email
  delivery decisions.
- `.scratchpad/` plans for each thin feature slice.
- `.history/` summaries after each shipped feature.
- CI, contribution docs, and onboarding docs if the repository does not already
  have them.

Recommended workflow:

1. Run `/to-prd` to capture the product shape and non-goals.
2. Run `/to-issues` to split the PRD into tracer-bullet issues: one end-to-end
   path per issue, not one layer per issue.
3. Run `/implement` on one issue at a time.
4. Run `/code-review` before merge and record any architectural decisions as ADRs.
5. Close the shipped slice with `/handoff` or a `.history/` summary.

A good result: a new agent can answer "how does billing/tenancy/auth work?" from
project docs before touching code, and every shipped slice leaves searchable
history behind.

### 2. Existing production web app

You already have code, CI, docs, and conventions. The scaffold should not fight
them. Start with a dry run, inspect conflicts, then add only the missing agentic
layer.

```bash
npx @yarkingulacti/agentic-scaffold --dry-run
npx @yarkingulacti/agentic-scaffold --extras ai-config,rtk
```

Use the scaffold for:

- `docs/context/` notes that explain current architecture, known seams, and
  deployment constraints.
- BM25 memory scripts for searching decisions, incidents, and prior summaries.
- Tool-specific skill adapters so the same workflow names work in supported AI
  clients.
- RTK filters for noisy build/test output during agent sessions.

Recommended workflow:

1. Dry-run first and review every would-write / would-skip line.
2. Fill `docs/context/architecture.md` with the current shape, not the desired
   rewrite.
3. Use `/diagnose` for hard regressions and `/bugfix` for the smallest real fix.
4. Use `/security-guidance` for auth, input handling, file paths, IDs,
   deserialization, secrets, or outbound requests.
5. Use `/playwright` for browser behavior that unit tests cannot prove.

A good result: agents add code through existing conventions instead of inventing
a parallel architecture.

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
- `docs/context/` separates platform notes: web, mobile, Godot/native, backend,
  tooling, release, and shared contracts.
- ADRs record shared choices such as auth, save data, networking, telemetry,
  asset pipelines, and backwards compatibility.
- `.scratchpad/` keeps platform-specific implementation plans near the repo.
- `.history/` captures shipped changes that touched multiple targets.

Recommended workflow:

1. `/ubiquitous-language` before splitting product/gameplay terms across teams.
2. `/to-issues` to produce platform slices instead of one huge monorepo task.
3. `/implement` for each independently testable slice.
4. `/handoff` when a feature crosses web, mobile, and C++/Godot boundaries.

A good result: a feature can cross platforms without every agent rediscovering
product vocabulary, build commands, and release coupling.

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
- Support boundaries: what is generated, what is client-owned, and what must not
  be changed without approval.
- A final `.history/` summary of delivered work.
- Known risks, credentials handoff boundaries, deployment ownership, and support
  escalation rules.

Recommended workflow:

1. Run `/fill-docs` while the agency team is still available.
2. Use `/weekly` or `/summary` to generate a compact project report.
3. Use `/handoff` before the final delivery call.
4. Leave the next maintainer with commands, not tribal memory.

A good result: the client can ask an agent to make a change months later and the
agent can find the domain rules, setup commands, and support boundaries locally.

### 5. Open-source project

Open-source maintainers need high-signal issues and reviews without forcing every
contributor to know the whole project.

```bash
npx @yarkingulacti/agentic-scaffold --extras ci,contribute,ai-config
```

Use the scaffold for:

- Contribution rules and PR expectations.
- Issue triage labels and reproduction standards.
- `.scratchpad/` details for accepted issues.
- `.history/` release and maintenance summaries.
- Skill commands for repeatable issue intake and review.

Recommended workflow:

1. `/qa` turns user reports into reproducible GitHub issues.
2. `/issue` creates tracker issues with matching `.scratchpad/` detail.
3. `/code-review` reviews diffs with confidence-scored findings.
4. `/rollback-drill` practices recovery before risky releases.
5. `/summary` keeps maintainers aligned after bursts of community activity.

A good result: drive-by contributions can follow the same repo-local workflow as
maintainer-written changes.

### 6. Legacy modernization

For a mature codebase, do not begin by rewriting. Begin by making the implicit
system explicit.

```bash
npx @yarkingulacti/agentic-scaffold --extras ai-config,rtk
```

Use the scaffold to collect:

- Current architecture and known seams.
- Build/test commands that actually work.
- Risky areas, owners, and release constraints.
- Previous migration attempts in `.history/`.
- Incremental refactor candidates in `.scratchpad/`.

Recommended workflow:

1. Use `/diagnose` to understand current failures before proposing structure
   changes.
2. Add tests around behavior that modernization might disturb.
3. Use `/refactoring` only after tests are green.
4. Use `/improve-codebase-architecture` for larger module-boundary work.
5. Record each accepted migration choice as an ADR.

A good result: modernization becomes a sequence of verified, documented cuts
instead of an agent-led rewrite.

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
  deserialization, secrets, IDs, permissions, exports, or outbound requests.

Recommended workflow:

1. Use `/security-guidance` while the diff is still small.
2. Pair it with `/code-review` before merge.
3. Use `/rollback-drill` for migrations and permission changes.
4. Capture risky release notes with `/handoff`.

A good result: the security model is documented as an invariant, not rediscovered
from code after an incident.

### 8. AI tool, agent, or MCP server

Agent-facing platforms need especially clear tool contracts because small schema
mistakes become LLM failure modes.

```bash
npx @yarkingulacti/agentic-scaffold --extras ai-config,onboarding,contribute
```

Use the scaffold for:

- Tool contracts, schemas, names, examples, error handling, and pagination rules.
- ADRs for transport choices, auth, rate limits, and model-facing semantics.
- `.scratchpad/` evaluation plans.
- `.history/` release notes and breaking-change summaries.

Recommended workflow:

1. Use `/mcp-builder` for tool names, schemas, annotations, pagination, and evals.
2. Use `/tdd` for schema and behavior tests.
3. Use `/code-review` for diff review.
4. Use `/claude-mem` or the generated memory scripts for continuity across
   sessions.

A good result: another agent can read the repo and correctly call the generated
tools without a maintainer narrating hidden constraints.

### 9. Documentation rescue

If a project has code but weak docs, scaffold the structure and let `/fill-docs`
interview the maintainer instead of inventing domain facts.

```bash
npx @yarkingulacti/agentic-scaffold --extras ai-config
```

Fill in this order:

1. `BUSINESS_LOGIC.md` — product rules and domain terms.
2. `docs/context/` — architecture, integrations, environments, ownership, local
   commands, and deployment constraints.
3. ADRs — decisions that explain why the current shape exists.
4. `.history/` — what changed and when.

Recommended workflow:

1. Use `/ubiquitous-language` first when terminology is messy.
2. Use `/fill-docs` to interview the maintainer.
3. Use `/summary` to produce a compact project overview.
4. Re-run the memory index after filling Markdown so future searches work.

A good result: the docs state what the code cannot prove: intent, tradeoffs,
ownership, and domain rules.

### 10. Incident follow-up

After a production incident, the useful artifact is not just the patch. It is the
repro, root cause, prevention, and rollback path.

```bash
npx @yarkingulacti/agentic-scaffold --extras ai-config,rtk
```

Use the scaffold for:

- `.scratchpad/` investigation notes and timelines.
- `.history/` incident summaries.
- `docs/context/` updates for changed operational assumptions.
- ADRs for prevention decisions.
- RTK filters for large logs and noisy test output.

Recommended workflow:

1. `/diagnose` to reproduce and isolate the failure.
2. `/bugfix` for the smallest real fix plus regression coverage.
3. `/handoff` when another engineer or agent must continue the work.
4. `/monthly` to roll repeated incidents into trend notes.
5. Update `BUSINESS_LOGIC.md` when the incident exposed a product invariant.

A good result: the next incident starts from known facts instead of a blank chat.

### 11. Solo founder product

A solo founder switches between product, engineering, support, and investor
updates. The risk is context loss between intense sessions.

```bash
npx @yarkingulacti/agentic-scaffold --extras ai-config,onboarding
```

Use the scaffold for:

- `BUSINESS_LOGIC.md` pricing, customer promises, target user, and non-negotiable
  UX rules.
- `.scratchpad/` for one active bet at a time.
- `.history/` for shipped slices and important decisions.
- Onboarding notes that let a contractor or future agent join without a briefing.

Recommended workflow:

1. `/to-prd` before building a new product bet.
2. `/today` to turn the backlog into a daily plan.
3. `/status` to check drift against the roadmap.
4. `/summary` when re-entering the work after a break.

A good result: product intent survives the founder's context switches.

### 12. Enterprise platform team

Platform teams serve many application teams. Their real product is stable
contracts: commands, templates, deployment rules, and migration paths.

```bash
npx @yarkingulacti/agentic-scaffold --extras ci,contribute,onboarding,ai-config
```

Use the scaffold for:

- ADRs that define supported patterns and deprecation windows.
- `docs/context/` ownership, escalation, compatibility, migration, and release
  rules.
- `.scratchpad/` rollout plans by consumer team.
- `.history/` weekly progress and stakeholder summaries.

Recommended workflow:

1. `/grill-me` before publishing a new standard.
2. `/to-issues` to slice migrations by consumer.
3. `/code-review` to keep platform contracts consistent.
4. `/weekly` to publish progress without forcing every stakeholder into the repo.

A good result: platform changes arrive with migration paths, owners, and
compatibility boundaries already documented.

### 13. Regulated fintech or healthcare

Regulated projects need a visible trail for decisions and review, even when the
code change is small.

```bash
npx @yarkingulacti/agentic-scaffold --extras ci,contribute,ai-config
```

Use the scaffold for:

- Data categories, retention rules, audit expectations, and third-party
  integrations.
- ADRs for controls, reporting, permissions, and operational tradeoffs.
- `.history/` release evidence and review summaries.
- Contribution docs that state verification expectations.

Recommended workflow:

1. `/security-guidance` for permissions, identifiers, exports, reporting,
   billing, PHI, PII, or audit-log changes.
2. `/code-review` before merge.
3. `/rollback-drill` before migrations.
4. `/handoff` to capture release risk, verification, and follow-up ownership.

A good result: compliance-relevant intent is visible in repo history and docs,
not buried in chat.

### 14. Data or ML pipeline repo

Data repositories often break through silent schema drift, flaky jobs, and
missing experiment context.

```bash
npx @yarkingulacti/agentic-scaffold --languages python,typescript --extras ai-config,rtk
```

Use the scaffold for:

- `docs/context/` data sources, refresh cadence, quality gates, model/report
  consumers, scheduling, and ownership.
- `.scratchpad/` experiment plans and incident investigations.
- `.history/` experiment summaries that survive notebook churn.
- RTK filters for long logs and test output.

Recommended workflow:

1. `/diagnose` for failing jobs or unexpected metrics.
2. `/tdd` for parser, transform, schema, and edge-value invariants.
3. `/summary` for current project state.
4. `/monthly` for trend reporting across runs.

A good result: agents can distinguish expected data variation from pipeline
breakage.

### 15. Desktop or Electron app

Desktop apps mix web UI, local files, installers, OS permissions, IPC, and
release channels. Agents need those boundaries explicit.

```bash
npx @yarkingulacti/agentic-scaffold --languages typescript,rust --extras ci,ai-config,onboarding
```

Use the scaffold for:

- Update channels, filesystem locations, IPC boundaries, installer notes, crash
  reporting, and OS-specific behavior.
- ADRs for native modules, permissions, and update strategy.
- `.scratchpad/` reproduction notes for machine-specific bugs.
- `.history/` release and rollback summaries.

Recommended workflow:

1. `/playwright` for renderer flows.
2. `/bugfix` for OS-specific regressions.
3. `/code-review` before releases.
4. `/handoff` when a bug depends on a machine another maintainer owns.

A good result: agents know where UI code ends, native code begins, and which
machine-specific assumptions matter.

### 16. Game studio repository

Game repos accumulate engine scripts, native plugins, assets, tools, and gameplay
rules. The shared language matters more than any one build target.

```bash
npx @yarkingulacti/agentic-scaffold --languages cpp,csharp,gdscript --extras ai-config,onboarding
```

Use the scaffold for:

- Gameplay vocabulary, progression, economy, save-data, balancing, and platform
  rules.
- Engine/native boundaries and asset-pipeline ADRs.
- `.scratchpad/` feature plans split across art, gameplay, backend, and tools.
- `.history/` milestone summaries.

Recommended workflow:

1. `/ubiquitous-language` to define gameplay terms.
2. `/to-issues` to split cross-discipline work.
3. `/implement` for independently testable slices.
4. `/weekly` to summarize cross-discipline status.

A good result: agents do not rename gameplay concepts or break save-data rules
because the shared language is explicit.

### 17. Design system or UI kit

A design system fails when every component has a different reason for existing.
The scaffold gives agents one place to find intent and review standards.

```bash
npx @yarkingulacti/agentic-scaffold --extras ai-config,contribute
```

Use the scaffold for:

- Token definitions, accessibility rules, browser support, release policy, and
  component API principles.
- ADRs for breaking changes and visual language decisions.
- `.scratchpad/` component proposals.
- `.history/` release summaries and migration notes.

Recommended workflow:

1. `/frontend-design` before adding a new component family.
2. `/playwright` for visual and interaction checks.
3. `/code-review` for API consistency and regressions.
4. `/summary` before a major release.

A good result: component additions remain coherent with design intent,
accessibility rules, and public API policy.

### 18. Internal tools or admin panel

Internal tools look low risk until an agent changes permissions, exports, or a
bulk action. Treat them as security-sensitive products with operational context.

```bash
npx @yarkingulacti/agentic-scaffold --extras ci,ai-config,rtk
```

Use the scaffold for:

- Roles, approval flows, audit logs, destructive actions, exports, and support
  playbooks.
- `BUSINESS_LOGIC.md` for operational invariants: who may do what, when, and why.
- `.history/` support escalation and incident summaries.
- RTK filters for noisy job logs.

Recommended workflow:

1. `/security-guidance` for permission, export, impersonation, or destructive
   action changes.
2. `/bugfix` for support escalations.
3. `/diagnose` when a background job or admin workflow behaves inconsistently.
4. `/handoff` after fixing operational incidents.

A good result: agents treat admin workflows as privileged production code, not
throwaway back office UI.

### 19. API, SDK, or library project

Public libraries need compatibility discipline. Agents must know which behavior is
contract and which internals may change.

```bash
npx @yarkingulacti/agentic-scaffold --extras ci,contribute,ai-config
```

Use the scaffold for:

- Public contract docs, versioning policy, supported runtimes, generated client
  behavior, and compatibility promises.
- ADRs for breaking-change decisions.
- `.scratchpad/` issue reproduction and design notes.
- `.history/` release-train summaries.

Recommended workflow:

1. `/tdd` for contract tests.
2. `/code-review` for API surface changes.
3. `/issue` for reproducible consumer reports.
4. `/summary` before a release train.

A good result: agents can change internals aggressively while preserving the
public contract.

### 20. Education or research lab repo

Research repos need reproducibility and onboarding more than polish. New students
or collaborators should not depend on oral history.

```bash
npx @yarkingulacti/agentic-scaffold --extras onboarding,ai-config
```

Use the scaffold for:

- Setup instructions, datasets, expected outputs, hardware assumptions, papers,
  experiment links, and lab conventions.
- `.scratchpad/` experiment plans.
- `.history/` results and interpretation summaries.
- Onboarding docs for new students or collaborators.

Recommended workflow:

1. `/fill-docs` to capture setup and reproducibility details.
2. `/today` for lab work planning.
3. `/weekly` for research progress summaries.
4. `/summary` for durable project overviews.

A good result: the next cohort can reproduce the work without reverse-engineering
old notebooks and chat logs.

### 21. Hackathon prototype becoming real

A hackathon repo usually has working code and missing decisions. Scaffold before
people start layering production assumptions on top.

```bash
npx @yarkingulacti/agentic-scaffold --extras all
```

Use the scaffold for:

- Capturing what is intentionally temporary, what must be rewritten, and what
  already has users.
- First ADRs for auth, data, deployment, and product scope.
- `.scratchpad/` stabilization plans.
- Contribution and onboarding docs before more people join.

Recommended workflow:

1. `/grill-me` to stress-test the product idea.
2. `/to-prd` to capture the real product shape.
3. `/to-issues` to turn the prototype into slices.
4. `/implement` only after the first real boundaries are written down.

A good result: the prototype becomes a product through explicit decisions, not
accidental hardening of hackathon shortcuts.

### 22. Acquisition or due-diligence review

When reviewing a repo you do not own yet, start with a dry run. Do not write
files until you understand the project's current conventions.

```bash
npx @yarkingulacti/agentic-scaffold --dry-run
npx @yarkingulacti/agentic-scaffold --extras ai-config,rtk
```

Use the scaffold for:

- Architecture and risk notes.
- `.scratchpad/` findings before promoting confirmed facts.
- `docs/context/` confirmed technical constraints.
- `.history/` review summaries.
- RTK filters for large audit outputs.

Recommended workflow:

1. `/fill-docs` to interview maintainers.
2. `/diagnose` to reproduce known risks.
3. `/security-guidance` for sensitive areas.
4. `/summary` to produce a concise technical-risk brief.

A good result: the review separates verified facts from assumptions and leaves a
repo-local paper trail.

### 23. Cloud migration or platform move

Migrations fail when rollback, verification, and ownership are implicit.

```bash
npx @yarkingulacti/agentic-scaffold --extras ci,contribute,ai-config,rtk
```

Use the scaffold for:

- ADRs for target architecture, staged cutover, data movement, observability,
  rollback, and cost tradeoffs.
- `.scratchpad/` migration slices and parity checks.
- `.history/` cutover summaries.
- `docs/context/` owner and operator notes.

Recommended workflow:

1. `/to-issues` for reversible slices.
2. `/diagnose` for parity failures.
3. `/rollback-drill` before high-risk steps.
4. `/handoff` at every operator boundary.

A good result: every migration step has a rollback story and a verification path.

### 24. Multi-agent QA sprint

A QA sprint with several agents needs shared definitions of done and a place for
findings that outlive chat.

```bash
npx @yarkingulacti/agentic-scaffold --extras ai-config,rtk
```

Use the scaffold for:

- `.scratchpad/` test charters.
- `.history/` final QA summaries.
- Memory indexing for repeated findings.
- Skill commands for intake, browser checks, and reviews.

Recommended workflow:

1. `/qa` turns reports into issues.
2. `/playwright` checks real browser flows.
3. `/issue` files durable work.
4. `/code-review` verifies fixes before merge.
5. `/summary` closes the sprint with what was tested, fixed, deferred, and still
   risky.

A good result: QA findings become durable work items and regression knowledge,
not one-off chat messages.

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
