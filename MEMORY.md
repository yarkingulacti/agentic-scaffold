# MEMORY

## Git flow — follow this every time

### Golden rules

1. **Feature branches are mandatory.** Every new feature MUST start by creating a `feature/<short-description>` branch from master. Never commit feature work directly to master.
2. **Every release gets a version tag.** After merging to master, always create an annotated `git tag v<version>` and push it to origin.

### Release workflow

1. `npm run release` — auto-bumps version, generates changelog, commits, tags
2. `git push --follow-tags origin master` — triggers CI publish

### Commit format

```
<type>(<scope>): <short imperative summary>
```

Allowed types: `feat`, `fix`, `docs`, `refactor`, `test`, `build`, `ci`, `chore`.

### Before every commit

Check `git status` and `git diff` — stage only intended files.

### Branch naming

- `feature/<short-description>` — new features
- `bugfix/<short-description>` — bug fixes
- `docs/<short-description>` — documentation changes
- `chore/<short-description>` — maintenance, tooling, CI

### PR workflow

1. Create branch from master.
2. Update `README.md` if change affects user-facing interface.
3. Commit with conventional format.
4. Push, create PR, review, merge, delete branch, release.
