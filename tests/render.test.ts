import assert from "node:assert/strict";
import { join } from "node:path";
import { describe, it } from "node:test";
import type { HandlebarsData } from "../src/config.js";
import { renderTemplate } from "../src/templates.js";

const TEMPLATES = join(import.meta.dirname, "..", "templates");

function sampleData(overrides: Partial<HandlebarsData> = {}): HandlebarsData {
  return {
    projectName: "demo",
    projectDescription: "A demo project.",
    languages: "TypeScript, Python",
    scriptsDir: ".agentic-scaffold/scripts",
    issueTrackerName: "Linear",
    // Contains <feature>, which default Handlebars escaping would corrupt.
    issueTrackerDescription: "Local planning lives in `.scratchpad/<feature>/`.",
    issueTrackerShort: "Short records in Linear.",
    statusTable: "| Label | Meaning |",
    trackerDoc: "Linear",
    envFile: "",
    envTemplate: "",
    packageManager: "npm",
    ciProvider: "github",
    scriptLanguage: "node",
    scaffoldVersion: "0.0.0-test",
    incompleteFiles: [],
    includeScripts: true,
    includeHooks: true,
    ...overrides,
  };
}

describe("template rendering", () => {
  it("does not HTML-escape Markdown values (noEscape)", () => {
    const out = renderTemplate(join(TEMPLATES, "root", "AGENTS.md.hbs"), sampleData());
    assert.ok(out.includes("<feature>"), "expected literal <feature>");
    assert.ok(!out.includes("&lt;feature&gt;"), "value must not be HTML-escaped");
    assert.ok(!/&(lt|gt|amp|quot|#x27|#39);/.test(out), "no HTML entities should leak");
  });

  it("renders the languages variable in AI/onboarding templates", () => {
    const copilot = renderTemplate(join(TEMPLATES, "ai-config", ".copilot-instructions.md.hbs"), sampleData());
    assert.ok(copilot.includes("This project uses: TypeScript, Python."));

    const onboarding = renderTemplate(join(TEMPLATES, "onboarding", "ONBOARDING.md.hbs"), sampleData());
    assert.ok(onboarding.includes("Languages needed: TypeScript, Python."));
  });

  it("omits the languages line when none are detected", () => {
    const copilot = renderTemplate(
      join(TEMPLATES, "ai-config", ".copilot-instructions.md.hbs"),
      sampleData({ languages: "" }),
    );
    assert.ok(!copilot.includes("This project uses:"));
  });
});
