@echo off
echo Deploying to Vercel...

echo.
echo Step 1: Installing Vercel CLI...
call npm install -g vercel

echo.
echo Step 2: Deploying to Vercel...
echo You will be prompted to:
echo - Login to Vercel
echo - Set up your project
echo - Configure environment variables
echo.
call vercel

echo.
echo Deployment complete!
echo Your app will be available at the URL provided by Vercel
pause
