# Quick Start

No install required — run it straight from npm.

## The 60-second loop

```bash
# Scaffold the current project — auto-detect, write what's missing
npx @yarkingulacti/agentic-scaffold

# Not sure? Preview every file first, write nothing
npx @yarkingulacti/agentic-scaffold --dry-run

# Changed your mind? Undo the whole thing
npx @yarkingulacti/agentic-scaffold un
```

That's the entire loop. The scaffold detects your project (language, package
manager, CI, AI tools), seeds the generated docs with what it found, and writes
only the files that don't already exist.

## Three ways to run it

Pick the level of control you want — all three produce the same scaffold shape.

| Mode | Command | When to use |
|------|---------|-------------|
| 🤖 **Zero-config** | `npx @yarkingulacti/agentic-scaffold` | Auto-detect and scaffold. No flags, no prompts. |
| 🚩 **Flag mode** | `npx ... --force --ci-provider github` | Override auto-detection from the CLI; `--force` overwrites. |
| 💬 **Interactive** | `npx ... -i` | Step-by-step prompts with detected defaults pre-filled. |

## After scaffolding

1. Fill in `.agentic-scaffold/BUSINESS_LOGIC.md` with your product domain.
2. Run `npm install` / `pnpm install` for your project's actual dependencies.
3. Run `node .agentic-scaffold/scripts/memory_index.mjs` to index your project Markdown (no additional setup needed).
4. Install the skills in your AI tool (e.g. opencode) — each `.agentic-scaffold/.agents/skills/*/SKILL.md` is self-contained.
5. Customize `.agentic-scaffold/docs/agents/triage-labels.md` to match your tracker's vocabulary.
6. Use the `fill-docs` skill (`.agentic-scaffold/.agents/skills/fill-docs/SKILL.md`) to complete scaffolded documentation.

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
    │   ├── skills/               # Agent skill definitions (23 skills)
    │   └── hooks/                # Pre/post lifecycle hooks
    ├── scripts/                  # Markdown memory indexing pipeline
    ├── .scratchpad/              # Local detailed planning
    └── .history/                 # Shipped work summaries
```

Everything lives under one wrapper directory, so it's easy to find, easy to
`.gitignore` selectively, and trivial to remove.
