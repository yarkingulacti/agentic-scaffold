# CI/CD: gitlab

This project uses **gitlab** for continuous integration.

## Workflow

Package management: **pnpm**.

### Standard pipeline

1. **Install** — dependencies are fetched with a lockfile
2. **Lint** — code style and static analysis
3. **Test** — unit and integration tests
4. **Build** — compilation or bundling

## Agent rules

- Before pushing, run `lint` and `test` locally.
- Read the CI config (`.github/workflows/ci.yml` or `.gitlab-ci.yml`) to
  understand the exact commands used.
- If CI fails after a push, read the CI output and fix the issue — do not
  retry blindly.
- Do not disable or modify CI checks without explicit human approval.
