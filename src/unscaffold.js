import { existsSync, readdirSync, lstatSync, readlinkSync, rmSync } from "node:fs";
import { join, relative } from "node:path";
import readline from "node:readline/promises";
import { stdin as input, stdout as output } from "node:process";
import { infoBox, summaryLine, style } from "./ui.js";

const SCAFFOLD_DIR = ".agentic-scaffold";

function findScaffoldFiles(target) {
  const scaffoldPath = join(target, SCAFFOLD_DIR);
  if (!existsSync(scaffoldPath)) return null;

  const files = [];
  collectFiles(scaffoldPath, files);
  return { scaffoldPath, files };
}

function collectFiles(dir, files) {
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

function findSymlinks(target) {
  const links = [];
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

export async function unscaffold(argv) {
  const target = argv.target || process.cwd();
  const force = argv.force ?? false;

  const scaffoldData = findScaffoldFiles(target);
  if (!scaffoldData) {
    console.log(` ${summaryLine("Nothing to unscaffold — .agentic-scaffold/ not found.", "done")}`);
    return;
  }

  const symlinks = findSymlinks(target);
  const { scaffoldPath, files } = scaffoldData;

  const rows = [
    ["Target", style.cyan(target)],
    ["Files to remove", style.cyan(String(files.length))],
    ["Symlinks to remove", style.cyan(String(symlinks.length))],
  ];
  console.log(`\n${infoBox(rows)}`);

  if (!force) {
    const rl = readline.createInterface({ input, output });
    const answer = await rl.question(`  Remove .agentic-scaffold/ (${files.length} files, ${symlinks.length} symlinks)? [y/N]: `);
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
