---
name: code-review
description: Automated, multi-angle review of a pull request or diff with confidence-scored findings so only high-signal issues surface. Reviews convention compliance, bugs, git-history context, prior PR comments, and code-comment accuracy. Use when the user wants a PR/branch reviewed, asks to "review this diff/PR", or before merging.
---

# Code Review

Review a pull request or diff from several independent angles, score each finding by
confidence, and surface only the high-confidence ones so the review is actionable
rather than noisy.

## When to skip

Don't review PRs that don't need it: closed, draft, automated/bot-authored, or
already-reviewed. Say so and stop.

## Review angles (run them independently)

1. **Convention compliance** — does the change follow the project's own rules
   (`AGENTS.md` / `CLAUDE.md`, `.agentic-scaffold/docs/CODING_PRINCIPLES.md`, ADRs,
   domain glossary)?
2. **Bug detection** — logic errors, unhandled cases, off-by-one, race conditions,
   resource leaks, incorrect error handling.
3. **Git-history context** — does the diff contradict recent changes, reintroduce a
   reverted fix, or ignore a pattern established nearby?
4. **Prior PR comments** — were earlier review comments on this branch addressed?
5. **Code-comment accuracy** — do comments and docstrings still match the code?

## Confidence scoring

Score every candidate finding 0–100. **Only report findings at or above a high
threshold (default 80).** This is the core of the skill: it dramatically cuts false
positives. Lower-confidence observations are dropped, not posted.

## Reporting

For each surfaced finding give: the exact location (file + line range, with a
full-SHA GitHub link when posting to a PR), the angle it came from, the problem, and
the suggested fix. Order by severity. You can narrow focus on request (security,
performance, accessibility) or adjust the threshold.

## Relationship to other skills

This reviews an existing diff/PR. For conversational bug intake that files issues, use
`qa`; for the broader spec→plan→build→review→finish flow, use `superpowers` (its
review phase can dispatch this skill).

## Credit

Adapted from Anthropic's **Code Review** plugin
(<https://claude.com/plugins/code-review>): multiple specialized reviewers in parallel
with confidence-based filtering. The original posts comments directly to GitHub via
`/code-review`; this skill captures its review methodology.
