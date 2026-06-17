# fill-docs Skill Design

A skill that helps the AI Agent (and user) complete scaffold-generated
documentation by interviewing the user and filling in the blanks.

## Motivation

After scaffolding, several files contain placeholder content:

| File | Placeholder markers |
|------|---------------------|
| `BUSINESS_LOGIC.md` | `<!-- Replace with your domain concepts... -->` |
| `docs/context/glossary.md` | `<!-- Define your domain terms here: -->` |
| `docs/context/INDEX.md` | `(populate as you define sections)` |
| `docs/product/README.md` | `Placeholder for concise product specs...` |
| `docs/engineering/README.md` | `Placeholder for implementation conventions...` |
| `docs/adr/TEMPLATE.md` | Template, not real decision |

The `fill-docs` skill automates completion of these files through an
interview loop with the user.

## Skill File

**Location:** `.agents/skills/fill-docs/SKILL.md`

### Skill definition

```
---
name: fill-docs
description: Complete scaffold-generated documentation by interviewing the user
  about their project. Detects placeholder content and fills BUSINESS_LOGIC.md,
  glossary, and other template files.
---
```

### Workflow

#### 1. Scan for incomplete files

Search for these markers across the project:

| Marker | File |
|--------|------|
| `<!-- Replace with... -->` | BUSINESS_LOGIC.md |
| `<!-- Define your domain terms... -->` | docs/context/glossary.md |
| `(populate as you...)` | docs/context/INDEX.md |
| `Placeholder for...` | docs/product/README.md, docs/engineering/README.md |
| Empty ADRs | docs/adr/ (files with only template content) |
| Empty section under heading | Any doc |

#### 2. Prioritize

1. **BUSINESS_LOGIC.md** — the project brain, read first by all agents
2. **docs/context/glossary.md** — ubiquitous language that agents use
3. **docs/context/INDEX.md** — navigation for historical context
4. **docs/product/README.md** — product spec extensions
5. **docs/engineering/README.md** — implementation conventions

#### 3. Interview + fill

For each incomplete section:

1. Show the user the current placeholder content
2. Explain the section's purpose in one sentence
3. Ask targeted questions to elicit the content
4. Write the user's answer into the file
5. Confirm the output

#### 4. Non-blocking gaps

If the user doesn't know or isn't ready to fill a section, leave a comment:
`<!-- TODO: fill during onboarding -->`

#### 5. Report

When done, list:
- Sections completed
- Sections deferred (with reason)
- What the agent should read first next session

## Agent Notification (Post-Scaffold Output)

After scaffolding completes, the CLI prints a notification that tells the user
about the skill:

```
Done. Scaffolded 18 files (3 skipped — already exist).

Documentation files that need completion:
  BUSINESS_LOGIC.md
    → Core Domain Concepts (empty)
    → Non-Negotiable Rules (empty)
    → Architecture Decisions (empty)
  docs/context/glossary.md
    → No terms defined
  docs/product/README.md
    → Placeholder content
  docs/engineering/README.md
    → Placeholder content

Agent skill available to help:
  .agents/skills/fill-docs/SKILL.md
  Invoke it with your AI agent to fill in these files conversationally.
```

## Scaffold Metadata (Informing the AI Agent)

`AGENTS.md` and `CLAUDE.md` gain a new section at the bottom:

```markdown
## Scaffold information

This project was bootstrapped with `@yarkingulacti/agentic-scaffold` v0.2.5.

Some files contain placeholder content that must be completed:
- **BUSINESS_LOGIC.md** — Core Domain Concepts, Non-Negotiable Rules,
  Architecture Decisions
- **docs/context/glossary.md** — domain term definitions
- **docs/product/README.md**, **docs/engineering/README.md** — descriptions

To complete these, invoke the `fill-docs` skill:
`.agents/skills/fill-docs/SKILL.md`
```

Handlebars variables: `scaffoldVersion`, `generatedFiles`, `incompleteFiles`.

## Implementation Plan

| Phase | What | Files |
|-------|------|-------|
| 1 | Create `fill-docs` skill template with full workflow | `templates/skills/fill-docs/SKILL.md` |
| 2 | Add scaffold metadata section to AGENTS.md/CLAUDE.md templates | `templates/root/AGENTS.md.hbs`, `CLAUDE.md.hbs` |
| 3 | Add post-scaffold summary with completion checklist | `src/scaffold.js` |
| 4 | Add `scaffoldVersion` and `incompleteFiles` to Handlebars data | `src/scaffold.js` |
