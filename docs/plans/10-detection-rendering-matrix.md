# Detection to Rendering Matrix

Current as of 2026-06-18.

Detection should stay smaller than the product surface it supports. Each field in
`ProjectProfile` needs a concrete owner: config resolution, rendered templates,
CLI display, component selection, or tests that protect user-visible behavior.

| Field | Detected from | Owner | User-visible effect |
|-------|---------------|-------|---------------------|
| `projectName` | Target directory basename | Config resolution, root templates, hook scripts | Rendered into `AGENTS.md`, `CLAUDE.md`, and hook script comments |
| `languages` | Language manifest files | CLI profile display, onboarding extra | Shown in interactive profile and onboarding output |
| `packageManager` | Lockfiles | Config resolution, root docs, CI, onboarding, hooks | Selects package-manager commands in generated docs, CI, and hook scripts |
| `ciProvider` | Existing CI config | Config resolution, root docs, CI component | Selects provider-specific CI templates and renders CI guidance |
| `aiTools` | Existing AI tool config files | Config resolution, interactive prompts | Seeds interactive AI-tool selection |
| `issueTracker` | `.github/` directory | Config resolution, issue-tracker docs | Selects tracker terminology and generated issue guidance |
| `scriptLanguage` | Runtime manifest files | Config resolution, root docs, hook scripts | Documents script runtime in generated agent config and hook comments |

## Non-Goals

Do not add passive existence flags such as `hasDockerfile`, `hasEnvExample`,
`hasContributing`, `hasChangelog`, `hasApiDocs`, or `hasMigrations` unless the
same change also wires them into a concrete behavior. Acceptable owners include:

- Rendering a specific template section.
- Selecting or suppressing an extras component.
- Producing explicit completion guidance after scaffolding.
- Protecting unscaffold ownership or conflict behavior.
- Driving an interactive prompt default.

Ownerless detection makes the CLI look smarter than it is and creates tests for
implementation details that users never see.
