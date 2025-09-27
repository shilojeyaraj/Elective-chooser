@echo off
echo Setting up Docker for Elective Chooser...

echo.
echo Step 1: Copying environment file...
copy env.docker.example .env
echo Please edit .env file with your actual API keys!

echo.
echo Step 2: Building Docker images...
docker-compose build

echo.
echo Step 3: Starting services...
docker-compose up -d

echo.
echo Setup complete! Your app should be running at:
echo - Frontend: http://localhost:3000
echo - Backend: Running in background
echo.
echo To view logs: docker-compose logs -f
echo To stop: docker-compose down
pause
