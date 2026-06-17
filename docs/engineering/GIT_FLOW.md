# Git Workflow

## Branch naming

- `feature/<short-description>` — new features
- `bugfix/<short-description>` — bug fixes
- `docs/<short-description>` — documentation changes
- `chore/<short-description>` — maintenance, tooling, CI

## Commit format

Master work title as the first line, then the Conventional Commit line:

```
<Master work title>

<type>(<scope>): <short imperative summary>
```

Example:

```
Markdown memory system

docs(memory): establish agent memory workflow
```

Allowed types: `feat`, `fix`, `docs`, `refactor`, `test`, `build`, `ci`, `chore`.

## Tagging

After merging a feature, tag the merge commit with a semantic version:

```bash
git tag v<major>.<minor>.<patch>
git push origin v<major>.<minor>.<patch>
```

## PR workflow

1. Create a feature/bugfix/docs branch from master.
2. Commit with Conventional Commit format.
3. Push the branch and tag to origin.
4. Create a PR on GitHub.
5. Review the PR — check diff, verify tests pass, confirm commit message style.
6. Merge the PR (squash or merge commit, no rebase).
7. Delete the PR branch.
