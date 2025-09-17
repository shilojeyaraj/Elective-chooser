# Data Ingestion Folder

This folder contains all files needed to ingest Waterloo Engineering data into your Supabase database.

## Files in this folder:

### Data Files:
- `uw_engineering_core_by_program_TIDY.json` - Main JSON file with all engineering programs and courses
- `processed_courses.csv` - Processed course data (284 courses)
- `processed_programs.csv` - Processed program data (11 programs)
- `sample-data/` - Additional sample CSV files

### Database Schema:
- `supabase-schema.sql` - Complete database schema
- `setup-database.sql` - Simplified database setup
- `add-number-column.sql` - Migration script to add missing number column

### Scripts:
- `ingest-json.py` - Python script to upload JSON data directly to Supabase

## How to ingest your data:

### Method 1: Upload JSON directly (Recommended)
```bash
# Install required packages
pip install supabase python-dotenv

# Run the JSON ingestion script
python ingest-json.py uw_engineering_core_by_program_TIDY.json
```

### Method 2: Use the web admin interface
1. Go to `http://localhost:3000/admin`
2. Upload `processed_courses.csv` and `processed_programs.csv`

### Method 3: Use the original Python processor
```bash
# From the project root
python scripts/simple_uw_processor.py data-to-ingest/uw_engineering_core_by_program_TIDY.json
```

## Prerequisites:

1. **Set up your Supabase database**:
   - Go to your Supabase project dashboard
   - Go to SQL Editor
   - Copy and paste the contents of `supabase-schema.sql`
   - Click Run

2. **Configure your environment variables** in `.env`:
   ```env
   SUPABASE_URL=https://your-project-id.supabase.co
   SUPABASE_KEY=your_anon_key
   SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
   ```

## What gets uploaded:

- **284 courses** from 11 engineering programs
- **11 engineering programs** (options/specializations)
- **Course details**: title, department, level, skills, workload, assessments
- **Program details**: name, degree type, required courses, selective rules

## Troubleshooting:

- **"Invalid API key"**: Check your `.env` file has the correct Supabase keys
- **"Could not find column"**: Run the database schema first
- **"Could not find 'number' column"**: Run the migration script `add-number-column.sql`
- **"Connection failed"**: Check your Supabase URL and keys are correct

### If you already have a database:
1. Run `add-number-column.sql` to add the missing number column
2. Then try uploading your data again
