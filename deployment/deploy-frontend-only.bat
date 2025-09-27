@echo off
echo Deploying from frontend directory only...
echo.

echo Step 1: Installing Vercel CLI...
call npm install -g vercel

echo.
echo Step 2: Deploying from frontend directory...
echo This will deploy only the frontend folder as the root
echo.

cd frontend
call vercel --prod

echo.
echo Deployment complete!
echo Your app will be available at the URL provided by Vercel
pause
