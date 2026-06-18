import { createHash } from "node:crypto";
import {
  copyFileSync,
  existsSync,
  mkdirSync,
  readdirSync,
  readFileSync,
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
}

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

export function createSymlinks(target: string, scaffoldDir: string): string[] {
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
      created.push("written");
      continue;
    }
    try {
      symlinkSync(linkTarget, linkPath);
      created.push("written");
    } catch (err: unknown) {
      const nodeErr = err as NodeJS.ErrnoException;
      if (nodeErr.code === "ENOSYS" || nodeErr.code === "EPERM" || nodeErr.code === "EACCES") {
        copyFileSync(sourcePath, linkPath);
        console.warn(`  Symlinks not supported on this system; copied ${name} instead.`);
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

export interface ManifestEntry {
  path: string;
  contentHash: string;
}

export interface Manifest {
  version: number;
  scaffoldVersion: string;
  createdAt: string;
  files: ManifestEntry[];
}

function fileHash(filePath: string): string {
  const content = readFileSync(filePath);
  return createHash("sha256").update(content).digest("hex");
}

export function generateManifest(scaffoldDir: string, scaffoldVersion: string): Manifest {
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

export function verifyManifest(scaffoldDir: string, manifest: Manifest): ModifiedFile[] {
  const modified: ModifiedFile[] = [];
  for (const entry of manifest.files) {
    const fullPath = join(scaffoldDir, entry.path);
    if (!existsSync(fullPath)) {
      modified.push({ path: entry.path, currentHash: "(deleted)", expectedHash: entry.contentHash });
      continue;
    }
    const currentHash = fileHash(fullPath);
    if (currentHash !== entry.contentHash) {
      modified.push({ path: entry.path, currentHash, expectedHash: entry.contentHash });
    }
  }
  return modified;
}
