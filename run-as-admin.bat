@echo off
echo Running Elective Chooser as Administrator...
echo.

REM Check if running as administrator
net session >nul 2>&1
if %errorLevel% == 0 (
    echo Running as Administrator - Good!
) else (
    echo Please run this script as Administrator
    echo Right-click and select "Run as administrator"
    pause
    exit /b 1
)

echo.
echo Cleaning build directory...
if exist .next rmdir /s /q .next

echo.
echo Starting development server...
echo The app will be available at http://localhost:3000
echo.
cd frontend
call npm run dev

pause
