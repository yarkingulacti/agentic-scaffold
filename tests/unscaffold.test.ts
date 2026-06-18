import assert from "node:assert/strict";
import { existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { describe, it } from "node:test";
import { readManifest, verifyManifest } from "../src/fs-utils.js";
import { scaffold } from "../src/scaffold.js";
import { unscaffold } from "../src/unscaffold.js";

const S = ".agentic-scaffold";

function p(dir: string, ...parts: string[]): string {
  return join(dir, ...parts);
}

function tempDir() {
  return mkdtempSync(join(tmpdir(), "unscaffold-test-"));
}

describe("unscaffold", () => {
  it("removes .agentic-scaffold/ and symlinks", async () => {
    const dir = tempDir();
    await scaffold({ target: dir, force: true, skipDocs: true, skipScripts: true, skipSkills: true, quiet: true });
    assert.ok(existsSync(p(dir, S)));
    assert.ok(existsSync(p(dir, "AGENTS.md")));

    await unscaffold({ target: dir, force: true, quiet: true });

    assert.equal(existsSync(p(dir, S)), false);
    assert.equal(existsSync(p(dir, "AGENTS.md")), false);
    assert.equal(existsSync(p(dir, "CLAUDE.md")), false);
    rmSync(dir, { recursive: true });
  });

  it("reports nothing to do when .agentic-scaffold/ is absent", async () => {
    const dir = tempDir();
    // No scaffold, just run unscaffold
    await unscaffold({ target: dir, force: true, quiet: true });
    // Should not throw
    rmSync(dir, { recursive: true });
  });

  it("removes all scaffolded components", async () => {
    const dir = tempDir();
    await scaffold({ target: dir, force: true, quiet: true });
    assert.ok(existsSync(p(dir, S, "docs")));
    assert.ok(existsSync(p(dir, S, "scripts")));
    assert.ok(existsSync(p(dir, S, ".agents", "skills")));
    assert.ok(existsSync(p(dir, S, ".agents", "hooks")));

    await unscaffold({ target: dir, force: true, quiet: true });

    assert.equal(existsSync(p(dir, S)), false);
    assert.equal(existsSync(p(dir, "AGENTS.md")), false);
    rmSync(dir, { recursive: true });
  });

  it("removes root extras, root entrypoints, and .agentic-scaffold/ with --force", async () => {
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

    assert.ok(existsSync(p(dir, "opencode.json")));
    assert.ok(existsSync(p(dir, ".github", "workflows", "ci.yml")));
    assert.ok(existsSync(p(dir, ".github", "dependabot.yml")));
    assert.ok(existsSync(p(dir, ".rtk", "filters.toml")));
    assert.ok(existsSync(p(dir, "AGENTS.md")));

    await unscaffold({ target: dir, force: true, quiet: true });

    assert.equal(existsSync(p(dir, "opencode.json")), false);
    assert.equal(existsSync(p(dir, ".github", "workflows", "ci.yml")), false);
    assert.equal(existsSync(p(dir, ".github", "dependabot.yml")), false);
    assert.equal(existsSync(p(dir, ".rtk", "filters.toml")), false);
    assert.equal(existsSync(p(dir, "AGENTS.md")), false);
    assert.equal(existsSync(p(dir, "CLAUDE.md")), false);
    assert.equal(existsSync(p(dir, S)), false);
    rmSync(dir, { recursive: true });
  });

  it("preserves non-empty parent directories for root extras", async () => {
    const dir = tempDir();
    await scaffold({
      target: dir,
      force: true,
      extras: "ci",
      ciProvider: "github",
      skipDocs: true,
      skipScripts: true,
      skipSkills: true,
      quiet: true,
    });
    mkdirSync(p(dir, ".github", "ISSUE_TEMPLATE"), { recursive: true });
    writeFileSync(p(dir, ".github", "ISSUE_TEMPLATE", "bug.md"), "user-owned\n", "utf-8");

    await unscaffold({ target: dir, force: true, quiet: true });

    assert.equal(readFileSync(p(dir, ".github", "ISSUE_TEMPLATE", "bug.md"), "utf-8"), "user-owned\n");
    assert.equal(existsSync(p(dir, ".github", "workflows", "ci.yml")), false);
    assert.equal(existsSync(p(dir, ".github", "dependabot.yml")), false);
    rmSync(dir, { recursive: true });
  });

  it("reports modified root-owned files through manifest verification", async () => {
    const dir = tempDir();
    await scaffold({
      target: dir,
      force: true,
      extras: "ai-config",
      skipDocs: true,
      skipScripts: true,
      skipSkills: true,
      quiet: true,
    });
    writeFileSync(p(dir, "opencode.json"), "{}\n", "utf-8");

    const manifest = readManifest(p(dir, S));
    assert.ok(manifest);
    const modified = verifyManifest(dir, manifest);

    assert.ok(modified.some((file) => file.path === "opencode.json" && file.currentHash !== "(deleted)"));
    rmSync(dir, { recursive: true });
  });
});
