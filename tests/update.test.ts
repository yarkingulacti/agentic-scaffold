import assert from "node:assert/strict";
import { existsSync, mkdtempSync, readFileSync, rmSync, unlinkSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { describe, it } from "node:test";
import type { Manifest } from "../src/fs-utils.js";
import { fileHash, readManifest } from "../src/fs-utils.js";
import { scaffold } from "../src/scaffold.js";
import { update } from "../src/update.js";

const S = ".agentic-scaffold";
const BUSINESS_LOGIC = `${S}/BUSINESS_LOGIC.md`;

function p(dir: string, ...parts: string[]): string {
  return join(dir, ...parts);
}

function tempDir(): string {
  return mkdtempSync(join(tmpdir(), "update-test-"));
}

function manifestPath(dir: string): string {
  return p(dir, S, ".manifest.json");
}

function readRequiredManifest(dir: string): Manifest {
  const manifest = readManifest(p(dir, S));
  assert.ok(manifest);
  return manifest;
}

function writeManifest(dir: string, manifest: Manifest): void {
  writeFileSync(manifestPath(dir), `${JSON.stringify(manifest, null, 2)}\n`, "utf-8");
}

async function createScaffold(dir: string): Promise<void> {
  await scaffold({ target: dir, force: true, skipDocs: true, skipScripts: true, skipSkills: true, quiet: true });
}

describe("update", () => {
  it("requires an existing scaffold manifest", async () => {
    const dir = tempDir();
    try {
      await assert.rejects(() => update({ target: dir, quiet: true }), /No \.agentic-scaffold\//);
    } finally {
      rmSync(dir, { recursive: true, force: true });
    }
  });

  it("is idempotent for an unchanged scaffold", async () => {
    const dir = tempDir();
    try {
      await createScaffold(dir);
      const result = await update({ target: dir, skipDocs: true, skipScripts: true, skipSkills: true, quiet: true });
      assert.equal(result.added.length, 0);
      assert.equal(result.updated.length, 0);
      assert.equal(result.conflicts.length, 0);
      assert.ok(result.unchanged.includes(BUSINESS_LOGIC));
    } finally {
      rmSync(dir, { recursive: true, force: true });
    }
  });

  it("adds canonical files that are absent from the old manifest and disk", async () => {
    const dir = tempDir();
    try {
      await createScaffold(dir);
      unlinkSync(p(dir, BUSINESS_LOGIC));
      const manifest = readRequiredManifest(dir);
      manifest.files = manifest.files.filter((entry) => entry.path !== BUSINESS_LOGIC);
      writeManifest(dir, manifest);

      const result = await update({ target: dir, skipDocs: true, skipScripts: true, skipSkills: true, quiet: true });

      assert.deepEqual(result.added, [BUSINESS_LOGIC]);
      assert.ok(existsSync(p(dir, BUSINESS_LOGIC)));
      assert.equal(result.conflicts.length, 0);
    } finally {
      rmSync(dir, { recursive: true, force: true });
    }
  });

  it("keeps user edits when the canonical template is unchanged", async () => {
    const dir = tempDir();
    try {
      await createScaffold(dir);
      writeFileSync(p(dir, BUSINESS_LOGIC), "local domain notes\n", "utf-8");

      const result = await update({ target: dir, skipDocs: true, skipScripts: true, skipSkills: true, quiet: true });

      assert.deepEqual(result.keptUserModified, [BUSINESS_LOGIC]);
      assert.equal(readFileSync(p(dir, BUSINESS_LOGIC), "utf-8"), "local domain notes\n");
      assert.equal(existsSync(p(dir, `${BUSINESS_LOGIC}.new`)), false);
    } finally {
      rmSync(dir, { recursive: true, force: true });
    }
  });

  it("writes a .new file on user-edit plus upstream-change conflicts", async () => {
    const dir = tempDir();
    try {
      await createScaffold(dir);
      const original = readFileSync(p(dir, BUSINESS_LOGIC), "utf-8");
      const manifest = readRequiredManifest(dir);
      const businessEntry = manifest.files.find((entry) => entry.path === BUSINESS_LOGIC);
      assert.ok(businessEntry && businessEntry.type !== "symlink");
      businessEntry.contentHash = "old-upstream-hash";
      writeManifest(dir, manifest);
      writeFileSync(p(dir, BUSINESS_LOGIC), "local domain notes\n", "utf-8");

      const result = await update({ target: dir, skipDocs: true, skipScripts: true, skipSkills: true, quiet: true });

      assert.deepEqual(result.conflicts, [BUSINESS_LOGIC]);
      assert.equal(readFileSync(p(dir, BUSINESS_LOGIC), "utf-8"), "local domain notes\n");
      assert.equal(readFileSync(p(dir, `${BUSINESS_LOGIC}.new`), "utf-8"), original);
      const newManifest = readRequiredManifest(dir);
      const newEntry = newManifest.files.find((entry) => entry.path === BUSINESS_LOGIC);
      assert.ok(newEntry && newEntry.type !== "symlink");
      assert.equal(newEntry.contentHash, fileHash(p(dir, `${BUSINESS_LOGIC}.new`)));
    } finally {
      rmSync(dir, { recursive: true, force: true });
    }
  });

  it("does not write files or manifest changes during dry-run", async () => {
    const dir = tempDir();
    try {
      await createScaffold(dir);
      const manifest = readRequiredManifest(dir);
      const businessEntry = manifest.files.find((entry) => entry.path === BUSINESS_LOGIC);
      assert.ok(businessEntry && businessEntry.type !== "symlink");
      businessEntry.contentHash = "old-upstream-hash";
      writeManifest(dir, manifest);
      const beforeManifest = readFileSync(manifestPath(dir), "utf-8");
      writeFileSync(p(dir, BUSINESS_LOGIC), "local domain notes\n", "utf-8");

      const result = await update({
        target: dir,
        skipDocs: true,
        skipScripts: true,
        skipSkills: true,
        dryRun: true,
        quiet: true,
      });

      assert.deepEqual(result.conflicts, [BUSINESS_LOGIC]);
      assert.equal(existsSync(p(dir, `${BUSINESS_LOGIC}.new`)), false);
      assert.equal(readFileSync(manifestPath(dir), "utf-8"), beforeManifest);
    } finally {
      rmSync(dir, { recursive: true, force: true });
    }
  });
});
