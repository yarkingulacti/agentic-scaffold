#!/usr/bin/env node
import yargs from "yargs";
import { hideBin } from "yargs/helpers";
import type { ScaffoldArgs } from "../src/config.js";
import { scaffold } from "../src/scaffold.js";
import { unscaffold } from "../src/unscaffold.js";

function scaffoldBuilder(y: ReturnType<typeof yargs>) {
  return y
    .epilogue(
      "Tiers:\n" +
        "  Zero-config   Run with no flags — auto-detect project, scaffold only\n" +
        "                what's missing. Never overwrites existing files.\n" +
        "  Flag mode     Override auto-detection with --package-manager,\n" +
        "                --ci-provider, --ai-tools, etc. Add --force to overwrite.\n" +
        "  Interactive   Run with -i / --interactive for step-by-step prompts.",
    )
    .example("$0", "Zero-config: auto-detect and scaffold missing files")
    .example("$0 --force", "Force overwrite existing files")
    .example("$0 --ci-provider github", "Override auto-detected CI provider")
    .example("$0 --ai-tools opencode,cursor", "Generate configs for specific AI tools")
    .example("$0 -i", "Interactive mode with prompts")
    .option("interactive", {
      alias: "i",
      type: "boolean",
      description: "Run in interactive mode with prompts",
      default: false,
    })
    .option("target", {
      alias: "t",
      type: "string",
      description: "Target directory (default: current working directory)",
      default: process.cwd(),
    })
    .option("only", {
      type: "string",
      description: "Comma-separated component groups to include: docs,scripts,skills,all",
      default: "all",
    })
    .option("skip-skills", {
      type: "boolean",
      description: "Skip agent skill definitions",
    })
    .option("skip-hooks", {
      type: "boolean",
      description: "Skip agent lifecycle hook templates",
    })
    .option("skip-scripts", {
      type: "boolean",
      description: "Skip memory scripts",
      default: false,
    })
    .option("skip-docs", {
      type: "boolean",
      description: "Skip docs folder",
      default: false,
    })
    .option("project-name", {
      type: "string",
      description: "Project name (used in generated files)",
    })
    .option("issue-tracker", {
      type: "string",
      choices: ["linear", "github", "both"] as const,
      description: "Issue tracker type",
    })
    .option("force", {
      alias: "f",
      type: "boolean",
      description: "Overwrite existing files",
      default: false,
    })
    .option("package-manager", {
      type: "string",
      choices: ["npm", "yarn", "pnpm", "pip", "poetry", "go-mod", "cargo"] as const,
      description: "Package manager (overrides auto-detection)",
    })
    .option("ci-provider", {
      type: "string",
      choices: ["github", "gitlab", "circleci"] as const,
      description: "CI provider (overrides auto-detection)",
    })
    .option("ai-tools", {
      type: "string",
      description: "Comma-separated AI tools to configure: opencode,cursor,copilot",
    })
    .option("script-language", {
      type: "string",
      choices: ["python", "node", "docker"] as const,
      description: "Memory script language (overrides auto-detection)",
    });
}

function unBuilder(y: ReturnType<typeof yargs>) {
  return y
    .option("target", {
      alias: "t",
      type: "string",
      description: "Target directory (default: current working directory)",
      default: process.cwd(),
    })
    .option("force", {
      alias: "f",
      type: "boolean",
      description: "Remove without confirmation",
      default: false,
    });
}

const _argv = yargs(hideBin(process.argv))
  .command(["$0", "scaffold"], "Scaffold agentic configuration into a project", scaffoldBuilder, (argv: ScaffoldArgs) =>
    scaffold(argv),
  )
  .command("un", "Remove scaffolded files from a project", unBuilder, (argv: { target?: string; force?: boolean }) =>
    unscaffold(argv),
  )
  .demandCommand(1, "Use --help to see available commands")
  .help()
  .parse();

_argv;
