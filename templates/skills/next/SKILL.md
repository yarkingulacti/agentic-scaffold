# Next

Scan work history to determine the next development task. If no clear next step emerges, enter planning mode and interview the user.

## Steps

1. **Scan work history**
   - Read `BUSINESS_LOGIC.md` for project goals and roadmap.
   - Read `CONTEXT.md` (via `.agentic-scaffold/docs/context/INDEX.md`) for active context.
   - Check `.agentic-scaffold/.scratchpad/` for active or ready work items.
   - Read the latest entries in `.agentic-scaffold/.history/` (most recent day directories).
   - Run `git log --oneline -20` to review recent commits.
   - Check open issues or PRs if an issue tracker is configured.

2. **Identify next work**
   - Look for items marked as "next", "ready", or "todo" in scratchpad files.
   - Check for blocked items whose blocker may have been resolved.
   - Review recent git history for incomplete or interrupted work.
   - Cross-reference against the roadmap for unstarted priorities.

3. **Decide action**
   - If a clear next task is found: present it to the user with a summary of why.
   - If multiple candidates: rank them by priority and ask the user to pick.
   - If nothing found: enter **planning mode** — ask the user what they want to work on next, then use `/to-issues` or `/to-prd` to formalize.

4. **Execute or plan**
   - If user confirms the next task, proceed with implementation.
   - If user chooses planning, guide discovery of what to build next.
