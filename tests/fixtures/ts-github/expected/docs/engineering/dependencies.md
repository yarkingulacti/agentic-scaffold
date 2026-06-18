# Dependency Management

This project manages dependencies through **npm**.

## Principles

1. **Lockfile** — always commit the lockfile (`package-lock.json`, `pnpm-lock.yaml`,
   `yarn.lock`, etc.) to ensure reproducible installs.
2. **Frozen installs** — CI and production installs use `--frozen-lockfile` or
   equivalent to validate that the lockfile matches the manifest.
3. **Audit** — regularly check for known vulnerabilities:
   - `npm audit` / `pnpm audit` / `yarn audit`
4. **Outdated** — review outdated packages periodically:
   - `npm outdated` / `pnpm outdated` / `yarn outdated`
5. **Minimal surface** — avoid unnecessary dependencies. Prefer standard library
   or small, focused packages over large frameworks.

## Agent rules

- Do not add a dependency without understanding what it does.
- Prefer devDependencies over dependencies when the package is only needed in
  development.
- If a dependency has a known vulnerability, update it or find an alternative.
