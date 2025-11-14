@echo off
echo ========================================
echo WhatsApp Backend Setup Checker
echo ========================================
echo.

REM Check Node.js
echo [1/5] Checking Node.js...
where node >nul 2>&1
if %ERRORLEVEL% EQU 0 (
    node --version
    echo ✅ Node.js is installed
) else (
    echo ❌ Node.js is NOT installed
    echo    Please install from: https://nodejs.org/
)
echo.

REM Check npm
echo [2/5] Checking npm...
where npm >nul 2>&1
if %ERRORLEVEL% EQU 0 (
    npm --version
    echo ✅ npm is installed
) else (
    echo ❌ npm is NOT installed
)
echo.

REM Check .env file
echo [3/5] Checking .env file...
if exist .env (
    echo ✅ .env file exists
    findstr /C:"META_VERIFY_TOKEN" .env >nul 2>&1
    if %ERRORLEVEL% EQU 0 (
        echo ✅ META_VERIFY_TOKEN is set
    ) else (
        echo ⚠️  META_VERIFY_TOKEN not found in .env
    )
    findstr /C:"META_ACCESS_TOKEN" .env >nul 2>&1
    if %ERRORLEVEL% EQU 0 (
        echo ✅ META_ACCESS_TOKEN is set
    ) else (
        echo ⚠️  META_ACCESS_TOKEN not found in .env
    )
    findstr /C:"WHATSAPP_PHONE_ID" .env >nul 2>&1
    if %ERRORLEVEL% EQU 0 (
        echo ✅ WHATSAPP_PHONE_ID is set
    ) else (
        echo ⚠️  WHATSAPP_PHONE_ID not found in .env
    )
) else (
    echo ❌ .env file NOT found
    echo    Please create .env file from .env.example
)
echo.

REM Check node_modules
echo [4/5] Checking dependencies...
if exist node_modules (
    echo ✅ node_modules exists
    if exist node_modules\express (
        echo ✅ Dependencies are installed
    ) else (
        echo ⚠️  Dependencies may be incomplete
        echo    Run: npm install
    )
) else (
    echo ❌ node_modules NOT found
    echo    Run: npm install
)
echo.

REM Check ngrok
echo [5/5] Checking ngrok...
where ngrok >nul 2>&1
if %ERRORLEVEL% EQU 0 (
    echo ✅ ngrok is in PATH
) else (
    if exist "C:\ngrok\ngrok.exe" (
        echo ✅ ngrok found at C:\ngrok\ngrok.exe
    ) else (
        echo ⚠️  ngrok not found
        echo    Download from: https://ngrok.com/download
        echo    Or install to: C:\ngrok\ngrok.exe
    )
)
echo.

echo ========================================
echo Setup Check Complete!
echo ========================================
echo.
pause









