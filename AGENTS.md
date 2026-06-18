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
  skills/              23 agent skills (bugfix, tdd, implement, handoff, …)
  hooks/               4 lifecycle hooks (pre/post feature/bugfix/session)
  scripts/             Memory indexing pipeline (Node.js .mjs)
tests/                 Node.js built-in test runner (node:test)
docs/plans/            Design documents and roadmaps
```

## Commands

| Command | What it does |
|---------|-------------|
| `pnpm install` | Install dependencies (pnpm is the package manager) |
| `pnpm run build` | Compile TypeScript to `dist/` |
| `pnpm test` | Run all tests (node --import tsx) |
| `pnpm run typecheck` | TypeScript type checking (--noEmit) |
| `pnpm run lint` | Biome lint check |
| `pnpm run format` | Biome format + write |
| `pnpm run format:check` | Biome CI format check |
| `pnpm run validate-skills` | Validate skill frontmatter against schema |
| `pnpm run validate-templates` | Validate template variables/partials + no HTML-escape leaks |
| `UPDATE_GOLDEN=1 pnpm test` | Regenerate `tests/fixtures/*/expected/` golden output |
| `pnpm run release` | Bump version, generate changelog, commit, tag, sync wiki |
| `pnpm run sync-wiki` | Render `docs/wiki/` and push to the GitHub wiki |
| `rtk gain` | Show token savings from RTK-filtered command output |
| `rtk verify` | Verify RTK hook and project-local `.rtk/filters.toml` |

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

## Token-cost workflow

This repo carries `.rtk/filters.toml` for project-local RTK filters. Use RTK for
high-volume shell output (`rtk git status`, `rtk git diff`, `rtk pnpm test`,
`rtk gain`) when a dedicated harness tool is not required. Keep file reads,
searches, and edits on the specialized tools in agent harnesses that provide
them.

## Why no .agentic-scaffold/ here?

This project *generates* `.agentic-scaffold/` for other projects. It doesn't
scaffold itself — that would be recursive. If you want to see what it produces,
run it on a test directory.
