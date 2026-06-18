#!/usr/bin/env node
import { readFileSync } from "node:fs";
import { join } from "node:path";
import Handlebars from "handlebars";
import type { HandlebarsData } from "../src/config.js";
import { walkDir } from "../src/fs-utils.js";
import { renderTemplate } from "../src/templates.js";

const TEMPLATES_DIR = join(import.meta.dirname, "..", "templates");

// Single source of truth for the variables templates may reference. Typed as
// HandlebarsData so the compiler fails if config.ts drops a field. Also reused
// as the render sample for the escape-leak guard, so every field is realistic.
const SAMPLE: HandlebarsData = {
  projectName: "demo",
  projectDescription: "A demo project.",
  languages: "TypeScript, Python",
  scriptsDir: ".agentic-scaffold/scripts",
  issueTrackerName: "Linear",
  issueTrackerDescription: "Local planning lives in `.scratchpad/<feature>/`.",
  issueTrackerShort: "Short records in Linear.",
  statusTable: "| Label | Meaning |\n|-------|---------|",
  trackerDoc: "Linear",
  envFile: ".env.linear",
  envTemplate: "LINEAR_TEAM_KEY=",
  packageManager: "npm",
  ciProvider: "github",
  scriptLanguage: "node",
  scaffoldVersion: "0.0.0-test",
  incompleteFiles: [{ file: "BUSINESS_LOGIC.md", sections: "a, b" }],
  includeScripts: true,
  includeHooks: true,
  includeRtk: true,
};

const ALLOWED_VARS = new Set(Object.keys(SAMPLE));
// Partials registered in src/templates.ts.
const ALLOWED_PARTIALS = new Set(["agentConfigHead", "agentConfigTail"]);

interface TemplateError {
  template: string;
  message: string;
}

// Helpers that rebind the current context for their block body. Bare paths
// inside them resolve against an element/sub-object, not the root data, so we
// stop validating bare paths against the top-level allow-list there.
const CONTEXT_HELPERS = new Set(["each", "with"]);

type HbsNode = {
  type: string;
  path?: { type: string; original?: string; parts?: string[]; data?: boolean; depth?: number };
  params?: HbsNode[];
  hash?: { pairs?: { value: HbsNode }[] };
  program?: { body?: HbsNode[]; blockParams?: string[] };
  inverse?: { body?: HbsNode[]; blockParams?: string[] };
  name?: { type: string; original?: string };
  body?: HbsNode[];
};

function helperName(node: HbsNode): string | undefined {
  return node.path?.parts?.[0];
}

function checkPath(
  node: HbsNode,
  contextIsRoot: boolean,
  blockParams: Set<string>,
  errors: TemplateError[],
  template: string,
): void {
  const path = node.path;
  if (path?.type !== "PathExpression") return;
  if (!contextIsRoot) return;
  if (path.data) return; // @index, @key, @root, ...
  if ((path.depth ?? 0) > 0) return; // ../ paths escape root scope
  const head = path.parts?.[0];
  if (!head || head === "this") return;
  if (blockParams.has(head)) return;
  if (!ALLOWED_VARS.has(head)) {
    errors.push({ template, message: `unknown variable {{${path.original ?? head}}}` });
  }
}

function walk(
  nodes: HbsNode[] | undefined,
  contextIsRoot: boolean,
  blockParams: Set<string>,
  errors: TemplateError[],
  template: string,
): void {
  for (const node of nodes ?? []) {
    switch (node.type) {
      case "MustacheStatement":
      case "SubExpression":
        checkPath(node, contextIsRoot, blockParams, errors, template);
        for (const param of node.params ?? []) checkPath(param, contextIsRoot, blockParams, errors, template);
        break;
      case "BlockStatement": {
        // The block's own arguments evaluate in the current context.
        for (const param of node.params ?? []) checkPath(param, contextIsRoot, blockParams, errors, template);
        const rebinds = CONTEXT_HELPERS.has(helperName(node) ?? "");
        const childRoot = rebinds ? false : contextIsRoot;
        const childParams = new Set(blockParams);
        for (const bp of node.program?.blockParams ?? []) childParams.add(bp);
        for (const bp of node.inverse?.blockParams ?? []) childParams.add(bp);
        walk(node.program?.body, childRoot, childParams, errors, template);
        // The {{else}} branch of #each/#with runs in the parent context.
        walk(node.inverse?.body, contextIsRoot, blockParams, errors, template);
        break;
      }
      case "PartialStatement": {
        const name = node.name?.original;
        if (name && !ALLOWED_PARTIALS.has(name)) {
          errors.push({ template, message: `unknown partial {{> ${name}}}` });
        }
        break;
      }
    }
  }
}

function validateTemplate(full: string, rel: string, errors: TemplateError[]): void {
  const raw = readFileSync(full, "utf-8");
  let ast: { body?: HbsNode[] };
  try {
    ast = Handlebars.parse(raw) as { body?: HbsNode[] };
  } catch (err) {
    errors.push({ template: rel, message: `parse error: ${(err as Error).message}` });
    return;
  }
  walk(ast.body, true, new Set(), errors, rel);
}

function checkRender(full: string, rel: string, errors: TemplateError[]): void {
  let out: string;
  try {
    out = renderTemplate(full, SAMPLE);
  } catch (err) {
    errors.push({ template: rel, message: `render error: ${(err as Error).message}` });
    return;
  }
  if (out.includes("{{")) {
    errors.push({ template: rel, message: "rendered output still contains '{{'" });
  }
  const entity = out.match(/&(lt|gt|amp|quot|#x27|#39);/);
  if (entity) {
    errors.push({ template: rel, message: `rendered output leaks HTML entity "${entity[0]}" (noEscape regression)` });
  }
}

function main(): void {
  const errors: TemplateError[] = [];
  const hbsFiles = walkDir(TEMPLATES_DIR).filter((e) => e.name.endsWith(".hbs"));

  for (const { name, full } of hbsFiles) {
    // AST-check every template, including `_`-prefixed partials.
    validateTemplate(full, name, errors);
    // Render-check only standalone templates; `_` partials are exercised via
    // the templates that include them and are not renderable on their own.
    const basename = name.split("/").pop() ?? name;
    if (!basename.startsWith("_")) checkRender(full, name, errors);
  }

  if (errors.length > 0) {
    console.error("Template validation errors:");
    for (const err of errors) {
      console.error(`  ${err.template}: ${err.message}`);
    }
    console.log(`\n${hbsFiles.length} templates checked, ${errors.length} error(s).`);
    process.exit(1);
  }

  console.log(`${hbsFiles.length} templates validated. All OK.`);
}

main();
