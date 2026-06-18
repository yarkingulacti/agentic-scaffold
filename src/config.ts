import { join } from "node:path";
import { detectProjectProfile } from "./detect.js";

export const DEFAULTS = {
  projectDescription: "A project.",
  issueTracker: "linear",
  scriptLanguage: "node",
};

export interface ScaffoldArgs {
  target?: string;
  projectName?: string;
  projectDescription?: string;
  issueTracker?: string;
  packageManager?: string;
  ciProvider?: string;
  aiTools?: string;
  scriptLanguage?: string;
  extras?: string;
  force?: boolean;
  interactive?: boolean;
  dryRun?: boolean;
  json?: boolean;
  only?: string;
  skipDocs?: boolean;
  skipSkills?: boolean;
  skipScripts?: boolean;
  skipHooks?: boolean;
  skipCi?: boolean;
  skipContribute?: boolean;
  skipAiConfig?: boolean;
  skipOnboarding?: boolean;
  skipHistory?: boolean;
  skipScratchpad?: boolean;
}

export interface ScaffoldConfig {
  target: string;
  scaffoldDir: string;
  projectName: string;
  projectDescription: string;
  languages: string[];
  issueTracker: string;
  packageManager: string | null;
  ciProvider: string | null;
  aiTools: string[];
  scriptLanguage: string;
  force: boolean;
  interactive: boolean;
  dryRun: boolean;
  json: boolean;
  include: Set<string>;
}

export interface TrackerDoc {
  name: string;
  description: string;
  trackerDoc: string;
  short: string;
  statusTable: string;
  envFile: string;
  envTemplate: string;
}

export interface HandlebarsData {
  projectName: string;
  projectDescription: string;
  languages: string;
  scriptsDir: string;
  issueTrackerName: string;
  issueTrackerDescription: string;
  issueTrackerShort: string;
  statusTable: string;
  trackerDoc: string;
  envFile: string;
  envTemplate: string;
  packageManager: string | null;
  ciProvider: string | null;
  scriptLanguage: string;
  scaffoldVersion: string;
  incompleteFiles: IncompleteFile[];
  includeScripts: boolean;
  includeHooks: boolean;
}

export interface IncompleteFile {
  file: string;
  sections: string;
}

const ISSUE_TRACKER_DOCS: Record<string, TrackerDoc> = {
  linear: {
    name: "Linear",
    description:
      "Short implementation records live in Linear. Local, detailed planning lives in `.agentic-scaffold/.scratchpad/<feature>/`. See `.agentic-scaffold/docs/agents/issue-tracker.md`.",
    trackerDoc: "Linear",
    short: "Short issue records live in Linear. Local detailed planning lives in `.agentic-scaffold/.scratchpad/`.",
    statusTable: [
      "| Label | Status string | Meaning |",
      "|-------|--------------|---------|",
      "| needs-triage | `needs-triage` | Maintainer needs to evaluate this issue |",
      "| needs-info   | `needs-info`   | Waiting on reporter for more information |",
      "| ready-for-agent | `ready-for-agent` | Fully specified, ready for an AI agent |",
      "| ready-for-human | `ready-for-human` | Requires human implementation |",
      "| wontfix      | `wontfix`      | Will not be actioned |",
    ].join("\n"),
    envFile: ".env.linear\n.env.linear.local",
    envTemplate: "LINEAR_TEAM_KEY=\nLINEAR_PROJECT_ID=",
  },
  github: {
    name: "GitHub Issues",
    description:
      "Short implementation records live in GitHub Issues. Local, detailed planning lives in `.agentic-scaffold/.scratchpad/<feature>/`. See `.agentic-scaffold/docs/agents/issue-tracker.md`.",
    trackerDoc: "GitHub Issues",
    short: "Short issue records live in GitHub Issues. Local detailed planning lives in `.scratchpad/`.",
    statusTable: [
      "| Label | Meaning |",
      "|-------|---------|",
      "| `needs-triage` | Maintainer needs to evaluate this issue |",
      "| `needs-info`   | Waiting on reporter for more information |",
      "| `ready-for-agent` | Fully specified, ready for an AI agent |",
      "| `ready-for-human` | Requires human implementation |",
      "| `wontfix`      | Will not be actioned |",
    ].join("\n"),
    envFile: "",
    envTemplate: "",
  },
};

const EXTRAS_GROUPS = ["ci", "contribute", "ai-config", "onboarding"];

function resolveIncludes(argv: ScaffoldArgs): Set<string> {
  let set = new Set(["docs", "scripts", "skills", "hooks"]);
  if (argv.only && argv.only !== "all") {
    set = new Set(argv.only.split(",").map((s) => s.trim()));
  }
  const extras = argv.extras
    ? argv.extras
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean)
    : [];
  const extrasToAdd = extras.includes("all") ? EXTRAS_GROUPS : extras;
  for (const e of extrasToAdd) {
    if (EXTRAS_GROUPS.includes(e)) set.add(e);
  }
  set.add("history");
  set.add("scratchpad");
  if (argv.skipDocs) set.delete("docs");
  if (argv.skipScripts) set.delete("scripts");
  if (argv.skipSkills) set.delete("skills");
  if (argv.skipHooks) set.delete("hooks");
  if (argv.skipCi) set.delete("ci");
  if (argv.skipContribute) set.delete("contribute");
  if (argv.skipAiConfig) set.delete("ai-config");
  if (argv.skipOnboarding) set.delete("onboarding");
  if (argv.skipHistory) set.delete("history");
  if (argv.skipScratchpad) set.delete("scratchpad");
  return set;
}

const ALL_AI_TOOLS = ["opencode", "cursor", "copilot", "windsurf", "cline"];

function resolveAiTools(value: string): string[] {
  const tools = value
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
  if (tools.includes("all")) return [...ALL_AI_TOOLS];
  return tools;
}

export function resolveConfig(argv: ScaffoldArgs): ScaffoldConfig {
  const target = argv.target || process.cwd();
  const profile = detectProjectProfile(target);

  return {
    target,
    scaffoldDir: join(target, ".agentic-scaffold"),
    projectName: argv.projectName ?? profile.projectName ?? target.split("/").filter(Boolean).pop() ?? "project",
    projectDescription: argv.projectDescription ?? DEFAULTS.projectDescription,
    languages: profile.languages,
    issueTracker: argv.issueTracker ?? profile.issueTracker ?? DEFAULTS.issueTracker,
    packageManager: argv.packageManager ?? profile.packageManager ?? null,
    ciProvider: argv.ciProvider ?? profile.ciProvider ?? null,
    aiTools: argv.aiTools ? resolveAiTools(argv.aiTools) : profile.aiTools,
    scriptLanguage: argv.scriptLanguage ?? profile.scriptLanguage ?? DEFAULTS.scriptLanguage,
    force: argv.force ?? false,
    interactive: argv.interactive ?? false,
    dryRun: argv.dryRun ?? false,
    json: argv.json ?? false,
    include: resolveIncludes(argv),
  };
}

export function buildHandlebars(config: ScaffoldConfig, version: string): HandlebarsData {
  const tracker = ISSUE_TRACKER_DOCS[config.issueTracker] || ISSUE_TRACKER_DOCS.linear;
  return {
    projectName: config.projectName,
    projectDescription: config.projectDescription,
    languages: config.languages.join(", "),
    scriptsDir: ".agentic-scaffold/scripts",
    issueTrackerName: tracker.name,
    issueTrackerDescription: tracker.description,
    issueTrackerShort: tracker.short,
    statusTable: tracker.statusTable,
    trackerDoc: tracker.trackerDoc,
    envFile: tracker.envFile,
    envTemplate: tracker.envTemplate,
    packageManager: config.packageManager,
    ciProvider: config.ciProvider,
    scriptLanguage: config.scriptLanguage,
    scaffoldVersion: version,
    incompleteFiles: buildIncompleteFiles(config),
    includeScripts: config.include.has("scripts"),
    includeHooks: config.include.has("hooks"),
  };
}

export function buildIncompleteFiles(config: ScaffoldConfig): IncompleteFile[] {
  const files: IncompleteFile[] = [
    {
      file: ".agentic-scaffold/BUSINESS_LOGIC.md",
      sections: "Core Domain Concepts, Non-Negotiable Rules, Architecture Decisions",
    },
  ];
  if (config.include.has("docs")) {
    files.push(
      { file: ".agentic-scaffold/docs/context/glossary.md", sections: "domain term definitions" },
      { file: ".agentic-scaffold/docs/product/README.md", sections: "product spec descriptions" },
      { file: ".agentic-scaffold/docs/engineering/README.md", sections: "implementation conventions" },
    );
  }
  return files;
}
