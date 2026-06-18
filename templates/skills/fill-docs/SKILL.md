# fill-docs

Complete scaffold-generated documentation by interviewing the user about their
project. Detects placeholder content and fills BUSINESS_LOGIC.md, glossary, and
other template files.

## Steps

### 1. Scan for incomplete files

Search for these markers across the project:

| Marker | File |
|--------|------|
| `<!-- Replace with... -->` | BUSINESS_LOGIC.md |
| `<!-- Define your domain terms... -->` | .agentic-scaffold/docs/context/glossary.md |
| `(populate as you...)` | .agentic-scaffold/docs/context/INDEX.md |
| `Placeholder for...` | .agentic-scaffold/docs/product/README.md, .agentic-scaffold/docs/engineering/README.md |

### 2. Prioritize

1. **.agentic-scaffold/BUSINESS_LOGIC.md** — the project brain, read first by all agents
2. **.agentic-scaffold/docs/context/glossary.md** — ubiquitous language that agents use
3. **.agentic-scaffold/docs/product/README.md** — product spec extensions
4. **.agentic-scaffold/docs/engineering/README.md** — implementation conventions
5. **.agentic-scaffold/docs/context/INDEX.md** — navigation for historical context

### 3. Interview and fill

For each incomplete section:

1. Show the user the current placeholder content
2. Explain the section's purpose in one sentence
3. Ask targeted questions to elicit the content
4. Write the user's answer into the file
5. Confirm the output

### 4. Non-blocking gaps

If the user doesn't know or isn't ready to fill a section, leave a comment:
`<!-- TODO: fill during onboarding -->`

### 5. Report

When done, list:

- Sections completed
- Sections deferred (with reason)
- What the agent should read first next session
