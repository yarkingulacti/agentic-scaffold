#!/usr/bin/env bash
# Post-bugfix hook — runs after a bugfix is delivered.
# Customize this file with project-specific post-fix tasks.
#
# Available context variables:
#   projectName    = "poly-app"
#   packageManager = "pnpm"
#   scriptLanguage = "node"

set -euo pipefail

echo "Running post-bugfix checks for poly-app..."
pnpm run lint 2>/dev/null || true
