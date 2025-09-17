@echo off
echo Starting data ingestion for specializations and diplomas...
echo.

cd /d "%~dp0"

echo Installing dependencies...
pip install -r requirements.txt

echo.
echo Running data ingestion...
python run_ingestion.py

echo.
echo Data ingestion complete!
pause
