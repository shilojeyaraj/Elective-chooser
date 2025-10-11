@echo off
echo ========================================
echo Fixing LangChain Dependencies
echo ========================================
echo.

echo Installing missing @langchain/core dependency...
cd frontend
call npm install @langchain/core@^0.3.15
if %errorlevel% neq 0 (
    echo Failed to install dependency!
    pause
    exit /b 1
)

echo.
echo Building application...
call npm run build
if %errorlevel% neq 0 (
    echo Build failed! Please check the errors above.
    pause
    exit /b 1
)

echo.
echo ========================================
echo Dependencies fixed and build successful!
echo ========================================
echo.
echo You can now deploy your application.
echo.
pause
