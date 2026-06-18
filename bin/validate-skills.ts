#!/usr/bin/env node
import { existsSync, readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";

interface ValidationError {
  skill: string;
  field: string;
  message: string;
}

const SKILLS_DIR = join(import.meta.dirname, "..", "templates", "skills");

const SCHEMA: Record<string, { required?: boolean; type: string; pattern?: string }> = {
  name: { required: true, type: "string", pattern: "^[a-z][a-z0-9-]*$" },
  description: { required: true, type: "string" },
};

function parseFrontmatter(content: string): Record<string, string> | null {
  const lines = content.split("\n");
  if (lines[0]?.trim() !== "---") return null;

  const end = lines.indexOf("---", 1);
  if (end === -1) return null;

  const fm: Record<string, string> = {};
  const fmLines = lines.slice(1, end);
  let currentKey: string | null = null;
  let currentValue: string[] = [];

  for (const line of fmLines) {
    const match = line.match(/^(\w[\w-]*):\s*(.*)$/);
    if (match) {
      if (currentKey) {
        fm[currentKey] = currentValue.join("\n").trim();
      }
      currentKey = match[1];
      const val = match[2].trim();
      if (val === ">") {
        currentValue = [];
      } else {
        currentValue = [val];
      }
    } else if (currentKey && line.startsWith("  ")) {
      currentValue.push(line.trim());
    } else if (currentKey && line.startsWith("\t")) {
      currentValue.push(line.trim());
    }
  }
  if (currentKey) {
    fm[currentKey] = currentValue.join("\n").trim();
  }
  return Object.keys(fm).length > 0 ? fm : null;
}

function validateSkill(skillDir: string, skillName: string): ValidationError[] {
  const errors: ValidationError[] = [];
  const skillPath = join(skillDir, skillName, "SKILL.md");

  if (!existsSync(skillPath)) {
    errors.push({ skill: skillName, field: "file", message: "SKILL.md not found" });
    return errors;
  }

  const content = readFileSync(skillPath, "utf-8");
  const fm = parseFrontmatter(content);

  if (!fm) {
    errors.push({ skill: skillName, field: "frontmatter", message: "No YAML frontmatter found" });
    return errors;
  }

  for (const [field, rule] of Object.entries(SCHEMA)) {
    if (rule.required && !fm[field]) {
      errors.push({ skill: skillName, field, message: `Required field "${field}" is missing` });
      continue;
    }
    if (fm[field] === undefined) continue;
    if (rule.type === "string" && typeof fm[field] !== "string") {
      errors.push({ skill: skillName, field, message: `Field "${field}" must be a string` });
    }
    if (rule.pattern && fm[field]) {
      const re = new RegExp(rule.pattern);
      if (!re.test(fm[field])) {
        errors.push({
          skill: skillName,
          field,
          message: `Field "${field}" does not match pattern ${rule.pattern}: "${fm[field]}"`,
        });
      }
    }
  }

  return errors;
}

function main(): void {
  if (!existsSync(SKILLS_DIR)) {
    console.log("Skills directory not found");
    process.exit(0);
  }

  const entries = readdirSync(SKILLS_DIR, { withFileTypes: true });
  const skills = entries
    .filter((e) => e.isDirectory())
    .map((e) => e.name)
    .sort();

  const allErrors: ValidationError[] = [];
  let hasFrontmatter = 0;
  let noFrontmatter = 0;

  for (const skill of skills) {
    const errors = validateSkill(SKILLS_DIR, skill);
    if (errors.length > 0) {
      const isMissingFrontmatter = errors.some((e) => e.field === "frontmatter");
      if (isMissingFrontmatter) {
        noFrontmatter++;
      } else {
        allErrors.push(...errors);
      }
    } else {
      hasFrontmatter++;
    }
  }

  if (allErrors.length > 0) {
    console.error(`Skill frontmatter validation errors:`);
    for (const err of allErrors) {
      console.error(`  ${err.skill}: ${err.field} — ${err.message}`);
    }
    console.log(
      `\n${skills.length} skills: ${hasFrontmatter} with valid frontmatter, ${noFrontmatter} without frontmatter, ${allErrors.length} errors`,
    );
    process.exit(1);
  }

  console.log(
    `${skills.length} skills validated: ${hasFrontmatter} with frontmatter, ${noFrontmatter} without frontmatter. All OK.`,
  );
}

main();
