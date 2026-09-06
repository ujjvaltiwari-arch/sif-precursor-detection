@echo off
setlocal enabledelayedexpansion

:: SIF Precursor Detection System - Windows Launcher
:: Smart India Hackathon 2026 - Problem Statement 26165

echo.
echo ============================================
echo  SIF Precursor Detection System
echo  Oil India Limited - SIH 2026
echo ============================================
echo.

:: Check Python
where python >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] Python not found. Please install Python 3.12+
    pause
    exit /b 1
)

:: Check Node.js
where npm >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] Node.js/npm not found. Please install Node.js 18+
    pause
    exit /b 1
)

set PROJECT_DIR=%~dp0
set BACKEND_DIR=%PROJECT_DIR%backend
set FRONTEND_DIR=%PROJECT_DIR%frontend
set VENV_DIR=%BACKEND_DIR%\.venv

:: Setup backend venv if missing
if not exist "%VENV_DIR%" (
    echo [SETUP] Creating Python virtual environment...
    python -m venv "%VENV_DIR%"
)

:: Activate venv and install deps
echo [SETUP] Installing backend dependencies...
call "%VENV_DIR%\Scripts\activate.bat"
pip install -r "%BACKEND_DIR%\requirements.txt" --quiet

:: Install frontend deps if needed
if not exist "%FRONTEND_DIR%\node_modules" (
    echo [SETUP] Installing frontend dependencies...
    cd "%FRONTEND_DIR%"
    npm install --silent
)

echo.
echo [START] Launching backend server on http://localhost:8000...
start "SIF Backend" cmd /k "cd /d %BACKEND_DIR% && %VENV_DIR%\Scripts\python.exe -m uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload"

:: Wait for backend to be ready
timeout /t 5 /nobreak >nul

echo [START] Launching frontend server on http://localhost:5173...
start "SIF Frontend" cmd /k "cd /d %FRONTEND_DIR% && npm run dev"

echo.
echo ============================================
echo  Both servers started!
echo  Backend:  http://localhost:8000
echo  Frontend: http://localhost:5173
echo  API Docs: http://localhost:8000/docs
echo ============================================
echo.
echo Press any key to stop all servers...
pause >nul

:: Kill servers
taskkill /FI "WINDOWTITLE eq SIF Backend*" /F >nul 2>&1
taskkill /FI "WINDOWTITLE eq SIF Frontend*" /F >nul 2>&1
echo Servers stopped.
