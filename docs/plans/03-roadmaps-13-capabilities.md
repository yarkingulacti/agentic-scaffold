# Roadmaps for 13 New Capabilities

The 13 gaps cluster into 5 roadmap themes. Each roadmap has phases.

---

## Roadmap 1: CI Providers

**Decision:** Start with GitHub Actions. Provider selection is a scaffold-time
option for future expansion.

### Phases

| Phase | What | Files | Effort |
|-------|------|-------|--------|
| 1 | GitHub Actions workflows + Dependabot config + agent-facing CI doc | `templates/ci/github/ci.yml.hbs`, `dependabot.yml.hbs`, `templates/docs/agents/ci.md.hbs` | Med |
| 2 | Provider abstraction — `--ci-provider` flag, config map | `src/scaffold.js`, `src/prompts.js` | Med |
| 3 | GitLab CI templates | `templates/ci/gitlab/` | Med |
| 4 | CircleCI templates | `templates/ci/circleci/` | Med |

---

## Roadmap 2: Memory Pipeline Language

**Decision:** Docker wrapper first, Node.js/TS port as optional alternative.

### Phases

| Phase | What | Files | Effort |
|-------|------|-------|--------|
| 1 | Dockerfile wrapping Python scripts, same CLI interface | `templates/scripts/Dockerfile.hbs` + `memory-docker.sh.hbs` | Small |
| 2 | `--script-language` flag (python | docker | node) | `bin/index.js`, `src/prompts.js` | Small |
| 3 | Node.js/TS port (memory_index.ts, memory_search.ts, etc.) | `templates/scripts/*.ts` + `package.json.hbs` | Large |
| 4 | Auto-detect preferred script language from project files | Heuristic in `scaffold.js` | Small |

---

## Roadmap 3: AI Tools Config Files

**Decision:** Ship opencode, Cursor, Copilot configs. Select via `--ai-tools`.

### Phases

| Phase | What | Files | Effort |
|-------|------|-------|--------|
| 1 | opencode.json | `templates/root/opencode.json.hbs` | Small |
| 2 | .cursorrules | `templates/root/.cursorrules.hbs` | Small |
| 3 | .copilot-instructions.md | `templates/root/.copilot-instructions.md.hbs` | Small |
| 4 | `--ai-tools` flag + `askAITools()` prompt | `src/scaffold.js`, `src/prompts.js` | Small |
| 5 | Windsurf / Cline / Aider configs (stretch) | `templates/root/` | Small each |

---

## Roadmap 4: New Component Groups (CLI Design)

**Decision:** Hybrid — `--extras` convenience flag + individual `--skip-*` flags.

### Phases

| Phase | What | Files | Effort |
|-------|------|-------|--------|
| 1 | Define 4 new groups in `resolveIncludes()`: ci, contribute, ai-config, onboarding | `src/scaffold.js` | Small |
| 2 | `--extras` flag — shorthand for including extras | `bin/index.js`, `src/scaffold.js` | Small |
| 3 | Individual `--skip-*` flags per group | `bin/index.js`, `src/scaffold.js` | Small |
| 4 | Updated interactive prompt — extras selection step | `src/prompts.js` | Small |
| 5 | Conditionally render AGENTS.md sections per included groups | `templates/root/AGENTS.md.hbs` | Med |

### Flag interaction priority

```
--extras ci,onboarding              → include ci + onboarding only
--only docs --extras ci             → include docs + ci only
--skip-ci --extras all              → include all extras except ci
--skip-ci                            → include all extras except ci
```

---

## Roadmap 5: Migration Conventions

**Decision:** Principles-first (framework-agnostic), then tool-specific templates.

### Phases

| Phase | What | Files | Effort |
|-------|------|-------|--------|
| 1 | Principles doc — workflow, naming, idempotency, rollback, testing | `templates/docs/agents/migrations.md` | Small |
| 2 | Reference in implement skill — "before schema change, read migrations.md" | `templates/skills/implement/SKILL.md` | Small |
| 3 | Tool-agnostic migration template files | `templates/scripts/migrations/` | Small |
| 4 | Detection + tool-specific templates (Alembic, node-pg-migrate, Prisma) | `templates/migrations/` + `src/prompts.js` | Med |
| 5 | Rollback drill skill | `templates/skills/rollback-drill/SKILL.md` | Med |

---

## Recommended Ship Order

```
Sprint 1 (core infrastructure):
  ├── Detection engine + config resolution + --force + --help redesign
  └── write() with skip/overwrite behavior

Sprint 2 (scaffold metadata + fill-docs skill):
  ├── Scaffold info section in AGENTS.md / CLAUDE.md
  ├── fill-docs skill template
  └── Post-scaffold summary with completion checklist

Sprint 3 (interactive mode redesign):
  ├── Show detected profile before prompts
  ├── Pre-fill prompts with detected values
  └── File conflict resolver

Sprint 4 (CI/CD + AI configs):
  ├── GitHub Actions templates + CI doc
  ├── opencode.json, .cursorrules, .copilot-instructions.md
  └── --ai-tools, --ci-provider flags drive template rendering

Sprint 5 (memory pipeline):
  ├── Docker wrapper + --script-language flag
  └── Node.js/TS port (if uptake justifies)

Sprint 6 (migrations + contribution + onboarding):
  ├── Migration principles doc + tool-agnostic templates
  ├── CONTRIBUTING.md + PR template + code review doc
  └── ONBOARDING.md + setup script

Sprint 7 (extras + cleanup):
  ├── --extras flag + new component groups
  ├── Stale doc/scratchpad cleanup scripts
  └── Dependency management + security + observability docs
```
