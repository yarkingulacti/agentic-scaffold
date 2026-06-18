import { existsSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import Handlebars from "handlebars";
import type { HandlebarsData } from "./config.js";
import type { WriteOptions } from "./fs-utils.js";
import { copyFile, walkDir, write } from "./fs-utils.js";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT_TEMPLATES = join(__dirname, "..", "templates", "root");

function registerPartial(name: string, filename: string): void {
  const path = join(ROOT_TEMPLATES, filename);
  const content = readFileSync(path, "utf-8");
  Handlebars.registerPartial(name, content);
}

registerPartial("agentConfigHead", "_AGENT_CONFIG_HEAD.md.hbs");
registerPartial("agentConfigTail", "_AGENT_CONFIG_TAIL.md.hbs");

export function renderTemplate(sourcePath: string, hbData: HandlebarsData): string {
  const raw = readFileSync(sourcePath, "utf-8");
  const template = Handlebars.compile(raw);
  return template(hbData);
}

export async function renderDir(
  srcDir: string,
  destDir: string,
  data: HandlebarsData,
  options: WriteOptions = {},
): Promise<string[]> {
  if (!existsSync(srcDir)) return [];
  const results: string[] = [];
  for (const entry of walkDir(srcDir)) {
    const basename = entry.name.split("/").pop() ?? entry.name;
    if (basename.startsWith("_")) continue;
    const isHbs = entry.name.endsWith(".hbs");
    const outName = isHbs ? entry.name.slice(0, -".hbs".length) : entry.name;
    const dest = join(destDir, outName);
    if (isHbs) {
      const content = renderTemplate(entry.full, data);
      results.push(await write(dest, content, options));
    } else {
      results.push(await copyFile(entry.full, dest, options));
    }
  }
  return results;
}

export interface DryRunEntry {
  dest: string;
  type: "file" | "dir";
}

export function listRenderedFiles(srcDir: string, destDir: string): DryRunEntry[] {
  const entries: DryRunEntry[] = [];
  if (!existsSync(srcDir)) return entries;
  for (const entry of walkDir(srcDir)) {
    const basename = entry.name.split("/").pop() ?? entry.name;
    if (basename.startsWith("_")) continue;
    const isHbs = entry.name.endsWith(".hbs");
    const outName = isHbs ? entry.name.slice(0, -".hbs".length) : entry.name;
    entries.push({ dest: join(destDir, outName), type: "file" });
  }
  return entries;
}
