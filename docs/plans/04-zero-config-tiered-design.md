# Zero-Config ↔ High-Tier Architecture

The scaffold must work as both a zero-config tool (run with no flags, get a
useful result) and a high-tier configurable tool (every option exposed via
flags and interactive prompts).

## Architecture

```
                    ┌──────────────┐
                    │  Project     │
                    │  Directory   │
                    └──────┬───────┘
                           │
                    ┌──────▼───────┐
                    │ detect.js    │
                    │ (I/O scan)   │  ← NEW
                    └──────┬───────┘
                           │ ProjectProfile
           ┌───────────────┼───────────────┐
           │               │               │
    ┌──────▼──────┐ ┌──────▼──────┐ ┌──────▼──────┐
    │ Zero-config │ │ CLI flags   │ │ Interactive │
    │ (no flags)  │ │ override    │ │ override    │
    │ auto-detect │ │             │ │ (-i)        │
    │ only, never │ │ --force     │ │ ask before  │
    │ overwrite   │ │ --ci, etc.  │ │ overwrite   │
    └──────┬──────┘ └──────┬──────┘ └──────┬──────┘
           │               │               │
           └───────┬───────┴───────┬───────┘
                   │               │
            ┌──────▼──────┐ ┌──────▼──────┐
            │ scaffold.js │ │ templates/  │
            │ writes to   │ │ (unchanged  │
            │ target dir  │ │  structure) │
            └─────────────┘ └─────────────┘
```

## Three Tiers

### Tier 1: Zero-Config

```
npx @yarkingulacti/agentic-scaffold
```

- Auto-detects everything from the project directory
- Never overwrites existing files
- Scaffolds only what's missing
- Prints summary of what was created and what was skipped

### Tier 2: Flag Mode

```
npx @yarkingulacti/agentic-scaffold --ci-provider github --package-manager pnpm
npx @yarkingulacti/agentic-scaffold --force
npx @yarkingulacti/agentic-scaffold --ai-tools opencode,cursor
```

- CLI flags override auto-detected values
- `--force` enables overwriting existing files
- No prompts

### Tier 3: Interactive Mode

```
npx @yarkingulacti/agentic-scaffold -i
```

- Shows detected profile before prompts
- Pre-fills prompts with detected values
- Asks before overwriting existing files
- Full control over every option

## Config Resolution Chain

```
1. Null state (nothing known)
2. Auto-detected profile (detect.js)
3. CLI flags override (bin/index.js)
4. Interactive answers override (prompts.js, only when -i)
5. Final fallback defaults (DEFAULTS in scaffold.js)
```

Each tier fills `null` slots. A defined CLI flag always wins over
auto-detection. Interactive answers always win over CLI flags.

## Overwrite Behavior

| Mode | Behavior |
|------|----------|
| Zero-config (no --force) | Skip existing files. Log "skipped, already exists" |
| --force | Overwrite everything unconditionally |
| Interactive (no --force) | Ask per-file: "already exists. Overwrite? [y/N]" |

## detect.js — Project Profile Scanner

Scans the target directory for:

| Scan | Method |
|------|--------|
| Project name | Directory basename |
| Languages | `package.json`, `requirements.txt`, `pyproject.toml`, `go.mod`, `Cargo.toml` |
| Package manager | Lockfile detection (`package-lock.json`, `yarn.lock`, `pnpm-lock.yaml`, `poetry.lock`) |
| Test framework | Config files (`jest.config.*`, `vitest.config.*`, `pytest.ini`) + dependency scan |
| Database | Dependency scan (`pg`, `mysql2`, `sqlite3`, `prisma`, `drizzle`, `sqlalchemy`) |
| CI provider | `.github/`, `.gitlab-ci.yml`, `.circleci/` directory checks |
| AI tools | `opencode.json`, `.cursorrules`, `.copilot-instructions.md`, `.windsurfrules` |
| Issue tracker | `.github/` exists → github, else null |
| Existing artifacts | `Dockerfile`, `.env.example`, `CONTRIBUTING.md`, `CHANGELOG.md`, `docs/api/`, migration dirs |

All scans are `existsSync` + lightweight reads. Target: under 20ms.
