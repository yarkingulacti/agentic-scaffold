#!/usr/bin/env node
import { loadIndex, searchChunks, INDEX_PATH, INDEX_VERSION } from "./memory_common.mjs";

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

  for (const { score, path, heading, content } of results) {
    const preview = content.split(/\s+/).slice(0, 40).join(" ");
    console.log(`${score.toFixed(3)}\t${path}\t${heading}`);
    console.log(`  ${preview}\n`);
  }
}

main();
