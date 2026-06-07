#!/usr/bin/env bash
# Deploys app/public to Cloudflare Pages, skipping files over the 25 MiB limit.
set -e

SRC="app/public"
DEPLOY_DIR=".deploy-tmp"

EXCLUDES=(
  "data/geojson/parcels.json"
  "data/geojson/address.json"
  "data/shp/Electric_Power_Transmission_Lines.zip"
  "data/topojson/zip-code-level-2017-topojson.json"
  "data/topojson/cb_2018_us_zcta510_500k.json"
)

echo "Preparing deploy directory..."
rm -rf "$DEPLOY_DIR"
cp -r "$SRC" "$DEPLOY_DIR"

for f in "${EXCLUDES[@]}"; do
  target="$DEPLOY_DIR/$f"
  if [ -f "$target" ]; then
    rm "$target"
    echo "  Excluded: $f"
  fi
done

echo "Deploying to Cloudflare Pages..."
npx wrangler pages deploy "$DEPLOY_DIR" --project-name node-azure --commit-dirty=true

echo "Cleaning up..."
rm -rf "$DEPLOY_DIR"

echo "Done!"
