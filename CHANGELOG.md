# Changelog

All notable changes to this project are documented here.

The format is based on [Keep a Changelog](https://keepachangelog.com/),
and this project adheres to [Semantic Versioning](https://semver.org/).

## [0.13.2](https://github.com/yarkingulacti/agentic-scaffold/compare/v0.13.1...v0.13.2) (2026-06-18)


### Fixed

* **unscaffold:** track root-owned scaffold files ([9fb0ae6](https://github.com/yarkingulacti/agentic-scaffold/commit/9fb0ae62d30a25b02604ac3f9d423feb06c013c2))

## [0.13.1](https://github.com/yarkingulacti/agentic-scaffold/compare/v0.13.0...v0.13.1) (2026-06-18)


### Changed

* derive dry-run previews and progress totals from the component registry
* refresh current-release planning docs and skill counts
* remove ownerless detection fields and document detection ownership

## [0.13.0](https://github.com/yarkingulacti/agentic-scaffold/compare/v0.12.0...v0.13.0) (2026-06-18)


### Changed

* make extras opt-in so zero-config scaffolding stays conservative
* expand `--extras all` to every extras group
* document extras behavior and correct the README skill count

## [0.12.0](https://github.com/yarkingulacti/agentic-scaffold/compare/v0.11.2...v0.12.0) (2026-06-18)


### Changed

* extract shared root Handlebars partials for AGENTS.md and CLAUDE.md
* replace repeated scaffold component functions with a component registry and render loop
* skip private root partial templates in render, dry-run, and template file counts

## [0.11.2](https://github.com/yarkingulacti/agentic-scaffold/compare/v0.11.1...v0.11.2) (2026-06-18)


### Added

* add project critique backlog for v1 planning

### Fixed

* default generated script runtime documentation to Node.js to match shipped `.mjs` memory scripts

## [0.11.1](https://github.com/yarkingulacti/agentic-scaffold/compare/v0.11.0...v0.11.1) (2026-06-18)


### Changed

* mark Phase 1 items as resolved in hardening roadmap

## [0.11.0](https://github.com/yarkingulacti/agentic-scaffold/compare/v0.10.1...v0.11.0) (2026-06-18)


### Added

* add scaffold manifest with content hashes for dirty-check on unscaffold

## [0.10.1](https://github.com/yarkingulacti/agentic-scaffold/compare/v0.10.0...v0.10.1) (2026-06-18)


### Changed

* add AGENTS.md and CLAUDE.md for the scaffold repo itself

## [0.10.0](https://github.com/yarkingulacti/agentic-scaffold/compare/v0.9.0...v0.10.0) (2026-06-18)


### Added

* complete sprints 4, 6, 7 and hardening v1.0

## [0.7.1](https://github.com/yarkingulacti/agentic-scaffold/compare/v0.7.0...v0.7.1) (2026-06-18)

### Added

- `unscaffold` command (`agentic-scaffold un`) — removes all scaffolded files and symlinks interactively; `--force` skips confirmation. (`src/unscaffold.js`)
- `next` skill — new agent skill for planning and executing the next development step. (`templates/skills/next/`)

### Changed

- Template refinements across all skills, hooks, and docs — improved task/issue descriptions, clearer checklists, refined AGENTS.md/CLAUDE.md formatting.
- Test suite expanded to 164 tests covering detection, scaffolding, CLI, unscaffold, and all hooks.

## [0.7.0](https://github.com/yarkingulacti/agentic-scaffold/compare/v0.6.0...v0.7.0) (2026-06-18)

## [v0.6.0] - 2026-06-17

### Added

- Interactive mode redesign: shows detected project profile before prompts, pre-fills prompts with detected values, and per-file conflict resolver that asks before overwriting existing files.
- MEMORY.md golden rules: feature branches mandatory for new features, every release gets a version tag.

### Changed

- `src/prompts.js` — `askIssueTracker()` now accepts detected value as default; new `askOverwrite()` for per-file conflict resolution.
- `src/scaffold.js` — new `showDetectedProfile()` function; `write()` and `copyFile()` made async to support interactive overwrite prompts; `interactive` config flag threaded through all scaffold functions.

## [v0.5.1] - 2026-06-17

### Changed

- Updated README.md to document v0.5.0 features.
- Added MEMORY.md with git flow rules for agent reference.

## [v0.5.0] - 2026-06-17

### Added

- `fill-docs` skill template (`templates/skills/fill-docs/SKILL.md`) — interviews the user to complete placeholder content in scaffolded documentation files.
- Scaffold metadata section in `AGENTS.md` and `CLAUDE.md` — lists the scaffolder version, incomplete files, and a reference to the fill-docs skill.
- Post-scaffold completion checklist in CLI output — shows which documentation files have placeholder content and suggests the fill-docs skill.

## [v0.4.2] - 2026-06-17

### Added

- `.history/` directory with full project release history (9 entries from v0.2.0 through v0.4.1), built from git log.

## [v0.4.1] - 2026-06-17

### Added

- Test job in publish workflow — runs `npm test` before publishing.
- `prepublishOnly` script in `package.json` — ensures tests pass before every `npm publish`.

## [v0.4.0] - 2026-06-17

### Added

- Sci-fi themed CLI UI: styled info-box header, animated spinner, real-time progress bar, colored summary with status icons.
- `src/ui.js` module with reusable `infoBox()`, `progressBar()`, `spinner()`, `summaryLine()` helpers.
- `onProgress` callback to `write()` and `copyFile()` for real-time progress tracking.
- All scaffold functions accept `extraOpts` to pass through progress callbacks to file operations.

## [v0.3.1] - 2026-06-17

### Added

- Auto-detection engine (`src/detect.js`): detects languages, package manager,
  CI provider, AI tools, issue tracker, and script language from project files.
- `--force` / `-f` flag to overwrite existing scaffolded files.
- `--package-manager`, `--ci-provider`, `--ai-tools`, `--script-language` CLI
  flags to override auto-detection.
- Redesigned `--help` with three-tier usage guide (zero-config, flag mode,
  interactive) and examples.
- Conditional sections in `AGENTS.md` / `CLAUDE.md` for package manager, CI/CD,
  and script runtime.
- Comprehensive test suite (82 tests) for detection, scaffolding, and CLI.
- Design documents and roadmaps in `docs/plans/`.
- Git workflow documentation in `docs/engineering/GIT_FLOW.md`.
- `CHANGELOG.md` with Keep a Changelog format.

### Changed

- `src/scaffold.js` — 3-tier config resolution (detected profile → CLI flags →
  hardcoded defaults), overwrite-aware file I/O, result collection for summary
  output.
- `templates/root/AGENTS.md.hbs` — new conditional sections for detected
  project attributes.
- Test script uses `node --test` instead of basic help check.

## [v0.2.5] - 2026-03-10

### Added

- Initial public release of the agentic development scaffold.
