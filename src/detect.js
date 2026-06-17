import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

export function detectProjectProfile(targetDir) {
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

const migrationDirs = [
  "migrations",
  "db/migrations",
  "prisma/migrations",
  "alembic",
];

function detectLanguages(targetDir) {
  const languages = [];
  if (existsSync(join(targetDir, "package.json"))) {
    try {
      const pkg = JSON.parse(readFileSync(join(targetDir, "package.json"), "utf-8"));
      if (pkg.devDependencies?.typescript || pkg.dependencies?.typescript) {
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

function detectPackageManager(targetDir) {
  if (existsSync(join(targetDir, "pnpm-lock.yaml"))) return "pnpm";
  if (existsSync(join(targetDir, "yarn.lock"))) return "yarn";
  if (existsSync(join(targetDir, "package-lock.json"))) return "npm";
  if (existsSync(join(targetDir, "poetry.lock"))) return "poetry";
  if (existsSync(join(targetDir, "Pipfile.lock"))) return "pip";
  return null;
}

function detectCIProvider(targetDir) {
  if (existsSync(join(targetDir, ".github", "workflows"))) return "github";
  if (existsSync(join(targetDir, ".gitlab-ci.yml"))) return "gitlab";
  if (existsSync(join(targetDir, ".circleci", "config.yml"))) return "circleci";
  return null;
}

function detectAITools(targetDir) {
  const tools = [];
  if (existsSync(join(targetDir, "opencode.json"))) tools.push("opencode");
  if (existsSync(join(targetDir, ".cursorrules"))) tools.push("cursor");
  if (existsSync(join(targetDir, ".copilot-instructions.md"))) tools.push("copilot");
  if (existsSync(join(targetDir, ".windsurfrules"))) tools.push("windsurf");
  if (existsSync(join(targetDir, ".clinerules"))) tools.push("cline");
  return tools;
}

function detectIssueTracker(targetDir) {
  if (existsSync(join(targetDir, ".github"))) return "github";
  return null;
}

function detectScriptLanguage(targetDir) {
  if (existsSync(join(targetDir, "package.json"))) return "node";
  if (existsSync(join(targetDir, "requirements.txt"))) return "python";
  if (existsSync(join(targetDir, "pyproject.toml"))) return "python";
  return null;
}
