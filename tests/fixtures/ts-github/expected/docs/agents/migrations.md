# Database Migrations

This project follows a **principles-first** approach to schema changes. The
specific tool may vary (Alembic, Prisma, node-pg-migrate, etc.), but the
principles stay the same.

## Principles

### 1. Idempotency

Every migration must be safe to run multiple times. Use `IF NOT EXISTS`,
`IF EXISTS`, or equivalent constructs. A migration that errors on re-run is
a bug.

### 2. Forward-only

Never modify a committed migration. Create a new migration that reverses or
builds on the previous one. This guarantees a linear, auditable history.

### 3. Tested

Each migration must be verified against a representative copy of the data.
Test the migration, then test the rollback.

### 4. Reviewed

Schema changes must be reviewed by another person before deployment.
Include the SQL diff in the PR description.

### 5. Separate from code

Deploy migrations separately from application code. Migrations run first;
code that depends on the new schema deploys after.

## Workflow

1. Read the relevant ADR and `BUSINESS_LOGIC.md` to understand domain constraints.
2. Create a migration with the tool-specific naming convention.
3. Write the up (apply) and down (rollback) steps.
4. Test against a local or staging database.
5. Commit the migration alone (no app code changes in the same commit).
6. Deploy the migration.
7. Deploy the application code that uses the new schema.
8. If something goes wrong, run the rollback, not a hotfix.

## Tool-specific guides

- [Alembic](../scripts/migrations/alembic/README.md)
- [node-pg-migrate](../scripts/migrations/node-pg-migrate/README.md)
- [Prisma](../scripts/migrations/prisma/README.md)

## Agent rules

- Before writing a migration, read this document.
- Never modify a committed migration — create a new one.
- Test both the up and down directions.
- If a migration errors, roll back and fix, then re-apply.
