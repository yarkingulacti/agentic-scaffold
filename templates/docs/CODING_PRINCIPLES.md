# Coding Principles

This is the short repo version for day-to-day implementation by human and AI agents.

## Operating Rules

- Prefer simple, direct implementations over speculative extensibility.
- Apply YAGNI: do not build features or abstractions for hypothetical future needs.
- Apply KISS: minimize moving parts and avoid clever code.
- Apply pragmatic DRY: remove duplicated knowledge, not every similar line.
- Respect existing architecture, naming, folder layout, and test style.
- Add an abstraction only when there is a current, demonstrated variation point.
- Avoid factories, registries, adapters, plugin systems, event buses, and generic frameworks unless the task or existing codebase requires them.
- Keep changes small, reviewable, and testable.
- Fail fast at system boundaries with explicit validation and meaningful errors.
- Leave nearby code cleaner only when the cleanup is directly related and low risk.

## Backend

- Keep HTTP/request concerns out of domain logic.
- Keep transaction boundaries explicit.
- Use the project's chosen ORM/database tools.
- Use ledgers and idempotency for balances, provider events, and sensitive state changes.
- Prefer clear domain methods and focused services over broad utility modules.

## Frontend

- Build the actual workflow, not marketing around the workflow.
- Keep UI state local unless it is shared by a real user flow.
- Components should have one clear responsibility and fit the existing design system.
- User-facing health/safety text must be safe, factual, and non-advisory.

## Review Checklist

- Is every new file needed for the current task?
- Is each new abstraction used by real code today?
- Does the code use project vocabulary from `BUSINESS_LOGIC.md` and `docs/context/glossary.md`?
- Are failures handled near the boundary where they become knowable?
- Do tests cover the behavior that could regress?
- Could a simpler function or module solve the same current requirement?
