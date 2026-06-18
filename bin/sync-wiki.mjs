#!/usr/bin/env node
// Render docs/wiki/ page sources and publish them to the GitHub project wiki.
//
// The wiki is generated, never hand-edited: page sources live in docs/wiki/
// with a {{VERSION}} token, and a Changelog page is mirrored from CHANGELOG.md.
// This script is invoked automatically by commit-and-tag-version's `posttag`
// hook (see .versionrc.json) so every version bump refreshes the wiki, and can
// be run manually via `npm run sync-wiki`.
//
// Flags:
//   --strict   Exit non-zero on failure (default: warn and exit 0 so a release
//              is never broken by a transient wiki push failure).
//   -m, --message <msg>   Commit message (default: "docs(wiki): sync to v<version>").

import { execFileSync } from "node:child_process";
import { cpSync, mkdtempSync, readdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const WIKI_SRC = join(ROOT, "docs", "wiki");
const CHANGELOG = join(ROOT, "CHANGELOG.md");

const args = process.argv.slice(2);
const strict = args.includes("--strict");
const msgIdx = args.findIndex((a) => a === "-m" || a === "--message");
const messageArg = msgIdx !== -1 ? args[msgIdx + 1] : undefined;

function run(cmd, cmdArgs, opts = {}) {
  return execFileSync(cmd, cmdArgs, {
    encoding: "utf8",
    stdio: ["ignore", "pipe", "pipe"],
    ...opts,
  });
}

function fail(message, err) {
  const detail = err?.stderr?.toString?.() || err?.message || "";
  const lines = [
    `wiki sync skipped: ${message}`,
    detail && `  ${detail.trim().split("\n").join("\n  ")}`,
    "  Retry manually with: npm run sync-wiki",
  ].filter(Boolean);
  if (strict) {
    console.error(lines.join("\n"));
    process.exit(1);
  }
  console.warn(lines.join("\n"));
  process.exit(0);
}

// Resolve owner/repo + version from package.json.
const pkg = JSON.parse(readFileSync(join(ROOT, "package.json"), "utf8"));
const version = pkg.version;
const repoUrl = pkg.repository?.url ?? "";
const match = repoUrl.match(/github\.com[:/]([^/]+)\/(.+?)(?:\.git)?$/);
if (!match) {
  fail(`could not parse owner/repo from package.json repository.url ("${repoUrl}")`);
}
const [, owner, repo] = match;
const wikiUrl = `https://github.com/${owner}/${repo}.wiki.git`;

// Resolve the push remote. An explicit AGENTIC_WIKI_REMOTE override wins (useful
// for forks and for end-to-end testing against a local bare repo). Otherwise
// prefer an authenticated remote via the gh token so push works in CI and
// locally without depending on a configured git credential helper.
let pushUrl = process.env.AGENTIC_WIKI_REMOTE || wikiUrl;
if (!process.env.AGENTIC_WIKI_REMOTE) {
  try {
    const token = run("gh", ["auth", "token"]).trim();
    if (token) pushUrl = `https://x-access-token:${token}@github.com/${owner}/${repo}.wiki.git`;
  } catch {
    // No gh / not authed: fall back to the plain URL + git credential helper.
  }
}

const tmp = mkdtempSync(join(tmpdir(), "agentic-scaffold-wiki-"));
const git = (gitArgs, opts = {}) => run("git", ["-C", tmp, ...gitArgs], opts);

try {
  // Clone the existing wiki, or initialize a fresh repo when the wiki has never
  // had a page (pushing to *.wiki.git creates it when the wiki is enabled).
  let cloned = true;
  try {
    run("git", ["clone", "--quiet", pushUrl, tmp]);
  } catch {
    cloned = false;
    git(["init", "--quiet"]);
    git(["remote", "add", "origin", pushUrl]);
  }
  git(["checkout", "-q", "-B", "master"]);

  // Render page sources: copy verbatim, substituting the {{VERSION}} token.
  const pages = readdirSync(WIKI_SRC).filter((f) => f.endsWith(".md"));
  if (pages.length === 0) fail(`no page sources found in ${WIKI_SRC}`);
  for (const page of pages) {
    const rendered = readFileSync(join(WIKI_SRC, page), "utf8").replaceAll("{{VERSION}}", version);
    writeFileSync(join(tmp, page), rendered);
  }
  // Mirror the changelog as a wiki page.
  cpSync(CHANGELOG, join(tmp, "Changelog.md"));

  git(["add", "-A"]);
  // Detect staged changes without breaking the surrounding flow.
  let hasChanges = true;
  try {
    git(["diff", "--cached", "--quiet"]);
    hasChanges = false;
  } catch {
    hasChanges = true;
  }

  if (!hasChanges) {
    console.log(`wiki already up to date at v${version} (${wikiUrl})`);
  } else {
    const message = messageArg ?? `docs(wiki): sync to v${version}`;
    git([
      "-c",
      "user.name=agentic-scaffold wiki sync",
      "-c",
      "user.email=wiki-sync@users.noreply.github.com",
      "commit",
      "--quiet",
      "-m",
      message,
    ]);
    git(["push", "--quiet", "origin", "HEAD:master"]);
    console.log(`wiki ${cloned ? "updated" : "created"} at v${version}: https://github.com/${owner}/${repo}/wiki`);
  }
} catch (err) {
  fail("git operation against the wiki repository failed", err);
} finally {
  rmSync(tmp, { recursive: true, force: true });
}
