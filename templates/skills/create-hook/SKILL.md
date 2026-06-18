---
name: create-hook
description: >
  Interview the user to identify a new lifecycle hook point, then create the
  hook markdown file, optional executable script, and wire it into the
  relevant skills.
---

# Create Hook

Add a new agent lifecycle hook to `.agents/hooks/`. Hooks are markdown files
that describe what an AI agent should do at a specific point in the workflow
(pre-feature, post-bugfix, etc.).

## Steps

### 1. Determine the hook point

Ask the user what event should trigger the hook. Common patterns:

| Prefix | Meaning | Example |
|--------|---------|---------|
| `pre-` | Before an event | `pre-deploy`, `pre-commit`, `pre-test` |
| `post-` | After an event | `post-deploy`, `post-migration`, `post-docs-change` |

If the user is unsure, suggest hooking into `post-session.md` instead — it
already chains to `post-feature.md` and `post-bugfix.md`.

### 2. Name and create the hook file

Name the file `<prefix>-<name>.md` and create it at `.agents/hooks/`. Use
this anatomy:

```markdown
# <Name> Hook

Fires <when this hook runs, e.g. "after every database migration">.

## Steps

1. First step the agent should take.
2. Second step.
3. Run `.agents/hooks/scripts/<name>.sh` if it exists.

## When to skip

Conditions under which the agent should silently skip this hook.
```

### 3. Create the optional executable script

If the hook needs automation, create `.agents/hooks/scripts/<name>.sh`:

```bash
#!/usr/bin/env bash
# <Name> hook — runs <when>.
set -euo pipefail
```

Follow the project's script language convention. Make the script
idempotent where possible.

### 4. Wire into skills

Add a conditional reference in every skill where the hook should fire.
Use the existing pattern:

```markdown
4. If `.agents/hooks/<hook-name>.md` exists, read and follow it.
```

Skills commonly wired to hooks:

| Skill | Hook point | File |
|-------|-----------|------|
| `implement` | pre + post | `.agents/skills/implement/SKILL.md` |
| `bugfix` | post | `.agents/skills/bugfix/SKILL.md` |
| `tdd` | pre + post | `.agents/skills/tdd/SKILL.md` |

### 5. Wire into the session close chain

If the hook should fire at the end of every session, add it to the
`post-session.md` chaining step — for example, after the existing
sub-hook references.

### 6. Confirm with the user

Show the user:
- The new hook file path
- The script file path (if created)
- Which skills reference it
