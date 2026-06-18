# Prisma Migrations

Prisma Migrate generates schema migrations from the Prisma schema file.

## File naming

Prisma generates migration directories with a timestamp prefix:

```
prisma/migrations/20260618120000_add_users_table/
  migration.sql
  migration_lock.toml
```

## Commands

```bash
# Create a new migration from schema changes
npx prisma migrate dev --name add_users_table

# Apply migrations in production
npx prisma migrate deploy

# Reset (dev only — drops and recreates)
npx prisma migrate reset

# Check status
npx prisma migrate status
```

## Conventions

- Always review the generated `migration.sql` before committing.
- Use `prisma migrate dev` during development, `prisma migrate deploy` in CI.
- Never edit a committed migration — create a new one.
- Test the migration with `prisma migrate deploy` on a staging database.
