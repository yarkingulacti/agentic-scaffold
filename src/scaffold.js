import { readFileSync, writeFileSync, mkdirSync, existsSync, symlinkSync } from "node:fs";
import { readdirSync, statSync, copyFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import Handlebars from "handlebars";
import { askProjectName, askIssueTracker, askComponents, askOverwrite } from "./prompts.js";
import { detectProjectProfile } from "./detect.js";
import { infoBox, progressBar, spinner, summaryLine, style } from "./ui.js";

const __dirname = dirname(fileURLToPath(import.meta.url));
const TEMPLATES_DIR = join(__dirname, "..", "templates");
const PKG = JSON.parse(readFileSync(join(__dirname, "..", "package.json"), "utf-8"));

const DEFAULTS = {
  projectDescription: "A project.",
  issueTracker: "linear",
  scriptLanguage: "python",
};

function resolveConfig(argv) {
  const target = argv.target || process.cwd();
  const profile = detectProjectProfile(target);

  const config = {
    target,
    scaffoldDir: join(target, ".agentic-scaffold"),
    projectName: argv.projectName ?? profile.projectName ?? (target.split("/").filter(Boolean).pop() ?? "project"),
    projectDescription: argv.projectDescription ?? profile.projectDescription ?? DEFAULTS.projectDescription,
    languages: profile.languages,
    issueTracker: argv.issueTracker ?? profile.issueTracker ?? DEFAULTS.issueTracker,
    packageManager: argv.packageManager ?? profile.packageManager ?? null,
    ciProvider: argv.ciProvider ?? profile.ciProvider ?? null,
    aiTools: argv.aiTools ? argv.aiTools.split(",").map((s) => s.trim()).filter(Boolean) : profile.aiTools,
    scriptLanguage: argv.scriptLanguage ?? profile.scriptLanguage ?? DEFAULTS.scriptLanguage,
    force: argv.force ?? false,
    interactive: argv.interactive ?? false,
    include: resolveIncludes(argv),
  };

  return config;
}

function resolveIncludes(argv) {
  if (argv.only && argv.only !== "all") {
    return new Set(argv.only.split(",").map((s) => s.trim()));
  }
  const set = new Set(["docs", "scripts", "skills", "hooks"]);
  if (argv.skipDocs) set.delete("docs");
  if (argv.skipScripts) set.delete("scripts");
  if (argv.skipSkills) set.delete("skills");
  if (argv.skipHooks) set.delete("hooks");
  return set;
}

const ISSUE_TRACKER_DOCS = {
  linear: {
    name: "Linear",
    description: "Short implementation records live in Linear. Local, detailed planning lives in `.agentic-scaffold/.scratchpad/<feature>/`. See `.agentic-scaffold/docs/agents/issue-tracker.md`.",
    trackerDoc: "Linear",
    short: "Short issue records live in Linear. Local detailed planning lives in `.agentic-scaffold/.scratchpad/`.",
    statusTable: `| Label | Status string | Meaning |
|-------|--------------|---------|
| needs-triage | \`needs-triage\` | Maintainer needs to evaluate this issue |
| needs-info   | \`needs-info\`   | Waiting on reporter for more information |
| ready-for-agent | \`ready-for-agent\` | Fully specified, ready for an AI agent |
| ready-for-human | \`ready-for-human\` | Requires human implementation |
| wontfix      | \`wontfix\`      | Will not be actioned |`,
    envFile: ".env.linear\n.env.linear.local",
    envTemplate: `LINEAR_TEAM_KEY=
LINEAR_PROJECT_ID=`,
  },
  github: {
    name: "GitHub Issues",
    description: "Short implementation records live in GitHub Issues. Local, detailed planning lives in `.agentic-scaffold/.scratchpad/<feature>/`. See `.agentic-scaffold/docs/agents/issue-tracker.md`.",
    trackerDoc: "GitHub Issues",
    short: "Short issue records live in GitHub Issues. Local detailed planning lives in `.scratchpad/`.",
    statusTable: `| Label | Meaning |
|-------|---------|
| \`needs-triage\` | Maintainer needs to evaluate this issue |
| \`needs-info\`   | Waiting on reporter for more information |
| \`ready-for-agent\` | Fully specified, ready for an AI agent |
| \`ready-for-human\` | Requires human implementation |
| \`wontfix\`      | Will not be actioned |`,
    envFile: "",
    envTemplate: "",
  },
};

function buildIncompleteFiles(config) {
  const files = [
    { file: ".agentic-scaffold/BUSINESS_LOGIC.md", sections: "Core Domain Concepts, Non-Negotiable Rules, Architecture Decisions" },
  ];
  if (config.include.has("docs")) {
    files.push(
      { file: ".agentic-scaffold/docs/context/glossary.md", sections: "domain term definitions" },
      { file: ".agentic-scaffold/docs/product/README.md", sections: "product spec descriptions" },
      { file: ".agentic-scaffold/docs/engineering/README.md", sections: "implementation conventions" },
    );
  }
  return files;
}

function showDetectedProfile(config) {
  const rows = [
    ["Project", style.cyan(config.projectName)],
    ["Languages", config.languages.length > 0 ? config.languages.join(", ") : style.dim("none")],
    ["Package", config.packageManager ? style.cyan(config.packageManager) : style.dim("none")],
    ["CI", config.ciProvider ? style.cyan(config.ciProvider) : style.dim("none")],
    ["AI tools", config.aiTools.length > 0 ? config.aiTools.join(", ") : style.dim("none")],
    ["Tracker", config.issueTracker ? style.cyan(config.issueTracker) : style.dim("none")],
    ["Script lang", config.scriptLanguage ? style.cyan(config.scriptLanguage) : style.dim("none")],
  ];
  console.log(`\n${infoBox(rows)}`);
}

function buildHandlebars(config) {
  const tracker = ISSUE_TRACKER_DOCS[config.issueTracker] || ISSUE_TRACKER_DOCS.linear;
  return {
    projectName: config.projectName,
    projectDescription: config.projectDescription,
    scriptsDir: ".agentic-scaffold/scripts",
    issueTrackerName: tracker.name,
    issueTrackerDescription: tracker.description,
    issueTrackerShort: tracker.short,
    statusTable: tracker.statusTable,
    trackerDoc: tracker.trackerDoc,
    envFile: tracker.envFile,
    envTemplate: tracker.envTemplate,
    packageManager: config.packageManager,
    ciProvider: config.ciProvider,
    scriptLanguage: config.scriptLanguage,
    scaffoldVersion: PKG.version,
    incompleteFiles: buildIncompleteFiles(config),
  };
}

function renderTemplate(sourcePath, hbData) {
  const raw = readFileSync(sourcePath, "utf-8");
  const template = Handlebars.compile(raw, { noEscape: true });
  return template(hbData);
}

async function write(targetPath, content, options = {}) {
  const dir = dirname(targetPath);
  if (!existsSync(dir)) mkdirSync(dir, { recursive: true });

  if (existsSync(targetPath)) {
    if (options.interactive && !options.force) {
      const ok = await askOverwrite(targetPath);
      if (!ok) return "skipped-existing";
    } else if (!options.force) {
      return "skipped-existing";
    }
  }

  writeFileSync(targetPath, content, "utf-8");
  options.onProgress?.();
  return "written";
}

async function copyFile(src, dest, options = {}) {
  const dir = dirname(dest);
  if (!existsSync(dir)) mkdirSync(dir, { recursive: true });

  if (existsSync(dest)) {
    if (options.interactive && !options.force) {
      const ok = await askOverwrite(dest);
      if (!ok) return "skipped-existing";
    } else if (!options.force) {
      return "skipped-existing";
    }
  }

  copyFileSync(src, dest);
  options.onProgress?.();
  return "written";
}

function walkDir(dir) {
  const entries = [];
  for (const name of readdirSync(dir)) {
    const full = join(dir, name);
    const stat = statSync(full);
    if (stat.isDirectory()) {
      entries.push(...walkDir(full).map((e) => ({ ...e, name: join(name, e.name) })));
    } else {
      entries.push({ name, full });
    }
  }
  return entries;
}

async function copyStaticDir(srcDir, destDir, options = {}) {
  if (!existsSync(srcDir)) return [];
  const results = [];
  for (const entry of walkDir(srcDir)) {
    const dest = join(destDir, entry.name);
    results.push(await copyFile(entry.full, dest, options));
  }
  return results;
}

async function renderDir(srcDir, destDir, data, options = {}) {
  if (!existsSync(srcDir)) return [];
  const results = [];
  for (const entry of walkDir(srcDir)) {
    const isHbs = entry.name.endsWith(".hbs");
    const outName = isHbs ? entry.name.slice(0, -".hbs".length) : entry.name;
    const dest = join(destDir, outName);
    if (isHbs) {
      const content = renderTemplate(entry.full, data);
      results.push(await write(dest, content, options));
    } else {
      results.push(await copyFile(entry.full, dest, options));
    }
  }
  return results;
}

const SCAFFOLD_DIR_NAME = ".agentic-scaffold";

function scaffoldDir(config) {
  return config.scaffoldDir;
}

async function scaffoldRoot(config, hbData, extraOpts = {}) {
  const rootSrc = join(TEMPLATES_DIR, "root");
  const rootDest = scaffoldDir(config);
  return renderDir(rootSrc, rootDest, hbData, { force: config.force, interactive: config.interactive, ...extraOpts });
}

async function scaffoldDocs(config, hbData, extraOpts = {}) {
  const docsSrc = join(TEMPLATES_DIR, "docs");
  const docsDest = join(scaffoldDir(config), "docs");
  return renderDir(docsSrc, docsDest, hbData, { force: config.force, interactive: config.interactive, ...extraOpts });
}

async function scaffoldScripts(config, hbData, extraOpts = {}) {
  const scriptsSrc = join(TEMPLATES_DIR, "scripts");
  const scriptsDest = join(scaffoldDir(config), "scripts");
  return renderDir(scriptsSrc, scriptsDest, hbData, { force: config.force, interactive: config.interactive, ...extraOpts });
}

async function scaffoldSkills(config, extraOpts = {}) {
  const skillsSrc = join(TEMPLATES_DIR, "skills");
  const skillsDest = join(scaffoldDir(config), ".agents", "skills");
  return copyStaticDir(skillsSrc, skillsDest, { force: config.force, interactive: config.interactive, ...extraOpts });
}

async function scaffoldHooks(config, hbData, extraOpts = {}) {
  const hooksSrc = join(TEMPLATES_DIR, "hooks");
  const hooksDest = join(scaffoldDir(config), ".agents", "hooks");
  return renderDir(hooksSrc, hooksDest, hbData, { force: config.force, interactive: config.interactive, ...extraOpts });
}

async function scaffoldScratchpad(config, extraOpts = {}) {
  const src = join(TEMPLATES_DIR, "scratchpad");
  const dest = join(scaffoldDir(config), ".scratchpad");
  return copyStaticDir(src, dest, { force: config.force, interactive: config.interactive, ...extraOpts });
}

async function scaffoldHistory(config, extraOpts = {}) {
  const src = join(TEMPLATES_DIR, "history");
  const dest = join(scaffoldDir(config), ".history");
  return copyStaticDir(src, dest, { force: config.force, interactive: config.interactive, ...extraOpts });
}

function createSymlinks(config) {
  const links = [
    ["AGENTS.md", ".agentic-scaffold/AGENTS.md"],
    ["CLAUDE.md", ".agentic-scaffold/CLAUDE.md"],
  ];
  const created = [];
  for (const [name, target] of links) {
    const linkPath = join(config.target, name);
    if (existsSync(linkPath)) {
      created.push("skipped-existing");
      continue;
    }
    try {
      symlinkSync(target, linkPath);
      created.push("written");
    } catch {
      created.push("skipped-existing");
    }
  }
  return created;
}

function countTemplateFiles(config) {
  const dirs = [
    join(TEMPLATES_DIR, "root"),
    ...(config.include.has("docs") ? [join(TEMPLATES_DIR, "docs")] : []),
    ...(config.include.has("scripts") ? [join(TEMPLATES_DIR, "scripts")] : []),
    ...(config.include.has("skills") ? [join(TEMPLATES_DIR, "skills")] : []),
    ...(config.include.has("hooks") ? [join(TEMPLATES_DIR, "hooks")] : []),
    join(TEMPLATES_DIR, "scratchpad"),
    join(TEMPLATES_DIR, "history"),
  ];
  return dirs.reduce((sum, d) => {
    if (existsSync(d)) return sum + walkDir(d).length;
    return sum;
  }, 0);
}

export async function scaffold(argv) {
  let config = resolveConfig(argv);

  if (argv.interactive) {
    console.log(`\n ${style.bold("Detected project profile:")}`);
    showDetectedProfile(config);

    config.projectName = await askProjectName(config.projectName);
    config.issueTracker = await askIssueTracker(config.issueTracker);
    const components = await askComponents();
    config.include = new Set(components);
  }

  const hbData = buildHandlebars(config);

  const detected = [];
  if (config.languages.length > 0) detected.push(config.languages.join(", "));
  if (config.packageManager) detected.push(style.cyan(config.packageManager));
  if (config.ciProvider) detected.push(style.cyan(config.ciProvider));
  const detectedStr = detected.length > 0 ? detected.join(" · ") : style.dim("none");

  const rows = [
    ["Project", style.cyan(config.projectName)],
    ["Detected", detectedStr],
    ["Tracker", style.dim(config.issueTracker)],
    ["Include", [...config.include].join(" + ") || style.dim("(none)")],
  ];
  console.log(`\n${infoBox(rows)}`);

  const total = countTemplateFiles(config);
  let done = 0;
  const tickOpts = {
    onProgress: () => {
      done++;
      process.stdout.write(`\r  ${spinner(done)} ${progressBar(done, total)}`);
    },
  };

  const results = [
    ...(await scaffoldRoot(config, hbData, tickOpts)),
  ];

  if (config.include.has("docs")) results.push(...(await scaffoldDocs(config, hbData, tickOpts)));
  if (config.include.has("scripts")) results.push(...(await scaffoldScripts(config, hbData, tickOpts)));
  if (config.include.has("skills")) results.push(...(await scaffoldSkills(config, tickOpts)));
  if (config.include.has("hooks")) results.push(...(await scaffoldHooks(config, hbData, tickOpts)));

  results.push(...(await scaffoldScratchpad(config, tickOpts)));
  results.push(...(await scaffoldHistory(config, tickOpts)));

  results.push(...(await createSymlinks(config)));

  process.stdout.write("\r".padEnd(60) + "\r");

  const written = results.filter((r) => r === "written").length;
  const skipped = results.filter((r) => r === "skipped-existing").length;
  console.log(` ${summaryLine(`Done! ${written} file${written !== 1 ? "s" : ""} scaffolded.`, "done")}`);
  if (skipped > 0) {
    console.log(`   ${summaryLine(`${skipped} file${skipped !== 1 ? "s" : ""} skipped — already exist.`, "warn")}`);
    console.log(`   ${style.dim("·")}  ${style.dim("Run with --force to overwrite existing files.")}`);
  }

  const incompleteFiles = buildIncompleteFiles(config);
  if (incompleteFiles.length > 0) {
    console.log(`\n ${style.dim("Documentation files that need completion:")}`);
    for (const { file, sections } of incompleteFiles) {
      console.log(`   ${style.bold(file)}`);
      for (const section of sections.split(", ")) {
        console.log(`     ${style.dim("→")} ${section} ${style.dim("(empty)")}`);
      }
    }
    if (config.include.has("skills")) {
      console.log(`\n ${style.dim("Agent skill available to help:")}`);
      console.log(`   .agentic-scaffold/.agents/skills/fill-docs/SKILL.md`);
      console.log(`   ${style.dim("Invoke it with your AI agent to fill in these files conversationally.")}`);
    }
  }
}
