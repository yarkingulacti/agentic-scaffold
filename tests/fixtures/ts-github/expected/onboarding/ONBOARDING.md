# Onboarding

Welcome to **ts-app**!

## Prerequisites

Languages needed: TypeScript.
Package manager: **npm**.

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
npm test

# Lint
npm run lint

# Build
npm run build
```

## Next steps

1. Read `BUSINESS_LOGIC.md` for domain context.
2. Read `CONTRIBUTING.md` for contribution workflow.
3. Read `.agentic-scaffold/docs/CODING_PRINCIPLES.md` for coding conventions.
4. Find a good first issue in the issue tracker.
