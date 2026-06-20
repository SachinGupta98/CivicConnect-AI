@echo off
title CivicConnect AI
color 0E
echo.
echo  =====================================================
echo   CivicConnect AI — Launching Both Servers
echo  =====================================================
echo.
echo  Backend  →  http://localhost:5000
echo  Frontend →  http://localhost:5173
echo.
echo  Starting backend in a new window...
start "CivicConnect Backend" cmd /k "cd /d %~dp0backend && start.bat"

timeout /t 3 /nobreak >nul

echo  Starting frontend in a new window...
start "CivicConnect Frontend" cmd /k "cd /d %~dp0frontend && start.bat"

echo.
echo  [OK] Both servers launching in separate windows.
echo  [OK] Open http://localhost:5173 in your browser.
echo.
pause
