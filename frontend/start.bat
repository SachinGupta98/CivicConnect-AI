@echo off
title CivicConnect AI — Frontend
color 0B
cd /d "%~dp0"

echo.
echo  =====================================================
echo   CivicConnect AI — Frontend Dev Server (React + Vite)
echo  =====================================================
echo.

:: Install npm packages if node_modules is missing
if not exist "node_modules" (
    echo  [SETUP] Installing npm packages...
    npm install
)

echo  [OK]    Starting Vite on http://localhost:5173
echo  [OK]    Press CTRL+C to stop
echo.
npm run dev
pause
