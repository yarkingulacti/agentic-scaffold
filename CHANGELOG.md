# Changelog

All notable changes to this project are documented here.

The format is based on [Keep a Changelog](https://keepachangelog.com/),
and this project adheres to [Semantic Versioning](https://semver.org/).

## [1.10.0](https://github.com/yarkingulacti/agentic-scaffold/compare/v1.9.1...v1.10.0) (2026-06-19)


### Added

* **skills:** add superpowers methodology skill with attribution ([345eaf4](https://github.com/yarkingulacti/agentic-scaffold/commit/345eaf43fd5e2bc0647c081d9b3b1744b01f76cc))

## [1.9.1](https://github.com/yarkingulacti/agentic-scaffold/compare/v1.9.0...v1.9.1) (2026-06-19)


### Changed

* credit vectorai for memory-search concepts ([8aed554](https://github.com/yarkingulacti/agentic-scaffold/commit/8aed55496073772bd773ffb1193261d4e05fcba4))

## [1.9.0](https://github.com/yarkingulacti/agentic-scaffold/compare/v1.8.0...v1.9.0) (2026-06-19)


### Added

* **update:** flag stale memory index when scripts change ([509612e](https://github.com/yarkingulacti/agentic-scaffold/commit/509612ed714af431c95529c6a5843e42d1746aeb))

## [1.8.0](https://github.com/yarkingulacti/agentic-scaffold/compare/v1.7.0...v1.8.0) (2026-06-19)


### Added

* **memory:** rank memory search with BM25 (index v2) ([867c9d1](https://github.com/yarkingulacti/agentic-scaffold/commit/867c9d17edea9ccd0812e22eb473b6197822f7c8))


### Changed

* **plans:** add vectorai-inspired vector/semantic memory search plan ([ea85e29](https://github.com/yarkingulacti/agentic-scaffold/commit/ea85e29e54be926a927865fe635272d02e74345d))

## [1.7.0](https://github.com/yarkingulacti/agentic-scaffold/compare/v1.6.0...v1.7.0) (2026-06-19)


### Added

* **ai-config:** install Cursor-native slash commands ([b88c320](https://github.com/yarkingulacti/agentic-scaffold/commit/b88c320952e3e7242365921cfa36f893d12e3262))

## [1.6.0](https://github.com/yarkingulacti/agentic-scaffold/compare/v1.5.0...v1.6.0) (2026-06-19)


### Added

* **ai-config:** cover mainstream skill agents ([8fd1a15](https://github.com/yarkingulacti/agentic-scaffold/commit/8fd1a151c38b42a9cd03e4176ace6beace7ac3c0))

## [1.5.0](https://github.com/yarkingulacti/agentic-scaffold/compare/v1.4.0...v1.5.0) (2026-06-19)


### Added

* **ai-config:** generate skill command adapters ([20184c3](https://github.com/yarkingulacti/agentic-scaffold/commit/20184c3ef4f8f5ee735b7740654f5d9d8274f3b8))

## [1.4.0](https://github.com/yarkingulacti/agentic-scaffold/compare/v1.3.0...v1.4.0) (2026-06-18)


### Added

* **update:** add safe scaffold update command ([274d4e8](https://github.com/yarkingulacti/agentic-scaffold/commit/274d4e838018fa24ae4cf240adc999c78226b141))

## [1.3.0](https://github.com/yarkingulacti/agentic-scaffold/compare/v1.2.2...v1.3.0) (2026-06-18)


### Added

* **scaffold:** gate initial and update runs on a Node runtime check ([ee82df4](https://github.com/yarkingulacti/agentic-scaffold/commit/ee82df45f5fbece7ebceffe471b0039a8c49e12d))

## [1.2.2](https://github.com/yarkingulacti/agentic-scaffold/compare/v1.2.1...v1.2.2) (2026-06-18)


### Changed

* **wiki:** add module dependency graph to Architecture ([56c56e0](https://github.com/yarkingulacti/agentic-scaffold/commit/56c56e06c7ce434c7a384f50c8ef0b6bdfe13e83))

## [1.2.1](https://github.com/yarkingulacti/agentic-scaffold/compare/v1.2.0...v1.2.1) (2026-06-18)


### Changed

* **cli:** document --languages flag in README and wiki CLI reference ([006432f](https://github.com/yarkingulacti/agentic-scaffold/commit/006432f4e5cd0fd54bfc6791d4c6b94882f6d98b))

## [1.2.0](https://github.com/yarkingulacti/agentic-scaffold/compare/v1.1.2...v1.2.0) (2026-06-18)


### Added

* **detect:** recursive multi-language detection and --languages override ([c4247a9](https://github.com/yarkingulacti/agentic-scaffold/commit/c4247a9edcd2286a9c85aace1994015f36afd17c))

## [1.1.2](https://github.com/yarkingulacti/agentic-scaffold/compare/v1.1.1...v1.1.2) (2026-06-18)


### Fixed

* **ci:** push only the new version tag in release:push ([#23](https://github.com/yarkingulacti/agentic-scaffold/issues/23)) ([dbd3cb0](https://github.com/yarkingulacti/agentic-scaffold/commit/dbd3cb0034059081da6a4a886d3a7a8f20c889db))

## [1.1.1](https://github.com/yarkingulacti/agentic-scaffold/compare/v1.1.0...v1.1.1) (2026-06-18)


### Fixed

* **ci:** trigger tagged-release publish + wiki deterministically ([#22](https://github.com/yarkingulacti/agentic-scaffold/issues/22)) ([287b80f](https://github.com/yarkingulacti/agentic-scaffold/commit/287b80ff56305cf745be88043cc89e94f6d9896a))

## [1.1.0](https://github.com/yarkingulacti/agentic-scaffold/compare/v1.0.0...v1.1.0) (2026-06-18)


### Added

* **wiki:** generate GitHub wiki from docs/wiki and sync on release ([c54509a](https://github.com/yarkingulacti/agentic-scaffold/commit/c54509ab556d4ddab59e879550486a265a8ac936))


### Fixed

* **cli:** honor --ai-tools filter and reject unimplemented --issue-tracker ([167b92d](https://github.com/yarkingulacti/agentic-scaffold/commit/167b92da8fbe195b2400958edb3451388d80e202))


### Changed

* migrate package management from npm to pnpm ([47e6609](https://github.com/yarkingulacti/agentic-scaffold/commit/47e66098c35c49d020dd0dea1464ba3357658bc8))
* sync wiki on tagged releases instead of local posttag hook ([bf54b4c](https://github.com/yarkingulacti/agentic-scaffold/commit/bf54b4c4e608933a26e6650bb3bd1f650a0bdc61))

## [1.0.0](https://github.com/yarkingulacti/agentic-scaffold/compare/v0.15.2...v1.0.0) (2026-06-18)


### Changed

* redesign README and reconcile release freshness gate ([3bb2641](https://github.com/yarkingulacti/agentic-scaffold/commit/3bb26418810ddcea8377ede926d2f46cdaa1b94b))

## [0.15.2](https://github.com/yarkingulacti/agentic-scaffold/compare/v0.15.1...v0.15.2) (2026-06-18)


### Fixed

* **ci:** scope publish concurrency per ref so tag runs aren't cancelled ([9a47ab9](https://github.com/yarkingulacti/agentic-scaffold/commit/9a47ab98898ebe0e5bd11f6f92d553ca5657679a))

## [0.15.1](https://github.com/yarkingulacti/agentic-scaffold/compare/v0.15.0...v0.15.1) (2026-06-18)


### Changed

* align README and critique with 0.15 release state ([43102bd](https://github.com/yarkingulacti/agentic-scaffold/commit/43102bd851dbf86315510fb2cde480fc2565892e))
* credit RTK in README ([e753510](https://github.com/yarkingulacti/agentic-scaffold/commit/e75351058a4a286ba490941673a84b9a7a1ec584))
* **release:** harden scaffold release contract ([6040c47](https://github.com/yarkingulacti/agentic-scaffold/commit/6040c4747568b426c87cc316ddd194351c94d6f1))

## [0.15.0](https://github.com/yarkingulacti/agentic-scaffold/compare/v0.14.2...v0.15.0) (2026-06-18)

### Added

* **rtk:** ship RTK token-cost filters as an opt-in scaffold extra


### Changed

* **release:** harden scaffold release contract ([696b05b](https://github.com/yarkingulacti/agentic-scaffold/commit/696b05bb18eaec79cc19caf66ee5b67bb82ace28))

## [0.14.2](https://github.com/yarkingulacti/agentic-scaffold/compare/v0.14.1...v0.14.2) (2026-06-18)


### Changed

* **components:** extract declarative component registry ([46f45ca](https://github.com/yarkingulacti/agentic-scaffold/commit/46f45cab1ca81faadff69477fa5541697db684dd)), closes [#8](https://github.com/yarkingulacti/agentic-scaffold/issues/8)

## [0.14.1](https://github.com/yarkingulacti/agentic-scaffold/compare/v0.14.0...v0.14.1) (2026-06-18)


### Changed

* **templates:** add golden-output fixtures for three profiles ([64fa5c4](https://github.com/yarkingulacti/agentic-scaffold/commit/64fa5c438ae5e81b95ce58cff21bca62938c91fe)), closes [#7](https://github.com/yarkingulacti/agentic-scaffold/issues/7)

## [0.14.0](https://github.com/yarkingulacti/agentic-scaffold/compare/v0.13.4...v0.14.0) (2026-06-18)


### Added

* **tooling:** add template variable + escape validator ([ba636e4](https://github.com/yarkingulacti/agentic-scaffold/commit/ba636e460e5fc26627e5e538cdd71856faa5a29d))

## [0.13.4](https://github.com/yarkingulacti/agentic-scaffold/compare/v0.13.3...v0.13.4) (2026-06-18)


### Fixed

* **templates:** stop HTML-escaping Markdown and render languages var ([c29a119](https://github.com/yarkingulacti/agentic-scaffold/commit/c29a119679d8c46f9d6264e3c90c718c10a2514f))

## [0.13.3](https://github.com/yarkingulacti/agentic-scaffold/compare/v0.13.2...v0.13.3) (2026-06-18)


### Changed

* **paths:** centralize package root resolution ([8a34290](https://github.com/yarkingulacti/agentic-scaffold/commit/8a34290373f89fc2984ac047844fe23f23275cbb))

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
