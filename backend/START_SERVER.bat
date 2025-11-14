@echo off
echo ========================================
echo WhatsApp Dashboard Backend Server
echo ========================================
echo.

REM Check if .env exists
if not exist .env (
    echo [ERROR] .env file not found!
    echo Please create .env file from .env.example
    echo.
    pause
    exit /b 1
)

REM Check if node_modules exists
if not exist node_modules (
    echo [INFO] Installing dependencies...
    call npm install
    echo.
)

echo [INFO] Starting server...
echo.
echo Server will run on: http://localhost:3000
echo Health check: http://localhost:3000/health
echo Webhook URL: http://localhost:3000/api/whatsapp/webhook
echo.
echo Press Ctrl+C to stop the server
echo.

call npm run dev









