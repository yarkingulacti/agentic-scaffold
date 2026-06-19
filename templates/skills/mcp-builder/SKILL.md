---
name: mcp-builder
description: Guide for creating high-quality MCP (Model Context Protocol) servers that let LLMs interact with external services through well-designed tools, in TypeScript (MCP SDK) or Python (FastMCP). Use when building or reviewing an MCP server, wrapping an API as agent tools, or designing tool schemas.
---

# MCP Server Development Guide

Create MCP (Model Context Protocol) servers that enable LLMs to interact with
external services through well-designed tools. Quality is measured by how well the
server enables an LLM to accomplish real-world tasks.

## Phase 1 — Research and plan

- **Coverage vs workflow tools.** Balance comprehensive API-endpoint coverage with
  specialized workflow tools. When uncertain, prioritize comprehensive coverage so
  agents can compose operations.
- **Naming and discoverability.** Use clear, action-oriented names with consistent
  prefixes (`github_create_issue`, `github_list_repos`).
- **Context management.** Concise tool descriptions; return focused data; support
  filtering and pagination.
- **Actionable errors.** Error messages guide the agent toward a fix with specific
  next steps.
- **Read the spec.** Start at `https://modelcontextprotocol.io/sitemap.xml`, fetch
  pages with a `.md` suffix. Review architecture, transports (streamable HTTP, stdio),
  and tool/resource/prompt definitions. Recommended stack: TypeScript SDK; streamable
  HTTP (stateless JSON) for remote servers, stdio for local.

## Phase 2 — Implement

1. **Project structure** per the chosen SDK (package.json/tsconfig or module layout).
2. **Core infrastructure**: authenticated API client, error helpers, response
   formatting (JSON/Markdown), pagination.
3. **Tools** — for each:
   - Input schema with Zod (TS) or Pydantic (Python): constraints, clear
     descriptions, examples in field descriptions.
   - Define `outputSchema` and return `structuredContent` where the SDK supports it.
   - Async I/O, actionable error handling, pagination where applicable.
   - Annotations: `readOnlyHint`, `destructiveHint`, `idempotentHint`, `openWorldHint`.

## Phase 3 — Review and test

- Code quality: DRY, consistent error handling, full type coverage, clear
  descriptions.
- Build/verify: `npm run build` (TS) or `python -m py_compile` (Python); exercise
  with the MCP Inspector (`npx @modelcontextprotocol/inspector`).

## Phase 4 — Evaluate

Write ~10 evaluation questions that test whether an LLM can use the server to answer
realistic, complex tasks. Each question must be **independent, read-only, complex
(multiple tool calls), realistic, verifiable (single checkable answer), and stable**.
Solve each yourself to verify. Store as XML:

```xml
<evaluation>
  <qa_pair>
    <question>...requires multiple tool calls and exploration...</question>
    <answer>3</answer>
  </qa_pair>
</evaluation>
```

## Credit

Adapted from the **mcp-builder** skill in Anthropic's
[anthropics/skills](https://github.com/anthropics/skills/tree/main/skills/mcp-builder)
collection. The original ships reference guides (`mcp_best_practices.md`,
`node_mcp_server.md`, `python_mcp_server.md`, `evaluation.md`) — consult that
repository for the full library and its license.
