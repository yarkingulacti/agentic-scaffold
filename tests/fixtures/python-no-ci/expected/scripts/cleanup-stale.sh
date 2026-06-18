#!/usr/bin/env bash
# Clean up stale scratchpad entries and old history files.
# Usage: ./scripts/cleanup-stale.sh [--dry-run] [--days N]

set -euo pipefail

DRY_RUN=false
DAYS=30

while [[ $# -gt 0 ]]; do
  case "$1" in
    --dry-run) DRY_RUN=true; shift ;;
    --days) DAYS="$2"; shift 2 ;;
    *) echo "Unknown option: $1"; exit 1 ;;
  esac
done

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
HISTORY_DIR="$ROOT/.agentic-scaffold/.history"
SCRATCHPAD_DIR="$ROOT/.agentic-scaffold/.scratchpad"

echo "=== Stale cleanup ==="
echo "Scratchpad: $SCRATCHPAD_DIR"
echo "History:    $HISTORY_DIR"
echo "Threshold:  $DAYS days"
echo "Dry run:    $DRY_RUN"
echo

# Find old scratchpad entries (directories with no activity)
if [ -d "$SCRATCHPAD_DIR" ]; then
  find "$SCRATCHPAD_DIR" -maxdepth 2 -type d -mtime +"$DAYS" | while read -r dir; do
    if [ "$dir" != "$SCRATCHPAD_DIR" ]; then
      if $DRY_RUN; then
        echo "[dry-run] Would remove: $dir"
      else
        rm -rf "$dir"
        echo "Removed: $dir"
      fi
    fi
  done
fi

# Find old history files (dated directories)
if [ -d "$HISTORY_DIR" ]; then
  find "$HISTORY_DIR" -maxdepth 2 -type d -mtime +"$DAYS" | while read -r dir; do
    if [ "$dir" != "$HISTORY_DIR" ]; then
      if $DRY_RUN; then
        echo "[dry-run] Would remove: $dir"
      else
        rm -rf "$dir"
        echo "Removed: $dir"
      fi
    fi
  done
fi

echo
echo "Done."
