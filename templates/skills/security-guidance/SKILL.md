---
name: security-guidance
description: Security review of code changes before they ship. Three layers — fast pattern checks for known-dangerous calls, diff review for the common web-vulnerability classes, and cross-file data-flow tracing for multi-file vulnerabilities. Use when reviewing a diff/PR for security, after generating code that touches input handling, auth, deserialization, or external requests, or when the user asks for a security check.
---

# Security Guidance

Review code changes for security issues before they ship. Treat findings as
suggestions to fix, not a substitute for human review, SAST/DAST, dependency
scanning, or pen-testing. Apply three layers.

## Layer 1 — Pattern warnings (fast)

Scan changed lines for known-dangerous patterns and flag each:

- `yaml.load` without `SafeLoader`; `pickle.load` / `torch.load(weights_only=False)`
  on untrusted data; other unsafe deserialization.
- Raw `innerHTML` / `dangerouslySetInnerHTML` with non-constant input (XSS).
- Hardcoded secrets, API keys, tokens, passwords.
- Shell/SQL built by string concatenation with user input (injection).
- `requests.get(user_url)` and friends without an SSRF allowlist.

## Layer 2 — Diff review (vulnerability classes)

Read the diff hunks and surrounding file context and check for the common
web-vulnerability classes: **injection, XSS, SSRF, hardcoded secrets, IDOR, auth
bypass, unsafe deserialization, path traversal**. For each finding give a severity
and a concrete fix. Honor inline justifications: a comment explaining why a line is
safe is a valid exclusion.

## Layer 3 — Cross-file data-flow tracing

For higher-severity or auth/data-access changes, trace data flow across files
(read/grep/glob related code) to catch what pattern matching misses: IDOR (does the
handler check the caller owns the resource?), auth bypass (is every privileged path
gated?), and cross-file SSRF (does user input reach an outbound request through a
helper?).

## Project-specific policy

Honor a project security-policy file when present (e.g.
`.agentic-scaffold/docs/agents/` security notes, or a `claude-security-guidance.md`).
Built-in classes cover common cases; project policy covers what the model can't infer
(which DB replica reads must use, which requests need the SSRF wrapper, which auth
token background jobs may use).

## Report

List findings ordered by severity, each with: location, the vulnerability class, why
it's exploitable, and the specific fix. State clearly that this is best-effort and
can miss issues or produce false positives.

## Credit

Adapted from Anthropic's **security-guidance** plugin in
[anthropics/claude-code](https://github.com/anthropics/claude-code/tree/main/plugins/security-guidance).
The original is an automated Claude Code plugin (pattern hook + LLM diff review +
agentic commit review); this skill captures its review methodology. No warranty —
see the upstream plugin's terms.
