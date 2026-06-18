#!/usr/bin/env bash
# Sync CONTEXT.md from the Obsidian vault (the source of truth) and regenerate
# the section index. CONTEXT.md is a VERBATIM MIRROR — never hand-edit it.
# Repo-local overlays that must survive a sync live elsewhere:
#   - docs/context/glossary.md   (ubiquitous language)
#   - docs/context/INDEX.md      (regenerated below)
#   - docs/agents/*              (this repo's paths/workflow)
#
# Usage: scripts/sync-context.sh
set -euo pipefail

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
VAULT_CONTEXT="${AGENTIC_VAULT_CONTEXT:-$HOME/Documents/Obsidian Vault/CONTEXT.md}"
DEST="$REPO_ROOT/CONTEXT.md"
INDEX="$REPO_ROOT/docs/context/INDEX.md"

if [[ ! -f "$VAULT_CONTEXT" ]]; then
  echo "error: vault CONTEXT.md not found at: $VAULT_CONTEXT" >&2
  echo "set AGENTIC_VAULT_CONTEXT to override the path." >&2
  exit 1
fi

cp "$VAULT_CONTEXT" "$DEST"
LINES="$(wc -l < "$DEST" | tr -d ' ')"
echo "synced CONTEXT.md ($LINES lines) from vault"

# Regenerate the full §->line map inside INDEX.md, between the markers.
MAP="$(grep -nE '^# [0-9]+\.' "$DEST" \
  | sed -E 's/^([0-9]+):# ([0-9]+)\. (.*)$/\2\t\3\t\1/' \
  | awk -F'\t' '{ printf "§%-3s %s ", $1, $2; n=70-length($2); for(i=0;i<n;i++)printf"."; printf" %s\n", $3 }')"

echo "regenerated section map ($(echo "$MAP" | wc -l | tr -d ' ') sections)"
echo
echo "NOTE: paste the map below into the \`\`\`text block in $INDEX,"
echo "and update the 'Last generated' line to today / $LINES lines."
echo "----------------------------------------------------------------"
echo "$MAP"
