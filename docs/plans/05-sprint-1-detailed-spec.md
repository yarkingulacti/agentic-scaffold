# Sprint 1 — Detailed Spec

## Goal

Build the detection engine, config resolution chain, overwrite protection, and
new CLI flags. This is the foundation that all future sprints build on.

## Files to Create

### `src/detect.js`

Exports `detectProjectProfile(targetDir): ProjectProfile`.

```js
ProjectProfile {
  projectName: string,            // dirname (always set)
  languages: string[],            // from package.json/requirements.txt/go.mod/Cargo.toml
  packageManager: string|null,    // 'npm'|'yarn'|'pnpm'|'pip'|'poetry'|'go-mod'|'cargo'|null
  ciProvider: string|null,        // 'github'|'gitlab'|'circleci'|null
  aiTools: string[],              // ['opencode', 'cursor', 'copilot', ...]
  issueTracker: string|null,      // 'github'|null (github if .github/ exists)
  scriptLanguage: string|null,    // 'node'|'python'|null
}
```

Detection heuristics:

| Field | Priority 1 (config file) | Priority 2 (dep scan) |
|-------|-------------------------|----------------------|
| `languages` | `package.json` → 'js'/'ts', `requirements.txt` → 'python', `go.mod` → 'go', `Cargo.toml` → 'rust' | — |
| `packageManager` | `pnpm-lock.yaml` → 'pnpm', `yarn.lock` → 'yarn', `package-lock.json` → 'npm', `poetry.lock` → 'poetry' | — |
| `ciProvider` | `.github/workflows/` → 'github', `.gitlab-ci.yml` → 'gitlab', `.circleci/config.yml` → 'circleci' | — |
| `aiTools` | `opencode.json` → 'opencode', `.cursorrules` → 'cursor', `.copilot-instructions.md` → 'copilot' | — |
| `issueTracker` | `.github/` directory → 'github' | — |
| `scriptLanguage` | `package.json` → 'node', `requirements.txt` or `pyproject.toml` → 'python' | — |

Detection fields should be added only when they have a documented rendering,
config, or CLI owner. See [10-detection-rendering-matrix.md](10-detection-rendering-matrix.md).

## Files to Modify

### `src/scaffold.js`

**`DEFAULTS` object** — centralized fallback values:

```js
const DEFAULTS = {
  projectDescription: "A project.",
  issueTracker: "linear",
  scriptLanguage: "node",
};
```

**`resolveConfig(argv)`** — new merge chain:

```js
function resolveConfig(argv) {
  const target = argv.target || process.cwd();
  const profile = detectProjectProfile(target);

  const config = {
    target,
    projectName: argv.projectName ?? profile.projectName ?? path.basename(target),
    projectDescription: argv.projectDescription ?? profile.projectDescription ?? DEFAULTS.projectDescription,
    issueTracker: argv.issueTracker ?? profile.issueTracker ?? DEFAULTS.issueTracker,
    packageManager: argv.packageManager ?? profile.packageManager ?? null,
    ciProvider: argv.ciProvider ?? profile.ciProvider ?? null,
    aiTools: argv.aiTools ? argv.aiTools.split(',').map(s => s.trim()) : profile.aiTools,
    scriptLanguage: argv.scriptLanguage ?? profile.scriptLanguage ?? DEFAULTS.scriptLanguage,
    force: argv.force ?? false,
    include: resolveIncludes(argv, profile),
  };

  return config;
}
```

**`write(targetPath, content, options)`** — new overwrite-aware signature:

```js
function write(targetPath, content, options = {}) {
  const dir = dirname(targetPath);
  if (!existsSync(dir)) mkdirSync(dir, { recursive: true });

  if (existsSync(targetPath)) {
    if (!options.force) return 'skipped-existing';
    // --force: fall through to overwrite
  }

  writeFileSync(targetPath, content, "utf-8");
  return 'written';
}
```

**`copyFile(src, dest, options)`** — same treatment, returns status string.

**`renderDir(srcDir, destDir, data, options)`** — threads options, returns `string[]`.

**All scaffold functions** (`scaffoldRoot`, `scaffoldDocs`, etc.) — collect
results and return them.

**`scaffold(argv)`** — aggregates all results, prints summary:

```
Detected: Node.js project, npm package manager, no CI detected.
Scaffolded 15 files (5 skipped — already exist).
Run with --force to overwrite existing files, -i for interactive mode.
```

### `bin/index.js`

Add flags:

```js
.option("force", {
  alias: "f",
  type: "boolean",
  description: "Overwrite existing files",
  default: false,
})
.option("package-manager", {
  type: "string",
  choices: ["npm", "yarn", "pnpm", "pip", "poetry", "go-mod", "cargo"],
  description: "Package manager (overrides auto-detection)",
})
.option("ci-provider", {
  type: "string",
  choices: ["github", "gitlab", "circleci"],
  description: "CI provider (overrides auto-detection)",
})
.option("ai-tools", {
  type: "string",
  description: "Comma-separated AI tools: opencode,cursor,copilot (overrides auto-detection)",
})
.option("script-language", {
  type: "string",
  choices: ["python", "node", "docker"],
  description: "Memory script language (overrides auto-detection)",
})
```

Redesign `--help` with tiers and examples:

```js
.usage("$0 [options]")
.epilogue(
  "Tiers:\n" +
  "  Zero-config   Run with no flags — auto-detect project, scaffold only what's\n" +
  "                missing. Never overwrites existing files.\n" +
  "  Flag mode     Override auto-detection with --package-manager, --ci-provider,\n" +
  "                --ai-tools, --script-language, etc. Add --force to overwrite.\n" +
  "  Interactive   Run with -i / --interactive for step-by-step prompts.\n"
)
.example("$0", "Zero-config: auto-detect and scaffold")
.example("$0 --force", "Force overwrite existing files")
.example("$0 --ci-provider github", "Override auto-detected CI provider")
.example("$0 --ai-tools opencode,cursor", "Generate configs for specific AI tools")
.example("$0 -i", "Interactive mode with prompts")
```

### `templates/root/AGENTS.md.hbs`

Add conditional sections to validate the detection → render chain:

```handlebars
{{#if packageManager}}
### Package manager

This project uses **{{packageManager}}**.
{{/if}}

{{#if ciProvider}}
### CI/CD

This project uses **{{ciProvider}}** for CI/CD.
{{/if}}

### Script language

Memory and utility scripts use **{{scriptLanguage}}**.
```

## What's NOT in Sprint 1

- `--extras` flag (deferred)
- `--only auto` (deferred)
- Template templates for CI/CD (deferred to Sprint 4)
- Template config files for AI tools (deferred to Sprint 4)
- Interactive conflict resolver (deferred to Sprint 3)

## Validation

After Sprint 1, these scenarios should work:

```
# Zero config — detect and scaffold missing files
node bin/index.js --target /tmp/test-project

# Force overwrite
node bin/index.js --target /tmp/test-project --force

# Override detection
node bin/index.js --target /tmp/test-project --package-manager pnpm --ci-provider github

# Rich help
node bin/index.js --help
```
