#!/usr/bin/env bash
# Post-feature hook — runs after a feature is delivered.
# Customize this file with project-specific post-delivery tasks.
#
# Available context variables:
#   projectName    = "ts-app"
#   packageManager = "npm"
#   scriptLanguage = "node"

set -euo pipefail

echo "Running post-feature tasks for ts-app..."
npm run lint 2>/dev/null || true
