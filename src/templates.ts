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

export function listDryRunFiles(dir: string, components: string[]): DryRunEntry[] {
  const dirs: { src: string; destBase: string }[] = [
    { src: join(dir, "root"), destBase: ".agentic-scaffold" },
    ...(components.includes("docs") ? [{ src: join(dir, "docs"), destBase: ".agentic-scaffold/docs" }] : []),
    ...(components.includes("scripts") ? [{ src: join(dir, "scripts"), destBase: ".agentic-scaffold/scripts" }] : []),
    ...(components.includes("skills")
      ? [{ src: join(dir, "skills"), destBase: ".agentic-scaffold/.agents/skills" }]
      : []),
    ...(components.includes("hooks") ? [{ src: join(dir, "hooks"), destBase: ".agentic-scaffold/.agents/hooks" }] : []),
    ...(components.includes("ci")
      ? [
          { src: join(dir, "ci", "github"), destBase: ".github" },
          { src: join(dir, "ci", "gitlab"), destBase: "." },
        ]
      : []),
    ...(components.includes("contribute")
      ? [{ src: join(dir, "contribute"), destBase: ".agentic-scaffold/contribute" }]
      : []),
    ...(components.includes("ai-config") ? [{ src: join(dir, "ai-config"), destBase: "." }] : []),
    ...(components.includes("onboarding")
      ? [{ src: join(dir, "onboarding"), destBase: ".agentic-scaffold/onboarding" }]
      : []),
    { src: join(dir, "scratchpad"), destBase: ".agentic-scaffold/.scratchpad" },
    { src: join(dir, "history"), destBase: ".agentic-scaffold/.history" },
  ];
  const entries: DryRunEntry[] = [];
  for (const { src, destBase } of dirs) {
    if (!existsSync(src)) continue;
    for (const entry of walkDir(src)) {
      const basename = entry.name.split("/").pop() ?? entry.name;
      if (basename.startsWith("_")) continue;
      const isHbs = entry.name.endsWith(".hbs");
      const outName = isHbs ? entry.name.slice(0, -".hbs".length) : entry.name;
      entries.push({ dest: join(destBase, outName), type: "file" });
    }
  }
  return entries;
}

export function countTemplateFiles(dir: string, components: string[]): number {
  const dirs = [
    join(dir, "root"),
    ...(components.includes("docs") ? [join(dir, "docs")] : []),
    ...(components.includes("scripts") ? [join(dir, "scripts")] : []),
    ...(components.includes("skills") ? [join(dir, "skills")] : []),
    ...(components.includes("hooks") ? [join(dir, "hooks")] : []),
    ...(components.includes("ci") ? [join(dir, "ci")] : []),
    ...(components.includes("contribute") ? [join(dir, "contribute")] : []),
    ...(components.includes("ai-config") ? [join(dir, "ai-config")] : []),
    ...(components.includes("onboarding") ? [join(dir, "onboarding")] : []),
    join(dir, "scratchpad"),
    join(dir, "history"),
  ];
  return dirs.reduce((sum, d) => {
    if (!existsSync(d)) return sum;
    return (
      sum +
      walkDir(d).filter((e) => {
        const basename = e.name.split("/").pop() ?? e.name;
        return !basename.startsWith("_");
      }).length
    );
  }, 0);
}
