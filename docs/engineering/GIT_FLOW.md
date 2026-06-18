# Git Workflow

## Branch naming

- `feature/<short-description>` — new features
- `bugfix/<short-description>` — bug fixes
- `docs/<short-description>` — documentation changes
- `chore/<short-description>` — maintenance, tooling, CI

## Commit format

Conventional Commits on the first line:

```
<type>(<scope>): <short imperative summary>
```

Example:

```
feat(hooks): add pre/post lifecycle hooks for AI agent workflows
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

1. Ensure you're on `master` with all changes merged.
2. Run `pnpm run release` — this reads commits since the last tag, determines the next version, updates `CHANGELOG.md`, bumps `package.json`, commits, and tags.
3. Run `pnpm run release:push` to ship. This pushes the branch and the tag as **two separate git events** (`git push origin master && git push origin --tags`). The separation is required: a single `git push --follow-tags` lets GitHub collapse the branch+tag into one branch-ref workflow run, which skips the tag-gated `publish` and `wiki` jobs. The tag event reliably triggers the publish + wiki jobs in CI.

## Before every PR

Before creating a PR, ensure `README.md` at the repo root is up to date:

- If new CLI flags were added, list them in the CLI section.
- If new component groups were added, list them in the Components table.
- If the scaffold output changed, update the "What you get" tree.
- If the quick-start or after-scaffolding instructions changed, update them.

This keeps the published README accurate for users running `npx`.

## PR workflow

1. Create a feature/bugfix/docs branch from master.
2. Update `README.md` if the change affects the user-facing interface.
3. Commit with Conventional Commit format.
4. Push the branch to origin.
5. Create a PR on GitHub.
6. Review the PR — check diff, verify `npm test` passes, confirm README is current.
7. Merge the PR (squash or merge commit, no rebase).
8. Delete the PR branch locally and on origin.
9. Follow the release workflow above to ship.
