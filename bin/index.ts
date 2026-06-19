#!/usr/bin/env node
import yargs from "yargs";
import { hideBin } from "yargs/helpers";
import type { ScaffoldArgs } from "../src/config.js";
import { scaffold } from "../src/scaffold.js";
import { unscaffold } from "../src/unscaffold.js";
import { update } from "../src/update.js";

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
    .example("$0 --extras ci,onboarding,rtk", "Scaffold CI, onboarding, and RTK token filters")
    .example("$0 --ai-tools all", "Generate configs for all known AI tools")
    .example("$0 --ai-tools openai,anthropic,google,deepseek,grok", "Generate mainstream provider skill adapters")
    .example("$0 -i", "Interactive mode with prompts")
    .example("$0 -n", "Dry-run: preview files without writing")
    .example("$0 --json", "Output results as JSON")
    .option("json", {
      type: "boolean",
      description: "Output results as JSON to stdout, progress to stderr",
      default: false,
    })
    .option("dry-run", {
      alias: "n",
      type: "boolean",
      description: "Preview files that would be created without writing anything",
      default: false,
    })
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
      description: "Comma-separated core groups to include: docs,scripts,skills,hooks,all",
      default: "all",
    })
    .option("extras", {
      type: "string",
      description: "Comma-separated extras groups: ci,contribute,ai-config,onboarding,rtk,all",
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
    .option("skip-ci", {
      type: "boolean",
      description: "Skip CI/CD configuration templates",
    })
    .option("skip-contribute", {
      type: "boolean",
      description: "Skip contribution guide templates",
    })
    .option("skip-ai-config", {
      type: "boolean",
      description: "Skip AI tool configuration templates",
    })
    .option("skip-onboarding", {
      type: "boolean",
      description: "Skip onboarding guide templates",
    })
    .option("skip-rtk", {
      type: "boolean",
      description: "Skip RTK token-cost filter templates",
    })
    .option("skip-history", {
      type: "boolean",
      description: "Skip .history directory",
    })
    .option("skip-scratchpad", {
      type: "boolean",
      description: "Skip .scratchpad directory",
    })
    .option("project-name", {
      type: "string",
      description: "Project name (used in generated files)",
    })
    .option("issue-tracker", {
      type: "string",
      choices: ["linear", "github"] as const,
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
      description:
        "Comma-separated AI tools/providers to configure: opencode,cursor,copilot,codex/openai,claude/anthropic,gemini/google,deepcode/deepseek,grok/xai,omp",
    })
    .option("languages", {
      type: "string",
      description: "Comma-separated languages (overrides auto-detection): ts,cpp,godot,swift,kotlin,dart",
    })
    .option("script-language", {
      type: "string",
      choices: ["node"] as const,
      description: "Memory script runtime. Only node is supported because the shipped scripts are .mjs files.",
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

function updateBuilder(y: ReturnType<typeof yargs>) {
  return y
    .option("target", {
      alias: "t",
      type: "string",
      description: "Target directory (default: current working directory)",
      default: process.cwd(),
    })
    .option("dry-run", {
      alias: "n",
      type: "boolean",
      description: "Preview update without writing files",
      default: false,
    })
    .option("json", {
      type: "boolean",
      description: "Output update result as JSON",
      default: false,
    })
    .option("quiet", {
      alias: "q",
      type: "boolean",
      description: "Suppress human-readable output",
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
  .command({
    command: "update",
    describe: "Update an existing scaffold without clobbering user edits",
    builder: updateBuilder,
    handler: async (argv) => {
      await update(argv as ScaffoldArgs);
    },
  })
  .demandCommand(1, "Use --help to see available commands")
  .help()
  .parse();

_argv;
