import { readFileSync } from "node:fs";
import { ALWAYS_INCLUDED, COMPONENTS, type ComponentSpec } from "./components.js";
import type { IncompleteFile, ScaffoldArgs, ScaffoldConfig } from "./config.js";
import { buildHandlebars, buildIncompleteFiles, resolveConfig } from "./config.js";
import type { WriteOptions, WrittenEntry } from "./fs-utils.js";
import { createSymlinks, writeManifestForTarget } from "./fs-utils.js";
import { PACKAGE_JSON } from "./paths.js";
import { askAITools, askComponents, askIssueTracker, askProjectName } from "./prompts.js";
import type { DryRunEntry } from "./templates.js";
import { infoBox, progressBar, spinner, style, summaryLine } from "./ui.js";

const PKG = JSON.parse(readFileSync(PACKAGE_JSON, "utf-8")) as { version: string };

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

function selectedComponents(config: ScaffoldConfig): ComponentSpec[] {
  return COMPONENTS.filter((comp) => comp.name === ALWAYS_INCLUDED || config.include.has(comp.name));
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
