#!/usr/bin/env bash
set -euo pipefail

echo "=== Setting up ts-app ==="

# Install dependencies
echo "Installing dependencies..."
npm install

# Copy env file if it exists
if [ -f .env.example ] && [ ! -f .env ]; then
  cp .env.example .env
  echo "Created .env from .env.example"
fi

echo "=== Setup complete ==="
