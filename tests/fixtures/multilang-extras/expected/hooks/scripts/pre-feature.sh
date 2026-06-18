#!/usr/bin/env bash
# Pre-feature hook — runs before feature implementation begins.
# Customize this file with project-specific pre-flight checks.
#
# Available context variables:
#   projectName    = "poly-app"
#   packageManager = "pnpm"
#   scriptLanguage = "node"

set -euo pipefail

echo "Running pre-feature checks for poly-app..."
echo "  Package manager: pnpm"
