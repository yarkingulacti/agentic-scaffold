# Bugfix

Diagnose and fix a described bug.

## Steps

1. Read `BUSINESS_LOGIC.md` and relevant ADRs.
2. Reproduce or narrow the bug before changing code.
3. Identify the smallest root-cause fix.
4. Add or update a regression test when practical.
5. Run focused verification.
6. If `.agentic-scaffold/.agents/hooks/post-bugfix.md` exists, read and follow it.
   Otherwise record shipped work in `.agentic-scaffold/.history/DD.MM.YYYY/README.md`.
