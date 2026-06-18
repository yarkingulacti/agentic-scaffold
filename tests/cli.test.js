import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { execSync } from "node:child_process";
import { mkdtempSync, rmSync, mkdirSync, writeFileSync, readFileSync, existsSync } from "node:fs";
import { join } from "node:path";
import { tmpdir } from "node:os";

const CLI = "node " + join(import.meta.dirname, "..", "bin", "index.js");

function tempDir() {
  return mkdtempSync(join(tmpdir(), "cli-test-"));
}

function run(args = "") {
  return execSync(`${CLI} ${args}`, { encoding: "utf-8" });
}

describe("CLI", () => {
  describe("--help", () => {
    it("runs without error", () => {
      run("--help"); // throws on non-zero exit
    });

    it("contains tier descriptions", () => {
      const out = run("--help");
      assert.ok(out.includes("Zero-config"));
      assert.ok(out.includes("Flag mode"));
      assert.ok(out.includes("Interactive"));
    });

    it("contains usage examples", () => {
      const out = run("--help");
      assert.ok(out.includes("Zero-config: auto-detect"));
      assert.ok(out.includes("--force"));
      assert.ok(out.includes("--ci-provider github"));
      assert.ok(out.includes("--ai-tools opencode,cursor"));
      assert.ok(out.includes("-i"));
    });

    it("lists all flags", () => {
      const out = run("--help");
      assert.ok(out.includes("--force"));
      assert.ok(out.includes("--package-manager"));
      assert.ok(out.includes("--ci-provider"));
      assert.ok(out.includes("--ai-tools"));
      assert.ok(out.includes("--script-language"));
      assert.ok(out.includes("--project-name"));
      assert.ok(out.includes("--issue-tracker"));
      assert.ok(out.includes("--target"));
      assert.ok(out.includes("--interactive"));
      assert.ok(out.includes("--skip-skills"));
      assert.ok(out.includes("--skip-scripts"));
      assert.ok(out.includes("--skip-docs"));
      assert.ok(out.includes("--skip-hooks"));
    });

    it("shows force short flag -f", () => {
      const out = run("--help");
      assert.ok(out.includes("-f"));
    });
  });

  describe("scaffolding", () => {
    it("creates files with default args", () => {
      const dir = tempDir();
      run(`--target ${dir} --force --skip-skills --skip-scripts`);
      assert.ok(existsSync(join(dir, "AGENTS.md")));
      assert.ok(existsSync(join(dir, "BUSINESS_LOGIC.md")));
      assert.ok(existsSync(join(dir, ".gitignore")));
      rmSync(dir, { recursive: true });
    });

    it("prints summary with file counts", () => {
      const dir = tempDir();
      const out = run(`--target ${dir} --force --skip-skills --skip-scripts`);
      assert.ok(out.includes("files scaffolded"));
      rmSync(dir, { recursive: true });
    });

    it("skips existing files on second run", () => {
      const dir = tempDir();
      run(`--target ${dir} --force --skip-skills --skip-scripts`);
      const out = run(`--target ${dir} --skip-skills --skip-scripts`);
      assert.ok(out.includes("skipped"));
      rmSync(dir, { recursive: true });
    });

    it("overwrites with --force on second run", () => {
      const dir = tempDir();
      run(`--target ${dir} --force --skip-skills --skip-scripts`);
      writeFileSync(join(dir, "AGENTS.md"), "tampered", "utf-8");
      run(`--target ${dir} --force --skip-skills --skip-scripts`);
      const content = readFileSync(join(dir, "AGENTS.md"), "utf-8");
      assert.notEqual(content, "tampered");
      rmSync(dir, { recursive: true });
    });

    it("respects --skip-skills", () => {
      const dir = tempDir();
      run(`--target ${dir} --force --skip-skills --skip-hooks --skip-scripts`);
      assert.equal(existsSync(join(dir, ".agents")), false);
      rmSync(dir, { recursive: true });
    });

    it("respects --skip-docs", () => {
      const dir = tempDir();
      run(`--target ${dir} --force --skip-docs --skip-skills --skip-scripts`);
      assert.equal(existsSync(join(dir, "docs")), false);
      rmSync(dir, { recursive: true });
    });

    it("creates hooks by default", () => {
      const dir = tempDir();
      run(`--target ${dir} --force --skip-docs --skip-skills --skip-scripts`);
      assert.ok(existsSync(join(dir, ".agents", "hooks", "post-feature.md")));
      rmSync(dir, { recursive: true });
    });

    it("respects --skip-hooks", () => {
      const dir = tempDir();
      run(`--target ${dir} --force --skip-hooks --skip-docs --skip-skills --skip-scripts`);
      assert.equal(existsSync(join(dir, ".agents", "hooks")), false);
      rmSync(dir, { recursive: true });
    });

    it("accepts --project-name", () => {
      const dir = tempDir();
      run(`--target ${dir} --force --project-name MyProject --skip-skills --skip-scripts`);
      const content = readFileSync(join(dir, "AGENTS.md"), "utf-8");
      assert.ok(content.includes("# MyProject"));
      rmSync(dir, { recursive: true });
    });

    it("accepts --package-manager override", () => {
      const dir = tempDir();
      run(`--target ${dir} --force --package-manager pnpm --skip-skills --skip-scripts`);
      const content = readFileSync(join(dir, "AGENTS.md"), "utf-8");
      assert.ok(content.includes("**pnpm**"));
      rmSync(dir, { recursive: true });
    });

    it("accepts --ci-provider override", () => {
      const dir = tempDir();
      run(`--target ${dir} --force --ci-provider gitlab --skip-skills --skip-scripts`);
      const content = readFileSync(join(dir, "AGENTS.md"), "utf-8");
      assert.ok(content.includes("**gitlab**"));
      rmSync(dir, { recursive: true });
    });

    it("accepts --script-language override", () => {
      const dir = tempDir();
      run(`--target ${dir} --force --script-language docker --skip-skills --skip-scripts`);
      const content = readFileSync(join(dir, "AGENTS.md"), "utf-8");
      assert.ok(content.includes("**docker**"));
      rmSync(dir, { recursive: true });
    });

    it("auto-detects from project files", () => {
      const dir = tempDir();
      writeFileSync(join(dir, "package.json"), JSON.stringify({ name: "test" }), "utf-8");
      mkdirSync(join(dir, ".github", "workflows"), { recursive: true });
      writeFileSync(join(dir, "pnpm-lock.yaml"), "", "utf-8");
      run(`--target ${dir} --force --skip-skills --skip-scripts`);
      const content = readFileSync(join(dir, "AGENTS.md"), "utf-8");
      assert.ok(content.includes("**pnpm**"));
      assert.ok(content.includes("**github**"));
      rmSync(dir, { recursive: true });
    });

    it("prints completion checklist when docs are included", () => {
      const dir = tempDir();
      const out = run(`--target ${dir} --force --skip-skills --skip-scripts`);
      assert.ok(out.includes("Documentation files that need completion"));
      assert.ok(out.includes("BUSINESS_LOGIC.md"));
      rmSync(dir, { recursive: true });
    });

    it("prints fill-docs skill hint when skills are included", () => {
      const dir = tempDir();
      const out = run(`--target ${dir} --force --skip-docs --skip-scripts`);
      assert.ok(out.includes("fill-docs"));
      rmSync(dir, { recursive: true });
    });

    it("omits doc-group files from checklist when --skip-docs is set", () => {
      const dir = tempDir();
      const out = run(`--target ${dir} --force --skip-docs --skip-skills --skip-scripts`);
      assert.equal(out.includes("docs/context/glossary.md"), false);
      assert.equal(out.includes("docs/product/README.md"), false);
      assert.equal(out.includes("docs/engineering/README.md"), false);
      assert.ok(out.includes("BUSINESS_LOGIC.md"));
      rmSync(dir, { recursive: true });
    });
  });

  describe("--version", () => {
    it("outputs a version string", () => {
      const out = run("--version");
      assert.ok(out.match(/\d+\.\d+\.\d+/));
    });
  });
});
