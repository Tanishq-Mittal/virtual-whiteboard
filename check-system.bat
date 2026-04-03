@echo off
REM Test script to verify all systems are working

setlocal enabledelayedexpansion

cls
echo ==========================================
echo Whiteboard Project - System Check
echo ==========================================
echo.

REM Check Node.js
echo Checking Node.js...
node --version >nul 2>&1
if %errorlevel% equ 0 (
    for /f "tokens=*" %%i in ('node --version') do set NODE_VERSION=%%i
    echo   Node.js: !NODE_VERSION!
) else (
    echo   X Node.js not found!
)

REM Check npm
echo.
echo Checking npm...
npm --version >nul 2>&1
if %errorlevel% equ 0 (
    for /f "tokens=*" %%i in ('npm --version') do set NPM_VERSION=%%i
    echo   npm: !NPM_VERSION!
) else (
    echo   X npm not found!
)

REM Check MongoDB
echo.
echo Checking MongoDB...
mongod --version >nul 2>&1
if %errorlevel% equ 0 (
    echo   MongoDB: found
) else (
    echo   ^! MongoDB not found or not in PATH
)

REM Check folder structure
echo.
echo Checking project structure...
if exist "backend\" (
    echo   backend/ folder found
) else (
    echo   X backend/ folder missing!
)
if exist "frontend\" (
    echo   frontend/ folder found
) else (
    echo   X frontend/ folder missing!
)

REM Check backend dependencies
echo.
echo Checking backend dependencies...
if exist "backend\node_modules" (
    echo   Backend packages installed
) else (
    echo   ^! Backend packages not installed
    echo   Run: cd backend ^&^& npm install
)

REM Check frontend dependencies
echo.
echo Checking frontend dependencies...
if exist "frontend\node_modules" (
    echo   Frontend packages installed
) else (
    echo   ^! Frontend packages not installed
    echo   Run: cd frontend ^&^& npm install
)

REM Check .env files
echo.
echo Checking configuration files...
if exist "backend\.env" (
    echo   backend/.env found
) else (
    echo   ^! backend/.env not found
)

if exist "frontend\.env" (
    echo   frontend/.env found
) else (
    echo   ^! frontend/.env not found
)

echo.
echo ==========================================
echo System check complete!
echo ==========================================
echo.
echo To start the project:
echo 1. Terminal 1: mongod
echo 2. Terminal 2: cd backend ^&^& npm start
echo 3. Terminal 3: cd frontend ^&^& npm run dev
echo.
echo Then open: http://localhost:5173
echo.
pause
