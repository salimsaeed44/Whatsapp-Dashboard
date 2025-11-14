@echo off
echo ========================================
echo Starting ngrok Tunnel
echo ========================================
echo.

REM Check if ngrok is in PATH or use full path
where ngrok >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo [WARNING] ngrok not found in PATH
    echo Trying to use: C:\ngrok\ngrok.exe
    if exist "C:\ngrok\ngrok.exe" (
        set NGROK_PATH=C:\ngrok\ngrok.exe
    ) else (
        echo [ERROR] ngrok.exe not found!
        echo Please install ngrok from: https://ngrok.com/download
        echo.
        pause
        exit /b 1
    )
) else (
    set NGROK_PATH=ngrok
)

echo [INFO] Starting ngrok on port 3000...
echo [INFO] Backend server should be running on http://localhost:3000
echo.
echo Webhook URL for Meta Console:
echo   https://your-ngrok-url.ngrok.io/api/whatsapp/webhook
echo.
echo Press Ctrl+C to stop ngrok
echo.

%NGROK_PATH% http 3000









