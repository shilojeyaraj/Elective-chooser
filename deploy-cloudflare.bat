@echo off
echo ========================================
echo UW Elective Chooser - Cloudflare Deploy
echo ========================================
echo.

echo Building application...
call npm run build
if %errorlevel% neq 0 (
    echo Build failed! Please check the errors above.
    pause
    exit /b 1
)

echo.
echo Build successful! Deploying to Cloudflare Pages...
echo.

echo Deploying with Wrangler...
call npx wrangler pages deploy frontend/.next --project-name uw-elective-chooser
if %errorlevel% neq 0 (
    echo Deployment failed! Please check the errors above.
    pause
    exit /b 1
)

echo.
echo ========================================
echo Deployment completed successfully!
echo ========================================
echo.
echo Your app should be available at:
echo https://uw-elective-chooser.pages.dev
echo.
echo Don't forget to set up your environment variables
echo in the Cloudflare Pages dashboard!
echo.
pause
