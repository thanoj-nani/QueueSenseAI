@echo off
setlocal enabledelayedexpansion

echo =====================================================================
echo                QueueSense AI - Launcher Script
echo =====================================================================
echo.

set "SCRIPT_DIR=%~dp0"
cd /d "%SCRIPT_DIR%"

:: Check if virtual environment exists
if not exist "backend\venv\Scripts\python.exe" (
    echo [ERROR] Virtual environment not found.
    echo Please run 'setup_windows.bat' first to configure dependencies.
    pause
    exit /b 1
)

:: Check for port 8000 (Backend)
netstat -ano | findstr :8000 | findstr LISTENING >nul 2>&1
if %ERRORLEVEL% equ 0 (
    echo [NOTICE] Backend server is already running on port 8000.
) else (
    echo [STARTING] Starting FastAPI Backend on http://localhost:8000...
    start "QueueSense AI - Backend API" cmd /k "cd /d %SCRIPT_DIR% && set PYTHONPATH=. && backend\venv\Scripts\python -m uvicorn backend.app.main:app --host 127.0.0.1 --port 8000 --reload"
)

:: Check for port 5173 (Frontend)
netstat -ano | findstr :5173 | findstr LISTENING >nul 2>&1
if %ERRORLEVEL% equ 0 (
    echo [NOTICE] Frontend server is already running on port 5173.
) else (
    echo [STARTING] Starting Vite React Frontend on http://localhost:5173...
    start "QueueSense AI - React Frontend" cmd /k "cd /d %SCRIPT_DIR%frontend && npm run dev"
)

echo.
echo =====================================================================
echo             QueueSense AI is Running Successfully!
echo =====================================================================
echo.
echo  [WEB APP URL]      http://localhost:5173
echo  [BACKEND API]      http://localhost:8000
echo  [API SWAGGER DOCS] http://localhost:8000/docs
echo.
echo  ----------------- DEMO LOGIN CREDENTIALS -----------------
echo   Admin Access:   admin@queuesense.ai  /  Admin@123
echo   Visitor Access: user@queuesense.ai   /  User@123
echo  ----------------------------------------------------------
echo.
echo Press any key to open the application in your default browser...
pause >nul
start http://localhost:5173
