@echo off
echo ========================================
echo Starting Backend Server and ngrok
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

REM Check if ngrok is available
where ngrok >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    if not exist "C:\ngrok\ngrok.exe" (
        echo [WARNING] ngrok not found!
        echo Please install ngrok from: https://ngrok.com/download
        echo.
        echo Starting server only...
        echo.
        call npm run dev
        exit /b 0
    )
)

echo [INFO] Starting backend server in background...
start "WhatsApp Backend Server" cmd /c "npm run dev"

echo [INFO] Waiting for server to start...
timeout /t 3 /nobreak >nul

echo [INFO] Starting ngrok tunnel...
echo.
echo ========================================
echo Backend Server: http://localhost:3000
echo ngrok Dashboard: http://localhost:4040
echo ========================================
echo.
echo Use the ngrok HTTPS URL in Meta Developer Console:
echo   https://your-ngrok-url.ngrok.io/api/whatsapp/webhook
echo.
echo Press Ctrl+C to stop ngrok
echo.

REM Start ngrok
where ngrok >nul 2>&1
if %ERRORLEVEL% EQU 0 (
    ngrok http 3000
) else (
    C:\ngrok\ngrok.exe http 3000
)






