#!/usr/bin/env node
import yargs from "yargs";
import { hideBin } from "yargs/helpers";
import { scaffold } from "../src/scaffold.js";

const argv = yargs(hideBin(process.argv))
  .usage("$0 [options]")
  .epilogue(
    "Tiers:\n" +
    "  Zero-config   Run with no flags \u2014 auto-detect project, scaffold only\n" +
    "                what\u2019s missing. Never overwrites existing files.\n" +
    "  Flag mode     Override auto-detection with --package-manager,\n" +
    "                --ci-provider, --ai-tools, etc. Add --force to overwrite.\n" +
    "  Interactive   Run with -i / --interactive for step-by-step prompts."
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
    description: "Skip skill files",
    default: false,
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
    choices: ["linear", "github", "both"],
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
    choices: ["npm", "yarn", "pnpm", "pip", "poetry", "go-mod", "cargo"],
    description: "Package manager (overrides auto-detection)",
  })
  .option("ci-provider", {
    type: "string",
    choices: ["github", "gitlab", "circleci"],
    description: "CI provider (overrides auto-detection)",
  })
  .option("ai-tools", {
    type: "string",
    description: "Comma-separated AI tools to configure: opencode,cursor,copilot",
  })
  .option("script-language", {
    type: "string",
    choices: ["python", "node", "docker"],
    description: "Memory script language (overrides auto-detection)",
  })
  .help()
  .parse();

await scaffold(argv);
