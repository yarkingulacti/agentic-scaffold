import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { checkNodeRuntime, MIN_NODE_MAJOR } from "../src/runtime.js";

describe("checkNodeRuntime", () => {
  it("accepts a version at the minimum major", () => {
    const result = checkNodeRuntime(`${MIN_NODE_MAJOR}.0.0`);
    assert.equal(result.ok, true);
    assert.equal(result.message, undefined);
  });

  it("accepts a version above the minimum major", () => {
    assert.equal(checkNodeRuntime(`${MIN_NODE_MAJOR + 6}.11.1`).ok, true);
  });

  it("rejects a version one major below the minimum", () => {
    const result = checkNodeRuntime(`${MIN_NODE_MAJOR - 1}.20.2`);
    assert.equal(result.ok, false);
    assert.match(result.message ?? "", new RegExp(`Node ${MIN_NODE_MAJOR}\\+ is required`));
    assert.match(result.message ?? "", new RegExp(`${MIN_NODE_MAJOR - 1}\\.20\\.2`));
  });

  it("rejects a falsy/absent runtime version", () => {
    // An empty string bypasses the default param and exercises the guard for a
    // runtime where process.versions.node is unset.
    const result = checkNodeRuntime("");
    assert.equal(result.ok, false);
    assert.match(result.message ?? "", /Node\.js runtime is required/);
  });
  it("rejects an unparseable version string", () => {
    assert.equal(checkNodeRuntime("not-a-version").ok, false);
  });

  it("passes on the live runtime running the test suite", () => {
    // The repo targets ES2022/NodeNext, so the dev/test runtime is always >= min.
    assert.equal(checkNodeRuntime().ok, true);
  });
});
