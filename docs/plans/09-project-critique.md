# Project Critique Backlog

Audit from 2026-06-18. This is intentionally critical: it captures product,
architecture, and maintenance risks that are not fully covered by the earlier
roadmaps.

Status legend: Open / In progress / Resolved

## Executive critique

`agentic-scaffold` has crossed from "useful generator" into "small product",
but the planning docs still describe earlier milestones as future work while
the code has already moved on. The main risk is no longer missing templates.
It is product coherence: defaults, documentation, dry-run output, detection, and
unscaffold behavior need to agree with one another.

## Priority critiques

### 1. Planning and README drift are now a release risk

Status: Resolved

The planning set was inconsistent with the implementation:

- The stale v1 release plan was removed after it no longer reflected current
  implementation.
- The README had stale release-highlight copy from `v0.9`.
- README and planning docs had stale skill counts.

Why it matters: contributors and agents will make bad decisions if the planning
docs are treated as canonical but are behind the code.

Resolution:

- Replaced the stale README "New in v0.9" block with a current-release summary
  for `0.13.x`.
- Corrected README and planning skill counts to match the 23 shipped skills.
- Added a release docs freshness gate to `docs/plans/README.md`.
- Updated this critique entry to reflect the current implementation baseline and
  mark the drift item resolved.

### 2. Defaults did not match the zero-config story

Status: Resolved

The README promises "auto-detect and scaffold only what's missing", but
`resolveIncludes()` previously included every extras group by default when
`--extras` was omitted. That meant zero-config scaffolding could write CI,
contribution, AI config, and onboarding artifacts, subject to provider/template
availability, rather than staying focused on the core scaffold.

Why it matters: a tool that claims conservative zero-config behavior should not
surprise users by writing root-level project files such as `.github/` or AI tool
config unless those are clearly requested or detected as safe.

Resolution:

- Defined `--extras` as opt-in; zero-config now includes only core scaffold
  groups plus `.history/` and `.scratchpad/`.
- Added explicit `--extras all` expansion.
- Updated README examples and component docs to describe extras behavior.
- Added CLI tests for default output, a single requested extra, and
  `--extras all`.

### 3. Runtime default pointed at Python while shipped scripts are Node

Status: Resolved

`DEFAULTS.scriptLanguage` previously used `python`, and tests asserted that
default in rendered `AGENTS.md`. The generated memory scripts are Node.js
`.mjs` files, so a target project with no detectable language could be told
"Memory and utility scripts use python" while only Node scripts existed.

Why it matters: this creates immediate post-scaffold confusion in exactly the
zero-config case where the user has provided the least context.

Resolution:

- Changed the default script language to `node`.
- Added a regression test that generated `AGENTS.md` agrees with the generated
  `.agentic-scaffold/scripts/memory_*.mjs` files.

Remaining follow-up:

- Decide whether `python` and `docker` should remain accepted CLI choices before
  matching template output modes exist.

### 4. Dry-run was not the same plan the scaffold would execute

Status: Resolved

`listDryRunFiles()` was a separate hard-coded mapping from the real component
registry. It could drift from actual provider-specific and skip-specific
rendering decisions, which made the preview less trustworthy than the write
path.

Why it matters: `--dry-run` is a safety feature. If its output is inaccurate,
users cannot trust it before running a file-writing command.

Resolution:

- Added component-level dry-run planning to the same `COMPONENTS` registry used
  for real writes.
- Made CI dry-run output provider-specific and skip-aware through
  `ScaffoldConfig`.
- Reused the component dry-run plan for progress totals.
- Added CLI tests for dry-run no-write behavior, skipped `.history/` and
  `.scratchpad/`, and provider-specific GitHub CI output.

### 5. Detection collects richer facts than rendering uses

Status: Resolved

`detectProjectProfile()` previously detected Dockerfile, `.env.example`,
contributing docs, changelog, API docs, and migrations. Those facts did not
affect selection, output, or completion guidance.

Why it matters: unused detection adds maintenance cost and implies intelligence
the tool does not actually provide.

Resolution:

- Removed the unused `has*` fields from `ProjectProfile` and deleted their
  implementation-detail tests.
- Added [10-detection-rendering-matrix.md](10-detection-rendering-matrix.md) so
  every retained detection field has a documented owner and user-visible effect.
- Updated the sprint spec to stop advertising ownerless detection fields.

### 6. Unscaffold still cannot protect all scaffold-related files

Status: Resolved

The manifest previously only tracked files under `.agentic-scaffold/`. Root-level
files created by extras (`.github/` workflows, AI config files) and Windows
fallback copies of the entry points were not manifested as scaffold-owned.

Why it matters: "Remove all scaffolded files" is a stronger promise than the
implementation can keep for root-level extras and copied entry points.

Resolution (v0.13.2–v0.13.3):

- The manifest is now v2 and stores paths relative to the target root, not only
  to `.agentic-scaffold/`.
- Root symlinks, copied entry points, and extras outputs are tracked as owned
  entries.
- Unscaffold distinguishes "owned and unchanged", "owned and modified", and
  "unknown new file under scaffold directories" (`findUnknownScaffoldFiles`).

### 7. Template safety is still mostly convention-based

Status: Resolved

There was skill frontmatter validation, but template variables and rendered
output contracts were not validated. A typo in a Handlebars variable could
silently produce weak docs, and there was no golden snapshot for representative
rendered projects. This also surfaced two latent bugs: `renderTemplate` compiled
without `noEscape` (so `<`/`>`/`&` in Markdown values were HTML-escaped), and
`{{languages}}` was referenced by two templates but never passed in
`HandlebarsData`.

Why it matters: this repo's main product is generated text. TypeScript coverage
does not protect most of that surface.

Resolution:

- Fixed the `noEscape` and missing-`languages` bugs.
- Added `bin/validate-templates.ts`: an AST-based checker that fails on unknown
  variables/partials and on HTML-escape leakage in rendered output. Wired into
  CI and `prepublishOnly`.
- Added three golden-output fixtures (`tests/fixtures/{ts-github,python-no-ci,multilang-extras}/`)
  compared byte-for-byte, regenerated via `UPDATE_GOLDEN=1 npm test`.

### 8. The product needs a sharper boundary between core scaffold and extras

Status: Resolved

The component model mixed core `.agentic-scaffold/` assets, target-root files,
CI config, onboarding, contribution templates, and tool config into one include
set, and the category knowledge was duplicated between `src/scaffold.ts`
(`COMPONENTS`) and `src/config.ts` (`EXTRAS_GROUPS` + the hardcoded core set).

Why it matters: the tool would become harder to evolve as more extras are added.
Every new target-root artifact increases the chance of overwriting or orphaning
user files, and the duplicated lists could silently drift apart.

Resolution:

- Extracted a single declarative registry, `src/components.ts`. Each
  `ComponentSpec` declares `category` (`core` / `extra` / `working-dir`),
  `destBase` (`scaffold` / `target`), `conflict` policy, and `manifested`
  (whether `unscaffold` removes it via the v2 manifest).
- `src/config.ts` now derives the default core set, `EXTRAS_GROUPS`, and the
  working-dir set from the registry (`componentNamesByCategory`), eliminating the
  cross-file duplication.
- Added `tests/components.test.ts`, a table-driven test asserting every component
  declares complete, internally consistent metadata (target-root writers carry an
  explicit conflict policy; core components stay under `.agentic-scaffold/`; the
  derived category groupings match the registry).
- Ownership/unscaffold behavior is enforced by the existing v2 manifest, which
  already tracks every written file as a target-relative typed entry.

## Suggested v1 gate

Before tagging v1.0.0, require:

- README and plans updated to match `package.json` and current behavior.
- Zero-config output contract made explicit and tested.
- `scriptLanguage` default aligned with actual generated scripts. (Resolved)
- Dry-run generated from the same decisions as real scaffolding.
- Manifest/unscaffold ownership model covers root-level extras or documents that
  extras are intentionally not removed.
- At least three golden-output fixtures for generated scaffold content.
