#!/usr/bin/env node
import { createHash } from "node:crypto";
import { readFileSync, writeFileSync, mkdirSync, existsSync, readdirSync, statSync } from "node:fs";
import { join, relative, resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
export const ROOT = resolve(__dirname, "..", "..");

export const INDEX_PATH = join(ROOT, ".memory", "index.json");

export const INDEX_VERSION = 2;

// Okapi BM25 tuning constants (standard defaults).
const BM25_K1 = 1.2;
const BM25_B = 0.75;

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
  return text.toLowerCase().match(TOKEN_RE) || [];
}

export function termFrequencies(tokens) {
  const tf = {};
  for (const token of tokens) tf[token] = (tf[token] || 0) + 1;
  return tf;
}

export function contentHash(relPath, chunkIndex, content) {
  const raw = `${relPath}\0${chunkIndex}\0${content}`;
  return createHash("sha256").update(raw).digest("hex");
}

export function loadIndex(indexPath = INDEX_PATH) {
  if (!existsSync(indexPath)) return null;
  try {
    const data = JSON.parse(readFileSync(indexPath, "utf-8"));
    if (data.version !== INDEX_VERSION) return { stale: true, version: data.version ?? null };
    return data;
  } catch {
    return null;
  }
}

// Precompute corpus statistics (document count N, average chunk length, and
// per-term document frequency) so search stays O(query x chunks) without
// repeated full-corpus passes.
export function buildIndexPayload(chunks) {
  const N = chunks.length;
  const df = {};
  let totalLength = 0;
  for (const chunk of chunks) {
    totalLength += chunk.length;
    for (const term of Object.keys(chunk.termFreq)) {
      df[term] = (df[term] || 0) + 1;
    }
  }
  const avgdl = N > 0 ? totalLength / N : 0;
  return { version: INDEX_VERSION, N, avgdl, df, chunks };
}

export function saveIndex(payload, indexPath = INDEX_PATH) {
  mkdirSync(dirname(indexPath), { recursive: true });
  writeFileSync(indexPath, JSON.stringify(payload, null, 2));
}

function bm25Idf(df, N) {
  return Math.log(1 + (N - df + 0.5) / (df + 0.5));
}

// Okapi BM25 ranking over the precomputed index. Repeated query terms are
// counted once; chunks containing no query term score 0 and are dropped.
export function bm25Score(queryTokens, chunk, stats) {
  const { df, N, avgdl } = stats;
  const tf = chunk.termFreq;
  let score = 0;
  const seen = new Set();
  for (const term of queryTokens) {
    if (seen.has(term)) continue;
    seen.add(term);
    const f = tf[term];
    if (!f) continue;
    const idf = bm25Idf(df[term] || 0, N);
    const denom = f + BM25_K1 * (1 - BM25_B + (BM25_B * chunk.length) / (avgdl || 1));
    score += (idf * (f * (BM25_K1 + 1))) / denom;
  }
  return score;
}

export function searchChunks(index, query, limit) {
  const queryTokens = tokenize(query);
  if (queryTokens.length === 0) return [];
  const stats = { df: index.df || {}, N: index.N ?? index.chunks.length, avgdl: index.avgdl || 0 };
  return index.chunks
    .map((chunk) => ({
      score: bm25Score(queryTokens, chunk, stats),
      path: chunk.path,
      heading: chunk.heading,
      content: chunk.content,
    }))
    .filter((r) => r.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);
}

export function rel(filePath) {
  return relative(ROOT, filePath);
}
