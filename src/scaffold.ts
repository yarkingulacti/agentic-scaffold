import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import type { HandlebarsData, IncompleteFile, ScaffoldArgs, ScaffoldConfig } from "./config.js";
import { buildHandlebars, buildIncompleteFiles, resolveConfig } from "./config.js";
import type { WriteOptions } from "./fs-utils.js";
import { copyStaticDir, createSymlinks, writeManifest } from "./fs-utils.js";
import { askAITools, askComponents, askIssueTracker, askProjectName } from "./prompts.js";
import { countTemplateFiles, listDryRunFiles, renderDir } from "./templates.js";
import { infoBox, progressBar, spinner, style, summaryLine } from "./ui.js";

const __dirname = dirname(fileURLToPath(import.meta.url));
const TEMPLATES_DIR = join(__dirname, "..", "templates");
const PKG = JSON.parse(readFileSync(join(__dirname, "..", "package.json"), "utf-8")) as { version: string };

function out(config: ScaffoldConfig, ...args: unknown[]): void {
  if (config.json) {
    process.stderr.write(`${args.join(" ")}\n`);
  } else {
    console.log(...args);
  }
}

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
  out(config, `\n${infoBox(rows)}`);
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

const CI_PROVIDER_MAP: Record<string, { src: string; dest: string }> = {
  github: { src: "github", dest: ".github" },
  gitlab: { src: "gitlab", dest: "." },
  circleci: { src: "circleci", dest: ".circleci" },
};

async function scaffoldCi(
  config: ScaffoldConfig,
  hbData: HandlebarsData,
  extraOpts: WriteOptions = {},
): Promise<string[]> {
  if (!config.ciProvider) return [];
  const provider = CI_PROVIDER_MAP[config.ciProvider];
  if (!provider) return [];
  const ciSrc = join(TEMPLATES_DIR, "ci", provider.src);
  const ciDest = join(config.target, provider.dest);
  return renderDir(ciSrc, ciDest, hbData, { force: config.force, interactive: config.interactive, ...extraOpts });
}

async function scaffoldContribute(
  config: ScaffoldConfig,
  hbData: HandlebarsData,
  extraOpts: WriteOptions = {},
): Promise<string[]> {
  const src = join(TEMPLATES_DIR, "contribute");
  const dest = join(scaffoldDir(config), "contribute");
  return renderDir(src, dest, hbData, { force: config.force, interactive: config.interactive, ...extraOpts });
}

async function scaffoldAiConfig(
  config: ScaffoldConfig,
  hbData: HandlebarsData,
  extraOpts: WriteOptions = {},
): Promise<string[]> {
  const src = join(TEMPLATES_DIR, "ai-config");
  const dest = config.target;
  return renderDir(src, dest, hbData, { force: config.force, interactive: config.interactive, ...extraOpts });
}

async function scaffoldOnboarding(
  config: ScaffoldConfig,
  hbData: HandlebarsData,
  extraOpts: WriteOptions = {},
): Promise<string[]> {
  const src = join(TEMPLATES_DIR, "onboarding");
  const dest = join(scaffoldDir(config), "onboarding");
  return renderDir(src, dest, hbData, { force: config.force, interactive: config.interactive, ...extraOpts });
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

interface JsonResult {
  written: number;
  skipped: number;
  incompleteFiles: IncompleteFile[];
  modifiedFiles?: string[];
}

export async function scaffold(argv: ScaffoldArgs): Promise<void> {
  const config = resolveConfig(argv);

  if (config.interactive) {
    out(config, `\n ${style.bold("Detected project profile:")}`);
    showDetectedProfile(config);

    config.projectName = await askProjectName(config.projectName);
    config.issueTracker = await askIssueTracker(config.issueTracker);
    config.aiTools = await askAITools(config.aiTools);
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
  out(config, `\n${infoBox(rows)}`);

  if (config.dryRun) {
    const entries = listDryRunFiles(TEMPLATES_DIR, [...config.include]);
    out(config, `\n ${style.bold("Dry run — no files will be written:")}`);
    out(config, `   ${style.cyan(String(entries.length))} files would be created\n`);
    for (const entry of entries) {
      const icon = entry.type === "dir" ? style.dim("📁") : "📄";
      out(config, `   ${icon} ${entry.dest}`);
    }
    out(config, `\n   ${style.dim("Symlinks that would be created:")}`);
    out(config, `   AGENTS.md → .agentic-scaffold/AGENTS.md`);
    out(config, `   CLAUDE.md → .agentic-scaffold/CLAUDE.md`);
    out(config, `\n ${summaryLine("Run without --dry-run to scaffold.", "done")}`);
    return;
  }

  const total = countTemplateFiles(TEMPLATES_DIR, [...config.include]);
  let done = 0;
  const tickOpts: WriteOptions = {
    onProgress: () => {
      if (!config.json) {
        done++;
        process.stdout.write(`\r  ${spinner(done)} ${progressBar(done, total)}`);
      } else {
        done++;
      }
    },
  };

  const results: string[] = [...(await scaffoldRoot(config, hbData, tickOpts))];

  if (config.include.has("docs")) results.push(...(await scaffoldDocs(config, hbData, tickOpts)));
  if (config.include.has("scripts")) results.push(...(await scaffoldScripts(config, hbData, tickOpts)));
  if (config.include.has("skills")) results.push(...(await scaffoldSkills(config, tickOpts)));
  if (config.include.has("hooks")) results.push(...(await scaffoldHooks(config, hbData, tickOpts)));
  if (config.include.has("ci")) results.push(...(await scaffoldCi(config, hbData, tickOpts)));
  if (config.include.has("contribute")) results.push(...(await scaffoldContribute(config, hbData, tickOpts)));
  if (config.include.has("ai-config")) results.push(...(await scaffoldAiConfig(config, hbData, tickOpts)));
  if (config.include.has("onboarding")) results.push(...(await scaffoldOnboarding(config, hbData, tickOpts)));
  if (config.include.has("history")) results.push(...(await scaffoldHistory(config, tickOpts)));
  if (config.include.has("scratchpad")) results.push(...(await scaffoldScratchpad(config, tickOpts)));

  results.push(...(await createSymlinks(config.target, config.scaffoldDir)));

  writeManifest(config.scaffoldDir, PKG.version);

  if (!config.json) {
    process.stdout.write(`${"\r".padEnd(60)}\r`);
  }

  const written = results.filter((r) => r === "written").length;
  const skipped = results.filter((r) => r === "skipped-existing").length;

  const incompleteFiles = buildIncompleteFiles(config);

  if (config.json) {
    const jsonResult: JsonResult = { written, skipped, incompleteFiles };
    process.stdout.write(`${JSON.stringify(jsonResult)}\n`);
    return;
  }

  out(config, ` ${summaryLine(`Done! ${written} file${written !== 1 ? "s" : ""} scaffolded.`, "done")}`);
  if (skipped > 0) {
    out(config, `   ${summaryLine(`${skipped} file${skipped !== 1 ? "s" : ""} skipped — already exist.`, "warn")}`);
    out(config, `   ${style.dim("·")}  ${style.dim("Run with --force to overwrite existing files.")}`);
  }

  if (incompleteFiles.length > 0) {
    out(config, `\n ${style.dim("Documentation files that need completion:")}`);
    for (const { file, sections } of incompleteFiles) {
      out(config, `   ${style.bold(file)}`);
      for (const section of sections.split(", ")) {
        out(config, `     ${style.dim("→")} ${section} ${style.dim("(empty)")}`);
      }
    }
    if (config.include.has("skills")) {
      out(config, `\n ${style.dim("Agent skill available to help:")}`);
      out(config, `   .agentic-scaffold/.agents/skills/fill-docs/SKILL.md`);
      out(config, `   ${style.dim("Invoke it with your AI agent to fill in these files conversationally.")}`);
    }
  }
}
