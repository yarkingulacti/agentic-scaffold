# node-pg-migrate Migrations

node-pg-migrate manages PostgreSQL schema migrations for Node.js projects.

## File naming

Migrations are named with a timestamp prefix:

```
20260618120000_add-users-table.js
20260618120000_add-users-table.sql
```

The format is: `YYYYMMDDHHMMSS_description.ext`

## Commands

```bash
# Create a new migration
npx node-pg-migrate create add users table

# Apply pending migrations
npx node-pg-migrate up

# Rollback the last migration
npx node-pg-migrate down

# Check status
npx node-pg-migrate status
```

## Conventions

- Use SQL files for simple DDL changes.
- Use JS files for data migrations that need application logic.
- Test both `up` and `down` directions.
- Name the file descriptively — the timestamp ensures ordering.
