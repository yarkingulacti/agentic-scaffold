#!/usr/bin/env bash
# Post-bugfix hook — runs after a bugfix is delivered.
# Customize this file with project-specific post-fix tasks.
#
# Available context variables:
#   projectName    = "ts-app"
#   packageManager = "npm"
#   scriptLanguage = "node"

set -euo pipefail

echo "Running post-bugfix checks for ts-app..."
npm run lint 2>/dev/null || true
