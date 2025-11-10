@echo off
echo ========================================
echo Testing Webhook Verification
echo ========================================
echo.

curl "http://localhost:3000/api/whatsapp/webhook?hub.mode=subscribe&hub.verify_token=12345&hub.challenge=TEST"

echo.
echo.
echo If you see "TEST" above, webhook verification is working!
echo.
pause







