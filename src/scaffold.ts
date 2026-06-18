import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import type { HandlebarsData, IncompleteFile, ScaffoldArgs, ScaffoldConfig } from "./config.js";
import { buildHandlebars, buildIncompleteFiles, resolveConfig } from "./config.js";
import type { WriteOptions, WrittenEntry } from "./fs-utils.js";
import { copyStaticDir, createSymlinks, writeManifestForTarget } from "./fs-utils.js";
import { askAITools, askComponents, askIssueTracker, askProjectName } from "./prompts.js";
import type { DryRunEntry } from "./templates.js";
import { listRenderedFiles, renderDir } from "./templates.js";
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

interface Component {
  name: string;
  render: (config: ScaffoldConfig, hbData: HandlebarsData, opts: WriteOptions) => Promise<string[]>;
  dryRun: (config: ScaffoldConfig) => DryRunEntry[];
}

type DestBase = "scaffold" | "target";

function componentRender(
  srcSubdir: string,
  destRel: string,
  destBase: DestBase = "scaffold",
  staticOnly = false,
): Pick<Component, "render" | "dryRun"> {
  const src = join(TEMPLATES_DIR, srcSubdir);
  const relBase = destBase === "target" ? "." : ".agentic-scaffold";
  const relDest = destRel ? join(relBase, destRel) : relBase;
  return {
    render: async (config, hbData, opts) => {
      const base = destBase === "target" ? config.target : config.scaffoldDir;
      const dest = destRel ? join(base, destRel) : base;
      const writeOpts = { force: config.force, interactive: config.interactive, ...opts };
      if (staticOnly) return copyStaticDir(src, dest, writeOpts);
      return renderDir(src, dest, hbData, writeOpts);
    },
    dryRun: () => listRenderedFiles(src, relDest),
  };
}

function ciComponent(): Pick<Component, "render" | "dryRun"> {
  const CI_PROVIDER_MAP: Record<string, { src: string; dest: string }> = {
    github: { src: "github", dest: ".github" },
    gitlab: { src: "gitlab", dest: "." },
    circleci: { src: "circleci", dest: ".circleci" },
  };
  return {
    render: async (config, hbData, opts) => {
      if (!config.ciProvider) return [];
      const provider = CI_PROVIDER_MAP[config.ciProvider];
      if (!provider) return [];
      const src = join(TEMPLATES_DIR, "ci", provider.src);
      const dest = join(config.target, provider.dest);
      return renderDir(src, dest, hbData, { force: config.force, interactive: config.interactive, ...opts });
    },
    dryRun: (config) => {
      if (!config.ciProvider) return [];
      const provider = CI_PROVIDER_MAP[config.ciProvider];
      if (!provider) return [];
      return listRenderedFiles(join(TEMPLATES_DIR, "ci", provider.src), provider.dest);
    },
  };
}

const COMPONENTS: Component[] = [
  { name: "root", ...componentRender("root", "") },
  { name: "docs", ...componentRender("docs", "docs") },
  { name: "scripts", ...componentRender("scripts", "scripts") },
  { name: "skills", ...componentRender("skills", ".agents/skills", "scaffold", true) },
  { name: "hooks", ...componentRender("hooks", ".agents/hooks") },
  { name: "ci", ...ciComponent() },
  { name: "contribute", ...componentRender("contribute", "contribute") },
  { name: "ai-config", ...componentRender("ai-config", "", "target") },
  { name: "onboarding", ...componentRender("onboarding", "onboarding") },
  { name: "history", ...componentRender("history", ".history", "scaffold", true) },
  { name: "scratchpad", ...componentRender("scratchpad", ".scratchpad", "scaffold", true) },
];

function selectedComponents(config: ScaffoldConfig): Component[] {
  return COMPONENTS.filter((comp) => comp.name === "root" || config.include.has(comp.name));
}

function dryRunEntries(config: ScaffoldConfig): DryRunEntry[] {
  return selectedComponents(config).flatMap((comp) => comp.dryRun(config));
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
    const entries = dryRunEntries(config);
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

  const total = dryRunEntries(config).length;
  let done = 0;
  const writtenEntries: WrittenEntry[] = [];
  const tickOpts: WriteOptions = {
    onProgress: () => {
      if (!config.json) {
        done++;
        process.stdout.write(`\r  ${spinner(done)} ${progressBar(done, total)}`);
      } else {
        done++;
      }
    },
    onWritten: (entry) => {
      writtenEntries.push(entry);
    },
  };

  const results: string[] = [];
  for (const comp of selectedComponents(config)) {
    results.push(...(await comp.render(config, hbData, tickOpts)));
  }

  results.push(...createSymlinks(config.target, config.scaffoldDir, tickOpts));

  writeManifestForTarget(config.target, config.scaffoldDir, PKG.version, writtenEntries);

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
