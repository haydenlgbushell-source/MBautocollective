#!/usr/bin/env bash
# Runs on Claude Stop hook — merges the current claude/* branch into main and pushes.
# Skips silently if already on main or nothing new to merge.

set -euo pipefail

CURRENT=$(git rev-parse --abbrev-ref HEAD 2>/dev/null) || exit 0

# Only act on claude/ session branches
[[ "$CURRENT" == claude/* ]] || exit 0

# Nothing ahead of main → nothing to merge
AHEAD=$(git rev-list --count "origin/main..HEAD" 2>/dev/null) || exit 0
[[ "$AHEAD" -gt 0 ]] || exit 0

echo "[merge-session] $CURRENT has $AHEAD commit(s) ahead of main — merging..."

git fetch origin main --quiet

# Abort if there would be conflicts (dry-run merge-tree check)
BASE=$(git merge-base HEAD origin/main)
if ! git merge-tree "$BASE" origin/main HEAD | grep -q "^<<<<<<" 2>/dev/null; then
  :  # no markers → safe
else
  echo "[merge-session] Conflicts detected — skipping auto-merge. Merge manually."
  exit 0
fi

# Fast-path: if main can simply fast-forward to this branch, do that
git checkout main --quiet
git pull origin main --quiet --ff-only 2>/dev/null || git pull origin main --quiet --no-rebase

git merge --no-ff "$CURRENT" -m "chore: auto-merge $CURRENT into main" --quiet

# Retry push up to 4 times with exponential backoff
for wait in 0 2 4 8 16; do
  sleep "$wait"
  if git push -u origin main --quiet; then
    echo "[merge-session] Pushed main successfully."
    break
  fi
  echo "[merge-session] Push failed, retrying in ${wait}s..."
done
