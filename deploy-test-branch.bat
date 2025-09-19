@echo off
echo Deploying from 'test' branch...
echo.

echo Step 1: Installing Vercel CLI...
call npm install -g vercel

echo.
echo Step 2: Deploying from test branch...
echo This will deploy the frontend folder from the 'test' branch
echo.

cd frontend
call vercel --prod --git-branch=test

echo.
echo Deployment complete!
echo Your app will be available at the URL provided by Vercel
pause
