# Quick Start

No install required — run it straight from npm.

> **Requires Node.js 18+.** Both initial and update runs perform a runtime check
> and abort before writing if the active Node is older — the generated memory
> scripts and hook helpers are ESM `.mjs` files that need a supported runtime.

## The 60-second loop

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

## Three ways to run it

Pick the level of control you want — all three produce the same scaffold shape.

| Mode | Command | When to use |
|------|---------|-------------|
| 🤖 **Zero-config** | `npx @yarkingulacti/agentic-scaffold` | Auto-detect and scaffold. No flags, no prompts. |
| 🚩 **Flag mode** | `npx ... --force --ci-provider github` | Override auto-detection from the CLI; `--force` overwrites. |
| 💬 **Interactive** | `npx ... -i` | Step-by-step prompts with detected defaults pre-filled. |


Need a concrete setup for a production app, web/mobile/native monorepo, client
handoff, regulated product, data pipeline, desktop app, game repo, migration,
QA sprint, or documentation rescue? See **[Real-life Use Cases](Use-Cases)** for
scenario-specific commands and skill pairings.

## After scaffolding

1. Fill in `.agentic-scaffold/BUSINESS_LOGIC.md` with your product domain.
2. Run `npm install` / `pnpm install` for your project's actual dependencies.
3. Run `node .agentic-scaffold/scripts/memory_index.mjs` to index your project Markdown (no additional setup needed).
4. If you scaffolded AI config for a supported skill-aware agent, use its generated skill command. Claude Code, Gemini CLI, Deep Code, and Grok expose `/fill-docs`; Codex exposes `$fill-docs` or its skills picker. If Gemini CLI is already open, run `/commands reload`.
5. If you did not scaffold AI config, use the generated skill file directly: `.agentic-scaffold/.agents/skills/fill-docs/SKILL.md`.
6. Customize `.agentic-scaffold/docs/agents/triage-labels.md` to match your tracker's vocabulary.
7. After upgrading this package, run `npx @yarkingulacti/agentic-scaffold update --dry-run` to preview generated-template changes before applying them.

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
    ├── docs/                     # CODING_PRINCIPLES, ADR template, agent + context docs
    ├── .agents/
    │   ├── skills/               # Agent skill definitions (31 skills)
    │   └── hooks/                # Pre/post lifecycle hooks
    ├── scripts/                  # Markdown memory indexing pipeline
    ├── .scratchpad/              # Local detailed planning
    └── .history/                 # Shipped work summaries
```

Everything lives under one wrapper directory, so it's easy to find, easy to
`.gitignore` selectively, and trivial to remove.
