@echo off
echo Starting development environment...

echo.
echo Starting development services with hot reloading...
docker-compose --profile dev up frontend-dev

echo.
echo Development server running at: http://localhost:3001
echo Press Ctrl+C to stop
