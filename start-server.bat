@echo off
REM NeuroHabit AI Auto-Startup Script for Windows
REM This script starts the NeuroHabit server automatically

setlocal enabledelayedexpansion

REM Get the directory of this batch file
cd /d "%~dp0"

echo.
echo ╔═════════════════════════════════════════╗
echo ║  NeuroHabit - AI Server Auto-Launcher   ║
echo ╚═════════════════════════════════════════╝
echo.

REM Check if node is installed
where node >nul 2>nul
if %errorlevel% neq 0 (
    echo ✗ Node.js tidak terdeteksi. Silakan install Node.js terlebih dahulu.
    echo   Download dari: https://nodejs.org/
    pause
    exit /b 1
)

echo ✓ Node.js terdeteksi

REM Check if .env file exists
if not exist ".env" (
    echo.
    echo ⚠️  File .env tidak ditemukan!
    echo ✓ Membuat file .env template...
    (
        echo OPENAI_API_KEY=your_openai_api_key_here
        echo OPENAI_MODEL=gpt-4o-mini
        echo PORT=3000
        echo HOSTNAME=localhost
    ) > .env
    echo ✓ File .env telah dibuat. Silakan isi OPENAI_API_KEY Anda!
    echo.
    pause
)

REM Check if node_modules exists
if not exist "node_modules" (
    echo ✓ Menginstal dependencies...
    call npm install
    if errorlevel 1 (
        echo ✗ Gagal menginstal dependencies
        pause
        exit /b 1
    )
)

echo.
echo ✓ Memulai NeuroHabit Server...
echo.

REM Start the server
call npm start

REM If server exits
echo.
echo ✗ Server telah berhenti
pause
