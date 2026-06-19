# 12 — Vector / Semantic Memory Search

Status: **Proposed** (not started). Created 2026-06-19.

Inspiration: [vector-ai/vectorai](https://github.com/vector-ai/vectorai). This plan
ports *concepts* from that project; it does **not** add a dependency on it (see
"Why not just use vectorai" below).

## TL;DR

The scaffold already generates a "memory pipeline" (`memory_index`,
`memory_search`, `memory_bundle`) that the plan docs and README call a "local
vector database". It is not one — it is naive lexical keyword overlap. This plan
upgrades it toward what vectorai actually does, in three phases that each ship
independently and each preserve the project's hard constraints (zero runtime
deps, offline, framework-agnostic, Node `.mjs`):

1. **Phase 1 — Hybrid lexical search (BM25).** Pure-JS, zero-dep, offline. The
   single biggest quality win. Ships first.
2. **Phase 2 — Optional semantic embeddings.** Pluggable encoder (local Ollama
   or any OpenAI-compatible endpoint), strictly opt-in, **off by default**.
   Weighted hybrid score = lexical + cosine. Needs one user decision (below).
3. **Phase 3 — Memory analytics / clustering.** Pure-JS k-means + a text report.

## Why not just use vectorai

| Blocker | Detail |
|---|---|
| Deprecated | Its own README: *"VectorAI is depreciated, and no longer maintained… use Relevance AI."* |
| Wrong language | Python library; our generated scripts are Node `.mjs`. |
| Hosted SaaS | Requires a `getvectorai.com` API key and network calls. The scaffold is a file generator that must run anywhere, offline, with no accounts. |
| Heavy | Image2Vec/Audio2Vec, dimensionality-reduction plots, scikit-learn model hub — far outside "index a repo's Markdown". |

So vectorai (and its successor Relevance AI) are **rejected as dependencies**.
We borrow the ideas — similarity search, hybrid search, weighted multi-model
search, clustering, vector analytics — and implement the subset that fits a
zero-dep repo-knowledge indexer.

## Current state (ground truth)

Generated into the target project under `.agentic-scaffold/scripts/` (static
`.mjs`, no `.hbs`, copied verbatim by the `scripts` component):

- `memory_common.mjs` — `findFiles()` over `INCLUDE_PATTERNS` (BUSINESS_LOGIC,
  AGENTS, CLAUDE, docs, .scratchpad, .history); `splitMarkdown()` chunks by
  heading; `tokenize()` returns **deduplicated** tokens (`[...new Set(...)]`);
  `saveIndex`/`loadIndex` read/write `.memory/index.json` shaped
  `{ version: 1, chunks: [{ path, heading, chunkIndex, content, contentHash, tokens }] }`.
- `memory_index.mjs` — builds the index.
- `memory_search.mjs` — `scoreTokens = matches / sqrt(chunkTokens.length)`.
- `memory_bundle.mjs` — same query path, writes a Markdown context bundle.

Problems this plan addresses:

- **Not actually vector/semantic** — pure lexical overlap; misses synonyms and
  paraphrase. The "vector memory" label in docs is misleading.
- **No term frequencies** — `tokenize` dedupes, so TF-IDF/BM25 is impossible
  without an index format change. Repeated terms carry no weight.
- **No IDF** — common words score the same as rare, discriminating ones.
- **Duplicated scorer** — `scoreTokens()` + `search()` are copy-pasted verbatim
  in both `memory_search.mjs` and `memory_bundle.mjs`. Any scoring change must
  touch both; hoist to `memory_common.mjs` first.

## vectorai feature → this project

| vectorai feature | Fit | Plan |
|---|---|---|
| Document-oriented store | ✅ have it | keep `index.json` |
| Vector similarity search | ⚠️ needs embeddings | Phase 2 (opt-in) |
| **Hybrid search** (vector + keyword/filter) | ✅ strong | Phase 1 (lexical BM25) + Phase 2 (fuse) |
| Multi-model **weighted** search | ⚠️ needs embeddings | Phase 2 weighted fusion |
| Vector operations (mean/median) | ⚠️ needs embeddings | Phase 3 (centroids) |
| Aggregation / **clustering** | ✅ | Phase 3 k-means |
| Vector analytics | ◐ partial | Phase 3 text report (no plots) |
| Multimedia vectorisation (Image/Audio2Vec) | ❌ | out of scope — text memory only |
| Dimensionality-reduction plots | ❌ | out of scope — no GUI/plot deps |

## Design constraints (non-negotiable)

- **Zero runtime dependencies** in generated scripts — Node stdlib only
  (`crypto`, `fs`, `path`, `url`). Same as today.
- **Offline by default** — no network, no API key, no account required for the
  default experience. Phase 2 network use is opt-in and degrades to Phase 1.
- **Node-only** (`scriptLanguage` is `node`; scripts are `.mjs`).
- **Backward compatible index** — bump `index.json` `version` 1 → 2; readers
  detect an old/format-mismatched index and instruct a reindex rather than
  crashing.
- **Golden fixtures** — `scripts` is in `RENDERED_COMPONENTS`
  (`tests/templates-golden.test.ts`), so editing any `memory_*.mjs` requires
  regenerating fixtures with `UPDATE_GOLDEN=1 pnpm test`.

## Phase 1 — Hybrid lexical search (BM25), zero-dep

**Goal:** replace naive overlap with BM25 — the "traditional search" half of
vectorai's hybrid pitch — fully offline.

Changes (all in `templates/scripts/`):

- `memory_common.mjs`
  - `tokenize()` → return a **term-frequency map** (or full token list) instead
    of a deduped set. Keep a `terms` count map per chunk.
  - Index v2 chunk shape: `{ path, heading, chunkIndex, content, contentHash,
    termFreq: {term: n}, length: <tokenCount> }`.
  - Index top-level: `{ version: 2, avgdl, df: {term: docCount}, N, chunks }`
    (df/avgdl/N precomputed at index time so search stays O(query·chunks)).
  - New shared `bm25Score(queryTerms, chunk, stats)` and `searchChunks(index,
    query, limit)` — the single source of truth for ranking.
  - `loadIndex()` version guard: if `version !== 2`, return a sentinel so the CLI
    prints "index is stale/old format — run memory_index.mjs" and exits non-zero.
- `memory_index.mjs` — compute `df`, `N`, `avgdl`; write v2.
- `memory_search.mjs` / `memory_bundle.mjs` — delete the duplicated
  `scoreTokens`/`search`; call `searchChunks()` from common.

Acceptance: existing test query ("nebula") still returns the scratchpad chunk;
add tests asserting (a) term-frequency weighting (a chunk repeating the query
term outranks one mentioning it once) and (b) IDF (a rare term outranks a
stopword-like common term). No new deps; `node memory_index.mjs` still offline.

## Phase 2 — Optional semantic embeddings (opt-in, off by default)

**Goal:** real similarity search + vectorai-style weighted multi-model fusion,
without forcing network/keys on anyone.

- **Encoder abstraction** in a new `memory_embed.mjs`: a thin client that POSTs
  chunk text to an OpenAI-compatible `/embeddings` endpoint **or** a local
  Ollama endpoint. Config via env (`MEMORY_EMBED_URL`, `MEMORY_EMBED_MODEL`,
  optional `MEMORY_EMBED_KEY`) or a `.memory/config.json`. If unset → embeddings
  are skipped entirely and everything falls back to Phase 1.
- `memory_index.mjs --embed` — when enabled, attach `vector: number[]` to each
  chunk; store `embedModel`/`dim` in the index header. Without `--embed` the
  index stays Phase-1-only.
- Search fusion: `score = wLex * bm25Norm + wVec * cosine` (defaults e.g.
  0.5/0.5, overridable via flags). This is vectorai's "multi-model weighted
  search" applied to {lexical, semantic}. With no vectors present, `wVec` is
  forced to 0 (pure BM25).
- Cosine + vector math live in `memory_common.mjs` (pure JS).

Acceptance: with embeddings disabled, byte-identical behavior to Phase 1; with a
mock/local endpoint, a paraphrase query (no shared keywords) retrieves the
semantically-matching chunk. Network failure → graceful fallback to BM25, never a
hard crash.

**Decision required before building Phase 2:** Phase 2 is the only part that can
touch the network. Confirm direction:
- (Recommended) Ship it opt-in, off by default, local-Ollama-first — keeps the
  zero-config/offline promise intact while unlocking semantics for those who
  want it.
- Or keep the tool 100% offline-only and stop after Phase 1 + Phase 3.

## Phase 3 — Memory analytics / clustering, zero-dep

**Goal:** vectorai's clustering/aggregation/analytics, as a text report.

- New `memory_analytics.mjs`: pure-JS **k-means** over chunk vectors (Phase-2
  embeddings when present) or over BM25/TF-IDF sparse vectors (Phase-1 fallback).
  Output: cluster count/sizes, representative (centroid-nearest) chunk per
  cluster, and per-cluster top terms. No plots, no deps.
- Optional `--json` for machine consumption (skills like `today`/`status` could
  fold cluster summaries into context bundles later).

Acceptance: deterministic with a fixed seed; on the test corpus produces stable
clusters; runs offline.

## Cross-cutting wiring (per repo conventions)

When each phase ships (not in this doc):

- **No component-registry change** — `scripts` copies the whole dir, so new
  `memory_embed.mjs` / `memory_analytics.mjs` are picked up automatically.
- **Tests** — extend `tests/memory-scripts.test.ts` (it already drives the real
  scripts via `execFileSync`); add ranking-quality and clustering cases.
- **Golden fixtures** — regenerate with `UPDATE_GOLDEN=1 pnpm test` (scripts are
  rendered/copied by the golden suite).
- **Docs currency** — fix the "vector database" wording in README and
  `docs/plans/01-capabilities-overview.md`; document new flags/scripts in the
  AGENTS template (`templates/root`), README, and `docs/wiki/`. Published
  surfaces (README/wiki) require a **tagged release** to go live.
- **Release** — Phase 1/3 are `feat` → minor bumps; follow
  `skill://agentic-scaffold-feature-flow` (branch → `pnpm run release` on branch
  → PR → `--merge` → delete). This plan doc itself is internal (`docs/plans/` is
  not published) and needs no tag.

## Rejected alternatives

- **Depend on vectorai / Relevance AI / any hosted vector DB** — violates
  offline + zero-dep + framework-agnostic; adds accounts/keys/cost. Rejected.
- **Bundle a JS embedding model (e.g. transformers.js + weights)** — pulls a
  large dependency and model download into every scaffolded project. Rejected;
  embeddings stay an opt-in remote/local-endpoint call instead.
- **Keep `tokenize` deduped and bolt cosine onto token sets** — Jaccard-style
  similarity is still lexical; doesn't deliver semantics and blocks BM25.
  Rejected in favor of the v2 index.

## Suggested sequencing

Phase 1 (self-contained, immediate value) → Phase 3 (depends only on vectors
existing; works on TF-IDF fallback) → Phase 2 (gated on the network decision
above). Phases 1 and 3 can land before any decision on Phase 2.
