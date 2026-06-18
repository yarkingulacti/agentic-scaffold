#!/usr/bin/env bash
# Post-session hook — runs after every successful coding session.
# Customize this file with project-specific session-close tasks.
#
# Available context variables:
#   projectName    = "poly-app"
#   packageManager = "pnpm"
#   scriptLanguage = "node"

set -euo pipefail

echo "Running post-session tasks for poly-app..."
pnpm run build 2>/dev/null || true
