@echo off
setlocal enabledelayedexpansion

echo =====================================================================
echo           QueueSense AI - Windows Automated Setup Script
echo =====================================================================
echo.

:: 1. Check Python Availability
python --version >nul 2>&1
if %ERRORLEVEL% neq 0 (
    echo [ERROR] Python is not installed or not added to your system PATH.
    echo Please install Python 3.11+ from https://www.python.org/
    pause
    exit /b 1
)
echo [OK] Python is available.

:: 2. Check Node.js and NPM Availability
npm --version >nul 2>&1
if %ERRORLEVEL% neq 0 (
    echo [ERROR] Node.js / NPM is not installed or not added to your PATH.
    echo Please install Node.js from https://nodejs.org/
    pause
    exit /b 1
)
echo [OK] Node.js and NPM are available.

echo.
echo =====================================================================
echo [1/5] Configuring Python Virtual Environment...
echo =====================================================================
if not exist "backend\venv" (
    echo Creating virtual environment in backend\venv...
    python -m venv backend\venv
)
if not exist "backend\venv\Scripts\python.exe" (
    echo [ERROR] Failed to locate backend\venv\Scripts\python.exe
    pause
    exit /b 1
)
echo [OK] Virtual environment ready.

echo.
echo =====================================================================
echo [2/5] Installing Backend Dependencies...
echo =====================================================================
backend\venv\Scripts\python.exe -m pip install --upgrade pip
backend\venv\Scripts\pip install -r backend\requirements.txt
if %ERRORLEVEL% neq 0 (
    echo [ERROR] Failed to install backend dependencies.
    pause
    exit /b 1
)
echo [OK] Backend dependencies installed.

echo.
echo =====================================================================
echo [3/5] Generating Synthetic Queue Dataset (12,000 Records)...
echo =====================================================================
set "PYTHONPATH=."
backend\venv\Scripts\python.exe -m backend.app.ml.generate_dataset
if %ERRORLEVEL% neq 0 (
    echo [ERROR] Failed to generate training dataset.
    pause
    exit /b 1
)
echo [OK] Synthetic dataset generated at backend\data\queue_training_data.csv

echo.
echo =====================================================================
echo [4/5] Training Machine Learning Models (Random Forest & Baselines)...
echo =====================================================================
backend\venv\Scripts\python.exe -m backend.app.ml.train_model
if %ERRORLEVEL% neq 0 (
    echo [ERROR] Model training failed.
    pause
    exit /b 1
)
echo [OK] ML models trained and saved to backend\saved_models\

echo.
echo =====================================================================
echo [5/5] Installing Frontend Dependencies...
echo =====================================================================
cd frontend
call npm install --legacy-peer-deps
if %ERRORLEVEL% neq 0 (
    echo [ERROR] Failed to install frontend dependencies.
    cd ..
    pause
    exit /b 1
)
cd ..
echo [OK] Frontend dependencies installed.

echo.
echo =====================================================================
echo   SETUP COMPLETED SUCCESSFULLY!
echo =====================================================================
echo You can now start the entire application by running:
echo   start_project.bat
echo.
pause
