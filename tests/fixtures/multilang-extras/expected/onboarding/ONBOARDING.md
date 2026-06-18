# Onboarding

Welcome to **poly-app**!

## Prerequisites

Languages needed: TypeScript, Go, Python.
Package manager: **pnpm**.

## First-time setup

Run the setup script:

```bash
# From the project root
./scripts/setup.sh
```

This will:

1. Install dependencies
2. Copy `.env.example` to `.env` (if present)
3. Run database migrations (if configured)
4. Verify the project builds

## Daily commands

```bash
# Run tests
pnpm test

# Lint
pnpm run lint

# Build
pnpm run build
```

## Next steps

1. Read `BUSINESS_LOGIC.md` for domain context.
2. Read `CONTRIBUTING.md` for contribution workflow.
3. Read `.agentic-scaffold/docs/CODING_PRINCIPLES.md` for coding conventions.
4. Find a good first issue in the issue tracker.
