#!/usr/bin/env bash
# Post-feature hook — runs after a feature is delivered.
# Customize this file with project-specific post-delivery tasks.
#
# Available context variables:
#   projectName    = "py-app"
#   packageManager = ""
#   scriptLanguage = "node"

set -euo pipefail

echo "Running post-feature tasks for py-app..."
