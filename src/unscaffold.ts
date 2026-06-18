import { existsSync, lstatSync, readdirSync, readlinkSync, rmdirSync, rmSync } from "node:fs";
import { dirname, join, relative } from "node:path";
import { stdin as input, stdout as output } from "node:process";
import readline from "node:readline/promises";
import type { Manifest, ManifestEntry } from "./fs-utils.js";
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

function manifestPath(target: string, scaffoldPath: string, manifest: Manifest, entry: ManifestEntry): string {
  return join(manifest.version >= 2 ? target : scaffoldPath, entry.path);
}

function isV2Manifest(manifest: Manifest | null): manifest is Manifest {
  return (manifest?.version ?? 1) >= 2;
}

function findUnknownScaffoldFiles(target: string, scaffoldPath: string, manifest: Manifest): string[] {
  const owned = new Set(manifest.files.map((entry) => entry.path));
  const unknown: string[] = [];
  const files: ScaffoldFile[] = [];
  collectFiles(scaffoldPath, files);

  for (const file of files) {
    if (file.type !== "file") continue;
    const relPath = relative(target, file.path);
    if (relPath === join(SCAFFOLD_DIR, ".manifest.json")) continue;
    if (!owned.has(relPath)) unknown.push(relPath);
  }

  unknown.sort((a, b) => a.localeCompare(b));
  return unknown;
}

function removeEmptyParents(target: string, path: string): void {
  let dir = dirname(path);
  while (dir !== target && dir.startsWith(target)) {
    try {
      rmdirSync(dir);
    } catch {
      return;
    }
    dir = dirname(dir);
  }
}

async function confirm(question: string): Promise<boolean> {
  const rl = readline.createInterface({ input, output });
  const answer = await rl.question(question);
  rl.close();
  return answer.trim().toLowerCase() === "y";
}

function displayModified(modified: ReturnType<typeof verifyManifest>): void {
  console.log(`\n ${style.bold("Modified files detected:")}`);
  for (const file of modified) {
    const icon = file.currentHash === "(deleted)" ? style.dim("(deleted)") : style.yellow("(modified)");
    console.log(`   ${icon} ${file.path}`);
  }
}

function removeV2OwnedFiles(target: string, scaffoldPath: string, manifest: Manifest): number {
  let removed = 0;
  const entries = [...manifest.files].sort((a, b) => b.path.localeCompare(a.path));
  for (const entry of entries) {
    const fullPath = manifestPath(target, scaffoldPath, manifest, entry);
    if (!existsSync(fullPath)) continue;
    rmSync(fullPath, { force: true });
    if (entry.type !== "symlink") removed++;
    if (!entry.path.startsWith(`${SCAFFOLD_DIR}/`) && entry.path !== SCAFFOLD_DIR) {
      removeEmptyParents(target, fullPath);
    }
  }
  return removed;
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
  const modified = manifest ? verifyManifest(isV2Manifest(manifest) ? target : scaffoldPath, manifest) : [];
  if (modified.length > 0 && !force) {
    displayModified(modified);
    console.log();
    const ok = await confirm(
      `  ${modified.length} file${modified.length > 1 ? "s" : ""} changed since scaffolding. Delete anyway? [y/N]: `,
    );
    if (!ok) {
      console.log(` ${summaryLine("Unscaffold cancelled.", "warn")}`);
      return;
    }
  }

  const unknown = isV2Manifest(manifest) ? findUnknownScaffoldFiles(target, scaffoldPath, manifest) : [];
  if (unknown.length > 0 && !force) {
    console.log(`\n ${style.bold("Unknown files under .agentic-scaffold/ detected:")}`);
    for (const file of unknown) {
      console.log(`   ${style.yellow("(unknown)")} ${file}`);
    }
    console.log();
    const ok = await confirm(
      `  Recursive cleanup will delete ${unknown.length} unknown file${unknown.length > 1 ? "s" : ""}. Delete anyway? [y/N]: `,
    );
    if (!ok) {
      console.log(` ${summaryLine("Unscaffold cancelled.", "warn")}`);
      return;
    }
  }

  const ownedEntries = isV2Manifest(manifest) ? manifest.files : [];
  const ownedFiles = ownedEntries.filter((entry) => entry.type !== "symlink").length;
  const ownedSymlinks = ownedEntries.filter((entry) => entry.type === "symlink").length;
  const fileCount = isV2Manifest(manifest) ? ownedFiles : files.length;
  const symlinkCount = isV2Manifest(manifest) ? ownedSymlinks : symlinks.length;

  const rows: [string, string][] = [
    ["Target", style.cyan(target)],
    ["Files to remove", style.cyan(String(fileCount))],
    ["Symlinks to remove", style.cyan(String(symlinkCount))],
    ...(modified.length > 0 ? [["Modified", style.yellow(String(modified.length))] as [string, string]] : []),
    ...(unknown.length > 0 ? [["Unknown", style.yellow(String(unknown.length))] as [string, string]] : []),
  ];
  console.log(`\n${infoBox(rows)}`);

  if (!force) {
    const ok = await confirm(`  Remove scaffolded files (${fileCount} files, ${symlinkCount} symlinks)? [y/N]: `);
    if (!ok) {
      console.log(` ${summaryLine("Unscaffold cancelled.", "warn")}`);
      return;
    }
  }

  let removedFiles = files.length;
  let removedSymlinks = symlinks.length;
  if (isV2Manifest(manifest)) {
    removedFiles = removeV2OwnedFiles(target, scaffoldPath, manifest);
    removedSymlinks = ownedSymlinks;
  }

  rmSync(scaffoldPath, { recursive: true, force: true });

  if (!isV2Manifest(manifest)) {
    for (const link of symlinks) {
      rmSync(link, { force: true });
    }
  }

  console.log(` ${summaryLine(`Removed ${removedFiles} files and ${removedSymlinks} symlinks.`, "done")}`);
}
