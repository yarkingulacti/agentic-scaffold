import { join } from "node:path";
import type { HandlebarsData, ScaffoldConfig } from "./config.js";
import type { WriteOptions } from "./fs-utils.js";
import { copyStaticDir } from "./fs-utils.js";
import { TEMPLATES_DIR } from "./paths.js";
import type { DryRunEntry } from "./templates.js";
import { listRenderedFiles, renderDir } from "./templates.js";

export type ComponentCategory = "core" | "extra" | "working-dir";
export type DestBase = "scaffold" | "target";
// Current behavior is uniform: existing files are skipped unless --force. The
// field makes that policy explicit per-component and leaves room to extend it.
export type ConflictPolicy = "skip-existing";

export interface ComponentSpec {
  name: string;
  category: ComponentCategory;
  destBase: DestBase;
  conflict: ConflictPolicy;
  // Whether files written by this component are tracked in the manifest and
  // therefore removed by `unscaffold`. Every component is manifested today.
  manifested: boolean;
  render: (config: ScaffoldConfig, hbData: HandlebarsData, opts: WriteOptions) => Promise<string[]>;
  dryRun: (config: ScaffoldConfig) => DryRunEntry[];
}

type RenderFns = Pick<ComponentSpec, "render" | "dryRun">;

function componentRender(srcSubdir: string, destRel: string, destBase: DestBase, staticOnly = false): RenderFns {
  const src = join(TEMPLATES_DIR, srcSubdir);
  const relBase = destBase === "target" ? "." : ".agentic-scaffold";
  const relDest = destRel ? join(relBase, destRel) : relBase;
  return {
    render: async (config, hbData, opts) => {
      const base = destBase === "target" ? config.target : config.scaffoldDir;
      const dest = destRel ? join(base, destRel) : base;
      const writeOpts = { force: config.force, interactive: config.interactive, ...opts };
      if (staticOnly) return copyStaticDir(src, dest, writeOpts);
      return renderDir(src, dest, hbData, writeOpts);
    },
    dryRun: () => listRenderedFiles(src, relDest),
  };
}

function ciComponent(): RenderFns {
  const CI_PROVIDER_MAP: Record<string, { src: string; dest: string }> = {
    github: { src: "github", dest: ".github" },
    gitlab: { src: "gitlab", dest: "." },
    circleci: { src: "circleci", dest: ".circleci" },
  };
  return {
    render: async (config, hbData, opts) => {
      if (!config.ciProvider) return [];
      const provider = CI_PROVIDER_MAP[config.ciProvider];
      if (!provider) return [];
      const src = join(TEMPLATES_DIR, "ci", provider.src);
      const dest = join(config.target, provider.dest);
      return renderDir(src, dest, hbData, { force: config.force, interactive: config.interactive, ...opts });
    },
    dryRun: (config) => {
      if (!config.ciProvider) return [];
      const provider = CI_PROVIDER_MAP[config.ciProvider];
      if (!provider) return [];
      return listRenderedFiles(join(TEMPLATES_DIR, "ci", provider.src), provider.dest);
    },
  };
}

export const COMPONENTS: ComponentSpec[] = [
  {
    name: "root",
    category: "core",
    destBase: "scaffold",
    conflict: "skip-existing",
    manifested: true,
    ...componentRender("root", "", "scaffold"),
  },
  {
    name: "docs",
    category: "core",
    destBase: "scaffold",
    conflict: "skip-existing",
    manifested: true,
    ...componentRender("docs", "docs", "scaffold"),
  },
  {
    name: "scripts",
    category: "core",
    destBase: "scaffold",
    conflict: "skip-existing",
    manifested: true,
    ...componentRender("scripts", "scripts", "scaffold"),
  },
  {
    name: "skills",
    category: "core",
    destBase: "scaffold",
    conflict: "skip-existing",
    manifested: true,
    ...componentRender("skills", ".agents/skills", "scaffold", true),
  },
  {
    name: "hooks",
    category: "core",
    destBase: "scaffold",
    conflict: "skip-existing",
    manifested: true,
    ...componentRender("hooks", ".agents/hooks", "scaffold"),
  },
  { name: "ci", category: "extra", destBase: "target", conflict: "skip-existing", manifested: true, ...ciComponent() },
  {
    name: "contribute",
    category: "extra",
    destBase: "scaffold",
    conflict: "skip-existing",
    manifested: true,
    ...componentRender("contribute", "contribute", "scaffold"),
  },
  {
    name: "ai-config",
    category: "extra",
    destBase: "target",
    conflict: "skip-existing",
    manifested: true,
    ...componentRender("ai-config", "", "target"),
  },
  {
    name: "onboarding",
    category: "extra",
    destBase: "scaffold",
    conflict: "skip-existing",
    manifested: true,
    ...componentRender("onboarding", "onboarding", "scaffold"),
  },
  {
    name: "history",
    category: "working-dir",
    destBase: "scaffold",
    conflict: "skip-existing",
    manifested: true,
    ...componentRender("history", ".history", "scaffold", true),
  },
  {
    name: "scratchpad",
    category: "working-dir",
    destBase: "scaffold",
    conflict: "skip-existing",
    manifested: true,
    ...componentRender("scratchpad", ".scratchpad", "scaffold", true),
  },
];

export const ALWAYS_INCLUDED = "root";

export function componentNamesByCategory(category: ComponentCategory): string[] {
  return COMPONENTS.filter((c) => c.category === category && c.name !== ALWAYS_INCLUDED).map((c) => c.name);
}
