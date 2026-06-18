import assert from "node:assert/strict";
import { existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { describe, it } from "node:test";
import type { ScaffoldArgs } from "../src/config.js";
import { resolveConfig } from "../src/config.js";
import { scaffold } from "../src/scaffold.js";

const S = ".agentic-scaffold";

function p(dir: string, ...parts: string[]): string {
  return join(dir, ...parts);
}

function tempDir() {
  return mkdtempSync(join(tmpdir(), "scaffold-test-"));
}

describe("scaffold", () => {
  it("creates AGENTS.md symlink in the target directory", async () => {
    const dir = tempDir();
    await scaffold({ target: dir, force: true, skipDocs: true, skipScripts: true, skipSkills: true, quiet: true });
    assert.ok(existsSync(p(dir, "AGENTS.md")));
    rmSync(dir, { recursive: true });
  });

  it("creates CLAUDE.md symlink in the target directory", async () => {
    const dir = tempDir();
    await scaffold({ target: dir, force: true, skipDocs: true, skipScripts: true, skipSkills: true, quiet: true });
    assert.ok(existsSync(p(dir, "CLAUDE.md")));
    rmSync(dir, { recursive: true });
  });

  it("creates BUSINESS_LOGIC.md in .agentic-scaffold", async () => {
    const dir = tempDir();
    await scaffold({ target: dir, force: true, skipDocs: true, skipScripts: true, skipSkills: true, quiet: true });
    assert.ok(existsSync(p(dir, S, "BUSINESS_LOGIC.md")));
    rmSync(dir, { recursive: true });
  });

  it("creates .gitignore in .agentic-scaffold", async () => {
    const dir = tempDir();
    await scaffold({ target: dir, force: true, skipDocs: true, skipScripts: true, skipSkills: true, quiet: true });
    assert.ok(existsSync(p(dir, S, ".gitignore")));
    rmSync(dir, { recursive: true });
  });

  it("creates .scratchpad/ and .history/ under .agentic-scaffold", async () => {
    const dir = tempDir();
    await scaffold({ target: dir, force: true, skipDocs: true, skipScripts: true, skipSkills: true, quiet: true });
    assert.ok(existsSync(p(dir, S, ".scratchpad")));
    assert.ok(existsSync(p(dir, S, ".history")));
    rmSync(dir, { recursive: true });
  });

  it("includes docs under .agentic-scaffold when not skipped", async () => {
    const dir = tempDir();
    await scaffold({ target: dir, force: true, skipScripts: true, skipSkills: true, quiet: true });
    assert.ok(existsSync(p(dir, S, "docs", "CODING_PRINCIPLES.md")));
    assert.ok(existsSync(p(dir, S, "docs", "adr", "TEMPLATE.md")));
    rmSync(dir, { recursive: true });
  });

  it("skips docs when --skip-docs is set", async () => {
    const dir = tempDir();
    await scaffold({ target: dir, force: true, skipDocs: true, skipScripts: true, skipSkills: true, quiet: true });
    assert.equal(existsSync(p(dir, S, "docs")), false);
    rmSync(dir, { recursive: true });
  });

  it("includes skills under .agentic-scaffold when not skipped", async () => {
    const dir = tempDir();
    await scaffold({ target: dir, force: true, skipDocs: true, skipScripts: true, quiet: true });
    assert.ok(existsSync(p(dir, S, ".agents", "skills", "implement", "SKILL.md")));
    rmSync(dir, { recursive: true });
  });

  it("skips skills when --skip-skills is set", async () => {
    const dir = tempDir();
    await scaffold({ target: dir, force: true, skipDocs: true, skipScripts: true, skipSkills: true, quiet: true });
    assert.equal(existsSync(p(dir, S, ".agents", "skills")), false);
    rmSync(dir, { recursive: true });
  });

  it("includes scripts under .agentic-scaffold when not skipped", async () => {
    const dir = tempDir();
    await scaffold({ target: dir, force: true, skipDocs: true, skipSkills: true, quiet: true });
    assert.ok(existsSync(p(dir, S, "scripts", "memory_index.mjs")));
    rmSync(dir, { recursive: true });
  });

  it("skips scripts when --skip-scripts is set", async () => {
    const dir = tempDir();
    await scaffold({ target: dir, force: true, skipDocs: true, skipScripts: true, skipSkills: true, quiet: true });
    assert.equal(existsSync(p(dir, S, "scripts")), false);
    rmSync(dir, { recursive: true });
  });

  it("skips existing files without --force", async () => {
    const dir = tempDir();
    await scaffold({ target: dir, force: true, skipDocs: true, skipScripts: true, skipSkills: true, quiet: true });
    const before = readFileSync(p(dir, S, "AGENTS.md"), "utf-8");
    await scaffold({ target: dir, force: false, skipDocs: true, skipScripts: true, skipSkills: true, quiet: true });
    const after = readFileSync(p(dir, S, "AGENTS.md"), "utf-8");
    assert.equal(before, after);
    rmSync(dir, { recursive: true });
  });

  it("overwrites files with --force", async () => {
    const dir = tempDir();
    await scaffold({ target: dir, force: true, skipDocs: true, skipScripts: true, skipSkills: true, quiet: true });
    writeFileSync(p(dir, S, "AGENTS.md"), "tampered content", "utf-8");
    await scaffold({ target: dir, force: true, skipDocs: true, skipScripts: true, skipSkills: true, quiet: true });
    const content = readFileSync(p(dir, S, "AGENTS.md"), "utf-8");
    assert.notEqual(content, "tampered content");
    rmSync(dir, { recursive: true });
  });

  it("renders project name in AGENTS.md", async () => {
    const dir = tempDir();
    await scaffold({
      target: dir,
      force: true,
      projectName: "my-app",
      skipDocs: true,
      skipScripts: true,
      skipSkills: true,
      quiet: true,
    });
    const content = readFileSync(p(dir, S, "AGENTS.md"), "utf-8");
    assert.ok(content.includes("# my-app"));
    rmSync(dir, { recursive: true });
  });

  it("renders packageManager section when set", async () => {
    const dir = tempDir();
    await scaffold({
      target: dir,
      force: true,
      packageManager: "pnpm",
      skipDocs: true,
      skipScripts: true,
      skipSkills: true,
      quiet: true,
    });
    const content = readFileSync(p(dir, S, "AGENTS.md"), "utf-8");
    assert.ok(content.includes("This project uses **pnpm**"));
    rmSync(dir, { recursive: true });
  });

  it("omits packageManager section when not set", async () => {
    const dir = tempDir();
    await scaffold({ target: dir, force: true, skipDocs: true, skipScripts: true, skipSkills: true, quiet: true });
    const content = readFileSync(p(dir, S, "AGENTS.md"), "utf-8");
    assert.equal(content.includes("Package manager"), false);
    rmSync(dir, { recursive: true });
  });

  it("renders ciProvider section when set", async () => {
    const dir = tempDir();
    await scaffold({
      target: dir,
      force: true,
      ciProvider: "gitlab",
      skipDocs: true,
      skipScripts: true,
      skipSkills: true,
      quiet: true,
    });
    const content = readFileSync(p(dir, S, "AGENTS.md"), "utf-8");
    assert.ok(content.includes("This project uses **gitlab** for CI/CD"));
    rmSync(dir, { recursive: true });
  });

  it("omits ciProvider section when not set", async () => {
    const dir = tempDir();
    await scaffold({ target: dir, force: true, skipDocs: true, skipScripts: true, skipSkills: true, quiet: true });
    const content = readFileSync(p(dir, S, "AGENTS.md"), "utf-8");
    assert.equal(content.includes("CI/CD"), false);
    rmSync(dir, { recursive: true });
  });

  it("renders scriptLanguage section with default 'node'", async () => {
    const dir = tempDir();
    await scaffold({ target: dir, force: true, skipDocs: true, skipScripts: true, skipSkills: true, quiet: true });
    const content = readFileSync(p(dir, S, "AGENTS.md"), "utf-8");
    assert.ok(content.includes("Memory and utility scripts use **node**"));
    rmSync(dir, { recursive: true });
  });

  it("keeps the default scriptLanguage aligned with generated memory scripts", async () => {
    const dir = tempDir();
    await scaffold({ target: dir, force: true, skipDocs: true, skipSkills: true, quiet: true });
    const content = readFileSync(p(dir, S, "AGENTS.md"), "utf-8");
    assert.ok(content.includes("Memory and utility scripts use **node**"));
    assert.ok(existsSync(p(dir, S, "scripts", "memory_index.mjs")));
    assert.ok(existsSync(p(dir, S, "scripts", "memory_search.mjs")));
    assert.ok(existsSync(p(dir, S, "scripts", "memory_bundle.mjs")));
    rmSync(dir, { recursive: true });
  });

  it("accepts the supported scriptLanguage override", async () => {
    const dir = tempDir();
    await scaffold({
      target: dir,
      force: true,
      scriptLanguage: "node",
      skipDocs: true,
      skipScripts: true,
      skipSkills: true,
      quiet: true,
    });
    const content = readFileSync(p(dir, S, "AGENTS.md"), "utf-8");
    assert.ok(content.includes("Memory and utility scripts use **node**"));
    rmSync(dir, { recursive: true });
  });

  it("detects existing project artifacts and renders them", async () => {
    const dir = tempDir();
    writeFileSync(p(dir, "package.json"), JSON.stringify({ name: "test-project" }), "utf-8");
    mkdirSync(p(dir, ".github", "workflows"), { recursive: true });
    writeFileSync(p(dir, "pnpm-lock.yaml"), "", "utf-8");
    await scaffold({ target: dir, force: true, skipDocs: true, skipScripts: true, skipSkills: true, quiet: true });
    const content = readFileSync(p(dir, S, "AGENTS.md"), "utf-8");
    assert.ok(content.includes("This project uses **pnpm**"));
    assert.ok(content.includes("This project uses **github** for CI/CD"));
    rmSync(dir, { recursive: true });
  });

  it("renders scaffold version in AGENTS.md and CLAUDE.md", async () => {
    const dir = tempDir();
    await scaffold({ target: dir, force: true, skipDocs: true, skipScripts: true, skipSkills: true, quiet: true });
    const agents = readFileSync(p(dir, S, "AGENTS.md"), "utf-8");
    const claude = readFileSync(p(dir, S, "CLAUDE.md"), "utf-8");
    assert.ok(agents.includes("@yarkingulacti/agentic-scaffold"));
    assert.ok(agents.match(/v\d+\.\d+\.\d+/));
    assert.ok(claude.includes("@yarkingulacti/agentic-scaffold"));
    rmSync(dir, { recursive: true });
  });

  it("renders only BUSINESS_LOGIC.md in scaffold info when docs are skipped", async () => {
    const dir = tempDir();
    await scaffold({ target: dir, force: true, skipDocs: true, skipScripts: true, skipSkills: true, quiet: true });
    const content = readFileSync(p(dir, S, "AGENTS.md"), "utf-8");
    assert.ok(content.includes("BUSINESS_LOGIC.md"));
    assert.equal(content.includes(".agentic-scaffold/docs/context/glossary.md"), false);
    rmSync(dir, { recursive: true });
  });

  it("renders multiple incomplete files when docs are included", async () => {
    const dir = tempDir();
    await scaffold({ target: dir, force: true, skipScripts: true, skipSkills: true, quiet: true });
    const content = readFileSync(p(dir, S, "AGENTS.md"), "utf-8");
    assert.ok(content.includes(".agentic-scaffold/BUSINESS_LOGIC.md"));
    assert.ok(content.includes(".agentic-scaffold/docs/context/glossary.md"));
    assert.ok(content.includes(".agentic-scaffold/docs/product/README.md"));
    assert.ok(content.includes(".agentic-scaffold/docs/engineering/README.md"));
    rmSync(dir, { recursive: true });
  });

  it("renders fill-docs skill reference when skills are included", async () => {
    const dir = tempDir();
    await scaffold({ target: dir, force: true, skipDocs: true, skipScripts: true, skipSkills: false, quiet: true });
    const content = readFileSync(p(dir, S, "AGENTS.md"), "utf-8");
    assert.ok(content.includes("fill-docs"));
    assert.ok(content.includes(".agentic-scaffold/.agents/skills/fill-docs/SKILL.md"));
    rmSync(dir, { recursive: true });
  });

  it("creates create-hook skill when skills are included", async () => {
    const dir = tempDir();
    await scaffold({ target: dir, force: true, skipDocs: true, skipScripts: true, quiet: true });
    assert.ok(existsSync(p(dir, S, ".agents", "skills", "create-hook", "SKILL.md")));
    rmSync(dir, { recursive: true });
  });

  it("creates hooks when not skipped", async () => {
    const dir = tempDir();
    await scaffold({ target: dir, force: true, skipDocs: true, skipScripts: true, skipSkills: true, quiet: true });
    assert.ok(existsSync(p(dir, S, ".agents", "hooks", "pre-feature.md")));
    assert.ok(existsSync(p(dir, S, ".agents", "hooks", "post-feature.md")));
    assert.ok(existsSync(p(dir, S, ".agents", "hooks", "post-bugfix.md")));
    assert.ok(existsSync(p(dir, S, ".agents", "hooks", "post-session.md")));
    assert.ok(existsSync(p(dir, S, ".agents", "hooks", "scripts", "pre-feature.sh")));
    assert.ok(existsSync(p(dir, S, ".agents", "hooks", "scripts", "post-feature.sh")));
    assert.ok(existsSync(p(dir, S, ".agents", "hooks", "scripts", "post-bugfix.sh")));
    assert.ok(existsSync(p(dir, S, ".agents", "hooks", "scripts", "post-session.sh")));
    rmSync(dir, { recursive: true });
  });

  it("skips hooks when --skip-hooks is set", async () => {
    const dir = tempDir();
    await scaffold({
      target: dir,
      force: true,
      skipDocs: true,
      skipScripts: true,
      skipSkills: true,
      skipHooks: true,
      quiet: true,
    });
    assert.equal(existsSync(p(dir, S, ".agents", "hooks")), false);
    rmSync(dir, { recursive: true });
  });

  it("renders hooks section in AGENTS.md when hooks are included", async () => {
    const dir = tempDir();
    await scaffold({ target: dir, force: true, skipDocs: true, skipScripts: true, skipSkills: true, quiet: true });
    const content = readFileSync(p(dir, S, "AGENTS.md"), "utf-8");
    assert.ok(content.includes("Agent lifecycle hooks"));
    assert.ok(content.includes(".agentic-scaffold/.agents/hooks/post-feature.md"));
    rmSync(dir, { recursive: true });
  });

  it("renders agent hooks reference in implement skill", async () => {
    const dir = tempDir();
    await scaffold({ target: dir, force: true, skipDocs: true, skipScripts: true, skipSkills: false, quiet: true });
    const content = readFileSync(p(dir, S, ".agents", "skills", "implement", "SKILL.md"), "utf-8");
    assert.ok(content.includes(".agentic-scaffold/.agents/hooks/pre-feature.md"));
    assert.ok(content.includes(".agentic-scaffold/.agents/hooks/post-feature.md"));
    rmSync(dir, { recursive: true });
  });

  it("writes a v2 root-relative manifest for scaffold-owned files", async () => {
    const dir = tempDir();
    await scaffold({
      target: dir,
      force: true,
      extras: "ai-config,ci,rtk",
      ciProvider: "github",
      skipDocs: true,
      skipScripts: true,
      skipSkills: true,
      quiet: true,
    });

    const manifest = JSON.parse(readFileSync(p(dir, S, ".manifest.json"), "utf-8")) as {
      version: number;
      files: Array<{ path: string; type?: string; contentHash?: string; linkTarget?: string }>;
    };
    const paths = new Set(manifest.files.map((entry) => entry.path));

    assert.equal(manifest.version, 2);
    assert.ok(paths.has("opencode.json"));
    assert.ok(paths.has(".github/workflows/ci.yml"));
    assert.ok(paths.has(".github/dependabot.yml"));
    assert.ok(paths.has(".rtk/filters.toml"));
    assert.ok(paths.has("AGENTS.md"));
    assert.ok(paths.has(".agentic-scaffold/AGENTS.md"));
    assert.equal(manifest.files.find((entry) => entry.path === "AGENTS.md")?.type, "symlink");

    rmSync(dir, { recursive: true });
  });

  it("renders agent hooks reference in bugfix skill", async () => {
    const dir = tempDir();
    await scaffold({ target: dir, force: true, skipDocs: true, skipScripts: true, skipSkills: false, quiet: true });
    const content = readFileSync(p(dir, S, ".agents", "skills", "bugfix", "SKILL.md"), "utf-8");
    assert.ok(content.includes(".agentic-scaffold/.agents/hooks/post-bugfix.md"));
    rmSync(dir, { recursive: true });
  });

  it("renders packageManager and projectName in hook script templates", async () => {
    const dir = tempDir();
    await scaffold({
      target: dir,
      force: true,
      projectName: "TestApp",
      packageManager: "pnpm",
      skipDocs: true,
      skipScripts: true,
      skipSkills: true,
      quiet: true,
    });
    const content = readFileSync(p(dir, S, ".agents", "hooks", "scripts", "post-feature.sh"), "utf-8");
    assert.ok(content.includes("TestApp"));
    assert.ok(content.includes("pnpm"));
    rmSync(dir, { recursive: true });
  });

  it("ai-config writes only the tools named in --ai-tools", async () => {
    const dir = tempDir();
    await scaffold({ target: dir, extras: "ai-config", aiTools: "opencode", force: true, quiet: true });
    assert.ok(existsSync(p(dir, "opencode.json")));
    assert.ok(!existsSync(p(dir, ".cursorrules")));
    assert.ok(!existsSync(p(dir, ".copilot-instructions.md")));
    rmSync(dir, { recursive: true });
  });

  it("ai-config writes all renderable tools when --ai-tools is omitted", async () => {
    const dir = tempDir();
    await scaffold({ target: dir, extras: "ai-config", force: true, quiet: true });
    assert.ok(existsSync(p(dir, "opencode.json")));
    assert.ok(existsSync(p(dir, ".cursorrules")));
    assert.ok(existsSync(p(dir, ".copilot-instructions.md")));
    rmSync(dir, { recursive: true });
  });

  it("rejects an unsupported issue tracker", () => {
    const dir = tempDir();
    assert.throws(
      () => resolveConfig({ target: dir, issueTracker: "both" } as ScaffoldArgs),
      /Unsupported issueTracker/,
    );
    rmSync(dir, { recursive: true });
  });

  it("honors the --languages override over detection", () => {
    const dir = tempDir();
    writeFileSync(p(dir, "package.json"), "{}", "utf-8");
    const config = resolveConfig({ target: dir, languages: "cpp, godot, swift" } as ScaffoldArgs);
    assert.deepEqual(config.languages, ["cpp", "godot", "swift"]);
    rmSync(dir, { recursive: true });
  });
});
