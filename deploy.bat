@echo off
setlocal

echo Preparing deploy directory...
if exist .deploy-tmp rmdir /s /q .deploy-tmp

robocopy app\public .deploy-tmp /E /XF parcels.json address.json Electric_Power_Transmission_Lines.zip zip-code-level-2017-topojson.json cb_2018_us_zcta510_500k.json > nul
if %errorlevel% geq 8 (
  echo ERROR: robocopy failed
  exit /b 1
)

echo Deploying to Cloudflare Workers...
npx wrangler deploy --assets .deploy-tmp
if %errorlevel% neq 0 (
  echo ERROR: Deploy failed
  rmdir /s /q .deploy-tmp
  exit /b 1
)

echo Cleaning up...
rmdir /s /q .deploy-tmp

echo Done!
