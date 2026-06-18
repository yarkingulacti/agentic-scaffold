import assert from "node:assert/strict";
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { describe, it } from "node:test";
import { detectProjectProfile } from "../src/detect.js";

function tempDir() {
  return mkdtempSync(join(tmpdir(), "detect-test-"));
}

function write(root: string, ...parts: string[]): string {
  const filePath = join(root, ...parts);
  mkdirSync(filePath.slice(0, filePath.lastIndexOf("/")), { recursive: true });
  writeFileSync(filePath, "", "utf-8");
  return filePath;
}

function writeJson(root: string, path: string, obj: unknown): string {
  const filePath = join(root, path);
  mkdirSync(filePath.slice(0, filePath.lastIndexOf("/")), { recursive: true });
  writeFileSync(filePath, JSON.stringify(obj), "utf-8");
  return filePath;
}

describe("detectProjectProfile", () => {
  describe("projectName", () => {
    it("uses the directory basename", () => {
      const dir = tempDir();
      const name = dir.split("/").pop();
      const profile = detectProjectProfile(dir);
      assert.equal(profile.projectName, name);
      rmSync(dir, { recursive: true });
    });

    it("falls back to 'project' for root-like paths", () => {
      const profile = detectProjectProfile("/");
      assert.equal(profile.projectName, "project");
    });
  });

  describe("languages", () => {
    it("detects js from empty package.json", () => {
      const dir = tempDir();
      write(dir, "package.json");
      const profile = detectProjectProfile(dir);
      assert.deepEqual(profile.languages, ["js"]);
      rmSync(dir, { recursive: true });
    });

    it("detects ts when typescript is a dependency", () => {
      const dir = tempDir();
      writeJson(dir, "package.json", { devDependencies: { typescript: "^5.0.0" } });
      const profile = detectProjectProfile(dir);
      assert.deepEqual(profile.languages, ["ts"]);
      rmSync(dir, { recursive: true });
    });

    it("detects python from requirements.txt", () => {
      const dir = tempDir();
      write(dir, "requirements.txt");
      const profile = detectProjectProfile(dir);
      assert.ok(profile.languages.includes("python"));
      rmSync(dir, { recursive: true });
    });

    it("detects python from pyproject.toml", () => {
      const dir = tempDir();
      write(dir, "pyproject.toml");
      const profile = detectProjectProfile(dir);
      assert.ok(profile.languages.includes("python"));
      rmSync(dir, { recursive: true });
    });

    it("detects go from go.mod", () => {
      const dir = tempDir();
      write(dir, "go.mod");
      const profile = detectProjectProfile(dir);
      assert.deepEqual(profile.languages, ["go"]);
      rmSync(dir, { recursive: true });
    });

    it("detects rust from Cargo.toml", () => {
      const dir = tempDir();
      write(dir, "Cargo.toml");
      const profile = detectProjectProfile(dir);
      assert.deepEqual(profile.languages, ["rust"]);
      rmSync(dir, { recursive: true });
    });

    it("returns empty array when no language files exist", () => {
      const dir = tempDir();
      const profile = detectProjectProfile(dir);
      assert.deepEqual(profile.languages, []);
      rmSync(dir, { recursive: true });
    });

    it("detects multiple languages when multiple markers exist", () => {
      const dir = tempDir();
      write(dir, "package.json");
      write(dir, "requirements.txt");
      const profile = detectProjectProfile(dir);
      assert.deepEqual(profile.languages, ["js", "python"]);
      rmSync(dir, { recursive: true });
    });
  });

  describe("packageManager", () => {
    it("detects pnpm from pnpm-lock.yaml", () => {
      const dir = tempDir();
      write(dir, "pnpm-lock.yaml");
      assert.equal(detectProjectProfile(dir).packageManager, "pnpm");
      rmSync(dir, { recursive: true });
    });

    it("detects yarn from yarn.lock", () => {
      const dir = tempDir();
      write(dir, "yarn.lock");
      assert.equal(detectProjectProfile(dir).packageManager, "yarn");
      rmSync(dir, { recursive: true });
    });

    it("detects npm from package-lock.json", () => {
      const dir = tempDir();
      write(dir, "package-lock.json");
      assert.equal(detectProjectProfile(dir).packageManager, "npm");
      rmSync(dir, { recursive: true });
    });

    it("detects poetry from poetry.lock", () => {
      const dir = tempDir();
      write(dir, "poetry.lock");
      assert.equal(detectProjectProfile(dir).packageManager, "poetry");
      rmSync(dir, { recursive: true });
    });

    it("detects pip from Pipfile.lock", () => {
      const dir = tempDir();
      write(dir, "Pipfile.lock");
      assert.equal(detectProjectProfile(dir).packageManager, "pip");
      rmSync(dir, { recursive: true });
    });

    it("returns null when no lockfile exists", () => {
      const dir = tempDir();
      assert.equal(detectProjectProfile(dir).packageManager, null);
      rmSync(dir, { recursive: true });
    });

    it("returns first match when multiple lockfiles exist", () => {
      const dir = tempDir();
      write(dir, "pnpm-lock.yaml");
      write(dir, "yarn.lock");
      assert.equal(detectProjectProfile(dir).packageManager, "pnpm");
      rmSync(dir, { recursive: true });
    });
  });

  describe("ciProvider", () => {
    it("detects github from .github/workflows", () => {
      const dir = tempDir();
      mkdirSync(join(dir, ".github", "workflows"), { recursive: true });
      assert.equal(detectProjectProfile(dir).ciProvider, "github");
      rmSync(dir, { recursive: true });
    });

    it("detects gitlab from .gitlab-ci.yml", () => {
      const dir = tempDir();
      write(dir, ".gitlab-ci.yml");
      assert.equal(detectProjectProfile(dir).ciProvider, "gitlab");
      rmSync(dir, { recursive: true });
    });

    it("detects circleci from .circleci/config.yml", () => {
      const dir = tempDir();
      mkdirSync(join(dir, ".circleci"), { recursive: true });
      write(dir, ".circleci", "config.yml");
      assert.equal(detectProjectProfile(dir).ciProvider, "circleci");
      rmSync(dir, { recursive: true });
    });

    it("returns null when no CI config exists", () => {
      const dir = tempDir();
      assert.equal(detectProjectProfile(dir).ciProvider, null);
      rmSync(dir, { recursive: true });
    });

    it("returns first match when multiple CI configs exist", () => {
      const dir = tempDir();
      mkdirSync(join(dir, ".github", "workflows"), { recursive: true });
      write(dir, ".gitlab-ci.yml");
      assert.equal(detectProjectProfile(dir).ciProvider, "github");
      rmSync(dir, { recursive: true });
    });
  });

  describe("aiTools", () => {
    it("detects opencode from opencode.json", () => {
      const dir = tempDir();
      write(dir, "opencode.json");
      assert.deepEqual(detectProjectProfile(dir).aiTools, ["opencode"]);
      rmSync(dir, { recursive: true });
    });

    it("detects cursor from .cursorrules", () => {
      const dir = tempDir();
      write(dir, ".cursorrules");
      assert.deepEqual(detectProjectProfile(dir).aiTools, ["cursor"]);
      rmSync(dir, { recursive: true });
    });

    it("detects copilot from .copilot-instructions.md", () => {
      const dir = tempDir();
      write(dir, ".copilot-instructions.md");
      assert.deepEqual(detectProjectProfile(dir).aiTools, ["copilot"]);
      rmSync(dir, { recursive: true });
    });

    it("detects windsurf from .windsurfrules", () => {
      const dir = tempDir();
      write(dir, ".windsurfrules");
      assert.deepEqual(detectProjectProfile(dir).aiTools, ["windsurf"]);
      rmSync(dir, { recursive: true });
    });

    it("detects cline from .clinerules", () => {
      const dir = tempDir();
      write(dir, ".clinerules");
      assert.deepEqual(detectProjectProfile(dir).aiTools, ["cline"]);
      rmSync(dir, { recursive: true });
    });

    it("returns all detected tools when multiple exist", () => {
      const dir = tempDir();
      write(dir, "opencode.json");
      write(dir, ".cursorrules");
      write(dir, ".copilot-instructions.md");
      const profile = detectProjectProfile(dir);
      assert.deepEqual(profile.aiTools.sort(), ["opencode", "cursor", "copilot"].sort());
      rmSync(dir, { recursive: true });
    });

    it("returns empty array when no AI tool configs exist", () => {
      const dir = tempDir();
      assert.deepEqual(detectProjectProfile(dir).aiTools, []);
      rmSync(dir, { recursive: true });
    });
  });

  describe("issueTracker", () => {
    it("detects github when .github directory exists", () => {
      const dir = tempDir();
      mkdirSync(join(dir, ".github"), { recursive: true });
      assert.equal(detectProjectProfile(dir).issueTracker, "github");
      rmSync(dir, { recursive: true });
    });

    it("returns null when no .github directory", () => {
      const dir = tempDir();
      assert.equal(detectProjectProfile(dir).issueTracker, null);
      rmSync(dir, { recursive: true });
    });
  });

  describe("scriptLanguage", () => {
    it("detects node from package.json", () => {
      const dir = tempDir();
      write(dir, "package.json");
      assert.equal(detectProjectProfile(dir).scriptLanguage, "node");
      rmSync(dir, { recursive: true });
    });

    it("detects python from requirements.txt", () => {
      const dir = tempDir();
      write(dir, "requirements.txt");
      assert.equal(detectProjectProfile(dir).scriptLanguage, "python");
      rmSync(dir, { recursive: true });
    });

    it("detects python from pyproject.toml", () => {
      const dir = tempDir();
      write(dir, "pyproject.toml");
      assert.equal(detectProjectProfile(dir).scriptLanguage, "python");
      rmSync(dir, { recursive: true });
    });

    it("prefers node over python when both markers exist", () => {
      const dir = tempDir();
      write(dir, "package.json");
      write(dir, "requirements.txt");
      assert.equal(detectProjectProfile(dir).scriptLanguage, "node");
      rmSync(dir, { recursive: true });
    });

    it("returns null when no language markers exist", () => {
      const dir = tempDir();
      assert.equal(detectProjectProfile(dir).scriptLanguage, null);
      rmSync(dir, { recursive: true });
    });
  });

  describe("existence booleans", () => {
    it("sets hasDockerfile when Dockerfile exists", () => {
      const dir = tempDir();
      write(dir, "Dockerfile");
      assert.ok(detectProjectProfile(dir).hasDockerfile);
      rmSync(dir, { recursive: true });
    });

    it("sets hasEnvExample when .env.example exists", () => {
      const dir = tempDir();
      write(dir, ".env.example");
      assert.ok(detectProjectProfile(dir).hasEnvExample);
      rmSync(dir, { recursive: true });
    });

    it("sets hasContributing when CONTRIBUTING.md exists", () => {
      const dir = tempDir();
      write(dir, "CONTRIBUTING.md");
      assert.ok(detectProjectProfile(dir).hasContributing);
      rmSync(dir, { recursive: true });
    });

    it("sets hasChangelog when CHANGELOG.md exists", () => {
      const dir = tempDir();
      write(dir, "CHANGELOG.md");
      assert.ok(detectProjectProfile(dir).hasChangelog);
      rmSync(dir, { recursive: true });
    });

    it("sets hasApiDocs when docs/api/ directory exists", () => {
      const dir = tempDir();
      mkdirSync(join(dir, "docs", "api"), { recursive: true });
      assert.ok(detectProjectProfile(dir).hasApiDocs);
      rmSync(dir, { recursive: true });
    });

    it("sets hasMigrations for known migration directories", () => {
      const dir = tempDir();
      mkdirSync(join(dir, "migrations"), { recursive: true });
      assert.ok(detectProjectProfile(dir).hasMigrations);
      rmSync(dir, { recursive: true });
    });

    it("sets hasMigrations for prisma/migrations", () => {
      const dir = tempDir();
      mkdirSync(join(dir, "prisma", "migrations"), { recursive: true });
      assert.ok(detectProjectProfile(dir).hasMigrations);
      rmSync(dir, { recursive: true });
    });

    it("all booleans default to false in empty project", () => {
      const dir = tempDir();
      const profile = detectProjectProfile(dir);
      assert.equal(profile.hasDockerfile, false);
      assert.equal(profile.hasEnvExample, false);
      assert.equal(profile.hasContributing, false);
      assert.equal(profile.hasChangelog, false);
      assert.equal(profile.hasApiDocs, false);
      assert.equal(profile.hasMigrations, false);
      rmSync(dir, { recursive: true });
    });
  });
});
