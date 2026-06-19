---
name: superpowers
description: Disciplined, spec-first software-development methodology. Brainstorm a spec, get sign-off, write a bite-sized plan, execute with subagents and strict TDD, review, then finish the branch. Use when the user starts a non-trivial feature, says "use superpowers", asks for a thorough/process-driven build, or wants planning before code.
---

# Superpowers

A complete development methodology: never jump straight to code. Step back,
understand the real goal, agree on a spec, plan in small verifiable steps, then
build with tests and review. The phases are mandatory workflow, not suggestions.

Adapted for agentic-scaffold from the [Superpowers](https://github.com/obra/superpowers)
methodology (see Credit below).

## When this applies

Any change beyond a one-line fix. For trivial edits, skip straight to the
relevant focused skill (`implement`, `bugfix`, `diagnose`).

When exploring the codebase, use the project's domain glossary
(`.agentic-scaffold/docs/context/glossary.md`) and respect ADRs in the area you
touch, so spec, plan, and test vocabulary match the project's language.

## Phase 1 — Brainstorm the spec

Do not write code. Refine the rough idea into a spec through questions.

1. Ask what the user is really trying to accomplish — the outcome, not the
   implementation.
2. Surface constraints, edge cases, and at least one alternative approach.
3. Present the design back in chunks short enough to actually read.
4. Get explicit sign-off on the spec before continuing.
5. Save the agreed design to `.agentic-scaffold/.scratchpad/<feature-slug>/spec.md`.

## Phase 2 — Isolate the workspace

After the spec is approved, work on a dedicated branch (or git worktree for
parallel work). Run project setup and confirm a clean, green test baseline
before changing anything — you must know tests pass *before* you start.

## Phase 3 — Write the plan

Turn the approved spec into a plan an enthusiastic junior engineer with no
context could follow. Break work into bite-sized tasks (a few minutes each).
Every task names exact file paths, the change to make, and how to verify it.
Emphasize YAGNI (build only what the spec needs) and DRY. Save the plan to
`.agentic-scaffold/.scratchpad/<feature-slug>/plan.md`.

## Phase 4 — Execute (subagent-driven)

Work the plan one task at a time. Prefer dispatching a fresh subagent per task
so each starts with clean context, then review its output in two stages:

1. **Spec compliance** — does it do exactly what the task specified, no more?
2. **Code quality** — is it simple, consistent with existing conventions, and
   free of dead code or speculative abstraction?

A failing stage sends the task back before moving on. Independent tasks run in
parallel; tasks that share an evolving interface run in sequence.

## Phase 5 — Test-driven development

Drive every behavior with the RED → GREEN → REFACTOR loop (see the `tdd` skill
for the full discipline):

1. Write ONE failing test for the next behavior. Watch it fail (RED).
2. Write the minimal code to pass. Watch it pass (GREEN).
3. Refactor only while GREEN.
4. Test behavior through public interfaces, never implementation details.

Delete code that was written before its test. No horizontal slicing (all tests,
then all code).

## Phase 6 — Request code review

Between tasks, review against the plan and report issues by severity. Critical
issues block progress — fix them before continuing.

## Phase 7 — Finish the branch

When all tasks are done and tests are green:

1. Run the full verification the project requires.
2. Confirm the spec's acceptance criteria are met end-to-end.
3. Present the merge/PR options and follow this repo's git flow.
4. Record shipped work in `.agentic-scaffold/.history/DD.MM.YYYY/README.md`, and
   if `.agentic-scaffold/.agents/hooks/post-feature.md` exists, follow it.

## Philosophy

- **Spec before code.** Understand the goal before touching the keyboard.
- **Test-first, always.** Evidence over claims; verify before declaring success.
- **Systematic over ad-hoc.** Process beats guessing.
- **Simplicity is the goal.** Reduce complexity; YAGNI and DRY.

## Credit

This skill adapts the methodology from **Superpowers** by Jesse Vincent and the
team at [Prime Radiant](https://primeradiant.com) —
<https://github.com/obra/superpowers> (MIT License). The upstream project is a
full multi-skill plugin for several coding agents; this is a single condensed
skill that captures its core workflow. For the complete framework, install
Superpowers directly from the upstream repository.
