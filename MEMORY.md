# MEMORY

## Git flow — follow this every time

### Release workflow (from `docs/engineering/GIT_FLOW.md`)

1. Update `CHANGELOG.md` with new version entry.
2. Bump `version` in `package.json`.
3. Commit: `chore(release): bump to v<version>`
4. Tag: `git tag v<version>` and `git push origin v<version>`

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
