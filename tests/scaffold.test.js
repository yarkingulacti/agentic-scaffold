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
});
