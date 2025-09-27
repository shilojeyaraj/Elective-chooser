@echo off
echo Starting Elective Chooser Application...
echo.

echo Step 1: Stopping any running Node processes...
taskkill /f /im node.exe >nul 2>&1

echo Step 2: Cleaning build cache...
if exist frontend\.next rmdir /s /q frontend\.next

echo Step 3: Starting fresh development server...
echo.
echo The app will be available at: http://localhost:3000
echo Press Ctrl+C to stop the server
echo.

cd frontend
call npm run dev

pause
