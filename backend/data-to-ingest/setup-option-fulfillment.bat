@echo off
echo Setting up option fulfillment data...

echo.
echo Step 1: Running database migration...
python run-database-migration.py

echo.
echo Step 2: Populating option fulfillment data...
python populate-option-fulfillment.py

echo.
echo Option fulfillment setup complete!
pause