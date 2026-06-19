# AI Skill Commands

`agentic-scaffold` generates project-local adapters only for agents with a documented local skill or command discovery mechanism.

| Provider | Agent/tool | `--ai-tools` value | Generated path | Invocation |
|---|---|---|---|---|
| OpenAI | Codex | `codex` or `openai` | `.agents/skills/<skill>/SKILL.md` | `$<skill>` in Codex CLI/IDE; skills may appear in the skills picker |
| Anthropic | Claude Code | `claude` or `anthropic` | `.claude/skills/<skill>/SKILL.md` | `/<skill>` |
| Google | Gemini CLI | `gemini` or `google` | `.gemini/commands/<skill>.toml` | `/<skill>`; run `/commands reload` if Gemini is already open |
| DeepSeek | Deep Code | `deepcode` or `deepseek` | `.deepcode/skills/<skill>/SKILL.md` | `/<skill>` or the skills menu |
| xAI | Grok Build | `grok` or `xai` | `.grok/skills/<skill>/SKILL.md` | `/<skill>` or `/local:<skill>` if names collide |

Example:

```bash
npx @yarkingulacti/agentic-scaffold \
  --extras ai-config \
  --ai-tools openai,anthropic,google,deepseek,grok
```

This installs adapters for every generated skill, including `fill-docs`.

Boundary: model providers are not interchangeable with agent clients. The adapter is generated only when a concrete client has a known project-local discovery path. Tools without a documented local skill/command format should not be advertised as supporting `/fill-docs`.
