#!/usr/bin/env bash
# Post-session hook — runs after every successful coding session.
# Customize this file with project-specific session-close tasks.
#
# Available context variables:
#   projectName    = "ts-app"
#   packageManager = "npm"
#   scriptLanguage = "node"

set -euo pipefail

echo "Running post-session tasks for ts-app..."
npm run build 2>/dev/null || true
