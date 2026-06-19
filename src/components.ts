import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import type { HandlebarsData, ScaffoldConfig } from "./config.js";
import type { WriteOptions } from "./fs-utils.js";
import { copyStaticDir, write } from "./fs-utils.js";
import { TEMPLATES_DIR } from "./paths.js";
import type { DryRunEntry } from "./templates.js";
import { listRenderedFiles, renderDir, renderTemplate } from "./templates.js";

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

const AI_TOOL_TEMPLATES: Record<string, { src: string; dest: string }> = {
  opencode: { src: "opencode.json.hbs", dest: "opencode.json" },
  cursor: { src: ".cursorrules.hbs", dest: ".cursorrules" },
  copilot: { src: ".copilot-instructions.md.hbs", dest: ".copilot-instructions.md" },
};

export const AI_SKILL_COMMAND_TOOLS = ["codex", "claude", "gemini", "deepcode", "grok", "omp"];

// Tools that also emit per-skill slash-command adapters. Cursor is here in
// addition to AI_SKILL_COMMAND_TOOLS because it ALSO writes a `.cursorrules`
// config (so it stays in AI_TOOL_TEMPLATES), but it discovers slash commands
// from `.cursor/commands/*.md` just like the skill-command-only tools.
export const SKILL_COMMAND_TOOLS = [...AI_SKILL_COMMAND_TOOLS, "cursor"];

export const AI_TOOL_ALIASES: Record<string, string> = {
  openai: "codex",
  codex: "codex",
  anthropic: "claude",
  anthrophic: "claude",
  claude: "claude",
  google: "gemini",
  gemini: "gemini",
  deepseek: "deepcode",
  deepcode: "deepcode",
  xai: "grok",
  grok: "grok",
  "oh-my-pi": "omp",
  ohmypi: "omp",
  ompsh: "omp",
  pi: "omp",
  omp: "omp",
};

export const AI_CONFIG_TOOLS = [...Object.keys(AI_TOOL_TEMPLATES), ...AI_SKILL_COMMAND_TOOLS];

export function normalizeAiToolName(tool: string): string {
  return AI_TOOL_ALIASES[tool] ?? tool;
}

interface SkillCommand {
  name: string;
  description: string;
}

function selectedAiTools(config: ScaffoldConfig): string[] {
  const requested = config.aiTools.length > 0 ? config.aiTools : AI_CONFIG_TOOLS;
  return requested.map(normalizeAiToolName).filter((t) => AI_CONFIG_TOOLS.includes(t));
}

function listSkillCommands(): SkillCommand[] {
  const skillsDir = join(TEMPLATES_DIR, "skills");
  return readdirSync(skillsDir, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => ({ name: entry.name, description: readSkillDescription(join(skillsDir, entry.name, "SKILL.md")) }))
    .sort((a, b) => a.name.localeCompare(b.name));
}

function readSkillDescription(path: string): string {
  const raw = readFileSync(path, "utf-8");
  const frontmatter = raw.match(/^---\n([\s\S]*?)\n---/);
  const frontmatterDescription = frontmatter?.[1].match(/^description:\s*(.+)$/m)?.[1];
  if (frontmatterDescription) return frontmatterDescription.replace(/^["']|["']$/g, "").trim();

  const lines = raw.split("\n");
  const firstText = lines.find((line) => line.trim() && !line.startsWith("#"));
  return firstText?.trim() ?? "Run this agentic-scaffold skill.";
}

function yamlString(value: string): string {
  return JSON.stringify(value);
}

function tomlString(value: string): string {
  return JSON.stringify(value);
}

function tomlMultiline(value: string): string {
  return `"""\n${value.replaceAll('"""', '\\"\\"\\"')}\n"""`;
}

function skillMarkdownContent(skill: SkillCommand, extraFrontmatter: string[] = []): string {
  return [
    "---",
    `name: ${yamlString(skill.name)}`,
    `description: ${yamlString(skill.description)}`,
    "argument-hint: [optional context]",
    ...extraFrontmatter,
    "---",
    "",
    `Read and follow \`.agentic-scaffold/.agents/skills/${skill.name}/SKILL.md\`.`,
    "",
    "User context:",
    "",
    "$ARGUMENTS",
    "",
  ].join("\n");
}

function geminiCommandContent(skill: SkillCommand): string {
  const prompt = [
    `Read and follow .agentic-scaffold/.agents/skills/${skill.name}/SKILL.md.`,
    "",
    "User context:",
    "{{args}}",
    "",
  ].join("\n");
  return [`description = ${tomlString(skill.description)}`, "", `prompt = ${tomlMultiline(prompt)}`, ""].join("\n");
}

function cursorCommandContent(skill: SkillCommand): string {
  return [
    `# ${skill.name}`,
    "",
    skill.description,
    "",
    `Read and follow \`.agentic-scaffold/.agents/skills/${skill.name}/SKILL.md\`, then apply it using the context I provide in this chat.`,
    "",
  ].join("\n");
}

// Oh My Pi (omp.sh) discovers native slash commands from `.omp/commands/*.md`:
// frontmatter `description` plus a body the engine expands (`$ARGUMENTS`). This
// is what makes `/<skill>` work directly, distinct from the `.omp/skills/`
// adapter that powers discovery, the system-prompt list, and `/skill:<skill>`.
function ompCommandContent(skill: SkillCommand): string {
  return [
    "---",
    `description: ${yamlString(skill.description)}`,
    "argument-hint: [optional context]",
    "---",
    "",
    `Read and follow \`.agentic-scaffold/.agents/skills/${skill.name}/SKILL.md\`.`,
    "",
    "User context:",
    "",
    "$ARGUMENTS",
    "",
  ].join("\n");
}

function skillCommandFiles(tool: string): { dest: string; content: string }[] {
  if (!SKILL_COMMAND_TOOLS.includes(tool)) return [];
  return listSkillCommands().flatMap((skill) => {
    const markdown = skillMarkdownContent(skill);
    switch (tool) {
      case "codex":
        return [{ dest: join(".agents", "skills", skill.name, "SKILL.md"), content: markdown }];
      case "claude":
        return [{ dest: join(".claude", "skills", skill.name, "SKILL.md"), content: markdown }];
      case "deepcode":
        return [{ dest: join(".deepcode", "skills", skill.name, "SKILL.md"), content: markdown }];
      case "cursor":
        return [{ dest: join(".cursor", "commands", `${skill.name}.md`), content: cursorCommandContent(skill) }];
      case "grok":
        return [
          {
            dest: join(".grok", "skills", skill.name, "SKILL.md"),
            content: skillMarkdownContent(skill, ["user-invocable: true"]),
          },
        ];
      case "omp":
        // Two adapters: the skill (discovery, system-prompt list, `/skill:<skill>`,
        // `skill://`) AND the native slash command for direct `/<skill>` invocation.
        return [
          { dest: join(".omp", "skills", skill.name, "SKILL.md"), content: markdown },
          { dest: join(".omp", "commands", `${skill.name}.md`), content: ompCommandContent(skill) },
        ];
      default:
        return [{ dest: join(".gemini", "commands", `${skill.name}.toml`), content: geminiCommandContent(skill) }];
    }
  });
}

function aiConfigComponent(): RenderFns {
  const baseDir = join(TEMPLATES_DIR, "ai-config");
  return {
    render: async (config, hbData, opts) => {
      const writeOpts = { force: config.force, interactive: config.interactive, ...opts };
      const results: string[] = [];
      for (const tool of selectedAiTools(config)) {
        const template = AI_TOOL_TEMPLATES[tool];
        if (template) {
          const content = renderTemplate(join(baseDir, template.src), hbData);
          results.push(await write(join(config.target, template.dest), content, writeOpts));
        }
        for (const file of skillCommandFiles(tool)) {
          results.push(await write(join(config.target, file.dest), file.content, writeOpts));
        }
      }
      return results;
    },
    dryRun: (config) =>
      selectedAiTools(config).flatMap((tool) => {
        const template = AI_TOOL_TEMPLATES[tool];
        const entries = template ? [{ dest: join(".", template.dest), type: "file" as const }] : [];
        return entries.concat(
          skillCommandFiles(tool).map((file) => ({ dest: join(".", file.dest), type: "file" as const })),
        );
      }),
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
    ...aiConfigComponent(),
  },
  {
    name: "rtk",
    category: "extra",
    destBase: "target",
    conflict: "skip-existing",
    manifested: true,
    ...componentRender("rtk", ".rtk", "target"),
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
