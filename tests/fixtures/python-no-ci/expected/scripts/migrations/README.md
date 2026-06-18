# Database Migrations

This directory contains database migration scripts for py-app.

## Naming Convention

Migrations are named using the pattern: `YYYYMMDD_HHMMSS_description.ext`

Example: `20260618_120000_add_users_table.sql`

## Rules

1. **Idempotent**: Migrations should be safe to run multiple times.
2. **Forward-only**: Never modify a committed migration; create a new one.
3. **Tested**: Each migration must have a rollback or be verified on a copy of production data.
4. **Reviewed**: Schema changes must be reviewed before deployment.

## Workflow

1. Create a new migration with the timestamp prefix.
2. Test the migration against a local database.
3. Commit the migration separately from application code changes.
4. Deploy migrations before deploying the code that depends on the new schema.

## Rollback

If a migration needs to be rolled back:

1. Create a new migration that reverses the change.
2. Test the rollback.
3. Deploy the rollback.

Never delete or modify existing migration files.
