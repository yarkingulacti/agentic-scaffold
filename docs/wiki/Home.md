<div align="center">

# 🛰️ agentic-scaffold

**Give any repository an AI-native foundation in a single command.**

Current release: **v{{VERSION}}** · [npm](https://www.npmjs.com/package/@yarkingulacti/agentic-scaffold) · [Changelog](Changelog)

</div>

---

`agentic-scaffold` drops a single **`.agentic-scaffold/`** directory (plus
`AGENTS.md` / `CLAUDE.md` entry-point symlinks) into your project. Run it with
zero flags: it auto-detects your language, package manager, CI, and AI-tool
context, then writes **only the conservative core scaffold** — never overwriting
what you already have.

```bash
npx @yarkingulacti/agentic-scaffold
```

## Where to next

- **[Quick Start](Quick-Start)** — install, preview, scaffold, undo.
- **[CLI Reference](CLI-Reference)** — every flag and invocation.
- **[Components & Extras](Components-and-Extras)** — what's core, what's opt-in.
- **[Auto-Detection](Auto-Detection)** — what the scaffold sniffs and how it's used.
- **[Architecture](Architecture)** — codebase layout and contributor commands.
- **[Changelog](Changelog)** — per-version history.

## Why bother?

Working with AI agents goes better when the repository carries its own context:
how the domain works, where decisions are recorded, what conventions hold, and
which workflows agents should follow. `agentic-scaffold` ships that structure as
a reusable, opinionated baseline:

| | |
|---|---|
| 🟢 **Zero-config & safe** | Auto-detects your stack and writes only what's missing. Existing files are never overwritten unless you pass `--force`. |
| 🪶 **Conservative by default** | The no-flag run writes the core scaffold plus working dirs. CI, onboarding, contribution docs, AI-tool config, and token filters are all opt-in. |
| ↩️ **Reversible** | One `un` command removes everything it created and leaves your project untouched. |
| ✅ **Validated before publish** | Template variables, Markdown escaping, and representative rendered projects are all checked against golden output. |

> This wiki is generated from the repository on every version bump. Edit the
> sources under [`docs/wiki/`](https://github.com/yarkingulacti/agentic-scaffold/tree/master/docs/wiki),
> not the wiki pages directly — direct edits are overwritten on the next release.
