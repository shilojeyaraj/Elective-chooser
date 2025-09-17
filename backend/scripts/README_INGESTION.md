# Data Ingestion for Specializations and Diplomas

This directory contains scripts to process and ingest Waterloo Engineering specializations and diplomas data into Supabase.

## Files

- `process_specializations_diplomas.py` - Main processor for JSON data
- `run_ingestion.py` - Simple script to run the ingestion
- `run_ingestion.bat` - Windows batch file to run the ingestion
- `requirements.txt` - Python dependencies

## Setup

1. **Install Python dependencies:**
   ```bash
   pip install -r requirements.txt
   ```

2. **Set up environment variables:**
   Create a `.env` file in the backend directory with:
   ```
   SUPABASE_URL=your_supabase_project_url
   SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
   ```

3. **Ensure your Supabase database is set up:**
   - Run the SQL schema from `data-to-ingest/supabase-schema.sql`
   - Make sure the `courses` and `options` tables exist

## Usage

### Option 1: Run the simple ingestion script
```bash
python run_ingestion.py
```

### Option 2: Run individual processors
```bash
# Process specializations only
python process_specializations_diplomas.py specializations data-to-ingest/waterloo_engineering_specializations_COMPLETE.json

# Process diplomas only
python process_specializations_diplomas.py diplomas data-to-ingest/waterloo_engineering_undergrad_diplomas.json

# Process both
python process_specializations_diplomas.py both data-to-ingest/waterloo_engineering_specializations_COMPLETE.json data-to-ingest/waterloo_engineering_undergrad_diplomas.json
```

### Option 3: Use the Windows batch file
Double-click `run_ingestion.bat` or run it from command prompt.

## What it does

1. **Processes Specializations JSON:**
   - Extracts course information from each specialization
   - Creates course entries for the `courses` table
   - Creates specialization entries for the `options` table
   - Maps course requirements and selective rules

2. **Processes Diplomas JSON:**
   - Extracts course information from each diploma
   - Creates course entries for the `courses` table
   - Creates diploma entries for the `options` table
   - Maps course requirements and elective rules

3. **Uploads to Supabase:**
   - Uses the Supabase client to upload data in batches
   - Handles conflicts by updating existing records
   - Provides detailed logging of the process

## Data Structure

### Courses Table
- `id`: Course code (e.g., "ECE486")
- `title`: Course title
- `dept`: Department code (e.g., "ECE")
- `level`: Course level (100, 200, 300, 400)
- `units`: Credit units (default 0.5)
- `description`: Course description
- `terms_offered`: JSON array of terms
- `skills`: JSON array of skills/topics
- `workload`: JSON object with workload info
- `assessments`: JSON object with assessment info

### Options Table
- `id`: UUID for the option
- `name`: Option name (specialization or diploma name)
- `program`: Program name
- `faculty`: Faculty name
- `description`: Option description
- `required_courses`: JSON array of required course IDs
- `selective_rules`: JSON object with selective course rules

## Troubleshooting

1. **Connection errors:** Check your Supabase URL and service role key
2. **Missing dependencies:** Run `pip install -r requirements.txt`
3. **File not found:** Ensure the JSON files are in the correct location
4. **Database errors:** Check that your Supabase database schema is set up correctly
