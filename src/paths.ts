import { existsSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const moduleDir = dirname(fileURLToPath(import.meta.url));

function findPackageRoot(startDir: string): string {
  let dir = startDir;
  while (true) {
    if (existsSync(join(dir, "package.json")) && existsSync(join(dir, "templates"))) {
      return dir;
    }

    const parent = dirname(dir);
    if (parent === dir) {
      throw new Error(`Unable to locate package root from ${startDir}`);
    }
    dir = parent;
  }
}

export const PACKAGE_ROOT = findPackageRoot(moduleDir);
export const PACKAGE_JSON = join(PACKAGE_ROOT, "package.json");
export const TEMPLATES_DIR = join(PACKAGE_ROOT, "templates");
