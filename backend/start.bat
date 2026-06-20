@echo off
title CivicConnect AI — Backend
color 0A
cd /d "%~dp0"

echo.
echo  =====================================================
echo   CivicConnect AI — Backend Server (Flask + PostgreSQL)
echo  =====================================================
echo.

:: Activate virtual environment if it exists, else create it
if not exist "venv\Scripts\activate.bat" (
    echo  [SETUP] Creating Python virtual environment...
    python -m venv venv
)

call venv\Scripts\activate.bat

:: Install dependencies silently
echo  [SETUP] Installing Python dependencies...
pip install -r requirements.txt -q

:: Run DB seed (safe — skips if data already exists)
echo  [DB]    Setting up database...
python seed.py

echo.
echo  [OK]    Starting Flask on http://localhost:5000
echo  [OK]    Press CTRL+C to stop
echo.
python run.py
pause
