# Security

Security guidelines for ts-app.

## Principles

1. **Defense in depth** — multiple layers of security controls.
2. **Least privilege** — code and users should have only the permissions they need.
3. **Input validation** — never trust user input. Validate, sanitize, escape.
4. **Secrets management** — never commit secrets to version control.

## Secrets

- Use environment variables for secrets, not config files.
- Use `.env` files locally (they are gitignored).
- In production, use a secrets manager (e.g., GitHub Actions secrets, AWS Secrets
  Manager, or HashiCorp Vault).

## Dependencies

- Run `npm audit` (or equivalent) regularly.
- Keep dependencies up to date.
- Review dependency changes in PRs.

## Agent rules

- Never log secrets, tokens, or passwords.
- Never commit `.env` files or files containing secrets.
- Use parameterized queries or ORM methods to prevent SQL injection.
- Sanitize output to prevent XSS.
- Report security issues through the project's issue tracker, not in public.
