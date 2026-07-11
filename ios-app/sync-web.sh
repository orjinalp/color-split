#!/bin/bash
# Copy the canonical web game (docs/) into the iOS app bundle folder.
# Run this after editing game.js / index.html / style.css so the native
# app ships the latest version.
set -euo pipefail
cd "$(dirname "$0")"
ROOT="../docs"
rm -rf Web
mkdir -p Web
cp "$ROOT/index.html" "$ROOT/game.js" "$ROOT/menu.js" "$ROOT/leaderboard.js" \
   "$ROOT/style.css" "$ROOT/site.webmanifest" "$ROOT/favicon.ico" Web/
cp -R "$ROOT/icons" Web/icons
echo "✅ Web/ synced from docs/."
