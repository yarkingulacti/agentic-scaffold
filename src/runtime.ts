// Minimum Node major required to RUN the scaffolded artifacts: the bundled
// memory-pipeline scripts (`templates/scripts/*.mjs`) and hook helpers are ESM
// `.mjs` files. 18 is the oldest non-EOL LTS and the floor implied by the
// project's ES2022 + NodeNext build target.
export const MIN_NODE_MAJOR = 18;

export interface RuntimeCheck {
  ok: boolean;
  message?: string;
}

// Verifies the active Node runtime can run the scaffolded `.mjs` scripts. Pure
// over its input so it is unit-testable; defaults to the live runtime version.
export function checkNodeRuntime(nodeVersion: string | undefined = process.versions.node): RuntimeCheck {
  if (!nodeVersion) {
    return {
      ok: false,
      message: `A Node.js runtime is required to scaffold: the bundled memory scripts and hook helpers are .mjs files needing Node ${MIN_NODE_MAJOR}+.`,
    };
  }

  const major = Number.parseInt(nodeVersion.split(".")[0], 10);
  if (Number.isNaN(major) || major < MIN_NODE_MAJOR) {
    return {
      ok: false,
      message: `Node ${MIN_NODE_MAJOR}+ is required to run the scaffolded .mjs memory scripts and hook helpers; detected Node ${nodeVersion}. Upgrade Node and re-run.`,
    };
  }

  return { ok: true };
}
