#!/usr/bin/env node
import { readFileSync, writeFileSync, mkdirSync, statSync } from "node:fs";
import { join, dirname } from "node:path";
import { loadIndex, searchChunks, INDEX_PATH, INDEX_VERSION, ROOT } from "./memory_common.mjs";

function queryText(raw) {
  const fullPath = join(ROOT, raw);
  try {
    if (statSync(fullPath).isFile()) {
      return readFileSync(fullPath, "utf-8");
    }
  } catch {}
  return raw;
}

function main() {
  const args = process.argv.slice(2);
  let queryOrPath = "";
  let limit = 8;
  let indexPath = INDEX_PATH;
  let outputPath = join(ROOT, ".memory", "context.bundle.md");

  for (let i = 0; i < args.length; i++) {
    if (args[i] === "--index" || args[i] === "--db") {
      indexPath = args[++i];
    } else if (args[i] === "--limit" || args[i] === "-k") {
      limit = parseInt(args[++i], 10) || 8;
    } else if (args[i] === "--output" || args[i] === "-o") {
      outputPath = args[++i];
    } else if (!queryOrPath) {
      queryOrPath = args[i];
    }
  }

  if (!queryOrPath) {
    console.error("Usage: memory_bundle.mjs <query|path> [-k limit] [-o output] [--index path]");
    process.exit(1);
  }

  const query = queryText(queryOrPath);
  const index = loadIndex(indexPath);
  if (!index) {
    console.error(`No index at ${indexPath}. Run memory_index.mjs first.`);
    process.exit(1);
  }
  if (index.stale) {
    console.error(`Index version ${index.version} is outdated (expected ${INDEX_VERSION}). Re-run memory_index.mjs.`);
    process.exit(1);
  }
  const results = searchChunks(index, query, limit);

  mkdirSync(dirname(outputPath), { recursive: true });
  const lines = [`# Context Bundle\n`, `Query: \`${queryOrPath}\`\n`];
  for (const { score, path, heading, content } of results) {
    lines.push(`## ${path} - ${heading}\n`);
    lines.push(`Score: ${score.toFixed(3)}\n`);
    lines.push(`${content.trim()}\n`);
  }
  writeFileSync(outputPath, lines.join("\n"));
  console.log(`wrote ${outputPath}`);
}

main();
