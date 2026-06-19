import { type Dirent, existsSync, readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";

export interface ProjectProfile {
  projectName: string;
  languages: string[];
  packageManager: string | null;
  ciProvider: string | null;
  aiTools: string[];
  issueTracker: string | null;
  scriptLanguage: string | null;
}

export function detectProjectProfile(targetDir: string): ProjectProfile {
  const projectName = targetDir.split("/").filter(Boolean).pop() || "project";

  return {
    projectName,
    languages: detectLanguages(targetDir),
    packageManager: detectPackageManager(targetDir),
    ciProvider: detectCIProvider(targetDir),
    aiTools: detectAITools(targetDir),
    issueTracker: detectIssueTracker(targetDir),
    scriptLanguage: detectScriptLanguage(targetDir),
  };
}

// Directories never worth scanning for language markers: dependency caches,
// build output, and VCS metadata. Keeps monorepo scans fast and noise-free.
const IGNORED_DIRS = new Set([
  "node_modules",
  "dist",
  "build",
  "out",
  "target",
  "vendor",
  "venv",
  "__pycache__",
  "Pods",
  "bin",
  "obj",
  "coverage",
]);

// How deep to walk for language markers. Deep enough for conventional monorepo
// layouts (apps/<name>, packages/<name>, platform dirs) without walking forever.
const MAX_SCAN_DEPTH = 4;

// Exact marker filenames mapped to the language/ecosystem they imply.
const FILE_MARKERS: Record<string, string> = {
  "requirements.txt": "python",
  "pyproject.toml": "python",
  Pipfile: "python",
  "setup.py": "python",
  "go.mod": "go",
  "Cargo.toml": "rust",
  "CMakeLists.txt": "cpp",
  "meson.build": "cpp",
  "vcpkg.json": "cpp",
  "conanfile.txt": "cpp",
  "conanfile.py": "cpp",
  "project.godot": "godot",
  "Package.swift": "swift",
  Podfile: "swift",
  "build.gradle.kts": "kotlin",
  "settings.gradle.kts": "kotlin",
  "build.gradle": "java",
  "settings.gradle": "java",
  "pom.xml": "java",
  "pubspec.yaml": "dart",
};

// Name suffixes (files or directories) mapped to the language they imply.
const SUFFIX_MARKERS: [string, string][] = [
  [".xcodeproj", "swift"],
  [".xcworkspace", "swift"],
  [".gdextension", "godot"],
];

// Canonical output order so detection is deterministic regardless of walk order.
const LANGUAGE_ORDER = ["ts", "js", "python", "go", "rust", "cpp", "godot", "swift", "kotlin", "java", "dart"];

function detectLanguages(targetDir: string): string[] {
  const found = new Set<string>();
  scanForLanguages(targetDir, 0, found);
  // Keep any detected languages outside the canonical list (none today) appended
  // after the ordered ones rather than dropped.
  const ordered = LANGUAGE_ORDER.filter((lang) => found.has(lang));
  for (const lang of found) {
    if (!LANGUAGE_ORDER.includes(lang)) ordered.push(lang);
  }
  return ordered;
}

function readEntries(dir: string): Dirent[] {
  try {
    return readdirSync(dir, { withFileTypes: true });
  } catch {
    return [];
  }
}

function scanForLanguages(dir: string, depth: number, found: Set<string>): void {
  for (const entry of readEntries(dir)) {
    const { name } = entry;
    addSuffixMarkers(name, found);
    if (entry.isDirectory()) {
      if (depth < MAX_SCAN_DEPTH && !IGNORED_DIRS.has(name) && !name.startsWith(".")) {
        scanForLanguages(join(dir, name), depth + 1, found);
      }
      continue;
    }
    const marker = FILE_MARKERS[name];
    if (marker) found.add(marker);
    if (name === "package.json") found.add(detectJsFlavor(join(dir, name)));
  }
}

function addSuffixMarkers(name: string, found: Set<string>): void {
  for (const [suffix, lang] of SUFFIX_MARKERS) {
    if (name.endsWith(suffix)) found.add(lang);
  }
}

// TypeScript when a `typescript` dependency is declared, otherwise plain JS.
function detectJsFlavor(packageJsonPath: string): string {
  try {
    const pkg: Record<string, unknown> = JSON.parse(readFileSync(packageJsonPath, "utf-8"));
    const deps = pkg.devDependencies as Record<string, string> | undefined;
    const prodDeps = pkg.dependencies as Record<string, string> | undefined;
    return deps?.typescript || prodDeps?.typescript ? "ts" : "js";
  } catch {
    return "js";
  }
}

function detectPackageManager(targetDir: string): string | null {
  if (existsSync(join(targetDir, "pnpm-lock.yaml"))) return "pnpm";
  if (existsSync(join(targetDir, "yarn.lock"))) return "yarn";
  if (existsSync(join(targetDir, "package-lock.json"))) return "npm";
  if (existsSync(join(targetDir, "poetry.lock"))) return "poetry";
  if (existsSync(join(targetDir, "Pipfile.lock"))) return "pip";
  return null;
}

function detectCIProvider(targetDir: string): string | null {
  if (existsSync(join(targetDir, ".github", "workflows"))) return "github";
  if (existsSync(join(targetDir, ".gitlab-ci.yml"))) return "gitlab";
  if (existsSync(join(targetDir, ".circleci", "config.yml"))) return "circleci";
  return null;
}

function detectAITools(targetDir: string): string[] {
  const tools: string[] = [];
  if (existsSync(join(targetDir, "opencode.json"))) tools.push("opencode");
  if (existsSync(join(targetDir, ".cursorrules"))) tools.push("cursor");
  if (existsSync(join(targetDir, ".copilot-instructions.md"))) tools.push("copilot");
  if (existsSync(join(targetDir, ".agents", "skills")) || existsSync(join(targetDir, ".codex"))) tools.push("codex");
  if (existsSync(join(targetDir, ".claude"))) tools.push("claude");
  if (existsSync(join(targetDir, ".gemini")) || existsSync(join(targetDir, "GEMINI.md"))) tools.push("gemini");
  if (existsSync(join(targetDir, ".deepcode"))) tools.push("deepcode");
  if (existsSync(join(targetDir, ".grok"))) tools.push("grok");
  if (existsSync(join(targetDir, ".windsurfrules"))) tools.push("windsurf");
  if (existsSync(join(targetDir, ".clinerules"))) tools.push("cline");
  return tools;
}

function detectIssueTracker(targetDir: string): string | null {
  if (existsSync(join(targetDir, ".github"))) return "github";
  return null;
}

function detectScriptLanguage(targetDir: string): string | null {
  if (existsSync(join(targetDir, "package.json"))) return "node";
  return null;
}
