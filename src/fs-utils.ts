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
import { dirname, join } from "node:path";
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
