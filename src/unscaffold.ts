import { existsSync, lstatSync, readdirSync, readlinkSync, rmSync } from "node:fs";
import { join } from "node:path";
import { stdin as input, stdout as output } from "node:process";
import readline from "node:readline/promises";
import { readManifest, verifyManifest } from "./fs-utils.js";
import { infoBox, style, summaryLine } from "./ui.js";

const SCAFFOLD_DIR = ".agentic-scaffold";

interface ScaffoldFile {
  path: string;
  type: "dir" | "file";
}

interface ScaffoldData {
  scaffoldPath: string;
  files: ScaffoldFile[];
}

function findScaffoldFiles(target: string): ScaffoldData | null {
  const scaffoldPath = join(target, SCAFFOLD_DIR);
  if (!existsSync(scaffoldPath)) return null;

  const files: ScaffoldFile[] = [];
  collectFiles(scaffoldPath, files);
  return { scaffoldPath, files };
}

function collectFiles(dir: string, files: ScaffoldFile[]): void {
  for (const name of readdirSync(dir)) {
    const full = join(dir, name);
    const stat = lstatSync(full);
    if (stat.isDirectory()) {
      files.push({ path: full, type: "dir" });
      collectFiles(full, files);
    } else {
      files.push({ path: full, type: "file" });
    }
  }
}

function findSymlinks(target: string): string[] {
  const links: string[] = [];
  for (const name of ["AGENTS.md", "CLAUDE.md"]) {
    const full = join(target, name);
    if (!existsSync(full)) continue;
    const stat = lstatSync(full);
    if (stat.isSymbolicLink()) {
      const linkTarget = readlinkSync(full);
      if (linkTarget.startsWith(SCAFFOLD_DIR)) {
        links.push(full);
      }
    }
  }
  return links;
}

export async function unscaffold(argv: { target?: string; force?: boolean }): Promise<void> {
  const target = argv.target || process.cwd();
  const force = argv.force ?? false;

  const scaffoldData = findScaffoldFiles(target);
  if (!scaffoldData) {
    console.log(` ${summaryLine("Nothing to unscaffold — .agentic-scaffold/ not found.", "done")}`);
    return;
  }

  const symlinks = findSymlinks(target);
  const { scaffoldPath, files } = scaffoldData;

  const manifest = readManifest(scaffoldPath);
  const modified = manifest ? verifyManifest(scaffoldPath, manifest) : [];
  if (modified.length > 0 && !force) {
    console.log(`\n ${style.bold("Modified files detected:")}`);
    for (const file of modified) {
      const icon = file.currentHash === "(deleted)" ? style.dim("(deleted)") : style.yellow("(modified)");
      console.log(`   ${icon} ${file.path}`);
    }
    console.log();
    const rl = readline.createInterface({ input, output });
    const answer = await rl.question(
      `  ${modified.length} file${modified.length > 1 ? "s" : ""} changed since scaffolding. Delete anyway? [y/N]: `,
    );
    rl.close();
    if (answer.trim().toLowerCase() !== "y") {
      console.log(` ${summaryLine("Unscaffold cancelled.", "warn")}`);
      return;
    }
  }

  const rows: [string, string][] = [
    ["Target", style.cyan(target)],
    ["Files to remove", style.cyan(String(files.length))],
    ["Symlinks to remove", style.cyan(String(symlinks.length))],
    ...(modified.length > 0 ? [["Modified", style.yellow(String(modified.length))] as [string, string]] : []),
  ];
  console.log(`\n${infoBox(rows)}`);

  if (!force) {
    const rl = readline.createInterface({ input, output });
    const answer = await rl.question(
      `  Remove .agentic-scaffold/ (${files.length} files, ${symlinks.length} symlinks)? [y/N]: `,
    );
    rl.close();
    if (answer.trim().toLowerCase() !== "y") {
      console.log(` ${summaryLine("Unscaffold cancelled.", "warn")}`);
      return;
    }
  }

  rmSync(scaffoldPath, { recursive: true, force: true });

  for (const link of symlinks) {
    rmSync(link, { force: true });
  }

  console.log(` ${summaryLine(`Removed ${files.length} files and ${symlinks.length} symlinks.`, "done")}`);
}
