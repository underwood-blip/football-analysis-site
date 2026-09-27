#!/bin/bash
set -e

SITE=/workspace/football-site
DEPLOY=/workspace

# Build
cd "$SITE"
npm run build

# Clean deploy dirs
rm -rf "$DEPLOY/assets" "$DEPLOY/data"
mkdir -p "$DEPLOY/assets" "$DEPLOY/data/history"

# index.html + hashed assets
cp "$SITE/dist/index.html" "$DEPLOY/index.html"
cp "$SITE/dist/assets/"*.js "$DEPLOY/assets/"
cp "$SITE/dist/assets/"*.css "$DEPLOY/assets/"

# Data at repo root (matches BASE_URL /football-analysis-site/ + data/...)
cp "$SITE/public/data/E0-2627.csv" "$DEPLOY/data/"
cp "$SITE/public/data/history/"*.csv "$DEPLOY/data/history/"

echo "=== Deployed ==="
ls -R "$DEPLOY/assets" "$DEPLOY/data"
