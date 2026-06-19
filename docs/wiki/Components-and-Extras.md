# Components & Extras

The scaffold splits its output into **core components** (written by default) and
**extras** (opt-in via `--extras`), so a zero-config run stays conservative.

## Core components

Written by default. Skip any of them with its flag:

| Group | Description | Flag |
|-------|-------------|------|
| `docs` | Documentation framework (CODING_PRINCIPLES, ADR, agents, context) | `--skip-docs` |
| `scripts` | Node.js memory indexing pipeline (flat-file keyword index) | `--skip-scripts` |
| `skills` | 23 agent skills (implement, bugfix, create-hook, diagnose, tdd, fill-docs, …) | `--skip-skills` |
| `hooks` | Pre/post lifecycle hooks (pre-feature, post-feature, post-bugfix, post-session) with executable scripts | `--skip-hooks` |

The working directories `.scratchpad/` and `.history/` are also created by
default; skip them with `--skip-scratchpad` and `--skip-history`.

## Extras

Opt-in via `--extras` so zero-config mode stays conservative:

| Extra | Description |
|-------|-------------|
| `ci` | CI/CD templates for the detected or requested provider |
| `contribute` | Contribution guide, PR template, and review guidance |
| `ai-config` | AI tool config files and skill-command adapters: `opencode.json`, `.cursorrules`, Copilot instructions, `.agents/skills/*/SKILL.md`, `.claude/skills/*/SKILL.md`, `.gemini/commands/*.toml`, `.deepcode/skills/*/SKILL.md`, `.grok/skills/*/SKILL.md` |
| `onboarding` | Human onboarding guide and setup helper |
| `rtk` | Project-local RTK token-cost filters in `.rtk/filters.toml` |
| `all` | Include every extras group |

```bash
# A single extra
npx @yarkingulacti/agentic-scaffold --extras onboarding

# Several at once
npx @yarkingulacti/agentic-scaffold --extras ci,contribute,ai-config,onboarding,rtk

# Everything
npx @yarkingulacti/agentic-scaffold --extras all
```

## Token-cost controls (`rtk` extra)

`--extras rtk` (or `--extras all`) writes an opt-in `.rtk/filters.toml` to the
target project. [RTK](https://github.com/rtk-ai/rtk) (Rust Token Killer) filters
high-volume command output to cut agent token usage from noisy shell output.
Install RTK and run `rtk trust` from the project root to apply the filters.

## Ownership & removal

Every written file is recorded in a v2 root-relative manifest, including
root-level extras (`.github/` workflows, AI config), copied entry points, and
symlinks. `agentic-scaffold un` uses that manifest to remove exactly what it
created and to warn about files you modified after scaffolding. See
**[CLI Reference](CLI-Reference)** for the `un` command.
