# agentic-scaffold

A CLI tool that bootstraps AI-agent-friendly documentation, configuration,
skills, and lifecycle hooks into any software project.

## Codebase layout

```
bin/index.ts           CLI entry point (yargs)
src/
  components.ts        Declarative component registry (category, dest, conflict, ownership)
  config.ts            Config types, defaults, config resolution
  detect.ts            Project detection engine (language, CI, AI tools, …)
  fs-utils.ts          File I/O, symlinks, directory walking
  prompts.ts           Interactive prompts (node:readline)
  scaffold.ts          Main orchestrator
  templates.ts         Handlebars template rendering
  ui.ts                Terminal UI (spinner, progress bar, colors)
  unscaffold.ts        Scaffold removal
templates/             Handlebars templates (.hbs) for what gets scaffolded
  root/                AGENTS.md, CLAUDE.md, BUSINESS_LOGIC.md, .gitignore
  docs/                ADR templates, agent docs, CODING_PRINCIPLES, context
  skills/              22 agent skills (bugfix, tdd, implement, handoff, …)
  hooks/               4 lifecycle hooks (pre/post feature/bugfix/session)
  scripts/             Memory indexing pipeline (Python)
tests/                 Node.js built-in test runner (node:test)
docs/plans/            Design documents and roadmaps
```

## Commands

| Command | What it does |
|---------|-------------|
| `npm run build` | Compile TypeScript to `dist/` |
| `npm test` | Run all tests (node --import tsx) |
| `npm run typecheck` | TypeScript type checking (--noEmit) |
| `npm run lint` | Biome lint check |
| `npm run format` | Biome format + write |
| `npm run format:check` | Biome CI format check |
| `npm run validate-skills` | Validate skill frontmatter against schema |
| `npm run validate-templates` | Validate template variables/partials + no HTML-escape leaks |
| `UPDATE_GOLDEN=1 npm test` | Regenerate `tests/fixtures/*/expected/` golden output |
| `npm run release` | Bump version, generate changelog, commit, tag |

## Quick start

```bash
# Run on the current directory
node --import tsx bin/index.ts

# Dry-run preview
node --import tsx bin/index.ts --dry-run

# Interactive mode
node --import tsx bin/index.ts -i

# Help
node --import tsx bin/index.ts --help
```

## Git workflow

See [MEMORY.md](MEMORY.md) for branch naming, commit format, PR workflow, and
release tagging rules. Every PR to master must be accompanied by a SemVer tag.

## Why no .agentic-scaffold/ here?

This project *generates* `.agentic-scaffold/` for other projects. It doesn't
scaffold itself — that would be recursive. If you want to see what it produces,
run it on a test directory.
