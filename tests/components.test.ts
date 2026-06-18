import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { ALWAYS_INCLUDED, COMPONENTS, type ComponentCategory, componentNamesByCategory } from "../src/components.js";

const CATEGORIES: ComponentCategory[] = ["core", "extra", "working-dir"];
const CONFLICT_POLICIES = ["skip-existing"];

describe("component registry declarations", () => {
  it("declares complete metadata for every component", () => {
    for (const c of COMPONENTS) {
      assert.ok(c.name, "component must have a name");
      assert.ok(CATEGORIES.includes(c.category), `${c.name}: invalid category ${c.category}`);
      assert.ok(["scaffold", "target"].includes(c.destBase), `${c.name}: invalid destBase ${c.destBase}`);
      assert.ok(CONFLICT_POLICIES.includes(c.conflict), `${c.name}: invalid conflict policy ${c.conflict}`);
      assert.equal(typeof c.manifested, "boolean", `${c.name}: manifested must be boolean`);
      assert.equal(typeof c.render, "function", `${c.name}: render must be a function`);
      assert.equal(typeof c.dryRun, "function", `${c.name}: dryRun must be a function`);
    }
  });

  it("has unique component names", () => {
    const names = COMPONENTS.map((c) => c.name);
    assert.equal(new Set(names).size, names.length, "component names must be unique");
  });

  it("declares an explicit conflict policy for target-root writers", () => {
    // Components that write into the project root (not .agentic-scaffold/) carry
    // the highest conflict risk; they must declare a policy explicitly.
    const targetWriters = COMPONENTS.filter((c) => c.destBase === "target");
    assert.deepEqual(
      targetWriters.map((c) => c.name).sort(),
      ["ai-config", "ci", "rtk"],
      "expected ci, ai-config, and rtk to be the only target-root writers",
    );
    for (const c of targetWriters) {
      assert.ok(c.conflict, `${c.name}: target-root writer must declare a conflict policy`);
    }
  });

  it("keeps every core component inside .agentic-scaffold/", () => {
    for (const c of COMPONENTS.filter((c) => c.category === "core")) {
      assert.equal(c.destBase, "scaffold", `core component ${c.name} must use destBase "scaffold"`);
    }
  });

  it("derives category groupings consistent with the registry", () => {
    // Guards the cross-file drift critique #8 warns about: config.ts derives its
    // include/extras/working-dir sets from these helpers.
    assert.deepEqual(componentNamesByCategory("extra").sort(), ["ai-config", "ci", "contribute", "onboarding", "rtk"]);
    assert.deepEqual(componentNamesByCategory("working-dir").sort(), ["history", "scratchpad"]);
    assert.deepEqual(componentNamesByCategory("core").sort(), ["docs", "hooks", "scripts", "skills"]);

    // ALWAYS_INCLUDED is core but excluded from the derived include sets.
    assert.equal(COMPONENTS.find((c) => c.name === ALWAYS_INCLUDED)?.category, "core");
    assert.ok(!componentNamesByCategory("core").includes(ALWAYS_INCLUDED));
  });
});
