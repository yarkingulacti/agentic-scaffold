# Post-Feature Hook

Fires after a feature is delivered by any implementation skill.

## Steps

1. Run the project's test suite:
      `pnpm test`
2. Run `.agentic-scaffold/.agents/hooks/scripts/post-feature.sh` if it exists.
3. Update `.agentic-scaffold/.history/DD.MM.YYYY/README.md` with a summary of shipped work.
4. Run `.agentic-scaffold/scripts/memory_index.mjs` to keep the keyword index current.
5. Update the related `.agentic-scaffold/.scratchpad/` status to mark completion.
6. Create a Conventional Commit under the master work title.

## When to skip

If the project has no tests, no history directory, or no memory pipeline,
skip the unavailable steps silently. Do not pretend they succeeded.
