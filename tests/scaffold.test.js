import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { mkdtempSync, mkdirSync, writeFileSync, readFileSync, rmSync, existsSync } from "node:fs";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { scaffold } from "../src/scaffold.js";

function tempDir() {
  return mkdtempSync(join(tmpdir(), "scaffold-test-"));
}

describe("scaffold", () => {
  it("creates AGENTS.md in the target directory", async () => {
    const dir = tempDir();
    await scaffold({ target: dir, force: true, skipDocs: true, skipScripts: true, skipSkills: true });
    assert.ok(existsSync(join(dir, "AGENTS.md")));
    rmSync(dir, { recursive: true });
  });

  it("creates CLAUDE.md in the target directory", async () => {
    const dir = tempDir();
    await scaffold({ target: dir, force: true, skipDocs: true, skipScripts: true, skipSkills: true });
    assert.ok(existsSync(join(dir, "CLAUDE.md")));
    rmSync(dir, { recursive: true });
  });

  it("creates BUSINESS_LOGIC.md in the target directory", async () => {
    const dir = tempDir();
    await scaffold({ target: dir, force: true, skipDocs: true, skipScripts: true, skipSkills: true });
    assert.ok(existsSync(join(dir, "BUSINESS_LOGIC.md")));
    rmSync(dir, { recursive: true });
  });

  it("creates .gitignore", async () => {
    const dir = tempDir();
    await scaffold({ target: dir, force: true, skipDocs: true, skipScripts: true, skipSkills: true });
    assert.ok(existsSync(join(dir, ".gitignore")));
    rmSync(dir, { recursive: true });
  });

  it("creates .scratchpad/ and .history/ unconditionally", async () => {
    const dir = tempDir();
    await scaffold({ target: dir, force: true, skipDocs: true, skipScripts: true, skipSkills: true });
    assert.ok(existsSync(join(dir, ".scratchpad")));
    assert.ok(existsSync(join(dir, ".history")));
    rmSync(dir, { recursive: true });
  });

  it("includes docs when not skipped", async () => {
    const dir = tempDir();
    await scaffold({ target: dir, force: true, skipScripts: true, skipSkills: true });
    assert.ok(existsSync(join(dir, "docs", "CODING_PRINCIPLES.md")));
    assert.ok(existsSync(join(dir, "docs", "adr", "TEMPLATE.md")));
    rmSync(dir, { recursive: true });
  });

  it("skips docs when --skip-docs is set", async () => {
    const dir = tempDir();
    await scaffold({ target: dir, force: true, skipDocs: true, skipScripts: true, skipSkills: true });
    assert.equal(existsSync(join(dir, "docs", "CODING_PRINCIPLES.md")), false);
    rmSync(dir, { recursive: true });
  });

  it("includes skills when not skipped", async () => {
    const dir = tempDir();
    await scaffold({ target: dir, force: true, skipDocs: true, skipScripts: true });
    assert.ok(existsSync(join(dir, ".agents", "skills", "implement", "SKILL.md")));
    rmSync(dir, { recursive: true });
  });

  it("skips skills when --skip-skills is set", async () => {
    const dir = tempDir();
    await scaffold({ target: dir, force: true, skipDocs: true, skipScripts: true, skipSkills: true });
    assert.equal(existsSync(join(dir, ".agents", "skills")), false);
    rmSync(dir, { recursive: true });
  });

  it("includes scripts when not skipped", async () => {
    const dir = tempDir();
    await scaffold({ target: dir, force: true, skipDocs: true, skipSkills: true });
    assert.ok(existsSync(join(dir, "scripts", "memory_index.py")));
    rmSync(dir, { recursive: true });
  });

  it("skips scripts when --skip-scripts is set", async () => {
    const dir = tempDir();
    await scaffold({ target: dir, force: true, skipDocs: true, skipScripts: true, skipSkills: true });
    assert.equal(existsSync(join(dir, "scripts")), false);
    rmSync(dir, { recursive: true });
  });

  it("skips existing files without --force", async () => {
    const dir = tempDir();
    await scaffold({ target: dir, force: true, skipDocs: true, skipScripts: true, skipSkills: true });
    const before = readFileSync(join(dir, "AGENTS.md"), "utf-8");
    await scaffold({ target: dir, force: false, skipDocs: true, skipScripts: true, skipSkills: true });
    const after = readFileSync(join(dir, "AGENTS.md"), "utf-8");
    assert.equal(before, after);
    rmSync(dir, { recursive: true });
  });

  it("overwrites files with --force", async () => {
    const dir = tempDir();
    await scaffold({ target: dir, force: true, skipDocs: true, skipScripts: true, skipSkills: true });
    writeFileSync(join(dir, "AGENTS.md"), "tampered content", "utf-8");
    await scaffold({ target: dir, force: true, skipDocs: true, skipScripts: true, skipSkills: true });
    const content = readFileSync(join(dir, "AGENTS.md"), "utf-8");
    assert.notEqual(content, "tampered content");
    rmSync(dir, { recursive: true });
  });

  it("renders project name in AGENTS.md", async () => {
    const dir = tempDir();
    await scaffold({ target: dir, force: true, projectName: "my-app", skipDocs: true, skipScripts: true, skipSkills: true });
    const content = readFileSync(join(dir, "AGENTS.md"), "utf-8");
    assert.ok(content.includes("# my-app"));
    rmSync(dir, { recursive: true });
  });

  it("renders packageManager section when set", async () => {
    const dir = tempDir();
    await scaffold({ target: dir, force: true, packageManager: "pnpm", skipDocs: true, skipScripts: true, skipSkills: true });
    const content = readFileSync(join(dir, "AGENTS.md"), "utf-8");
    assert.ok(content.includes("This project uses **pnpm**"));
    rmSync(dir, { recursive: true });
  });

  it("omits packageManager section when not set", async () => {
    const dir = tempDir();
    await scaffold({ target: dir, force: true, skipDocs: true, skipScripts: true, skipSkills: true });
    const content = readFileSync(join(dir, "AGENTS.md"), "utf-8");
    assert.equal(content.includes("Package manager"), false);
    rmSync(dir, { recursive: true });
  });

  it("renders ciProvider section when set", async () => {
    const dir = tempDir();
    await scaffold({ target: dir, force: true, ciProvider: "gitlab", skipDocs: true, skipScripts: true, skipSkills: true });
    const content = readFileSync(join(dir, "AGENTS.md"), "utf-8");
    assert.ok(content.includes("This project uses **gitlab** for CI/CD"));
    rmSync(dir, { recursive: true });
  });

  it("omits ciProvider section when not set", async () => {
    const dir = tempDir();
    await scaffold({ target: dir, force: true, skipDocs: true, skipScripts: true, skipSkills: true });
    const content = readFileSync(join(dir, "AGENTS.md"), "utf-8");
    assert.equal(content.includes("CI/CD"), false);
    rmSync(dir, { recursive: true });
  });

  it("renders scriptLanguage section with default 'python'", async () => {
    const dir = tempDir();
    await scaffold({ target: dir, force: true, skipDocs: true, skipScripts: true, skipSkills: true });
    const content = readFileSync(join(dir, "AGENTS.md"), "utf-8");
    assert.ok(content.includes("Memory and utility scripts use **python**"));
    rmSync(dir, { recursive: true });
  });

  it("renders scriptLanguage section with override", async () => {
    const dir = tempDir();
    await scaffold({ target: dir, force: true, scriptLanguage: "docker", skipDocs: true, skipScripts: true, skipSkills: true });
    const content = readFileSync(join(dir, "AGENTS.md"), "utf-8");
    assert.ok(content.includes("Memory and utility scripts use **docker**"));
    rmSync(dir, { recursive: true });
  });

  it("detects existing project artifacts and renders them", async () => {
    const dir = tempDir();
    writeFileSync(join(dir, "package.json"), JSON.stringify({ name: "test-project" }), "utf-8");
    mkdirSync(join(dir, ".github", "workflows"), { recursive: true });
    writeFileSync(join(dir, "pnpm-lock.yaml"), "", "utf-8");
    await scaffold({ target: dir, force: true, skipDocs: true, skipScripts: true, skipSkills: true });
    const content = readFileSync(join(dir, "AGENTS.md"), "utf-8");
    assert.ok(content.includes("This project uses **pnpm**"));
    assert.ok(content.includes("This project uses **github** for CI/CD"));
    rmSync(dir, { recursive: true });
  });

  it("renders scaffold version in AGENTS.md and CLAUDE.md", async () => {
    const dir = tempDir();
    await scaffold({ target: dir, force: true, skipDocs: true, skipScripts: true, skipSkills: true });
    const agents = readFileSync(join(dir, "AGENTS.md"), "utf-8");
    const claude = readFileSync(join(dir, "CLAUDE.md"), "utf-8");
    assert.ok(agents.includes("@yarkingulacti/agentic-scaffold"));
    assert.ok(agents.match(/v\d+\.\d+\.\d+/));
    assert.ok(claude.includes("@yarkingulacti/agentic-scaffold"));
    rmSync(dir, { recursive: true });
  });

  it("renders only BUSINESS_LOGIC.md in scaffold info when docs are skipped", async () => {
    const dir = tempDir();
    await scaffold({ target: dir, force: true, skipDocs: true, skipScripts: true, skipSkills: true });
    const content = readFileSync(join(dir, "AGENTS.md"), "utf-8");
    assert.ok(content.includes("BUSINESS_LOGIC.md"));
    assert.equal(content.includes("docs/context/glossary.md"), false);
    rmSync(dir, { recursive: true });
  });

  it("renders multiple incomplete files when docs are included", async () => {
    const dir = tempDir();
    await scaffold({ target: dir, force: true, skipScripts: true, skipSkills: true });
    const content = readFileSync(join(dir, "AGENTS.md"), "utf-8");
    assert.ok(content.includes("BUSINESS_LOGIC.md"));
    assert.ok(content.includes("docs/context/glossary.md"));
    assert.ok(content.includes("docs/product/README.md"));
    assert.ok(content.includes("docs/engineering/README.md"));
    rmSync(dir, { recursive: true });
  });

  it("renders fill-docs skill reference when skills are included", async () => {
    const dir = tempDir();
    await scaffold({ target: dir, force: true, skipDocs: true, skipScripts: true, skipSkills: false });
    const content = readFileSync(join(dir, "AGENTS.md"), "utf-8");
    assert.ok(content.includes("fill-docs"));
    assert.ok(content.includes(".agents/skills/fill-docs/SKILL.md"));
    rmSync(dir, { recursive: true });
  });

  it("creates hooks when not skipped", async () => {
    const dir = tempDir();
    await scaffold({ target: dir, force: true, skipDocs: true, skipScripts: true, skipSkills: true });
    assert.ok(existsSync(join(dir, ".agents", "hooks", "pre-feature.md")));
    assert.ok(existsSync(join(dir, ".agents", "hooks", "post-feature.md")));
    assert.ok(existsSync(join(dir, ".agents", "hooks", "post-bugfix.md")));
    assert.ok(existsSync(join(dir, ".agents", "hooks", "post-session.md")));
    assert.ok(existsSync(join(dir, ".agents", "hooks", "scripts", "pre-feature.sh")));
    assert.ok(existsSync(join(dir, ".agents", "hooks", "scripts", "post-feature.sh")));
    assert.ok(existsSync(join(dir, ".agents", "hooks", "scripts", "post-bugfix.sh")));
    assert.ok(existsSync(join(dir, ".agents", "hooks", "scripts", "post-session.sh")));
    rmSync(dir, { recursive: true });
  });

  it("skips hooks when --skip-hooks is set", async () => {
    const dir = tempDir();
    await scaffold({ target: dir, force: true, skipDocs: true, skipScripts: true, skipSkills: true, skipHooks: true });
    assert.equal(existsSync(join(dir, ".agents", "hooks")), false);
    rmSync(dir, { recursive: true });
  });

  it("renders hooks section in AGENTS.md when hooks are included", async () => {
    const dir = tempDir();
    await scaffold({ target: dir, force: true, skipDocs: true, skipScripts: true, skipSkills: true });
    const content = readFileSync(join(dir, "AGENTS.md"), "utf-8");
    assert.ok(content.includes("Agent lifecycle hooks"));
    assert.ok(content.includes(".agents/hooks/post-feature.md"));
    rmSync(dir, { recursive: true });
  });

  it("renders agent hooks reference in implement skill", async () => {
    const dir = tempDir();
    await scaffold({ target: dir, force: true, skipDocs: true, skipScripts: true, skipSkills: false });
    const content = readFileSync(join(dir, ".agents", "skills", "implement", "SKILL.md"), "utf-8");
    assert.ok(content.includes(".agents/hooks/pre-feature.md"));
    assert.ok(content.includes(".agents/hooks/post-feature.md"));
    rmSync(dir, { recursive: true });
  });

  it("renders agent hooks reference in bugfix skill", async () => {
    const dir = tempDir();
    await scaffold({ target: dir, force: true, skipDocs: true, skipScripts: true, skipSkills: false });
    const content = readFileSync(join(dir, ".agents", "skills", "bugfix", "SKILL.md"), "utf-8");
    assert.ok(content.includes(".agents/hooks/post-bugfix.md"));
    rmSync(dir, { recursive: true });
  });

  it("renders packageManager and projectName in hook script templates", async () => {
    const dir = tempDir();
    await scaffold({ target: dir, force: true, projectName: "TestApp", packageManager: "pnpm", skipDocs: true, skipScripts: true, skipSkills: true });
    const content = readFileSync(join(dir, ".agents", "hooks", "scripts", "post-feature.sh"), "utf-8");
    assert.ok(content.includes("TestApp"));
    assert.ok(content.includes("pnpm"));
    rmSync(dir, { recursive: true });
  });
});
