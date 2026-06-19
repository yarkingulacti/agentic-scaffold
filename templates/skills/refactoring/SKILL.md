---
name: refactoring
description: Refactoring assessment and patterns for already-tested code. Use when the user asks to refactor, clean up, simplify, or restructure existing code, and as the REFACTOR step of the TDD cycle. Covers commit-before-refactoring discipline, when refactoring adds value vs when to skip it, and priority classification. Do NOT use for untested code or for adding behavior (see tdd) — for large architectural change see improve-codebase-architecture.
---

# Refactoring

Refactoring is the final step of TDD. After tests are green (and, ideally, mutation
testing confirms their strength), assess whether refactoring actually adds value.

## When to refactor

- Always assess once tests confirm behavior is locked in.
- Only refactor if it improves the code.
- **Commit working code BEFORE refactoring** — the critical safety net.

### Commit before refactoring — why

A working baseline lets you revert if a refactor breaks things, makes
experimentation safe, and shows a clean separation in git history.

**Workflow:** GREEN (tests pass) → verify test effectiveness → COMMIT working code →
REFACTOR → COMMIT refactored code.

## Priority classification

| Priority | Action | Examples |
|----------|--------|----------|
| Critical | Fix now | Surviving mutations, knowledge duplication, >3 levels nesting |
| High | This session | Magic numbers, unclear names, >30-line functions |
| Nice | Later | Minor naming, single-use helpers |
| Skip | Don't change | Already-clean code |

## DRY = knowledge, not code

**Abstract when** the same business concept appears (same semantic meaning), the
copies would change together if requirements change, and it's obvious why they're
grouped.

**Keep separate when** they are different concepts that merely look similar, would
evolve independently, or where coupling would be confusing.

## Speculative code is a TDD violation

If code isn't driven by a failing test, don't write it. Every line must have a test
that demanded its existence. Delete "just in case" logic, unused flexibility, and
untested error-handling paths — if the behavior is needed, write a failing test that
demands it, then implement.

## When NOT to refactor

- Code works correctly (no bug to fix).
- No test demands the change (speculative).
- It would change behavior (that's a feature, not a refactor).
- Premature optimization, or code is "good enough" for the current phase.
- **Extracting purely for testability** — if the only reason to move code into a new
  file is "so we can unit test it", keep it inline; the consuming function already has
  behavioral coverage. Extract for readability, DRY, or separation of concerns —
  never for testability alone.

## Commit messages

Format `refactor: <what changed>` (e.g. `refactor: extract scenario validation
logic`). Refactor commits are never mixed with feature commits.

## Checklist

- [ ] All tests pass without modification
- [ ] No new public APIs added
- [ ] Code more readable than before
- [ ] Committed separately from features, BEFORE refactoring (safety net)
- [ ] No speculative code added
- [ ] Behavior unchanged (tests prove this)

## Credit

Adapted from the **refactoring** skill by Paul Hammond
([citypaul/.dotfiles](https://github.com/citypaul/.dotfiles/blob/main/claude/.claude/skills/refactoring/SKILL.md)).
