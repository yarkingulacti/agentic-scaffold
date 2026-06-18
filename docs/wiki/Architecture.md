# Architecture

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
docs/wiki/             Source for this wiki (rendered + pushed on every release)
```

## Maintainer commands

| Command | What it does |
|---------|--------------|
| `npm run build` | Compile TypeScript to `dist/` |
| `npm test` | Run all tests (`node --import tsx`) |
| `npm run typecheck` | TypeScript type checking (`--noEmit`) |
| `npm run lint` | Biome lint check |
| `npm run format` | Biome format + write |
| `npm run format:check` | Biome CI format check |
| `npm run validate-skills` | Validate skill frontmatter against schema |
| `npm run validate-templates` | Validate template variables/partials + no HTML-escape leaks |
| `UPDATE_GOLDEN=1 npm test` | Regenerate `tests/fixtures/*/expected/` golden output |
| `npm run release` | Bump version, generate changelog, commit, tag, sync wiki |
| `npm run sync-wiki` | Render `docs/wiki/` and push to the GitHub wiki manually |

## How this wiki stays current

The wiki is generated, not hand-edited. Page sources live in `docs/wiki/` with a
`{{VERSION}}` token, and `bin/sync-wiki.mjs` renders them (plus a `Changelog`
page mirrored from `CHANGELOG.md`) and pushes to `*.wiki.git`. The release
tooling runs it automatically on the `posttag` hook, so every version bump
refreshes the wiki. Edit `docs/wiki/` — never the wiki pages directly.
