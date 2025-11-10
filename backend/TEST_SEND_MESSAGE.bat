@echo off
echo ========================================
echo Testing Send WhatsApp Message
echo ========================================
echo.

curl -X POST http://localhost:3000/api/whatsapp/send ^
  -H "Content-Type: application/json" ^
  -d "{\"phoneNumber\": \"967773812563\", \"message\": \"رسالة اختبار من النظام - سالم سعيد\", \"type\": \"text\"}"

echo.
echo.
pause







