@echo off
REM NeuroHabit Auto-Startup for Windows Startup Folder
REM Place this file in: C:\Users\{USERNAME}\AppData\Roaming\Microsoft\Windows\Start Menu\Programs\Startup

REM Navigate to NeuroHabit project directory
cd /d "d:\UII\semester 3\FSD\NeuroHabit3\NeuroHabit" || goto :error

REM Start the server in a new window
start "NeuroHabit Server" cmd /c npm start

REM Give server time to start
timeout /t 3

REM Open browser to localhost:3000
start "" http://localhost:3000

exit /b 0

:error
echo ✗ Error: Could not navigate to NeuroHabit directory
exit /b 1
