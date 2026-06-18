# 13 Gaps in the Current Scaffold

Analysis from 2026-06-17 of what the scaffold is missing, ordered roughly by
impact.

Status legend: ❌ Open · 🔄 In progress · ✅ Resolved

## 1. CI/CD & Quality Gates ❌ Open

No scaffolded CI workflows, lint/type-check configs, or quality gates. The
session-close doc says "run tests, build" but there's no enforcement mechanism
or agent-facing docs about what CI enforces, how to read CI failures, or
pre-commit hook conventions.

## 2. Dependency Management Discipline ❌ Open

Nothing tells the agent *how* to add dependencies — vetting, license checks,
lockfile hygiene, avoiding dependency hell. A YAGNI agent adding a library
with no CI check is an accident waiting to happen.

## 3. Security Posture 🔄 In progress (Plan F)

No secrets scanning convention, no dependency audit workflow, no agent-facing
safe coding rules beyond generic "fail fast at boundaries."

Plan F addresses Handlebars noEscape, input validation, and path traversal hardening.

## 4. Release & Changelog Workflow ✅ Resolved

Versioning strategy, changelog generation, release branches — the agent can't
participate in a release without being told how.

Resolved by conventional commits + `commit-and-tag-version` + CI publish workflow.

## 5. Database/Schema Migration Conventions ❌ Open

The PRD skill mentions "schema changes" but there's no migration workflow,
rollback strategy, or guidance on how the agent should safely evolve the database.

## 6. API Documentation Scaffolding ❌ Open

No OpenAPI/Swagger spec template, API documentation conventions, or
documentation-first API design workflow.

## 7. Language-Portable Memory Pipeline 🔄 In progress (Plan G)

The memory pipeline (`scripts/`) is Python-only with sqlite-vec. If the project
is Node.js, Go, or Rust, requiring Python is an extra burden. No Docker-based
fallback or Node.js port exists.

Plan G adds Node.js memory scripts and auto-selects based on detected script language.

## 8. Configuration & Secrets Management ❌ Open

No `.env.example` template, config file conventions, or secrets-handling
workflow for the agent.

## 9. Observability Conventions ❌ Open

Logging levels, structured logging, metrics, tracing — no guidance on how the
agent should instrument code.

## 10. Contribution & Review Guidelines ❌ Open

No CONTRIBUTING.md, PR template, or code review criteria for the agent or human
collaborators to follow.

## 11. Stale Doc & Scratchpad Cleanup ❌ Open

Nothing tells the agent when to archive a `.scratchpad/` dir or flag a
BUSINESS_LOGIC.md section as outdated.

## 12. Local AI Config Files ❌ Open

No `opencode.json`, `.cursorrules`, `.copilot-instructions.md`, or similar
per-tool config is scaffolded. CLAUDE.md is a start but doesn't configure
tool-specific behavior.

## 13. Human Onboarding ❌ Open

Everything focuses on AI orientation. A new human teammate has no "getting
started" path beyond reading BUSINESS_LOGIC.md.
