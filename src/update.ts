import {
  copyFileSync,
  existsSync,
  lstatSync,
  mkdirSync,
  mkdtempSync,
  readFileSync,
  readlinkSync,
  rmSync,
  symlinkSync,
  unlinkSync,
  writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { buildHandlebars, resolveConfig, type ScaffoldArgs, type ScaffoldConfig } from "./config.js";
import { fileHash, generateManifest, type Manifest, type ManifestEntry, readManifest } from "./fs-utils.js";
import { PACKAGE_JSON } from "./paths.js";
import { checkNodeRuntime } from "./runtime.js";
import { renderScaffoldInto } from "./scaffold.js";
import { style, summaryLine } from "./ui.js";

const PKG = JSON.parse(readFileSync(PACKAGE_JSON, "utf-8")) as { version: string };

export interface UpdateResult {
  added: string[];
  updated: string[];
  unchanged: string[];
  conflicts: string[]; // user edited + template changed -> kept, wrote <path>.new
  keptUserModified: string[]; // user edited, template unchanged -> kept
  untracked: string[]; // path occupied by a non-scaffold file -> skipped
  deletedSkipped: string[]; // scaffold-owned file the user deleted -> not restored
  obsolete: string[]; // dropped from templates -> left in place
  reindexRequired: boolean; // memory scripts changed and a .memory/index.json exists -> it is now stale
}

// lstat-based existence: true even for a dangling symlink.
function lexists(path: string): boolean {
  try {
    lstatSync(path);
    return true;
  } catch {
    return false;
  }
}

function copyInto(src: string, dest: string): void {
  mkdirSync(dirname(dest), { recursive: true });
  copyFileSync(src, dest);
}

function isSymlinkEntry(entry: ManifestEntry): entry is Extract<ManifestEntry, { type: "symlink" }> {
  return entry.type === "symlink";
}

function reconcileFile(
  entry: ManifestEntry & { contentHash: string },
  oldEntry: ManifestEntry | undefined,
  srcAbs: string,
  destAbs: string,
  relPath: string,
  dryRun: boolean,
  result: UpdateResult,
): void {
  const next = entry.contentHash;
  const base = oldEntry && !isSymlinkEntry(oldEntry) ? oldEntry.contentHash : undefined;
  const destPresent = lexists(destAbs) && !lstatSync(destAbs).isSymbolicLink();
  const current = destPresent ? fileHash(destAbs) : undefined;

  if (base === undefined) {
    if (!lexists(destAbs)) {
      if (!dryRun) copyInto(srcAbs, destAbs);
      result.added.push(relPath);
    } else {
      result.untracked.push(relPath);
    }
    return;
  }

  if (!destPresent) {
    result.deletedSkipped.push(relPath);
    return;
  }

  if (current === base) {
    if (next !== base) {
      if (!dryRun) copyInto(srcAbs, destAbs);
      result.updated.push(relPath);
    } else {
      result.unchanged.push(relPath);
    }
    return;
  }

  // User-modified file.
  if (next === base) {
    result.keptUserModified.push(relPath);
  } else {
    if (!dryRun) copyInto(srcAbs, `${destAbs}.new`);
    result.conflicts.push(relPath);
  }
}

function reconcileSymlink(
  entry: Extract<ManifestEntry, { type: "symlink" }>,
  oldEntry: ManifestEntry | undefined,
  destAbs: string,
  relPath: string,
  dryRun: boolean,
  result: UpdateResult,
): void {
  const next = entry.linkTarget;
  const base = oldEntry && isSymlinkEntry(oldEntry) ? oldEntry.linkTarget : undefined;
  const present = lexists(destAbs);
  const current =
    present && lstatSync(destAbs).isSymbolicLink() ? readlinkSync(destAbs) : present ? "(file)" : undefined;

  const writeLink = () => {
    if (dryRun) return;
    if (lexists(destAbs)) unlinkSync(destAbs);
    symlinkSync(next, destAbs);
  };

  if (base === undefined) {
    if (!present) {
      writeLink();
      result.added.push(relPath);
    } else {
      result.untracked.push(relPath);
    }
    return;
  }

  if (!present) {
    result.deletedSkipped.push(relPath);
    return;
  }

  if (current === base) {
    if (next !== base) {
      writeLink();
      result.updated.push(relPath);
    } else {
      result.unchanged.push(relPath);
    }
    return;
  }

  if (next === base) {
    result.keptUserModified.push(relPath);
  } else {
    // A symlink has no mergeable body, so surface the conflict without a .new.
    result.conflicts.push(relPath);
  }
}

export async function update(argv: ScaffoldArgs): Promise<UpdateResult> {
  const runtime = checkNodeRuntime();
  if (!runtime.ok) throw new Error(runtime.message);

  const target = argv.target || process.cwd();
  const scaffoldDir = join(target, ".agentic-scaffold");
  if (!existsSync(scaffoldDir)) {
    throw new Error(
      `No .agentic-scaffold/ found in ${target}. Run \`agentic-scaffold\` to create one before updating.`,
    );
  }

  const oldManifest = readManifest(scaffoldDir);
  if (!oldManifest || oldManifest.version < 2) {
    throw new Error(
      "update requires a v2 scaffold manifest (.agentic-scaffold/.manifest.json). " +
        "Re-run `agentic-scaffold --force` to regenerate it, then update.",
    );
  }

  const dryRun = argv.dryRun ?? false;
  const quiet = argv.quiet ?? false;
  const json = argv.json ?? false;

  // Resolve config against the REAL project so detection matches the installed
  // scaffold, then render the new canonical version into a throwaway temp dir.
  const config = resolveConfig({ ...argv, interactive: false, dryRun: false, force: true });
  const tmpRoot = mkdtempSync(join(tmpdir(), "agentic-scaffold-update-"));

  let result: UpdateResult;
  let newManifest: Manifest;
  try {
    const renderConfig: ScaffoldConfig = {
      ...config,
      target: tmpRoot,
      scaffoldDir: join(tmpRoot, ".agentic-scaffold"),
      force: true,
      quiet: true,
      dryRun: false,
    };
    const hbData = buildHandlebars(renderConfig, PKG.version);
    const { writtenEntries } = await renderScaffoldInto(renderConfig, hbData);
    newManifest = generateManifest(renderConfig.scaffoldDir, PKG.version, { target: tmpRoot, writtenEntries });

    result = {
      added: [],
      updated: [],
      unchanged: [],
      conflicts: [],
      keptUserModified: [],
      untracked: [],
      deletedSkipped: [],
      obsolete: [],
      reindexRequired: false,
    };
    const oldByPath = new Map(oldManifest.files.map((e) => [e.path, e] as const));
    const newPaths = new Set(newManifest.files.map((e) => e.path));

    for (const entry of newManifest.files) {
      const srcAbs = join(tmpRoot, entry.path);
      const destAbs = join(target, entry.path);
      const oldEntry = oldByPath.get(entry.path);
      if (isSymlinkEntry(entry)) {
        reconcileSymlink(entry, oldEntry, destAbs, entry.path, dryRun, result);
      } else {
        reconcileFile(entry, oldEntry, srcAbs, destAbs, entry.path, dryRun, result);
      }
    }

    // Templates dropped upstream: left in place, reported.
    for (const old of oldManifest.files) {
      if (!newPaths.has(old.path)) result.obsolete.push(old.path);
    }

    // The memory scripts own the .memory/index.json format. If update changed
    // any of them and the user already built an index, that index is now stale
    // (e.g. the v1->v2 BM25 bump): advise a reindex rather than silently
    // leaving search to fail on the next run.
    result.reindexRequired =
      existsSync(join(target, ".memory", "index.json")) &&
      [...result.added, ...result.updated, ...result.conflicts].some((p) => /scripts[\\/]memory_/.test(p));

    // Rebase the manifest to the new canonical baseline (see docs/plans/11).
    if (!dryRun) {
      writeFileSync(join(scaffoldDir, ".manifest.json"), `${JSON.stringify(newManifest, null, 2)}\n`, "utf-8");
    }
  } finally {
    rmSync(tmpRoot, { recursive: true, force: true });
  }

  report(result, oldManifest.scaffoldVersion, dryRun, json, quiet);
  return result;
}

function report(result: UpdateResult, fromVersion: string, dryRun: boolean, json: boolean, quiet: boolean): void {
  if (json) {
    process.stdout.write(`${JSON.stringify(result)}\n`);
    return;
  }
  if (quiet) return;

  const head = dryRun
    ? "Update preview (no files written)"
    : `Updated scaffold from v${fromVersion} to v${PKG.version}`;
  process.stdout.write(`\n ${style.bold(head)}\n`);

  const line = (label: string, items: string[], hint?: string) => {
    if (items.length === 0) return;
    process.stdout.write(`   ${label}: ${style.cyan(String(items.length))}${hint ? ` ${style.dim(hint)}` : ""}\n`);
    for (const p of items) process.stdout.write(`     ${style.dim("·")} ${p}\n`);
  };

  line(dryRun ? "Would add" : "Added", result.added);
  line(dryRun ? "Would update" : "Updated", result.updated);
  line(
    "Conflicts",
    result.conflicts,
    dryRun ? "(would keep your file, write <path>.new)" : "(kept your file; review <path>.new)",
  );
  line("Kept (your edits, template unchanged)", result.keptUserModified);
  line("Untracked (left as-is)", result.untracked);
  line("Deleted by you (not restored)", result.deletedSkipped);
  line("Obsolete (no longer scaffolded)", result.obsolete);

  const changed = result.added.length + result.updated.length;
  const status = result.conflicts.length > 0 ? "warn" : "done";
  const tail = dryRun
    ? `${changed} file${changed !== 1 ? "s" : ""} would change, ${result.conflicts.length} conflict${result.conflicts.length !== 1 ? "s" : ""}.`
    : `${changed} file${changed !== 1 ? "s" : ""} changed, ${result.conflicts.length} conflict${result.conflicts.length !== 1 ? "s" : ""}.`;
  process.stdout.write(`\n ${summaryLine(tail, status)}\n`);

  if (result.reindexRequired) {
    const msg = dryRun
      ? "Memory scripts would change — afterward re-run `node .agentic-scaffold/scripts/memory_index.mjs` to rebuild .memory/index.json (index format may differ)."
      : "Memory scripts changed — re-run `node .agentic-scaffold/scripts/memory_index.mjs` to rebuild .memory/index.json (index format may differ).";
    process.stdout.write(`\n ${summaryLine(msg, "warn")}\n`);
  }
}
