@echo off
echo Deploying Elective Chooser to Vercel...
echo.

echo Step 1: Installing Vercel CLI...
call npm install -g vercel

echo.
echo Step 2: Deploying to Vercel...
echo You will be prompted to:
echo - Login to Vercel (if not already logged in)
echo - Set up your project
echo - Configure environment variables
echo.
echo Environment variables needed:
echo - NEXT_PUBLIC_SUPABASE_URL
echo - NEXT_PUBLIC_SUPABASE_ANON_KEY  
echo - SUPABASE_SERVICE_ROLE_KEY
echo - OPENAI_API_KEY
echo.

cd frontend
call vercel --prod

echo.
echo Deployment complete!
echo Your app will be available at the URL provided by Vercel
pause
