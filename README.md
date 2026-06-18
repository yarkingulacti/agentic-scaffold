# @yarkingulacti/agentic-scaffold

[![npm version](https://img.shields.io/npm/v/%40yarkingulacti%2Fagentic-scaffold?logo=npm&label=version)](https://www.npmjs.com/package/@yarkingulacti/agentic-scaffold)
[![License](https://img.shields.io/badge/license-MIT-blue)](LICENSE)
[![GitHub stars](https://img.shields.io/github/stars/yarkingulacti/agentic-scaffold?style=flat&logo=github)](https://github.com/yarkingulacti/agentic-scaffold)

Scaffold agentic development documentation and configuration into any project.
Run with zero flags and it auto-detects your project's language, package manager,
CI provider, and AI tools — scaffolding only what's missing. Or use flags and
interactive mode for full control.

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
npx @yarkingulacti/agentic-scaffold --ai-tools opencode,cursor

# Choose script language for memory pipeline
npx @yarkingulacti/agentic-scaffold --script-language node

# Interactive mode — prompts with detected defaults pre-filled
npx @yarkingulacti/agentic-scaffold --interactive

# Scaffold into a specific directory
npx @yarkingulacti/agentic-scaffold --target ../my-project

# Skip specific groups
npx @yarkingulacti/agentic-scaffold --skip-skills --skip-scripts --skip-hooks

# Pre-configure values
npx @yarkingulacti/agentic-scaffold --project-name "my-app" --issue-tracker github
```

## What you get

```
project/
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
├── .agents/skills/           # Agent skill definitions (21 skills)
├── .agents/hooks/            # Pre/post lifecycle hooks for agent workflows
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
| **Script language** | Node.js, Python (from manifest files) |

Detected values are rendered into `AGENTS.md` / `CLAUDE.md`. Override any with
CLI flags.

## Components

| Group | Description | Flag |
|-------|-------------|------|
| `docs` | Documentation framework (CODING_PRINCIPLES, ADR, agents, context) | `--skip-docs` |
| `scripts` | Python memory indexing pipeline (sqlite-vec based RAG) | `--skip-scripts` |
| `skills` | 21 agent skills (implement, bugfix, create-hook, diagnose, tdd, fill-docs, etc.) | `--skip-skills` |
| `hooks` | Pre/post lifecycle hooks for agent workflows (pre-feature, post-feature, post-bugfix, post-session) with executable scripts | `--skip-hooks` |

## New in v0.7

- **Agent lifecycle hooks** — new `.agents/hooks/` component group with 4 hooks (pre-feature, post-feature, post-bugfix, post-session) and executable shell scripts. Skills reference hooks conditionally with graceful fallback.
- **`create-hook` skill** — new agent skill that guides you through adding custom hooks for any lifecycle point.
- **`--skip-hooks` flag** — skip the hooks component group.
- **98 tests** — detection, scaffolding, CLI, and hooks tested end-to-end.

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

1. Fill in `BUSINESS_LOGIC.md` with your product domain.
2. Run `npm install` / `pnpm install` for your project's actual dependencies.
3. `python3 -m venv .venv && pip install sqlite-vec` if you want vector memory.
4. Install the skills in your AI tool (e.g. opencode) — each `.agents/skills/*/SKILL.md` is self-contained.
5. Customize `docs/agents/triage-labels.md` to match your tracker's vocabulary.
6. Use the `fill-docs` skill (`.agents/skills/fill-docs/SKILL.md`) to complete scaffolded documentation.

## Open source

- [LICENSE](LICENSE) — MIT
- [CONTRIBUTING.md](CONTRIBUTING.md) — contribution guidelines
- [SECURITY.md](SECURITY.md) — security policy
- [Issues](https://github.com/yarkingulacti/agentic-scaffold/issues) — bug reports and feature requests
