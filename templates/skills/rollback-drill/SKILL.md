# Rollback Drill

Practice rolling back a change safely. Use this skill when the user wants to
rehearse a rollback scenario, test disaster recovery, or validate that
schema migrations can be reversed.

## Steps

1. Identify the change to roll back (migration, commit, or deployment).
2. Determine the rollback strategy:
   - **Schema**: apply the down migration.
   - **Code**: revert the commit or deploy previous version.
   - **Data**: restore from backup or run a data migration.
3. Test the rollback in a safe environment first.
4. Execute the rollback.
5. Verify the system is healthy after rollback.
6. Document what went wrong and how to prevent it.

## Rules

- Never roll back a production database without a tested down migration.
- Always verify the rollback on a staging environment first.
- If the rollback requires data loss, get explicit human approval.
- After rollback, create a follow-up issue to fix the root cause.

## Prerequisites

- Read `.agentic-scaffold/docs/agents/migrations.md` before rolling back schema
  changes.
- Read relevant ADRs and `BUSINESS_LOGIC.md` to understand domain impact.
