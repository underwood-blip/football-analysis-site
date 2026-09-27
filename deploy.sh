#!/bin/bash
set -e

SITE=/workspace/football-site
DEPLOY=/workspace

# Build
cd "$SITE"
npm run build

# Deploy dirs (non-destructive: overwrite in place, keep old artifacts)
mkdir -p "$DEPLOY/assets" "$DEPLOY/data/history"

# index.html + hashed assets
cp -f "$SITE/dist/index.html" "$DEPLOY/index.html"
cp -f "$SITE/dist/assets/"*.js "$DEPLOY/assets/"
cp -f "$SITE/dist/assets/"*.css "$DEPLOY/assets/"

# Data at repo root (matches BASE_URL /football-analysis-site/ + data/...)
cp -f "$SITE/public/data/E0-2627.csv" "$DEPLOY/data/"
cp -f "$SITE/public/data/history/"*.csv "$DEPLOY/data/history/"

echo "=== Deployed ==="
ls -R "$DEPLOY/assets" "$DEPLOY/data"
