import assert from "node:assert/strict";
import { existsSync, mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { describe, it } from "node:test";
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
    await scaffold({ target: dir, force: true, skipDocs: true, skipScripts: true, skipSkills: true });
    assert.ok(existsSync(p(dir, S)));
    assert.ok(existsSync(p(dir, "AGENTS.md")));

    await unscaffold({ target: dir, force: true });

    assert.equal(existsSync(p(dir, S)), false);
    assert.equal(existsSync(p(dir, "AGENTS.md")), false);
    assert.equal(existsSync(p(dir, "CLAUDE.md")), false);
    rmSync(dir, { recursive: true });
  });

  it("reports nothing to do when .agentic-scaffold/ is absent", async () => {
    const dir = tempDir();
    // No scaffold, just run unscaffold
    await unscaffold({ target: dir, force: true });
    // Should not throw
    rmSync(dir, { recursive: true });
  });

  it("removes all scaffolded components", async () => {
    const dir = tempDir();
    await scaffold({ target: dir, force: true });
    assert.ok(existsSync(p(dir, S, "docs")));
    assert.ok(existsSync(p(dir, S, "scripts")));
    assert.ok(existsSync(p(dir, S, ".agents", "skills")));
    assert.ok(existsSync(p(dir, S, ".agents", "hooks")));

    await unscaffold({ target: dir, force: true });

    assert.equal(existsSync(p(dir, S)), false);
    assert.equal(existsSync(p(dir, "AGENTS.md")), false);
    rmSync(dir, { recursive: true });
  });
});
