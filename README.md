# @yarkingulacti/agentic-scaffold

[![npm version](https://img.shields.io/npm/v/%40yarkingulacti%2Fagentic-scaffold?logo=npm&label=version)](https://www.npmjs.com/package/@yarkingulacti/agentic-scaffold)
[![License](https://img.shields.io/badge/license-MIT-blue)](LICENSE)
[![GitHub stars](https://img.shields.io/github/stars/yarkingulacti/agentic-scaffold?style=flat&logo=github)](https://github.com/yarkingulacti/agentic-scaffold)

Scaffold agentic development documentation and configuration into any project.
Run with zero flags and it auto-detects your project's language, package manager,
and existing CI/AI-tool context for generated docs — while writing only the
conservative core scaffold unless extras are requested.

Inspired by the methodology evolved in the [haprec.com](https://haprec.com) project — extracts the reusable patterns (agent config, domain docs, ADR system, memory scripts, skill system, scratchpad conventions) so every project can start with an AI-native foundation.

## Quick start

```bash
npx @yarkingulacti/agentic-scaffold
```

Auto-detects your project (language, package manager, CI, AI tools) and
scaffolds only what's missing. Never overwrites existing files.

## Tiers

The scaffold works in three tiers depending on how much control you need:

```
Zero-config   npx @yarkingulacti/agentic-scaffold
              Auto-detect and scaffold. No flags, no prompts.

Flag mode     npx ... --force --ci-provider github
              Override auto-detection with CLI flags. Add --force to overwrite.

Interactive   npx ... -i
              Step-by-step prompts with detected defaults pre-filled.
```

## CLI

```bash
# Zero-config — auto-detect and scaffold what's missing
npx @yarkingulacti/agentic-scaffold

# Force overwrite existing files
npx @yarkingulacti/agentic-scaffold --force

# Override auto-detection
npx @yarkingulacti/agentic-scaffold --package-manager pnpm --ci-provider github

# Generate AI tool configs
npx @yarkingulacti/agentic-scaffold --extras ai-config --ai-tools opencode,cursor

# Generate extras such as CI, contribution docs, AI config, RTK filters, or onboarding
npx @yarkingulacti/agentic-scaffold --extras ci,contribute,ai-config,onboarding,rtk

# Memory pipeline runtime (currently fixed to the shipped Node.js .mjs scripts)
npx @yarkingulacti/agentic-scaffold --script-language node

# Interactive mode — prompts with detected defaults pre-filled
npx @yarkingulacti/agentic-scaffold --interactive

# Scaffold into a specific directory
npx @yarkingulacti/agentic-scaffold --target ../my-project

# Skip specific groups
npx @yarkingulacti/agentic-scaffold --skip-skills --skip-scripts --skip-hooks

# Pre-configure values
npx @yarkingulacti/agentic-scaffold --project-name "my-app" --issue-tracker github

# Remove all scaffolded files (asks for confirmation)
npx @yarkingulacti/agentic-scaffold un

# Remove without confirmation
npx @yarkingulacti/agentic-scaffold un --force
```

## What you get

```
project/
├── AGENTS.md -> .agentic-scaffold/AGENTS.md   # Symlink entry point
├── CLAUDE.md -> .agentic-scaffold/CLAUDE.md   # Symlink entry point
└── .agentic-scaffold/                          # Single wrapper directory
    ├── AGENTS.md                 # Agent config (entry point for AI agents)
    ├── CLAUDE.md                 # Mirror of AGENTS.md
    ├── BUSINESS_LOGIC.md         # Shell — fill with your domain
    ├── .gitignore
    ├── docs/
    │   ├── CODING_PRINCIPLES.md  # Operating rules for code
    │   ├── adr/TEMPLATE.md       # Architecture Decision Record template
    │   ├── agents/
    │   │   ├── domain.md         # How to consume domain docs
    │   │   ├── session-close.md  # Post-coding session workflow
    │   │   ├── issue-tracker.md  # Issue tracker conventions
    │   │   └── triage-labels.md  # Triage status vocabulary
    │   ├── context/
    │   │   ├── INDEX.md          # Section index for CONTEXT.md
    │   │   └── glossary.md       # Ubiquitous language glossary
    │   ├── engineering/README.md
    │   └── product/README.md
    ├── .agents/
    │   ├── skills/               # Agent skill definitions (23 skills)
    │   └── hooks/                # Pre/post lifecycle hooks
    ├── scripts/                  # Markdown memory indexing pipeline
    ├── .scratchpad/              # Local detailed planning
    └── .history/                 # Shipped work summaries
```

## Auto-detection

The scaffold scans your project and detects:

| What | How |
|------|-----|
| **Languages** | JavaScript/TypeScript, Python, Go, Rust (from manifest files) |
| **Package manager** | npm, yarn, pnpm, pip, poetry (from lockfiles) |
| **CI provider** | GitHub Actions, GitLab CI, CircleCI (from config files) |
| **AI tools** | opencode, Cursor, Copilot, Windsurf, Cline (from config files) |
| **Issue tracker** | GitHub Issues (from .github/ directory) |
| **Script runtime** | Node.js when package.json is present; otherwise the scaffold still defaults to Node.js because the shipped memory scripts are `.mjs` files |

Detected values are rendered into `AGENTS.md` / `CLAUDE.md` and seed interactive
defaults. Root-level extras such as CI and AI-tool config are written only when
requested with `--extras`.

## Components

| Group | Description | Flag |
|-------|-------------|------|
| `docs` | Documentation framework (CODING_PRINCIPLES, ADR, agents, context) | `--skip-docs` |
| `scripts` | Node.js memory indexing pipeline (flat-file keyword index) | `--skip-scripts` |
| `skills` | 23 agent skills (implement, bugfix, create-hook, diagnose, tdd, fill-docs, etc.) | `--skip-skills` |
| `hooks` | Pre/post lifecycle hooks for agent workflows (pre-feature, post-feature, post-bugfix, post-session) with executable scripts | `--skip-hooks` |

Extras are opt-in with `--extras` so zero-config mode stays conservative:

| Extra | Description |
|-------|-------------|
| `ci` | CI/CD templates for the detected or requested provider |
| `contribute` | Contribution guide, PR template, and review guidance |
| `ai-config` | AI tool config files such as `opencode.json`, `.cursorrules`, and Copilot instructions |
| `onboarding` | Human onboarding guide and setup helper |
| `rtk` | Project-local RTK token-cost filters in `.rtk/filters.toml` |
| `all` | Include every extras group |

## Current release

Version `0.14.x` focuses on making scaffold output predictable and releasable:

- **Conservative zero-config defaults** — extras are opt-in, so running with no flags writes the core scaffold, `.scratchpad/`, and `.history/` without adding CI, onboarding, contribution, AI tool config, or RTK filter files.
- **Registry-driven dry-run preview** — `--dry-run` now uses the same component decisions as real scaffolding, including provider-specific CI output and `--skip-history` / `--skip-scratchpad`.
- **Template and golden-output validation** — template variables, Markdown escaping, and representative rendered projects are validated before publish.
- **RTK filter extra** — generated projects can opt into `.rtk/filters.toml` with `--extras rtk` or `--extras all` to reduce agent token cost from noisy shell output.
- **Component registry rendering** — scaffold groups are rendered through a single component registry rather than repeated per-group control flow.

## New in v0.7

- **Agent lifecycle hooks** — new `.agents/hooks/` component group with 4 hooks (pre-feature, post-feature, post-bugfix, post-session) and executable shell scripts. Skills reference hooks conditionally with graceful fallback.
- **`create-hook` skill** — new agent skill that guides you through adding custom hooks for any lifecycle point.
- **`--skip-hooks` flag** — skip the hooks component group.
- **98 tests** — detection, scaffolding, CLI, and hooks tested end-to-end.

## New in v0.7.1

- **`unscaffold` command** — `npx @yarkingulacti/agentic-scaffold un` removes all scaffolded files and symlinks interactively; `--force` skips confirmation.
- **`next` skill** — new agent skill for planning and executing the next development step.
- **Template refinements** — improved task/issue descriptions, clearer checklists, refined AGENTS.md/CLAUDE.md formatting across all templates.
- **164 tests** — detection, scaffolding, CLI, unscaffold, and all hooks tested end-to-end.

## New in v0.6

- **Interactive mode redesign** — shows detected project profile before prompts, pre-fills prompts with detected values, and per-file conflict resolver that asks before overwriting existing files.
- **MEMORY.md golden rules** — feature branches mandatory for new features, every release gets a version tag.
- **Per-file conflict resolution** — `askOverwrite()` prompt lets you decide for each existing file during scaffolding.

## New in v0.5

- **`fill-docs` skill** — new agent skill that interviews you to complete placeholder content in BUSINESS_LOGIC.md, glossary, and other scaffolded docs.
- **Scaffold metadata in AGENTS.md/CLAUDE.md** — version info, incomplete files list, and fill-docs skill reference at the bottom of every scaffolded project.
- **Post-scaffold completion checklist** — the CLI now lists which documentation files have placeholder content and suggests the `fill-docs` skill.

## New in v0.4

- **Sci-fi themed CLI UI** — styled info-box header, animated spinner, real-time progress bar, colored summary with icons.
- **New `src/ui.js` module** — reusable `infoBox()`, `progressBar()`, `spinner()`, `summaryLine()` helpers.

## New in v0.4.1

- **Test-before-publish CI** — publish workflow runs test job first; publish depends on it.
- **`prepublishOnly` script** — `npm test` runs automatically before every `npm publish`.

## New in v0.3

- **Auto-detection engine** — detects languages, package manager, CI, AI tools from project files.
- **Three tiers** — zero-config, flag mode, and interactive mode.
- **`--force`** (`-f`) — overwrite existing files.
- **Override flags** — `--package-manager`, `--ci-provider`, `--ai-tools`, `--script-language`.
- **Rich `--help`** — tiers overview and usage examples.
- **Conditional AGENTS.md** — sections for package manager, CI/CD, script runtime appear only when detected.
- **82 tests** — detection, scaffolding, and CLI tested end-to-end.

## After scaffolding

1. Fill in `.agentic-scaffold/BUSINESS_LOGIC.md` with your product domain.
2. Run `npm install` / `pnpm install` for your project's actual dependencies.
3. Run `node .agentic-scaffold/scripts/memory_index.mjs` to index your project Markdown (no additional setup needed).
4. Install the skills in your AI tool (e.g. opencode) — each `.agentic-scaffold/.agents/skills/*/SKILL.md` is self-contained.
5. Customize `.agentic-scaffold/docs/agents/triage-labels.md` to match your tracker's vocabulary.
6. Use the `fill-docs` skill (`.agentic-scaffold/.agents/skills/fill-docs/SKILL.md`) to complete scaffolded documentation.

## Unscaffold

Remove all scaffolded files in one command:

```bash
# Interactive (asks for confirmation)
npx @yarkingulacti/agentic-scaffold un

# Non-interactive
npx @yarkingulacti/agentic-scaffold un --force
```

This removes the entire `.agentic-scaffold/` directory and the root-level symlinks (AGENTS.md, CLAUDE.md). Your project files are left untouched.

## Development token-cost controls

This repository includes project-local [RTK](https://github.com/rtk-ai/rtk)
filters in `.rtk/filters.toml`. Install RTK and run `rtk trust` from the repo
root to apply compact output filters for local test and validation commands.

## Open source

- [LICENSE](LICENSE) — MIT
- [CONTRIBUTING.md](CONTRIBUTING.md) — contribution guidelines
- [SECURITY.md](SECURITY.md) — security policy
- [Issues](https://github.com/yarkingulacti/agentic-scaffold/issues) — bug reports and feature requests

## Credits & acknowledgements

Token-cost controls in this project are powered by [RTK](https://github.com/rtk-ai/rtk)
(Rust Token Killer) by the [rtk-ai](https://github.com/rtk-ai) team. RTK filters
high-volume command output to cut agent token usage, and agentic-scaffold both
uses it locally (`.rtk/filters.toml`) and ships an opt-in RTK extra
(`--extras rtk`) so generated projects can adopt the same workflow. Thanks to the
RTK maintainers for the tooling.
