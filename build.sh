#!/usr/bin/env bash
# Copies app/public to dist, excluding files over the 25 MiB Cloudflare limit,
# and generates dist/config.js with the Azure Maps key from the environment.
set -e

echo "Building dist..."
rm -rf dist
cp -r app/public dist

rm -f dist/data/shp/Electric_Power_Transmission_Lines.zip
rm -f dist/data/topojson/zip-code-level-2017-topojson.json
rm -f dist/data/topojson/cb_2018_us_zcta510_500k.json

# Generate config.js from environment variable
echo "window.AZURE_MAPS_KEY = \"${AZURE_MAPS_KEY}\";" > dist/config.js

echo "Build complete."
