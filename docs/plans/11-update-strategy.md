# Update Strategy

Status: implemented (v1.4.0). How `agentic-scaffold update` reconciles an
existing scaffold with a newer tool version **without clobbering user edits**.

## Problem

Re-running the scaffolder is binary:

- default — skip every existing file (so a project pinned to an old template
  set never receives new skills, hooks, or fixes), or
- `--force` — overwrite everything, destroying any local edits.

Neither lets a user pull new template/skill versions while keeping their
customizations. `update` fills that gap.

## Approach — manifest-based 3-way reconciliation

The v2 manifest (`.agentic-scaffold/.manifest.json`) already records, per
scaffold-owned path, the SHA-256 `contentHash` of exactly what the scaffolder
last wrote (its canonical render) plus symlink `linkTarget`s. That hash is the
**base** of a 3-way comparison:

| Term | Meaning | Source |
|------|---------|--------|
| `base` | what the installed version wrote | old manifest `contentHash` |
| `current` | the file on disk now | hashed live from the target |
| `next` | what the current tool version renders | canonical render into a temp dir |

`next` is produced by scaffolding into a throwaway temp directory using a config
**resolved against the real project** (so detection — package manager, CI,
languages — matches what the existing scaffold was built with), then reconciling
temp → target. This reuses the entire render pipeline (`renderScaffoldInto`) with
zero template duplication.

## Per-path classification (never clobber)

For every path in the new canonical set:

| `base` | `current` | `next` | Action |
|--------|-----------|--------|--------|
| absent | absent | — | **ADD** — write the new file |
| absent | present | — | **UNTRACKED** — user owns this path; skip + report |
| present | absent (deleted) | — | **DELETED** — respect the deletion; skip + report |
| present | `== base` | `== base` | **UNCHANGED** — no-op |
| present | `== base` | `!= base` | **UPDATE** — overwrite (file was untouched) |
| present | `!= base` | `== base` | **KEPT** — user edited, template unchanged; keep |
| present | `!= base` | `!= base` | **CONFLICT** — keep file, write `<path>.new`, report |

Symlinks (the `AGENTS.md` / `CLAUDE.md` entry points) use the same buckets keyed
on `linkTarget`; conflicts are reported but no `.new` is written (a symlink has
no mergeable body). Paths present in the old manifest but absent from the new
canonical set (templates dropped upstream) are **OBSOLETE** — left in place and
reported, never auto-deleted.

## Manifest after update

`update` rewrites `.manifest.json` to the **new canonical baseline** (new
`scaffoldVersion` + new hashes), regardless of conflicts. This preserves the
invariant *manifest base == canonical render of the installed version*, which
makes future updates safe:

- UPDATE/UNCHANGED files now equal the base → eligible for future overwrite.
- CONFLICT / KEPT files differ from the base → always seen as user-modified →
  never silently overwritten later.
- DELETED files stay tracked → future updates keep respecting the deletion.

## CLI

```
agentic-scaffold update [--target <dir>] [--dry-run] [--json] [--quiet]
```

Requires an existing **v2** manifest; errors with guidance otherwise (re-run
`scaffold --force` to regenerate a manifest, then `update`). Shares the Node
runtime gate with `scaffold`. `--dry-run` classifies and reports without writing.

## Non-goals

- No content-level merging (no diff3 hunks) — conflicts surface as `.new` files
  for the user to merge manually.
- No auto-removal of obsolete files and no restoration of user-deleted files —
  both are reported, never actioned.
