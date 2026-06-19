import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { describe, it } from "node:test";
import { scaffold } from "../src/scaffold.js";

const S = ".agentic-scaffold";

function setupScaffold() {
  return mkdtempSync(join(tmpdir(), "memory-scripts-test-"));
}

function scriptPath(dir, name) {
  return join(dir, S, "scripts", name);
}

function writeScratch(dir, name, body) {
  const scratchpadDir = join(dir, S, ".scratchpad");
  mkdirSync(scratchpadDir, { recursive: true });
  writeFileSync(join(scratchpadDir, name), body, "utf-8");
}

function runIndex(dir, indexPath) {
  return execFileSync(process.execPath, [scriptPath(dir, "memory_index.mjs"), "--index", indexPath], {
    encoding: "utf-8",
  });
}

function runSearch(dir, indexPath, query, limit) {
  return execFileSync(
    process.execPath,
    [scriptPath(dir, "memory_search.mjs"), query, "--index", indexPath, "--limit", String(limit)],
    { encoding: "utf-8" },
  );
}

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

  it("ranks higher term frequency first (bm25 tf)", async () => {
    const dir = setupScaffold();
    try {
      await scaffold({ target: dir, force: true, skipDocs: true, skipSkills: true, quiet: true });
      writeScratch(dir, "tf-high.md", "# TF High\n\nzephyr zephyr zephyr\n");
      writeScratch(dir, "tf-low.md", "# TF Low\n\nzephyr meadow meadow meadow\n");
      const indexPath = join(dir, ".memory", "tf-index.json");
      runIndex(dir, indexPath);
      const out = runSearch(dir, indexPath, "zephyr", 5);
      const high = out.indexOf("tf-high.md");
      const low = out.indexOf("tf-low.md");
      assert.ok(high >= 0 && low >= 0, "both docs returned");
      assert.ok(high < low, "the chunk repeating the term ranks above the one mentioning it once");
    } finally {
      rmSync(dir, { recursive: true, force: true });
    }
  });

  it("ranks rarer terms above common ones (bm25 idf)", async () => {
    const dir = setupScaffold();
    try {
      await scaffold({ target: dir, force: true, skipDocs: true, skipSkills: true, quiet: true });
      for (let i = 0; i < 4; i++) writeScratch(dir, `common-${i}.md`, `# Common ${i}\n\nwidget\n`);
      writeScratch(dir, "rare.md", "# Rare\n\nsprocket\n");
      const indexPath = join(dir, ".memory", "idf-index.json");
      runIndex(dir, indexPath);
      const out = runSearch(dir, indexPath, "widget sprocket", 10);
      const rare = out.indexOf("rare.md");
      const firstCommon = out.indexOf("common-");
      assert.ok(rare >= 0 && firstCommon >= 0, "both kinds returned");
      assert.ok(rare < firstCommon, "the high-idf rare term outranks the low-idf common term");
    } finally {
      rmSync(dir, { recursive: true, force: true });
    }
  });

  it("exits non-zero on a stale index version", async () => {
    const dir = setupScaffold();
    try {
      await scaffold({ target: dir, force: true, skipDocs: true, skipSkills: true, quiet: true });
      const indexPath = join(dir, ".memory", "stale.json");
      mkdirSync(join(dir, ".memory"), { recursive: true });
      writeFileSync(indexPath, JSON.stringify({ version: 1, chunks: [] }), "utf-8");
      assert.throws(
        () =>
          execFileSync(process.execPath, [scriptPath(dir, "memory_search.mjs"), "zephyr", "--index", indexPath], {
            encoding: "utf-8",
            stdio: "pipe",
          }),
        (err) => {
          assert.equal(err.status, 1);
          assert.match(String(err.stderr), /outdated/);
          return true;
        },
      );
    } finally {
      rmSync(dir, { recursive: true, force: true });
    }
  });
});
