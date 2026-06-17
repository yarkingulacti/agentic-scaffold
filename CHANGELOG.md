# Changelog

All notable changes to this project are documented here.

The format is based on [Keep a Changelog](https://keepachangelog.com/),
and this project adheres to [Semantic Versioning](https://semver.org/).

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
