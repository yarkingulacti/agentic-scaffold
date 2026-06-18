# Auto-Detection

The scaffold scans your project and seeds the generated docs and interactive
defaults from what it finds. Detection never writes root-level files on its own —
it only informs rendered content and pre-filled prompts.

| What | Detected from |
|------|---------------|
| 🧬 **Languages** | JavaScript/TypeScript, Python, Go, Rust (manifest files) |
| 📦 **Package manager** | npm, yarn, pnpm, pip, poetry (lockfiles) |
| 🔧 **CI provider** | GitHub Actions, GitLab CI, CircleCI (config files) |
| 🤝 **AI tools** | opencode, Cursor, Copilot, Windsurf, Cline (config files) |
| 🎫 **Issue tracker** | GitHub Issues (`.github/` directory) |
| ⚙️ **Script runtime** | Node.js when `package.json` is present; otherwise still defaults to Node.js because the shipped memory scripts are `.mjs` files |

## How detected values are used

- Detected values render into `AGENTS.md` / `CLAUDE.md` (package manager, CI
  provider, script runtime, languages).
- In interactive mode, detected values become the pre-filled defaults for each
  prompt.
- Root-level extras such as CI config and AI-tool config are written **only**
  when requested with `--extras` — detection alone never creates them.

## Overriding detection

Any detected value can be overridden from the CLI:

```bash
npx @yarkingulacti/agentic-scaffold \
  --package-manager pnpm \
  --ci-provider github \
  --ai-tools opencode,cursor \
  --issue-tracker github
```

Every retained detection field has a documented owner and user-visible effect —
see `docs/plans/10-detection-rendering-matrix.md` in the repository.
