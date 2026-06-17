import { readFileSync, writeFileSync, mkdirSync, existsSync } from "node:fs";
import { readdirSync, statSync, copyFileSync } from "node:fs";
import { join, dirname, relative } from "node:path";
import { fileURLToPath } from "node:url";
import Handlebars from "handlebars";
import { askProjectName, askIssueTracker, askComponents } from "./prompts.js";

const __dirname = dirname(fileURLToPath(import.meta.url));
const TEMPLATES_DIR = join(__dirname, "..", "templates");

function resolveConfig(argv) {
  const target = argv.target;
  const defaultName = target === process.cwd()
    ? process.cwd().split("/").pop()
    : target.split("/").pop();

  return {
    projectName: argv.projectName || defaultName,
    issueTracker: argv.issueTracker || "linear",
    projectDescription: "A project.",
    target,
    include: resolveIncludes(argv),
  };
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
  };
}

function renderTemplate(sourcePath, hbData) {
  const raw = readFileSync(sourcePath, "utf-8");
  const template = Handlebars.compile(raw, { noEscape: true });
  return template(hbData);
}

function write(targetPath, content) {
  const dir = dirname(targetPath);
  if (!existsSync(dir)) mkdirSync(dir, { recursive: true });
  writeFileSync(targetPath, content, "utf-8");
}

function copyFile(src, dest) {
  const dir = dirname(dest);
  if (!existsSync(dir)) mkdirSync(dir, { recursive: true });
  copyFileSync(src, dest);
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

function copyStaticDir(srcDir, destDir) {
  if (!existsSync(srcDir)) return;
  for (const entry of walkDir(srcDir)) {
    const dest = join(destDir, entry.name);
    copyFile(entry.full, dest);
  }
}

function renderDir(srcDir, destDir, data, { suffix = ".hbs" } = {}) {
  if (!existsSync(srcDir)) return;
  for (const entry of walkDir(srcDir)) {
    const isHbs = entry.name.endsWith(suffix);
    const outName = isHbs ? entry.name.slice(0, -suffix.length) : entry.name;
    const dest = join(destDir, outName);
    if (isHbs) {
      const content = renderTemplate(entry.full, data);
      write(dest, content);
    } else {
      copyFile(entry.full, dest);
    }
  }
}

function scaffoldRoot(config, hbData) {
  const rootSrc = join(TEMPLATES_DIR, "root");
  const rootDest = config.target;
  renderDir(rootSrc, rootDest, hbData);
}

function scaffoldDocs(config, hbData) {
  const docsSrc = join(TEMPLATES_DIR, "docs");
  const docsDest = join(config.target, "docs");
  renderDir(docsSrc, docsDest, hbData);
}

function scaffoldScripts(config, hbData) {
  const scriptsSrc = join(TEMPLATES_DIR, "scripts");
  const scriptsDest = join(config.target, "scripts");
  renderDir(scriptsSrc, scriptsDest, hbData);
}

function scaffoldSkills(config) {
  const skillsSrc = join(TEMPLATES_DIR, "skills");
  const skillsDest = join(config.target, ".agents", "skills");
  copyStaticDir(skillsSrc, skillsDest);
}

function scaffoldScratchpad(config) {
  const src = join(TEMPLATES_DIR, "scratchpad");
  const dest = join(config.target, ".scratchpad");
  copyStaticDir(src, dest);
}

function scaffoldHistory(config) {
  const src = join(TEMPLATES_DIR, "history");
  const dest = join(config.target, ".history");
  copyStaticDir(src, dest);
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

  console.log(`\nScaffolding agentic development config into ${config.target}`);
  console.log(`  Project:   ${config.projectName}`);
  console.log(`  Tracker:   ${config.issueTracker}`);
  console.log(`  Include:   ${[...config.include].join(", ") || "(none)"}`);

  scaffoldRoot(config, hbData);

  if (config.include.has("docs")) scaffoldDocs(config, hbData);
  if (config.include.has("scripts")) scaffoldScripts(config, hbData);
  if (config.include.has("skills")) scaffoldSkills(config);

  scaffoldScratchpad(config);
  scaffoldHistory(config);

  console.log("\nDone.");
  console.log("Next: fill in BUSINESS_LOGIC.md with your domain, then customize.");
}
