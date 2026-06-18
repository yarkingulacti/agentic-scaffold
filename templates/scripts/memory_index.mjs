#!/usr/bin/env node
import { readFileSync } from "node:fs";
import { contentHash, findFiles, loadIndex, rel, saveIndex, splitMarkdown, tokenize, INDEX_PATH } from "./memory_common.mjs";

function main() {
  const args = process.argv.slice(2);
  let indexPath = INDEX_PATH;
  for (let i = 0; i < args.length; i++) {
    if (args[i] === "--index" || args[i] === "--db") {
      indexPath = args[++i];
    }
  }

  const files = findFiles();
  const newChunks = [];

  for (const filePath of files) {
    const text = readFileSync(filePath, "utf-8");
    const sections = splitMarkdown(filePath, text);
    for (let i = 0; i < sections.length; i++) {
      const { heading, content } = sections[i];
      if (!content) continue;
      const hash = contentHash(rel(filePath), i, content);
      const tokens = tokenize(`${heading}\n${content}`);
      newChunks.push({
        path: rel(filePath),
        heading,
        chunkIndex: i,
        content,
        contentHash: hash,
        tokens,
      });
    }
  }

  saveIndex(newChunks, indexPath);
  console.log(`indexed ${newChunks.length} chunks from ${files.length} markdown files`);
  console.log(`index: ${indexPath}`);
}

main();
