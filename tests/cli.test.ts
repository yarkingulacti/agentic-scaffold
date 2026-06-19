import assert from "node:assert/strict";
import { execSync } from "node:child_process";
import { existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { describe, it } from "node:test";

const CLI = `node --import tsx ${join(import.meta.dirname, "..", "bin", "index.ts")}`;
const DIST_CLI = join(import.meta.dirname, "..", "dist", "bin", "index.js");
const S = ".agentic-scaffold";

function p(dir: string, ...parts: string[]): string {
  return join(dir, ...parts);
}

function tempDir() {
  return mkdtempSync(join(tmpdir(), "cli-test-"));
}

function run(args = "") {
  return execSync(`${CLI} ${args}`, { encoding: "utf-8" });
}

describe("CLI", () => {
  describe("--help", () => {
    it("runs without error", () => {
      run("--help");
    });

    it("runs from built dist when build artifacts are present", { skip: !existsSync(DIST_CLI) }, () => {
      execSync(`node ${DIST_CLI} --help`, { encoding: "utf-8" });
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
      assert.ok(out.includes("Generate mainstream provider skill"));
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
      assert.ok(out.includes("--skip-rtk"));
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
      assert.ok(existsSync(p(dir, "AGENTS.md")));
      assert.ok(existsSync(p(dir, S, "BUSINESS_LOGIC.md")));
      assert.ok(existsSync(p(dir, S, ".gitignore")));
      assert.equal(existsSync(p(dir, "opencode.json")), false);
      assert.equal(existsSync(p(dir, S, "contribute")), false);
      assert.equal(existsSync(p(dir, S, "onboarding")), false);
      assert.equal(existsSync(p(dir, ".rtk", "filters.toml")), false);
      rmSync(dir, { recursive: true });
    });

    it("scaffolds requested extras only", () => {
      const dir = tempDir();
      run(`--target ${dir} --force --extras ai-config --skip-docs --skip-skills --skip-scripts --skip-hooks`);
      assert.ok(existsSync(p(dir, "opencode.json")));
      assert.ok(existsSync(p(dir, ".claude", "skills", "fill-docs", "SKILL.md")));
      assert.ok(existsSync(p(dir, ".gemini", "commands", "fill-docs.toml")));
      assert.ok(existsSync(p(dir, ".agents", "skills", "fill-docs", "SKILL.md")));
      assert.ok(existsSync(p(dir, ".deepcode", "skills", "fill-docs", "SKILL.md")));
      assert.ok(existsSync(p(dir, ".grok", "skills", "fill-docs", "SKILL.md")));
      assert.equal(existsSync(p(dir, S, "contribute")), false);
      assert.equal(existsSync(p(dir, S, "onboarding")), false);
      assert.equal(existsSync(p(dir, ".rtk", "filters.toml")), false);
      rmSync(dir, { recursive: true });
    });

    it("scaffolds all extras when --extras all is set", () => {
      const dir = tempDir();
      run(
        `--target ${dir} --force --extras all --ci-provider github --skip-docs --skip-skills --skip-scripts --skip-hooks`,
      );
      assert.ok(existsSync(p(dir, ".github", "workflows", "ci.yml")));
      assert.ok(existsSync(p(dir, ".github", "dependabot.yml")));
      assert.ok(existsSync(p(dir, "opencode.json")));
      assert.ok(existsSync(p(dir, ".claude", "skills", "fill-docs", "SKILL.md")));
      assert.ok(existsSync(p(dir, ".gemini", "commands", "fill-docs.toml")));
      assert.ok(existsSync(p(dir, ".agents", "skills", "fill-docs", "SKILL.md")));
      assert.ok(existsSync(p(dir, ".deepcode", "skills", "fill-docs", "SKILL.md")));
      assert.ok(existsSync(p(dir, ".grok", "skills", "fill-docs", "SKILL.md")));
      assert.ok(existsSync(p(dir, S, "contribute", "CONTRIBUTING.md")));
      assert.ok(existsSync(p(dir, S, "onboarding", "ONBOARDING.md")));
      assert.ok(existsSync(p(dir, ".rtk", "filters.toml")));
      rmSync(dir, { recursive: true });
    });

    it("skips RTK filters when --skip-rtk is set", () => {
      const dir = tempDir();
      run(
        `--target ${dir} --force --extras all --skip-rtk --skip-docs --skip-skills --skip-scripts --skip-hooks --skip-ci`,
      );
      assert.equal(existsSync(p(dir, ".rtk", "filters.toml")), false);
      assert.ok(existsSync(p(dir, S, "onboarding", "ONBOARDING.md")));
      rmSync(dir, { recursive: true });
    });

    it("dry-run previews without writing files", () => {
      const dir = tempDir();
      const out = run(`--target ${dir} --dry-run --skip-skills --skip-scripts`);
      assert.ok(out.includes("Dry run"));
      assert.ok(out.includes(".agentic-scaffold/AGENTS.md"));
      assert.equal(existsSync(p(dir, "AGENTS.md")), false);
      assert.equal(existsSync(p(dir, S)), false);
      rmSync(dir, { recursive: true });
    });

    it("dry-run respects skipped working directories", () => {
      const dir = tempDir();
      const out = run(
        `--target ${dir} --dry-run --skip-history --skip-scratchpad --skip-docs --skip-skills --skip-scripts --skip-hooks`,
      );
      assert.equal(out.includes(".agentic-scaffold/.history"), false);
      assert.equal(out.includes(".agentic-scaffold/.scratchpad"), false);
      assert.ok(out.includes(".agentic-scaffold/AGENTS.md"));
      rmSync(dir, { recursive: true });
    });

    it("dry-run previews only the selected CI provider", () => {
      const dir = tempDir();
      const out = run(
        `--target ${dir} --dry-run --extras ci --ci-provider github --skip-docs --skip-skills --skip-scripts --skip-hooks --skip-history --skip-scratchpad`,
      );
      assert.ok(out.includes(".github/workflows/ci.yml"));
      assert.ok(out.includes(".github/dependabot.yml"));
      assert.equal(out.includes(".gitlab-ci.yml"), false);
      assert.equal(out.includes(".circleci/config.yml"), false);
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
      writeFileSync(p(dir, S, "AGENTS.md"), "tampered", "utf-8");
      run(`--target ${dir} --force --skip-skills --skip-scripts`);
      const content = readFileSync(p(dir, S, "AGENTS.md"), "utf-8");
      assert.notEqual(content, "tampered");
      rmSync(dir, { recursive: true });
    });

    it("respects --skip-skills", () => {
      const dir = tempDir();
      run(`--target ${dir} --force --skip-skills --skip-hooks --skip-scripts`);
      assert.equal(existsSync(p(dir, S, ".agents")), false);
      rmSync(dir, { recursive: true });
    });

    it("respects --skip-docs", () => {
      const dir = tempDir();
      run(`--target ${dir} --force --skip-docs --skip-skills --skip-scripts`);
      assert.equal(existsSync(p(dir, S, "docs")), false);
      rmSync(dir, { recursive: true });
    });

    it("creates hooks by default", () => {
      const dir = tempDir();
      run(`--target ${dir} --force --skip-docs --skip-skills --skip-scripts`);
      assert.ok(existsSync(p(dir, S, ".agents", "hooks", "post-feature.md")));
      rmSync(dir, { recursive: true });
    });

    it("respects --skip-hooks", () => {
      const dir = tempDir();
      run(`--target ${dir} --force --skip-hooks --skip-docs --skip-skills --skip-scripts`);
      assert.equal(existsSync(p(dir, S, ".agents", "hooks")), false);
      rmSync(dir, { recursive: true });
    });

    it("accepts --project-name", () => {
      const dir = tempDir();
      run(`--target ${dir} --force --project-name MyProject --skip-skills --skip-scripts`);
      const content = readFileSync(p(dir, S, "AGENTS.md"), "utf-8");
      assert.ok(content.includes("# MyProject"));
      rmSync(dir, { recursive: true });
    });

    it("accepts --package-manager override", () => {
      const dir = tempDir();
      run(`--target ${dir} --force --package-manager pnpm --skip-skills --skip-scripts`);
      const content = readFileSync(p(dir, S, "AGENTS.md"), "utf-8");
      assert.ok(content.includes("**pnpm**"));
      rmSync(dir, { recursive: true });
    });

    it("accepts --ci-provider override", () => {
      const dir = tempDir();
      run(`--target ${dir} --force --ci-provider gitlab --skip-skills --skip-scripts`);
      const content = readFileSync(p(dir, S, "AGENTS.md"), "utf-8");
      assert.ok(content.includes("**gitlab**"));
      rmSync(dir, { recursive: true });
    });

    it("accepts the supported --script-language override", () => {
      const dir = tempDir();
      run(`--target ${dir} --force --script-language node --skip-skills --skip-scripts`);
      const content = readFileSync(p(dir, S, "AGENTS.md"), "utf-8");
      assert.ok(content.includes("**node**"));
      rmSync(dir, { recursive: true });
    });

    it("rejects unsupported --script-language values", () => {
      const dir = tempDir();
      assert.throws(() => run(`--target ${dir} --force --script-language python --skip-skills --skip-scripts`));
      rmSync(dir, { recursive: true });
    });

    it("auto-detects from project files", () => {
      const dir = tempDir();
      writeFileSync(p(dir, "package.json"), JSON.stringify({ name: "test" }), "utf-8");
      mkdirSync(p(dir, ".github", "workflows"), { recursive: true });
      writeFileSync(p(dir, "pnpm-lock.yaml"), "", "utf-8");
      run(`--target ${dir} --force --skip-skills --skip-scripts`);
      const content = readFileSync(p(dir, S, "AGENTS.md"), "utf-8");
      assert.ok(content.includes("**pnpm**"));
      assert.ok(content.includes("**github**"));
      rmSync(dir, { recursive: true });
    });

    it("prints completion checklist when docs are included", () => {
      const dir = tempDir();
      const out = run(`--target ${dir} --force --skip-skills --skip-scripts`);
      assert.ok(out.includes("Documentation files that need completion"));
      assert.ok(out.includes(".agentic-scaffold/BUSINESS_LOGIC.md"));
      rmSync(dir, { recursive: true });
    });

    it("prints fill-docs skill hint when skills are included", () => {
      const dir = tempDir();
      const out = run(`--target ${dir} --force --skip-docs --skip-scripts`);
      assert.ok(out.includes("fill-docs"));
      rmSync(dir, { recursive: true });
    });

    it("prints slash command availability when skill-aware AI configs are included", () => {
      const dir = tempDir();
      const out = run(
        `--target ${dir} --force --extras ai-config --ai-tools openai,anthropic,google,deepseek,grok --skip-docs --skip-scripts`,
      );
      assert.ok(out.includes("Skill adapters installed for codex, claude, gemini, deepcode, grok: /fill-docs"));
      assert.ok(out.includes("/commands reload"));
      rmSync(dir, { recursive: true });
    });

    it("omits doc-group files from checklist when --skip-docs is set", () => {
      const dir = tempDir();
      const out = run(`--target ${dir} --force --skip-docs --skip-skills --skip-scripts`);
      assert.equal(out.includes("docs/context/glossary.md"), false);
      assert.equal(out.includes("docs/product/README.md"), false);
      assert.equal(out.includes("docs/engineering/README.md"), false);
      assert.ok(out.includes(".agentic-scaffold/BUSINESS_LOGIC.md"));
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
