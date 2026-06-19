# AI Skill Commands

`agentic-scaffold` generates project-local adapters only for agents with a documented local skill or command discovery mechanism.

| Provider | Agent/tool | `--ai-tools` value | Generated path | Invocation |
|---|---|---|---|---|
| OpenAI | Codex | `codex` or `openai` | `.agents/skills/<skill>/SKILL.md` | `$<skill>` in Codex CLI/IDE; skills may appear in the skills picker |
| Anysphere | Cursor | `cursor` | `.cursor/commands/<skill>.md` | `/<skill>`; Cursor also gets a `.cursorrules` config |
| Anthropic | Claude Code | `claude` or `anthropic` | `.claude/skills/<skill>/SKILL.md` | `/<skill>` |
| Google | Gemini CLI | `gemini` or `google` | `.gemini/commands/<skill>.toml` | `/<skill>`; run `/commands reload` if Gemini is already open |
| DeepSeek | Deep Code | `deepcode` or `deepseek` | `.deepcode/skills/<skill>/SKILL.md` | `/<skill>` or the skills menu |
| xAI | Grok Build | `grok` or `xai` | `.grok/skills/<skill>/SKILL.md` | `/<skill>` or `/local:<skill>` if names collide |
| Oh My Pi | omp.sh CLI | `omp` (aliases: `oh-my-pi`, `ompsh`, `pi`) | `.omp/skills/<skill>/SKILL.md` + `.omp/commands/<skill>.md` | `/<skill>` (native slash command); also `/skill:<skill>`, `skill://<skill>`, and the model-readable skills list |

## Example: install commands for every supported client

```bash
npx @yarkingulacti/agentic-scaffold \
  --extras ai-config \
  --ai-tools cursor,openai,anthropic,google,deepseek,grok,omp
```

This installs adapters for every generated skill, including `fill-docs`.

Oh My Pi (`omp`) is the only target that emits **two** adapters per skill: a
`.omp/skills/<skill>/SKILL.md` so the skill is discovered (model-readable list,
`skill://<skill>`, `/skill:<skill>`), and a `.omp/commands/<skill>.md` native
slash command so `/<skill>` works directly. Both reference the canonical
`.agentic-scaffold/.agents/skills/<skill>/SKILL.md` body.
For practical workflows that combine those commands with scaffold files, see
the comprehensive 24-playbook **[Real-life Use Cases](Use-Cases)** guide and the
skill-to-scenario map in **[AI Skills](AI-Skills#skill-examples-by-use-case)**.

Boundary: model providers are not interchangeable with agent clients. The adapter is generated only when a concrete client has a known project-local discovery path. Tools without a documented local skill/command format should not be advertised as supporting `/fill-docs`.
