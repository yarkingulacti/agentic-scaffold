# Real-life use cases

`agentic-scaffold` is useful when the repository needs durable context before an
AI agent starts changing code. The scaffold is intentionally boring: docs,
skills, hooks, scratchpads, history, memory search, and optional tool adapters.
The value comes from applying that baseline to real workflows.

## Scenario index

| Scenario | Run | What the scaffold adds | Skill examples |
|---|---|---|---|
| Greenfield SaaS app | `npx @yarkingulacti/agentic-scaffold --extras ci,contribute,ai-config,onboarding` | Architecture docs, ADRs, CI, PR templates, onboarding, slash commands | `/to-prd`, `/to-issues`, `/implement`, `/code-review` |
| Existing production web app | `npx ... --dry-run` then `npx ... --extras ai-config,rtk` | Non-destructive docs, memory index, local skill adapters, token filters | `/bugfix`, `/diagnose`, `/security-guidance`, `/playwright` |
| Web + mobile + C++/Godot monorepo | `npx ... --languages typescript,dart,kotlin,swift,cpp --extras all` | Shared repo memory, language-aware context, CI/contribution docs, project-wide lifecycle hooks | `/ubiquitous-language`, `/to-issues`, `/implement`, `/handoff` |
| Agency/client handoff | `npx ... --extras onboarding,contribute` | Human onboarding, setup helper, contribution guide, decision records | `/fill-docs`, `/weekly`, `/summary`, `/handoff` |
| Open-source project | `npx ... --extras ci,contribute,ai-config` | Contributor guide, PR template, review guidance, skill commands | `/qa`, `/issue`, `/code-review`, `/rollback-drill` |
| Legacy modernization | `npx ... --extras ai-config,rtk` | Context docs, scratchpads, history, BM25 memory search, low-noise shell output | `/diagnose`, `/refactoring`, `/improve-codebase-architecture` |
| Security-sensitive product | `npx ... --extras ci,contribute,ai-config` | Review guidance, lifecycle hooks, security review skill access | `/security-guidance`, `/code-review`, `/rollback-drill` |
| AI/MCP platform work | `npx ... --extras ai-config,onboarding` | Agent instructions, local command adapters, architecture docs | `/mcp-builder`, `/tdd`, `/code-review`, `/claude-mem` |
| Documentation rescue | `npx ... --extras ai-config` | Fillable product/engineering docs plus `/fill-docs` adapters | `/fill-docs`, `/ubiquitous-language`, `/summary` |
| Incident follow-up | `npx ... --extras ai-config,rtk` | Timeline-friendly history, scratchpad investigation notes, searchable Markdown | `/diagnose`, `/bugfix`, `/handoff`, `/monthly` |

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
