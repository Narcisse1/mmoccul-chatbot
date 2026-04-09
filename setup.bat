@echo off
REM ============================================
REM MMOCCUL Chatbot - Windows Setup Script
REM ============================================

setlocal enabledelayedexpansion

echo.
echo ==========================================
echo MMOCCUL Chatbot - Setup Script (Windows)
echo ==========================================
echo.

REM Check Node.js
echo Checking Node.js...
node --version >nul 2>&1
if errorlevel 1 (
    echo ERROR: Node.js is not installed.
    echo Please install Node.js v18+ from: https://nodejs.org
    pause
    exit /b 1
)
for /f "tokens=*" %%i in ('node --version') do set NODE_VERSION=%%i
echo [OK] Node.js %NODE_VERSION%

REM Check pnpm
echo Checking pnpm...
pnpm --version >nul 2>&1
if errorlevel 1 (
    echo Installing pnpm...
    npm install -g pnpm
)
for /f "tokens=*" %%i in ('pnpm --version') do set PNPM_VERSION=%%i
echo [OK] pnpm %PNPM_VERSION%

REM Check MySQL
echo Checking MySQL...
mysql --version >nul 2>&1
if errorlevel 1 (
    echo ERROR: MySQL is not installed.
    echo Please install MySQL 8.0+ from: https://www.mysql.com/downloads/
    pause
    exit /b 1
)
echo [OK] MySQL installed

REM Install dependencies
echo.
echo Installing dependencies...
call pnpm install
if errorlevel 1 (
    echo ERROR: Failed to install dependencies
    pause
    exit /b 1
)
echo [OK] Dependencies installed

REM Create .env.local
echo.
echo Setting up environment variables...
if not exist .env.local (
    echo Creating .env.local file...
    (
        echo # Database Configuration
        echo DATABASE_URL=mysql://root:password@localhost:3306/mmoccul_chatbot
        echo.
        echo # Authentication
        echo JWT_SECRET=your_jwt_secret_here
        echo VITE_APP_ID=your_app_id
        echo OAUTH_SERVER_URL=https://api.manus.im
        echo VITE_OAUTH_PORTAL_URL=https://login.manus.im
        echo.
        echo # LLM Integration
        echo BUILT_IN_FORGE_API_URL=https://api.manus.im/forge
        echo BUILT_IN_FORGE_API_KEY=your_api_key
        echo VITE_FRONTEND_FORGE_API_KEY=your_frontend_key
        echo VITE_FRONTEND_FORGE_API_URL=https://api.manus.im/forge
        echo.
        echo # Application
        echo VITE_APP_TITLE=MMOCCUL Support
        echo OWNER_NAME=MMOCCUL
        echo OWNER_OPEN_ID=your_owner_open_id
    ) > .env.local
    echo [OK] .env.local created
    echo WARNING: Please edit .env.local with your credentials
) else (
    echo [OK] .env.local already exists
)

REM Setup database
echo.
echo Setting up database...
echo Please enter your MySQL root password when prompted:
mysql -u root -p -e "CREATE DATABASE IF NOT EXISTS mmoccul_chatbot CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"
if errorlevel 1 (
    echo ERROR: Failed to create database
    pause
    exit /b 1
)
echo [OK] Database created

REM Run migrations
echo.
echo Running database migrations...
call pnpm drizzle-kit push
if errorlevel 1 (
    echo ERROR: Failed to run migrations
    pause
    exit /b 1
)
echo [OK] Database migrations applied

REM Run tests
echo.
echo Running tests...
call pnpm test
if errorlevel 1 (
    echo WARNING: Some tests failed
) else (
    echo [OK] All tests passed
)

REM Summary
echo.
echo ==========================================
echo Setup Complete!
echo ==========================================
echo.
echo Next steps:
echo 1. Edit .env.local with your credentials
echo 2. Run: pnpm dev
echo 3. Open: http://localhost:3000
echo.
echo For deployment, see DEPLOYMENT_GUIDE.md
echo.
pause
