---
name: claude-mem
description: Persistent memory across sessions — capture what happened during a session, compress it into semantic summaries, and surface relevant context at the start of future sessions. Use when the user wants continuity across sessions, asks to remember/recall project context, or wants to set up cross-session memory. Complements (does not replace) the repo's BM25 memory pipeline in scripts/.
---

# Claude-Mem (Cross-Session Memory)

Preserve context across sessions so an agent keeps continuity of knowledge about a
project even after a session ends. The cycle is **capture → compress → inject**.

## Capture

During a session, record durable observations: decisions made and why, files and
modules touched, problems hit and how they were solved, and open threads. Capture
facts and rationale, not a verbatim transcript.

## Compress

Turn raw observations into concise, semantic summaries. Drop noise (exploratory dead
ends, superseded attempts); keep what a future session needs to resume without
re-deriving it. Layer the memory so high-level summaries come first and details are
retrievable on demand (progressive disclosure), keeping token cost visible.

## Inject

At the start of a new session, surface the relevant prior summaries before work
begins, so the agent starts already knowing the project's recent history. Pull
narrowly by topic rather than dumping everything.

## Where it lives in a scaffolded project

This project already ships a memory story; use it rather than duplicating:

- **Durable worklog**: `.agentic-scaffold/.history/DD.MM.YYYY/README.md` — the
  human-readable record of shipped work (see the `handoff`, `summary`, `today`
  skills).
- **Searchable index**: the `scripts/` memory pipeline
  (`memory_index.mjs` / `memory_search.mjs` / `memory_bundle.mjs`) builds a
  zero-dep BM25 index over project Markdown for retrieval.

`claude-mem` (the external tool) automates capture/compress/inject via session hooks.
If you adopt it, point its capture at the `.history/` worklog and let the BM25 index
remain the project-document search layer — the two are complementary, not competing.

## Credit

Adapted from **claude-mem** by Alex Newman / thedotmack
([thedotmack/claude-mem](https://github.com/thedotmack/claude-mem), Apache-2.0): a
persistent memory-compression system that captures tool-usage observations, generates
semantic summaries, and injects them into future sessions. Install it directly
(`npx claude-mem install`) for the full hook-driven implementation.
