@echo off
setlocal

echo Building dist...
if exist dist rmdir /s /q dist

robocopy app\public dist /E /XF Electric_Power_Transmission_Lines.zip zip-code-level-2017-topojson.json cb_2018_us_zcta510_500k.json > nul
if %errorlevel% geq 8 (
  echo ERROR: Build failed
  exit /b 1
)

echo Generating config.js...
echo window.AZURE_MAPS_KEY = "%AZURE_MAPS_KEY%"; > dist\config.js

echo Deploying to Cloudflare Pages...
npx wrangler pages deploy dist
if %errorlevel% neq 0 (
  echo ERROR: Deploy failed
  exit /b 1
)

echo Done!
