#!/usr/bin/env node
import yargs from "yargs";
import { hideBin } from "yargs/helpers";
import { scaffold } from "../src/scaffold.js";

const argv = yargs(hideBin(process.argv))
  .usage("$0 [options]")
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
  .help()
  .parse();

await scaffold(argv);
