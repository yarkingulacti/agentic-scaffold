import { createHash } from "node:crypto";
import {
  copyFileSync,
  existsSync,
  lstatSync,
  mkdirSync,
  readdirSync,
  readFileSync,
  readlinkSync,
  statSync,
  symlinkSync,
  writeFileSync,
} from "node:fs";
import { dirname, join, relative } from "node:path";
import { askOverwrite } from "./prompts.js";

export interface WriteOptions {
  interactive?: boolean;
  force?: boolean;
  onProgress?: () => void;
  onWritten?: (entry: WrittenEntry) => void;
}

export interface WrittenFileEntry {
  path: string;
  type: "file";
}

export interface WrittenSymlinkEntry {
  path: string;
  type: "symlink";
  linkTarget: string;
}

export type WrittenEntry = WrittenFileEntry | WrittenSymlinkEntry;

export async function write(targetPath: string, content: string, options: WriteOptions = {}): Promise<string> {
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
  options.onWritten?.({ path: targetPath, type: "file" });
  return "written";
}

export async function copyFile(src: string, dest: string, options: WriteOptions = {}): Promise<string> {
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
  options.onWritten?.({ path: dest, type: "file" });
  return "written";
}

export async function copyStaticDir(srcDir: string, destDir: string, options: WriteOptions = {}): Promise<string[]> {
  if (!existsSync(srcDir)) return [];
  const results: string[] = [];
  for (const entry of walkDir(srcDir)) {
    const dest = join(destDir, entry.name);
    results.push(await copyFile(entry.full, dest, options));
  }
  return results;
}

export function createSymlinks(target: string, scaffoldDir: string, options: WriteOptions = {}): string[] {
  const names = ["AGENTS.md", "CLAUDE.md"];
  const created: string[] = [];
  for (const name of names) {
    const linkPath = join(target, name);
    if (existsSync(linkPath)) {
      created.push("skipped-existing");
      continue;
    }
    const linkTarget = join(".agentic-scaffold", name);
    const sourcePath = join(scaffoldDir, name);
    if (!existsSync(sourcePath)) {
      created.push("skipped-existing");
      continue;
    }
    if (process.platform === "win32") {
      copyFileSync(sourcePath, linkPath);
      console.warn(`  Symlinks not supported on Windows; copied ${name} instead.`);
      options.onWritten?.({ path: linkPath, type: "file" });
      created.push("written");
      continue;
    }
    try {
      symlinkSync(linkTarget, linkPath);
      options.onWritten?.({ path: linkPath, type: "symlink", linkTarget });
      created.push("written");
    } catch (err: unknown) {
      const nodeErr = err as NodeJS.ErrnoException;
      if (nodeErr.code === "ENOSYS" || nodeErr.code === "EPERM" || nodeErr.code === "EACCES") {
        copyFileSync(sourcePath, linkPath);
        console.warn(`  Symlinks not supported on this system; copied ${name} instead.`);
        options.onWritten?.({ path: linkPath, type: "file" });
        created.push("written");
      } else {
        created.push("skipped-existing");
      }
    }
  }
  return created;
}

export interface DirEntry {
  name: string;
  full: string;
}

export function walkDir(dir: string): DirEntry[] {
  const entries: DirEntry[] = [];
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

export interface ManifestFileEntry {
  path: string;
  type?: "file";
  contentHash: string;
}

export interface ManifestSymlinkEntry {
  path: string;
  type: "symlink";
  linkTarget: string;
}

export type ManifestEntry = ManifestFileEntry | ManifestSymlinkEntry;

export interface Manifest {
  version: number;
  scaffoldVersion: string;
  createdAt: string;
  files: ManifestEntry[];
}

export function fileHash(filePath: string): string {
  const content = readFileSync(filePath);
  return createHash("sha256").update(content).digest("hex");
}

function manifestEntryFor(root: string, entry: WrittenEntry): ManifestEntry {
  const relPath = relative(root, entry.path);
  if (entry.type === "symlink") {
    return { path: relPath, type: "symlink", linkTarget: entry.linkTarget };
  }
  return { path: relPath, type: "file", contentHash: fileHash(entry.path) };
}

export function generateManifest(
  scaffoldDir: string,
  scaffoldVersion: string,
  options?: { target?: string; writtenEntries?: WrittenEntry[] },
): Manifest {
  if (options?.target && options.writtenEntries) {
    const files = options.writtenEntries
      .filter((entry) => existsSync(entry.path))
      .map((entry) => manifestEntryFor(options.target as string, entry));
    files.sort((a, b) => a.path.localeCompare(b.path));
    return {
      version: 2,
      scaffoldVersion,
      createdAt: new Date().toISOString(),
      files,
    };
  }

  const files: ManifestEntry[] = [];
  for (const entry of walkDir(scaffoldDir)) {
    if (entry.name === ".manifest.json") continue;
    const relPath = relative(scaffoldDir, entry.full);
    files.push({ path: relPath, contentHash: fileHash(entry.full) });
  }
  files.sort((a, b) => a.path.localeCompare(b.path));
  return {
    version: 1,
    scaffoldVersion,
    createdAt: new Date().toISOString(),
    files,
  };
}

export function writeManifest(scaffoldDir: string, scaffoldVersion: string): void {
  const manifest = generateManifest(scaffoldDir, scaffoldVersion);
  writeFileSync(join(scaffoldDir, ".manifest.json"), `${JSON.stringify(manifest, null, 2)}\n`, "utf-8");
}

export function writeManifestForTarget(
  target: string,
  scaffoldDir: string,
  scaffoldVersion: string,
  writtenEntries: WrittenEntry[],
): void {
  const manifest = generateManifest(scaffoldDir, scaffoldVersion, { target, writtenEntries });
  writeFileSync(join(scaffoldDir, ".manifest.json"), `${JSON.stringify(manifest, null, 2)}\n`, "utf-8");
}

export function readManifest(scaffoldDir: string): Manifest | null {
  const manifestPath = join(scaffoldDir, ".manifest.json");
  if (!existsSync(manifestPath)) return null;
  try {
    return JSON.parse(readFileSync(manifestPath, "utf-8")) as Manifest;
  } catch {
    return null;
  }
}

export interface ModifiedFile {
  path: string;
  currentHash: string;
  expectedHash: string;
}

export function verifyManifest(root: string, manifest: Manifest): ModifiedFile[] {
  const modified: ModifiedFile[] = [];
  for (const entry of manifest.files) {
    const fullPath = join(root, entry.path);
    if (!existsSync(fullPath)) {
      const expectedHash = entry.type === "symlink" ? entry.linkTarget : entry.contentHash;
      modified.push({ path: entry.path, currentHash: "(deleted)", expectedHash });
      continue;
    }
    if (entry.type === "symlink") {
      if (!lstatSync(fullPath).isSymbolicLink()) {
        modified.push({ path: entry.path, currentHash: "(replaced)", expectedHash: entry.linkTarget });
        continue;
      }
      const currentTarget = readlinkSync(fullPath);
      if (currentTarget !== entry.linkTarget) {
        modified.push({ path: entry.path, currentHash: currentTarget, expectedHash: entry.linkTarget });
      }
      continue;
    }
    if (lstatSync(fullPath).isSymbolicLink()) {
      modified.push({ path: entry.path, currentHash: "(replaced)", expectedHash: entry.contentHash });
      continue;
    }
    const currentHash = fileHash(fullPath);
    if (currentHash !== entry.contentHash) {
      modified.push({ path: entry.path, currentHash, expectedHash: entry.contentHash });
    }
  }
  return modified;
}
