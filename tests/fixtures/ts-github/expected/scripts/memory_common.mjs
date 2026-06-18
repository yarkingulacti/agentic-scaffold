#!/usr/bin/env node
import { createHash } from "node:crypto";
import { readFileSync, writeFileSync, mkdirSync, existsSync, readdirSync, statSync } from "node:fs";
import { join, relative, resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
export const ROOT = resolve(__dirname, "..", "..");

export const INDEX_PATH = join(ROOT, ".memory", "index.json");

export const INCLUDE_PATTERNS = [
  ".agentic-scaffold/BUSINESS_LOGIC.md",
  "AGENTS.md",
  "CLAUDE.md",
  ".agentic-scaffold/docs",
  ".agentic-scaffold/.scratchpad",
  ".agentic-scaffold/.history",
];

export function walkDir(dirPath) {
  const files = [];
  if (!existsSync(dirPath)) return files;
  for (const entry of readdirSync(dirPath, { withFileTypes: true })) {
    const full = join(dirPath, entry.name);
    if (entry.isDirectory()) {
      files.push(...walkDir(full));
    } else if (entry.isFile() && entry.name.endsWith(".md")) {
      files.push(full);
    }
  }
  return files;
}

export function findFiles() {
  const files = new Set();
  for (const pattern of INCLUDE_PATTERNS) {
    const fullPath = join(ROOT, pattern);
    if (!existsSync(fullPath)) continue;
    const st = statSync(fullPath);
    if (st.isFile()) {
      if (pattern.endsWith(".md")) files.add(fullPath);
    } else if (st.isDirectory()) {
      for (const f of walkDir(fullPath)) files.add(f);
    }
  }
  return [...files].sort();
}

export function splitMarkdown(filePath, text) {
  const chunks = [];
  let currentHeading = filePath;
  let currentLines = [];
  for (const line of text.split("\n")) {
    if (line.startsWith("#") && currentLines.length > 0) {
      chunks.push({ heading: currentHeading, content: currentLines.join("\n").trim() });
      currentLines = [];
    }
    if (line.startsWith("#")) {
      currentHeading = line.replace(/^#+\s*/, "").trim() || filePath;
    }
    currentLines.push(line);
  }
  if (currentLines.length > 0) {
    chunks.push({ heading: currentHeading, content: currentLines.join("\n").trim() });
  }
  return chunks.filter((c) => c.content.length > 0);
}

const TOKEN_RE = /[a-z0-9_]+/gi;
export function tokenize(text) {
  const tokens = text.toLowerCase().match(TOKEN_RE);
  return tokens ? [...new Set(tokens)] : [];
}

export function contentHash(relPath, chunkIndex, content) {
  const raw = `${relPath}\0${chunkIndex}\0${content}`;
  return createHash("sha256").update(raw).digest("hex");
}

export function loadIndex(indexPath = INDEX_PATH) {
  if (!existsSync(indexPath)) return [];
  try {
    const data = JSON.parse(readFileSync(indexPath, "utf-8"));
    return data.chunks || [];
  } catch {
    return [];
  }
}

export function saveIndex(chunks, indexPath = INDEX_PATH) {
  mkdirSync(dirname(indexPath), { recursive: true });
  writeFileSync(indexPath, JSON.stringify({ version: 1, chunks: chunks }, null, 2));
}

export function rel(filePath) {
  return relative(ROOT, filePath);
}
