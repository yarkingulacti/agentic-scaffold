import assert from "node:assert/strict";
import { cpSync, existsSync, mkdirSync, mkdtempSync, readdirSync, readFileSync, rmSync, statSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { describe, it } from "node:test";
import type { ScaffoldConfig } from "../src/config.js";
import { buildHandlebars } from "../src/config.js";
import { renderDir } from "../src/templates.js";

const TEMPLATES = join(import.meta.dirname, "..", "templates");
const FIXTURES = join(import.meta.dirname, "fixtures");
const FIXED_VERSION = "0.0.0-test";
const UPDATE = process.env.UPDATE_GOLDEN === "1";

// Components whose templates contain .hbs files (rendered, not static-copied).
// skills/history/scratchpad are verbatim copies with no .hbs and are excluded.
const RENDERED_COMPONENTS = ["root", "docs", "scripts", "hooks", "contribute", "ai-config", "onboarding"];

interface Profile {
  name: string;
  config: Partial<ScaffoldConfig>;
  components: string[];
  ciProviderDir?: string; // templates/ci/<dir>, rendered into expected/ci
}

function makeConfig(overrides: Partial<ScaffoldConfig>): ScaffoldConfig {
  return {
    target: "/tmp/golden",
    scaffoldDir: "/tmp/golden/.agentic-scaffold",
    projectName: "demo",
    projectDescription: "A demo project.",
    languages: [],
    issueTracker: "linear",
    packageManager: null,
    ciProvider: null,
    aiTools: [],
    scriptLanguage: "node",
    force: true,
    interactive: false,
    dryRun: false,
    json: false,
    include: new Set<string>(),
    ...overrides,
  };
}

const PROFILES: Profile[] = [
  {
    name: "ts-github",
    config: {
      projectName: "ts-app",
      languages: ["TypeScript"],
      packageManager: "npm",
      ciProvider: "github",
      issueTracker: "github",
      include: new Set(["docs", "scripts", "hooks", "ci", "contribute", "ai-config", "onboarding"]),
    },
    components: ["root", "docs", "scripts", "hooks", "contribute", "ai-config", "onboarding"],
    ciProviderDir: "github",
  },
  {
    name: "python-no-ci",
    config: {
      projectName: "py-app",
      languages: ["Python"],
      packageManager: null,
      ciProvider: null,
      issueTracker: "linear",
      include: new Set(["docs", "scripts", "hooks"]),
    },
    components: ["root", "docs", "scripts", "hooks"],
  },
  {
    name: "multilang-extras",
    config: {
      projectName: "poly-app",
      languages: ["TypeScript", "Go", "Python"],
      packageManager: "pnpm",
      ciProvider: "gitlab",
      issueTracker: "linear",
      include: new Set(["docs", "scripts", "hooks", "ci", "onboarding"]),
    },
    components: ["root", "docs", "scripts", "hooks", "onboarding"],
    ciProviderDir: "gitlab",
  },
];

function tempDir() {
  return mkdtempSync(join(tmpdir(), "golden-"));
}

function readTree(dir: string): Map<string, string> {
  const tree = new Map<string, string>();
  if (!existsSync(dir)) return tree;
  const walk = (base: string, rel: string) => {
    for (const name of readdirSync(base).sort()) {
      const full = join(base, name);
      const childRel = rel ? `${rel}/${name}` : name;
      if (statSync(full).isDirectory()) walk(full, childRel);
      else tree.set(childRel, readFileSync(full, "utf-8"));
    }
  };
  walk(dir, "");
  return tree;
}

async function renderProfile(profile: Profile, dest: string): Promise<void> {
  const config = makeConfig(profile.config);
  const hbData = buildHandlebars(config, FIXED_VERSION);
  for (const comp of profile.components) {
    await renderDir(join(TEMPLATES, comp), join(dest, comp), hbData, { force: true });
  }
  if (profile.ciProviderDir) {
    await renderDir(join(TEMPLATES, "ci", profile.ciProviderDir), join(dest, "ci"), hbData, { force: true });
  }
}

describe("golden template output", () => {
  for (const profile of PROFILES) {
    it(`matches committed fixtures for ${profile.name}`, async () => {
      const out = tempDir();
      try {
        await renderProfile(profile, out);
        const expectedDir = join(FIXTURES, profile.name, "expected");

        if (UPDATE) {
          rmSync(expectedDir, { recursive: true, force: true });
          mkdirSync(expectedDir, { recursive: true });
          cpSync(out, expectedDir, { recursive: true });
          return;
        }

        const actual = readTree(out);
        const expected = readTree(expectedDir);
        assert.ok(expected.size > 0, `no fixtures for ${profile.name}; run UPDATE_GOLDEN=1 npm test`);
        assert.deepEqual(
          [...actual.keys()].sort(),
          [...expected.keys()].sort(),
          `file set differs for ${profile.name}`,
        );
        for (const [path, content] of actual) {
          assert.equal(content, expected.get(path), `content differs: ${profile.name}/${path}`);
        }
      } finally {
        rmSync(out, { recursive: true, force: true });
      }
    });
  }

  it("every rendered template dir is covered by a profile", () => {
    const covered = new Set<string>();
    for (const profile of PROFILES) {
      for (const comp of profile.components) covered.add(comp);
    }
    for (const comp of RENDERED_COMPONENTS) {
      assert.ok(covered.has(comp), `template dir "${comp}" has .hbs files but no golden profile renders it`);
    }
    // Both shipped CI providers must be exercised.
    const ciDirs = new Set(PROFILES.map((p) => p.ciProviderDir).filter(Boolean));
    for (const provider of readdirSync(join(TEMPLATES, "ci"))) {
      assert.ok(ciDirs.has(provider), `CI provider "${provider}" is not covered by a golden profile`);
    }
  });
});
