@echo off
echo ========================================
echo Testing Render Deployment
echo ========================================
echo.

set RENDER_URL=https://whatsapp-dashboard-encw.onrender.com

echo [1/4] Testing Health Check...
curl %RENDER_URL%/health
echo.
echo.

echo [2/4] Testing Root Endpoint...
curl %RENDER_URL%/
echo.
echo.

echo [3/4] Testing Webhook Verification...
curl "%RENDER_URL%/api/whatsapp/webhook?hub.mode=subscribe&hub.verify_token=12345&hub.challenge=TEST"
echo.
echo.

echo [4/4] Testing WhatsApp Service Config...
curl %RENDER_URL%/api/whatsapp/config
echo.
echo.

echo ========================================
echo Testing Complete!
echo ========================================
echo.
pause




