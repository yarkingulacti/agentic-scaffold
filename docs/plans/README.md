# Plans & Design Documents

Design discussions, roadmaps, and implementation specs for the agentic-scaffold
tool itself.

## Index

| File | Content |
|------|---------|
| [01-capabilities-overview.md](01-capabilities-overview.md) | What an AI agent acquires from this scaffold |
| [02-gaps-analysis.md](02-gaps-analysis.md) | 13 things the scaffold currently misses |
| [03-roadmaps-13-capabilities.md](03-roadmaps-13-capabilities.md) | Roadmaps for closing each gap |
| [04-zero-config-tiered-design.md](04-zero-config-tiered-design.md) | Architecture for zero-config ↔ high-tier |
| [05-sprint-1-detailed-spec.md](05-sprint-1-detailed-spec.md) | Sprint 1 implementation spec |
| [06-fill-docs-skill-design.md](06-fill-docs-skill-design.md) | fill-docs skill + agent notification design |
| [07-hardening-roadmap.md](07-hardening-roadmap.md) | Hardening roadmap: v0.8 → v1.0 (dry-run, self-host, dirty check, etc.) |
| [09-project-critique.md](09-project-critique.md) | Critical backlog from implementation and planning review |
| [10-detection-rendering-matrix.md](10-detection-rendering-matrix.md) | Ownership matrix for detected project facts |
| [11-update-strategy.md](11-update-strategy.md) | Manifest-based safe update design |

## Status

- Sprint 1 (core infrastructure):          Done in v0.4.x
- Sprint 2 (scaffold metadata + fill-docs): Done in v0.5.0
- Sprint 3 (interactive mode redesign):     Done in v0.6.0
- Sprint 4 (CI/CD + AI configs):            Done in v0.12.0
- Sprint 5 (memory pipeline):               Done (hardening phase 2)
- Sprint 6 (migrations + contribution):     Done in v0.12.0
- Sprint 7 (extras + cleanup):              Done in v0.12.0
- Hardening v1.0:                           All phases resolved (self-host, manifest, Node scripts, NO_COLOR, --json, skill validation, --skip-history/scratchpad)
- Created: 2026-06-17
- Updated: 2026-06-18

## Release Docs Freshness Gate

Before tagging a release, update or verify:

- `package.json` version matches the intended release tag.
- `CHANGELOG.md` has a top entry for the release.
- README intro and "Why" bullets describe current behavior, not an older
  milestone; per-version history stays in `CHANGELOG.md` only.
- README component counts match `templates/` contents.
- Plan status sections do not describe already-shipped work as future work.
- `docs/plans/09-project-critique.md` statuses match the implemented fixes.
