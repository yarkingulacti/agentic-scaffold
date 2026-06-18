#!/usr/bin/env node
import { readFileSync, writeFileSync, mkdirSync, statSync } from "node:fs";
import { join, dirname } from "node:path";
import { loadIndex, tokenize, INDEX_PATH, ROOT } from "./memory_common.mjs";

function scoreTokens(queryTokens, chunkTokens) {
  if (chunkTokens.length === 0) return 0;
  const set = new Set(chunkTokens);
  let matches = 0;
  for (const token of queryTokens) {
    if (set.has(token)) matches++;
  }
  return matches / Math.sqrt(chunkTokens.length);
}

function search(chunks, query, limit) {
  const queryTokens = tokenize(query);
  if (queryTokens.length === 0) return [];

  const scored = chunks
    .map((chunk) => ({
      score: scoreTokens(queryTokens, chunk.tokens),
      path: chunk.path,
      heading: chunk.heading,
      content: chunk.content,
    }))
    .filter((r) => r.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);

  return scored;
}

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
  const chunks = loadIndex(indexPath);
  const results = search(chunks, query, limit);

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
