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

## Changelog

Every release gets an entry in `CHANGELOG.md` at the repo root. Use the
[Keep a Changelog](https://keepachangelog.com/) format:

```markdown
## [v0.3.1] - 2026-06-17

### Added
- New feature description.

### Changed
- Change description.

### Fixed
- Bug fix description.
```

Group changes under `Added`, `Changed`, `Deprecated`, `Removed`, `Fixed`,
`Security`. Each entry is a bullet point referencing the PR number.

## Versioning

This project follows [Semantic Versioning](https://semver.org/).

- **MAJOR** — breaking changes to the scaffold API or generated output.
- **MINOR** — new features, new component groups, new flags.
- **PATCH** — bug fixes, documentation, test additions.

## Release workflow

1. Update `CHANGELOG.md` with the new version entry.
2. Bump the `version` field in `package.json`.
3. Commit: `chore(release): bump to v<version>`.
4. Tag: `git tag v<version>` and `git push origin v<version>`.
5. The CI publish workflow triggers on the tag and publishes to npm.

## PR workflow

1. Create a feature/bugfix/docs branch from master.
2. Commit with Conventional Commit format.
3. Push the branch to origin.
4. Create a PR on GitHub.
5. Review the PR — check diff, verify tests pass, confirm commit message style.
6. Merge the PR (squash or merge commit, no rebase).
7. Delete the PR branch locally and on origin.
8. Follow the release workflow above to ship.
