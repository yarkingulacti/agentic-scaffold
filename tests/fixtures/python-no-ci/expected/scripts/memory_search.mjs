#!/usr/bin/env node
import { loadIndex, tokenize, INDEX_PATH } from "./memory_common.mjs";

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

function main() {
  const args = process.argv.slice(2);
  let query = "";
  let limit = 8;
  let indexPath = INDEX_PATH;

  for (let i = 0; i < args.length; i++) {
    if (args[i] === "--index" || args[i] === "--db") {
      indexPath = args[++i];
    } else if (args[i] === "--limit" || args[i] === "-k") {
      limit = parseInt(args[++i], 10) || 8;
    } else if (!query) {
      query = args[i];
    }
  }

  if (!query) {
    console.error("Usage: memory_search.mjs <query> [-k limit] [--index path]");
    process.exit(1);
  }

  const chunks = loadIndex(indexPath);
  const results = search(chunks, query, limit);

  for (const { score, path, heading, content } of results) {
    const preview = content.split(/\s+/).slice(0, 40).join(" ");
    console.log(`${score.toFixed(3)}\t${path}\t${heading}`);
    console.log(`  ${preview}\n`);
  }
}

main();
