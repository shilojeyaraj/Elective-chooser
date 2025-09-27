@echo off
echo Starting simple deployment process...

echo.
echo Step 1: Cleaning build directory...
if exist .next rmdir /s /q .next

echo.
echo Step 2: Installing dependencies...
call npm install

echo.
echo Step 3: Starting development server...
echo The app will be available at http://localhost:3000
echo Press Ctrl+C to stop the server
echo.
call npm run dev

pause
