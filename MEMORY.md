# Git Rules — follow EVERY session

## 1. Master is production — NEVER push directly

Master is the production branch. Every change must flow through a PR. No
exceptions. No force-push. No direct commits.

## 2. Temporary branches for EVERYTHING

Every piece of work gets its own branch. Branch from master, never from another
feature branch. Use Conventional Branch naming:

- `feat/<short-description>` — new features
- `fix/<short-description>` — bug fixes
- `docs/<short-description>` — documentation
- `refactor/<short-description>` — refactoring
- `chore/<short-description>` — maintenance, tooling, CI

## 3. Small branches — no mega-PRs

Break work into small, logical chunks. If a feature touches 5 concerns, it
should be 5 branches. A PR should be reviewable in under 10 minutes. If you
find yourself writing a huge diff, stop and split.

## 4. Conventional Commits with a clear title

Every commit starts with a short, descriptive title line:

```
<type>(<scope>): <short imperative summary>
```

Allowed types: `feat`, `fix`, `docs`, `refactor`, `test`, `build`, `ci`,
`chore`. The title must be readable at a glance — "feat(cli): add --dry-run
flag", not "wip".

## 5. PRs are the delivery mechanism

Code reaches master exclusively through GitHub PRs. After creating a PR:

- Re-read the diff in full
- Analyse whether each change is correct, tested, and necessary
- Run the test suite (`npm test`)
- Run lint + typecheck (`npm run lint && npm run typecheck`)
- Only then merge

If you find issues during review, fix them in the same branch and push again.

## 6. PRs must be complete

Every PR requires:

- A **title** that matches the Conventional Commit format
- A **description** explaining what changed and why
- **Comments** showing PR activity (questions, decisions, review notes)

A PR with no description or no activity is not ready to merge.

## 7. Every master PR gets a SemVer tag

Every PR merged to master must result in a SemVer-compliant version tag
(`v<major>.<minor>.<patch>`). The tag must be pushed to origin.

- Use `npm run release` for automatic version bump, changelog generation,
  commit, and tag
- Or manually: `git tag v<version> && git push origin v<version>`
- The version bump must reflect the PR's scope (patch for fixes, minor for
  features, major for breaking changes)

## 8. Cleanup after every PR

After merging:

1. Delete the branch (remote and local)
2. Pull master locally to stay in sync
