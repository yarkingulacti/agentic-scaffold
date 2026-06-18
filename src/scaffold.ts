import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import type { HandlebarsData, ScaffoldArgs, ScaffoldConfig } from "./config.js";
import { buildHandlebars, buildIncompleteFiles, resolveConfig } from "./config.js";
import type { WriteOptions } from "./fs-utils.js";
import { copyStaticDir, createSymlinks } from "./fs-utils.js";
import { askComponents, askIssueTracker, askProjectName } from "./prompts.js";
import { countTemplateFiles, renderDir } from "./templates.js";
import { infoBox, progressBar, spinner, style, summaryLine } from "./ui.js";

const __dirname = dirname(fileURLToPath(import.meta.url));
const TEMPLATES_DIR = join(__dirname, "..", "templates");
const PKG = JSON.parse(readFileSync(join(__dirname, "..", "package.json"), "utf-8")) as { version: string };

function showDetectedProfile(config: ScaffoldConfig): void {
  const rows: [string, string][] = [
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

function scaffoldDir(config: ScaffoldConfig): string {
  return config.scaffoldDir;
}

async function scaffoldRoot(
  config: ScaffoldConfig,
  hbData: HandlebarsData,
  extraOpts: WriteOptions = {},
): Promise<string[]> {
  const rootSrc = join(TEMPLATES_DIR, "root");
  const rootDest = scaffoldDir(config);
  return renderDir(rootSrc, rootDest, hbData, { force: config.force, interactive: config.interactive, ...extraOpts });
}

async function scaffoldDocs(
  config: ScaffoldConfig,
  hbData: HandlebarsData,
  extraOpts: WriteOptions = {},
): Promise<string[]> {
  const docsSrc = join(TEMPLATES_DIR, "docs");
  const docsDest = join(scaffoldDir(config), "docs");
  return renderDir(docsSrc, docsDest, hbData, { force: config.force, interactive: config.interactive, ...extraOpts });
}

async function scaffoldScripts(
  config: ScaffoldConfig,
  hbData: HandlebarsData,
  extraOpts: WriteOptions = {},
): Promise<string[]> {
  const scriptsSrc = join(TEMPLATES_DIR, "scripts");
  const scriptsDest = join(scaffoldDir(config), "scripts");
  return renderDir(scriptsSrc, scriptsDest, hbData, {
    force: config.force,
    interactive: config.interactive,
    ...extraOpts,
  });
}

async function scaffoldSkills(config: ScaffoldConfig, extraOpts: WriteOptions = {}): Promise<string[]> {
  const skillsSrc = join(TEMPLATES_DIR, "skills");
  const skillsDest = join(scaffoldDir(config), ".agents", "skills");
  return copyStaticDir(skillsSrc, skillsDest, { force: config.force, interactive: config.interactive, ...extraOpts });
}

async function scaffoldHooks(
  config: ScaffoldConfig,
  hbData: HandlebarsData,
  extraOpts: WriteOptions = {},
): Promise<string[]> {
  const hooksSrc = join(TEMPLATES_DIR, "hooks");
  const hooksDest = join(scaffoldDir(config), ".agents", "hooks");
  return renderDir(hooksSrc, hooksDest, hbData, { force: config.force, interactive: config.interactive, ...extraOpts });
}

async function scaffoldScratchpad(config: ScaffoldConfig, extraOpts: WriteOptions = {}): Promise<string[]> {
  const src = join(TEMPLATES_DIR, "scratchpad");
  const dest = join(scaffoldDir(config), ".scratchpad");
  return copyStaticDir(src, dest, { force: config.force, interactive: config.interactive, ...extraOpts });
}

async function scaffoldHistory(config: ScaffoldConfig, extraOpts: WriteOptions = {}): Promise<string[]> {
  const src = join(TEMPLATES_DIR, "history");
  const dest = join(scaffoldDir(config), ".history");
  return copyStaticDir(src, dest, { force: config.force, interactive: config.interactive, ...extraOpts });
}

export async function scaffold(argv: ScaffoldArgs): Promise<void> {
  const config = resolveConfig(argv);

  if (config.interactive) {
    console.log(`\n ${style.bold("Detected project profile:")}`);
    showDetectedProfile(config);

    config.projectName = await askProjectName(config.projectName);
    config.issueTracker = await askIssueTracker(config.issueTracker);
    const components = await askComponents();
    config.include = new Set(components);
  }

  const hbData = buildHandlebars(config, PKG.version);

  const detected: string[] = [];
  if (config.languages.length > 0) detected.push(config.languages.join(", "));
  if (config.packageManager) detected.push(style.cyan(config.packageManager));
  if (config.ciProvider) detected.push(style.cyan(config.ciProvider));
  const detectedStr = detected.length > 0 ? detected.join(" · ") : style.dim("none");

  const rows: [string, string][] = [
    ["Project", style.cyan(config.projectName)],
    ["Detected", detectedStr],
    ["Tracker", style.dim(config.issueTracker)],
    ["Include", [...config.include].join(" + ") || style.dim("(none)")],
  ];
  console.log(`\n${infoBox(rows)}`);

  const total = countTemplateFiles(TEMPLATES_DIR, [...config.include]);
  let done = 0;
  const tickOpts: WriteOptions = {
    onProgress: () => {
      done++;
      process.stdout.write(`\r  ${spinner(done)} ${progressBar(done, total)}`);
    },
  };

  const results: string[] = [...(await scaffoldRoot(config, hbData, tickOpts))];

  if (config.include.has("docs")) results.push(...(await scaffoldDocs(config, hbData, tickOpts)));
  if (config.include.has("scripts")) results.push(...(await scaffoldScripts(config, hbData, tickOpts)));
  if (config.include.has("skills")) results.push(...(await scaffoldSkills(config, tickOpts)));
  if (config.include.has("hooks")) results.push(...(await scaffoldHooks(config, hbData, tickOpts)));

  results.push(...(await scaffoldScratchpad(config, tickOpts)));
  results.push(...(await scaffoldHistory(config, tickOpts)));

  results.push(...(await createSymlinks(config.target, config.scaffoldDir)));

  process.stdout.write(`${"\r".padEnd(60)}\r`);

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
