import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { describe, it } from "node:test";
import { scaffold } from "../src/scaffold.js";

const S = ".agentic-scaffold";

describe("memory scripts", () => {
  it("indexes markdown, searches terms, and writes context bundles", async () => {
    const dir = mkdtempSync(join(tmpdir(), "memory-scripts-test-"));
    try {
      await scaffold({ target: dir, force: true, skipDocs: true, skipSkills: true, quiet: true });
      const scratchpadDir = join(dir, S, ".scratchpad");
      mkdirSync(scratchpadDir, { recursive: true });
      writeFileSync(
        join(scratchpadDir, "release-contract.md"),
        "# Release Contract\n\nMemory scripts must index nebula invariants before publishing.\n",
        "utf-8",
      );

      const indexPath = join(dir, ".memory", "test-index.json");
      const indexOut = execFileSync(
        process.execPath,
        [join(dir, S, "scripts", "memory_index.mjs"), "--index", indexPath],
        {
          encoding: "utf-8",
        },
      );
      assert.ok(indexOut.includes("indexed"));
      assert.ok(existsSync(indexPath));

      const searchOut = execFileSync(
        process.execPath,
        [join(dir, S, "scripts", "memory_search.mjs"), "nebula", "--index", indexPath, "--limit", "1"],
        { encoding: "utf-8" },
      );
      assert.ok(searchOut.includes(".agentic-scaffold/.scratchpad/release-contract.md"));
      assert.ok(searchOut.includes("nebula invariants"));

      const bundlePath = join(dir, ".memory", "bundle.md");
      const bundleOut = execFileSync(
        process.execPath,
        [
          join(dir, S, "scripts", "memory_bundle.mjs"),
          "nebula",
          "--index",
          indexPath,
          "--limit",
          "1",
          "--output",
          bundlePath,
        ],
        { encoding: "utf-8" },
      );
      assert.ok(bundleOut.includes(bundlePath));
      const bundle = readFileSync(bundlePath, "utf-8");
      assert.ok(bundle.includes("# Context Bundle"));
      assert.ok(bundle.includes("nebula invariants"));
    } finally {
      rmSync(dir, { recursive: true, force: true });
    }
  });
});
