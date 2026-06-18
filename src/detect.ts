import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

export interface ProjectProfile {
  projectName: string;
  languages: string[];
  packageManager: string | null;
  ciProvider: string | null;
  aiTools: string[];
  issueTracker: string | null;
  scriptLanguage: string | null;
  hasDockerfile: boolean;
  hasEnvExample: boolean;
  hasContributing: boolean;
  hasChangelog: boolean;
  hasApiDocs: boolean;
  hasMigrations: boolean;
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
    hasDockerfile: existsSync(join(targetDir, "Dockerfile")),
    hasEnvExample: existsSync(join(targetDir, ".env.example")),
    hasContributing: existsSync(join(targetDir, "CONTRIBUTING.md")),
    hasChangelog: existsSync(join(targetDir, "CHANGELOG.md")),
    hasApiDocs: existsSync(join(targetDir, "docs", "api")),
    hasMigrations: migrationDirs.some((dir) => existsSync(join(targetDir, dir))),
  };
}

const migrationDirs = ["migrations", "db/migrations", "prisma/migrations", "alembic"];

function detectLanguages(targetDir: string): string[] {
  const languages: string[] = [];
  if (existsSync(join(targetDir, "package.json"))) {
    try {
      const pkg: Record<string, unknown> = JSON.parse(readFileSync(join(targetDir, "package.json"), "utf-8"));
      const deps = pkg.devDependencies as Record<string, string> | undefined;
      const prodDeps = pkg.dependencies as Record<string, string> | undefined;
      if (deps?.typescript || prodDeps?.typescript) {
        languages.push("ts");
      } else {
        languages.push("js");
      }
    } catch {
      languages.push("js");
    }
  }
  if (existsSync(join(targetDir, "requirements.txt"))) {
    languages.push("python");
  }
  if (existsSync(join(targetDir, "pyproject.toml"))) {
    languages.push("python");
  }
  if (existsSync(join(targetDir, "go.mod"))) {
    languages.push("go");
  }
  if (existsSync(join(targetDir, "Cargo.toml"))) {
    languages.push("rust");
  }
  return languages;
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
  if (existsSync(join(targetDir, "requirements.txt"))) return "python";
  if (existsSync(join(targetDir, "pyproject.toml"))) return "python";
  return null;
}
