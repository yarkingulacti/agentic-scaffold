<div align="center">

# 🛰️ agentic-scaffold

**Give any repository an AI-native foundation in a single command.**

Agent config · domain docs · an ADR system · a memory pipeline · 23 reusable skills · lifecycle hooks — all dropped into one tidy directory, none of your files touched.

[![npm version](https://img.shields.io/npm/v/%40yarkingulacti%2Fagentic-scaffold?logo=npm&label=version)](https://www.npmjs.com/package/@yarkingulacti/agentic-scaffold)
[![License](https://img.shields.io/badge/license-MIT-blue)](LICENSE)
[![GitHub stars](https://img.shields.io/github/stars/yarkingulacti/agentic-scaffold?style=flat&logo=github)](https://github.com/yarkingulacti/agentic-scaffold)

```bash
npx @yarkingulacti/agentic-scaffold
```

</div>

---

Your AI coding agent is only as good as the context it can see. `agentic-scaffold`
ships that context as a reusable, opinionated baseline — so every repo starts
AI-native instead of you hand-rolling the same structure over and over.

It drops a single **`.agentic-scaffold/`** directory (plus `AGENTS.md` /
`CLAUDE.md` entry-point symlinks) into your project. Run it with zero flags: it
auto-detects your language, package manager, CI, and AI-tool context, then writes
**only the conservative core scaffold** — never overwriting what you already have.

> Inspired by the methodology evolved in the [haprec.com](https://haprec.com)
> project. The reusable patterns — agent config, domain docs, ADR system, memory
> scripts, skill system, scratchpad conventions — are extracted here so every
> project can start AI-native.

---

## Contents

- [Why bother?](#-why-bother)
- [60-second tour](#-60-second-tour)
- [Three ways to run it](#-three-ways-to-run-it)
- [CLI reference](#-cli-reference)
- [What you get](#-what-you-get)
- [Auto-detection](#-auto-detection)
- [Components & extras](#-components--extras)
- [After scaffolding](#-after-scaffolding)
- [Unscaffold](#-unscaffold)
- [Token-cost controls](#-token-cost-controls)
- [Contributing](#-contributing)
- [Credits](#-credits)

---

## 🤔 Why bother?

Working with AI agents goes better when the repository carries its own context:
how the domain works, where decisions are recorded, what conventions hold, and
which workflows agents should follow. Doing that by hand for every project is
repetitive and easy to get wrong.

|  | What you get |
|---|---|
| 🟢 **Zero-config & safe** | Auto-detects your stack and writes only what's missing. Existing files are never overwritten unless you pass `--force`. |
| 🪶 **Conservative by default** | The no-flag run writes the core scaffold plus working dirs. CI, onboarding, contribution docs, AI-tool config, and token filters are all opt-in. |
| 🔁 **Safe updates** | `update` reconciles new template versions against the manifest, preserves local edits, and writes `<path>.new` for conflicts instead of clobbering. |
| ↩️ **Reversible** | One `un` command removes everything it created and leaves your project untouched. |
| ✅ **Validated before publish** | Template variables, Markdown escaping, and representative rendered projects are all checked against golden output. |

## ⚡ 60-second tour

```bash
# Scaffold the current project — auto-detect, write what's missing
npx @yarkingulacti/agentic-scaffold

# Not sure? Preview every file first, write nothing
npx @yarkingulacti/agentic-scaffold --dry-run

# Already scaffolded? Update generated files without clobbering local edits
npx @yarkingulacti/agentic-scaffold update

# Changed your mind? Undo the whole thing
npx @yarkingulacti/agentic-scaffold un
```

That's the core loop. The scaffold detects your project (language, package
manager, CI, AI tools), seeds the generated docs with what it found, and writes
only the files that don't already exist. Later, `update` refreshes generated
templates while preserving local edits.

> **Requires Node.js 18+.** Both initial and update runs perform a runtime check
> and abort before writing if the active Node is older — the generated memory
> scripts and hook helpers are ESM `.mjs` files that need a supported runtime.

## 🎛️ Three ways to run it

Pick the level of control you want — all three produce the same scaffold shape.

| Mode | Command | When to use |
|------|---------|-------------|
| 🤖 **Zero-config** | `npx @yarkingulacti/agentic-scaffold` | Auto-detect and scaffold. No flags, no prompts. |
| 🚩 **Flag mode** | `npx ... --force --ci-provider github` | Override auto-detection from the CLI; `--force` overwrites. |
| 💬 **Interactive** | `npx ... -i` | Step-by-step prompts with detected defaults pre-filled. |

## 📟 CLI reference

<details>
<summary><strong>Click to expand — common invocations</strong></summary>

```bash
# Zero-config — auto-detect and scaffold what's missing
npx @yarkingulacti/agentic-scaffold

# Force overwrite existing files
npx @yarkingulacti/agentic-scaffold --force

# Override auto-detection
npx @yarkingulacti/agentic-scaffold --package-manager pnpm --ci-provider github

# Override detected languages (comma-separated; useful for monorepos and C++/Godot/mobile stacks)
npx @yarkingulacti/agentic-scaffold --languages ts,cpp,godot,swift

# Generate AI tool configs and project-local skill/slash commands
npx @yarkingulacti/agentic-scaffold --extras ai-config --ai-tools openai,anthropic,google,deepseek,grok

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

# Update an existing scaffold; conflicts are kept in-place and written to <path>.new
npx @yarkingulacti/agentic-scaffold update

# Preview an update as JSON without writing files
npx @yarkingulacti/agentic-scaffold update --dry-run --json

# Remove all scaffolded files (asks for confirmation)
npx @yarkingulacti/agentic-scaffold un

# Remove without confirmation
npx @yarkingulacti/agentic-scaffold un --force
```

</details>

## 📦 What you get

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

Everything lives under one wrapper directory, so it's easy to find, easy to
`.gitignore` selectively, and trivial to remove.

## 🔍 Auto-detection

The scaffold scans your project and seeds the generated docs and interactive
defaults from what it finds:

| What | Detected from |
|------|---------------|
| 🧬 **Languages** | JS/TS, Python, Go, Rust, C++ (CMake/meson/conan), Godot, Swift, Kotlin, Java, Dart — recursively across monorepo subpackages |
| 📦 **Package manager** | npm, yarn, pnpm, pip, poetry (lockfiles) |
| 🔧 **CI provider** | GitHub Actions, GitLab CI, CircleCI (config files) |
| 🤝 **AI tools** | opencode, Cursor, Copilot, Codex/OpenAI, Claude Code/Anthropic, Gemini CLI/Google, Deep Code/DeepSeek, Grok/xAI, Windsurf, Cline (config files) |
| 🎫 **Issue tracker** | GitHub Issues (`.github/` directory) |
| ⚙️ **Script runtime** | Node.js when `package.json` is present; otherwise still defaults to Node.js because the shipped memory scripts are `.mjs` files |

Detected values render into `AGENTS.md` / `CLAUDE.md`. Detection walks
subdirectories (skipping `node_modules`, build output, and VCS dirs) so monorepo
subpackages are covered; override it with `--languages ts,cpp,godot`. Root-level
extras such as CI and AI-tool config are written only when requested with `--extras`.

## 🧩 Components & extras

**Core components** are written by default. Skip any of them with its flag:

| Group | Description | Flag |
|-------|-------------|------|
| `docs` | Documentation framework (CODING_PRINCIPLES, ADR, agents, context) | `--skip-docs` |
| `scripts` | Node.js memory indexing pipeline (flat-file keyword index) | `--skip-scripts` |
| `skills` | 23 agent skills (implement, bugfix, create-hook, diagnose, tdd, fill-docs, …) | `--skip-skills` |
| `hooks` | Pre/post lifecycle hooks (pre-feature, post-feature, post-bugfix, post-session) with executable scripts | `--skip-hooks` |

**Extras** are opt-in via `--extras` so zero-config mode stays conservative:

| Extra | Description |
|-------|-------------|
| `ci` | CI/CD templates for the detected or requested provider |
| `contribute` | Contribution guide, PR template, and review guidance |
| `ai-config` | AI tool config files and skill-command adapters: `opencode.json`, `.cursorrules`, Copilot instructions, `.agents/skills/*/SKILL.md`, `.claude/skills/*/SKILL.md`, `.gemini/commands/*.toml`, `.deepcode/skills/*/SKILL.md`, `.grok/skills/*/SKILL.md` |
| `onboarding` | Human onboarding guide and setup helper |
| `rtk` | Project-local RTK token-cost filters in `.rtk/filters.toml` |
| `all` | Include every extras group |

## 🚀 After scaffolding

1. Fill in `.agentic-scaffold/BUSINESS_LOGIC.md` with your product domain.
2. Run `npm install` / `pnpm install` for your project's actual dependencies.
3. Run `node .agentic-scaffold/scripts/memory_index.mjs` to index your project Markdown (no additional setup needed).
4. If you scaffolded AI config for a supported skill-aware agent, use its generated skill command. Claude Code, Gemini CLI, Deep Code, and Grok expose `/fill-docs`; Codex exposes `$fill-docs` or its skills picker. If Gemini CLI is already open, run `/commands reload`.
5. If you did not scaffold AI config, use the generated skill file directly: `.agentic-scaffold/.agents/skills/fill-docs/SKILL.md`.
6. Customize `.agentic-scaffold/docs/agents/triage-labels.md` to match your tracker's vocabulary.
7. After upgrading this package, run `npx @yarkingulacti/agentic-scaffold update --dry-run` to preview generated-template changes before applying them.

## 🔁 Update strategy

Run `update` after upgrading `@yarkingulacti/agentic-scaffold` to refresh generated files safely:

```bash
# Preview changed generated files and conflicts
npx @yarkingulacti/agentic-scaffold update --dry-run

# Apply non-conflicting scaffold updates
npx @yarkingulacti/agentic-scaffold update
```

The updater uses `.agentic-scaffold/.manifest.json` as the old baseline, renders
the current package version into a temporary directory, and compares:

- old manifest content
- your current working file
- new canonical template output

It updates files only when you have not edited them. User-edited files are kept
as-is. If both you and the upstream template changed the same file, your file
stays untouched and the new canonical version is written beside it as
`<path>.new` for manual review.

## 🧹 Unscaffold

Changed your mind? Remove everything the scaffold created in one command:

```bash
# Interactive (asks for confirmation)
npx @yarkingulacti/agentic-scaffold un

# Non-interactive
npx @yarkingulacti/agentic-scaffold un --force
```

This removes the entire `.agentic-scaffold/` directory and the root-level
symlinks (`AGENTS.md`, `CLAUDE.md`). Your project files are left untouched.

## 💸 Token-cost controls

This repository includes project-local [RTK](https://github.com/rtk-ai/rtk)
filters in `.rtk/filters.toml`. Install RTK and run `rtk trust` from the repo
root to apply compact output filters for local test and validation commands.

Generated projects can adopt the same workflow with `--extras rtk` (or
`--extras all`), which writes an opt-in `.rtk/filters.toml` to cut agent token
usage from noisy shell output.

## 🛠️ Contributing

- [CONTRIBUTING.md](CONTRIBUTING.md) — contribution guidelines
- [SECURITY.md](SECURITY.md) — security policy
- [Issues](https://github.com/yarkingulacti/agentic-scaffold/issues) — bug reports and feature requests
- [LICENSE](LICENSE) — MIT

## 🙏 Credits

Token-cost controls in this project are powered by [RTK](https://github.com/rtk-ai/rtk)
(Rust Token Killer) by the [rtk-ai](https://github.com/rtk-ai) team. RTK filters
high-volume command output to cut agent token usage; `agentic-scaffold` uses it
locally (`.rtk/filters.toml`) and ships an opt-in RTK extra (`--extras rtk`) so
generated projects can adopt the same workflow. Thanks to the RTK maintainers
for the tooling.
