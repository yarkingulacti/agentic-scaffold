#!/usr/bin/env bash
# Post-bugfix hook — runs after a bugfix is delivered.
# Customize this file with project-specific post-fix tasks.
#
# Available context variables:
#   projectName    = "py-app"
#   packageManager = ""
#   scriptLanguage = "node"

set -euo pipefail

echo "Running post-bugfix checks for py-app..."
