# @yarkingulacti/agentic-scaffold

Scaffold agentic development documentation and configuration into any project.

Inspired by the methodology evolved in the [haprec.com](https://haprec.com) project — extracts the reusable patterns (agent config, domain docs, ADR system, memory scripts, skill system, scratchpad conventions) so every project can start with an AI-native foundation.

## Quick start

```bash
npx @yarkingulacti/agentic-scaffold
```

This copies everything into the current directory with defaults (project name = directory name, issue tracker = Linear).

## CLI

```bash
# Interactive mode — prompts for project name, issue tracker, component selection
npx @yarkingulacti/agentic-scaffold --interactive

# Scaffold into a specific directory
npx @yarkingulacti/agentic-scaffold --target ../my-project

# Skip specific groups
npx @yarkingulacti/agentic-scaffold --skip-skills --skip-scripts

# Include only specific groups
npx @yarkingulacti/agentic-scaffold --only docs,scripts

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
├── .agents/skills/           # Agent skill definitions (19 skills)
├── scripts/                  # Markdown memory indexing pipeline
├── .scratchpad/              # Local detailed planning
└── .history/                 # Shipped work summaries
```

## Components

| Group | Description | Flag |
|-------|-------------|------|
| `docs` | Documentation framework (CODING_PRINCIPLES, ADR, agents, context) | `--skip-docs` |
| `scripts` | Python memory indexing pipeline (sqlite-vec based RAG) | `--skip-scripts` |
| `skills` | 19 agent skills (implement, bugfix, diagnose, tdd, etc.) | `--skip-skills` |

## After scaffolding

1. Fill in `BUSINESS_LOGIC.md` with your product domain.
2. Run `npm install` / `pnpm install` for your project's actual dependencies.
3. `python3 -m venv .venv && pip install sqlite-vec` if you want vector memory.
4. Install the skills in your AI tool (e.g. opencode) — each `.agents/skills/*/SKILL.md` is self-contained.
5. Customize `docs/agents/triage-labels.md` to match your tracker's vocabulary.

## License

MIT
