# CLI Reference

## Commands

| Command | What it does |
|---------|--------------|
| `agentic-scaffold` | Scaffold agentic configuration into a project (default command) |
| `agentic-scaffold un` | Remove scaffolded files from a project |
| `agentic-scaffold update` | Update an existing scaffold without clobbering user edits |

## Common invocations

```bash
# Zero-config — auto-detect and scaffold what's missing
npx @yarkingulacti/agentic-scaffold

# Force overwrite existing files
npx @yarkingulacti/agentic-scaffold --force

# Override auto-detection
npx @yarkingulacti/agentic-scaffold --package-manager pnpm --ci-provider github

# Override detected languages (comma-separated)
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

## Flags

| Flag | Type | Description |
|------|------|-------------|
| `--json` | boolean | Output results as JSON to stdout, progress to stderr |
| `-n, --dry-run` | boolean | Preview scaffold or update changes without writing anything |
| `-i, --interactive` | boolean | Run in interactive mode with prompts |
| `-t, --target` | string | Target directory (default: current working directory) |
| `--only` | string | Comma-separated core groups to include: `docs,scripts,skills,hooks,all` |
| `--extras` | string | Comma-separated extras groups: `ci,contribute,ai-config,onboarding,rtk,all` |
| `--skip-skills` | boolean | Skip agent skill definitions |
| `--skip-hooks` | boolean | Skip agent lifecycle hook templates |
| `--skip-scripts` | boolean | Skip memory scripts |
| `--skip-docs` | boolean | Skip docs folder |
| `--skip-ci` | boolean | Skip CI/CD configuration templates |
| `--skip-contribute` | boolean | Skip contribution guide templates |
| `--skip-ai-config` | boolean | Skip AI tool configuration templates |
| `--skip-onboarding` | boolean | Skip onboarding guide templates |
| `--skip-rtk` | boolean | Skip RTK token-cost filter templates |
| `--skip-history` | boolean | Skip `.history` directory |
| `--skip-scratchpad` | boolean | Skip `.scratchpad` directory |
| `--project-name` | string | Project name (used in generated files) |
| `--issue-tracker` | `linear` \| `github` | Issue tracker type |
| `-f, --force` | boolean | Overwrite existing files |
| `--package-manager` | `npm` \| `yarn` \| `pnpm` \| `pip` \| `poetry` \| `go-mod` \| `cargo` | Package manager (overrides auto-detection) |
| `--ci-provider` | `github` \| `gitlab` \| `circleci` | CI provider (overrides auto-detection) |
| `--ai-tools` | string | Comma-separated AI tools/providers to configure: `opencode,cursor,copilot,codex/openai,claude/anthropic,gemini/google,deepcode/deepseek,grok/xai` |
| `--languages` | string | Comma-separated languages, overrides auto-detection: `ts,js,python,go,rust,cpp,godot,swift,kotlin,java,dart` |
| `--script-language` | `node` | Memory script runtime. Only `node` is supported because the shipped scripts are `.mjs` files. |

See **[Components & Extras](Components-and-Extras)** for what each group writes.
