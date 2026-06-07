#!/usr/bin/env bash
# Prepares a filtered copy of app/public for deployment, excluding files over the 25 MiB Pages limit.
# - For local deploys: run `bash deploy.sh` (uses wrangler pages deploy)
# - For Cloudflare Pages Git integration: set build command to `bash deploy.sh --ci`
#   and build output directory to `.deploy-tmp`
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

# In CI mode (Cloudflare Pages Git integration), just prepare the output directory.
# Cloudflare handles the actual deploy using the build output directory setting.
if [ "$1" = "--ci" ]; then
  echo "CI mode: output ready in $DEPLOY_DIR"
  exit 0
fi

echo "Deploying to Cloudflare Pages..."
if command -v npx.cmd &>/dev/null; then
  npx.cmd wrangler pages deploy "$DEPLOY_DIR" --project-name node-azure --commit-dirty=true
else
  npx wrangler pages deploy "$DEPLOY_DIR" --project-name node-azure --commit-dirty=true
fi

echo "Cleaning up..."
rm -rf "$DEPLOY_DIR"

echo "Done!"
