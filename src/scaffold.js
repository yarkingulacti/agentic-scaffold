import { readFileSync, writeFileSync, mkdirSync, existsSync } from "node:fs";
import { readdirSync, statSync, copyFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import Handlebars from "handlebars";
import { askProjectName, askIssueTracker, askComponents } from "./prompts.js";
import { detectProjectProfile } from "./detect.js";
import { infoBox, progressBar, spinner, summaryLine, style } from "./ui.js";

const __dirname = dirname(fileURLToPath(import.meta.url));
const TEMPLATES_DIR = join(__dirname, "..", "templates");

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
    projectName: argv.projectName ?? profile.projectName ?? (target.split("/").filter(Boolean).pop() ?? "project"),
    projectDescription: argv.projectDescription ?? profile.projectDescription ?? DEFAULTS.projectDescription,
    languages: profile.languages,
    issueTracker: argv.issueTracker ?? profile.issueTracker ?? DEFAULTS.issueTracker,
    packageManager: argv.packageManager ?? profile.packageManager ?? null,
    ciProvider: argv.ciProvider ?? profile.ciProvider ?? null,
    aiTools: argv.aiTools ? argv.aiTools.split(",").map((s) => s.trim()).filter(Boolean) : profile.aiTools,
    scriptLanguage: argv.scriptLanguage ?? profile.scriptLanguage ?? DEFAULTS.scriptLanguage,
    force: argv.force ?? false,
    include: resolveIncludes(argv),
  };

  return config;
}

function resolveIncludes(argv) {
  if (argv.only && argv.only !== "all") {
    return new Set(argv.only.split(",").map((s) => s.trim()));
  }
  const set = new Set(["docs", "scripts", "skills"]);
  if (argv.skipDocs) set.delete("docs");
  if (argv.skipScripts) set.delete("scripts");
  if (argv.skipSkills) set.delete("skills");
  return set;
}

const ISSUE_TRACKER_DOCS = {
  linear: {
    name: "Linear",
    description: "Short implementation records live in Linear. Local, detailed planning lives in `.scratchpad/<feature>/`. See `docs/agents/issue-tracker.md`.",
    trackerDoc: "Linear",
    short: "Short issue records live in Linear. Local detailed planning lives in `.scratchpad/`.",
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
    description: "Short implementation records live in GitHub Issues. Local, detailed planning lives in `.scratchpad/<feature>/`. See `docs/agents/issue-tracker.md`.",
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

function buildHandlebars(config) {
  const tracker = ISSUE_TRACKER_DOCS[config.issueTracker] || ISSUE_TRACKER_DOCS.linear;
  return {
    projectName: config.projectName,
    projectDescription: config.projectDescription,
    scriptsDir: "scripts",
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
  };
}

function renderTemplate(sourcePath, hbData) {
  const raw = readFileSync(sourcePath, "utf-8");
  const template = Handlebars.compile(raw, { noEscape: true });
  return template(hbData);
}

function write(targetPath, content, options = {}) {
  const dir = dirname(targetPath);
  if (!existsSync(dir)) mkdirSync(dir, { recursive: true });

  if (existsSync(targetPath)) {
    if (!options.force) return "skipped-existing";
  }

  writeFileSync(targetPath, content, "utf-8");
  options.onProgress?.();
  return "written";
}

function copyFile(src, dest, options = {}) {
  const dir = dirname(dest);
  if (!existsSync(dir)) mkdirSync(dir, { recursive: true });

  if (existsSync(dest)) {
    if (!options.force) return "skipped-existing";
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

function copyStaticDir(srcDir, destDir, options = {}) {
  if (!existsSync(srcDir)) return [];
  const results = [];
  for (const entry of walkDir(srcDir)) {
    const dest = join(destDir, entry.name);
    results.push(copyFile(entry.full, dest, options));
  }
  return results;
}

function renderDir(srcDir, destDir, data, options = {}) {
  if (!existsSync(srcDir)) return [];
  const results = [];
  for (const entry of walkDir(srcDir)) {
    const isHbs = entry.name.endsWith(".hbs");
    const outName = isHbs ? entry.name.slice(0, -".hbs".length) : entry.name;
    const dest = join(destDir, outName);
    if (isHbs) {
      const content = renderTemplate(entry.full, data);
      results.push(write(dest, content, options));
    } else {
      results.push(copyFile(entry.full, dest, options));
    }
  }
  return results;
}

function scaffoldRoot(config, hbData, extraOpts = {}) {
  const rootSrc = join(TEMPLATES_DIR, "root");
  const rootDest = config.target;
  return renderDir(rootSrc, rootDest, hbData, { force: config.force, ...extraOpts });
}

function scaffoldDocs(config, hbData, extraOpts = {}) {
  const docsSrc = join(TEMPLATES_DIR, "docs");
  const docsDest = join(config.target, "docs");
  return renderDir(docsSrc, docsDest, hbData, { force: config.force, ...extraOpts });
}

function scaffoldScripts(config, hbData, extraOpts = {}) {
  const scriptsSrc = join(TEMPLATES_DIR, "scripts");
  const scriptsDest = join(config.target, "scripts");
  return renderDir(scriptsSrc, scriptsDest, hbData, { force: config.force, ...extraOpts });
}

function scaffoldSkills(config, extraOpts = {}) {
  const skillsSrc = join(TEMPLATES_DIR, "skills");
  const skillsDest = join(config.target, ".agents", "skills");
  return copyStaticDir(skillsSrc, skillsDest, { force: config.force, ...extraOpts });
}

function scaffoldScratchpad(config, extraOpts = {}) {
  const src = join(TEMPLATES_DIR, "scratchpad");
  const dest = join(config.target, ".scratchpad");
  return copyStaticDir(src, dest, { force: config.force, ...extraOpts });
}

function scaffoldHistory(config, extraOpts = {}) {
  const src = join(TEMPLATES_DIR, "history");
  const dest = join(config.target, ".history");
  return copyStaticDir(src, dest, { force: config.force, ...extraOpts });
}

function countTemplateFiles(config) {
  const dirs = [
    join(TEMPLATES_DIR, "root"),
    ...(config.include.has("docs") ? [join(TEMPLATES_DIR, "docs")] : []),
    ...(config.include.has("scripts") ? [join(TEMPLATES_DIR, "scripts")] : []),
    ...(config.include.has("skills") ? [join(TEMPLATES_DIR, "skills")] : []),
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
    config.projectName = await askProjectName(config.projectName);
    const tracker = await askIssueTracker();
    config.issueTracker = tracker;
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
    ...scaffoldRoot(config, hbData, tickOpts),
  ];

  if (config.include.has("docs")) results.push(...scaffoldDocs(config, hbData, tickOpts));
  if (config.include.has("scripts")) results.push(...scaffoldScripts(config, hbData, tickOpts));
  if (config.include.has("skills")) results.push(...scaffoldSkills(config, tickOpts));

  results.push(...scaffoldScratchpad(config, tickOpts));
  results.push(...scaffoldHistory(config, tickOpts));

  process.stdout.write("\r".padEnd(60) + "\r");

  const written = results.filter((r) => r === "written").length;
  const skipped = results.filter((r) => r === "skipped-existing").length;
  console.log(` ${summaryLine(`Done! ${written} file${written !== 1 ? "s" : ""} scaffolded.`, "done")}`);
  if (skipped > 0) {
    console.log(`   ${summaryLine(`${skipped} file${skipped !== 1 ? "s" : ""} skipped — already exist.`, "warn")}`);
    console.log(`   ${style.dim("·")}  ${style.dim("Run with --force to overwrite existing files.")}`);
  }
}
