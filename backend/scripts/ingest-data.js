const fs = require('fs');
const path = require('path');
require('dotenv').config();

// Import the data ingestion functions
const { ingestCourses, ingestOptions, parseCoursesCSV, parseOptionsCSV } = require('../src/lib/data-ingestion.ts');

async function main() {
  try {
    console.log('🚀 Starting data ingestion...');
    
    // Check if .env file exists and has required variables
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
      console.error('❌ Missing required Supabase environment variables');
      console.error('Please ensure your .env file contains:');
      console.error('  NEXT_PUBLIC_SUPABASE_URL=your_supabase_url');
      console.error('  NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key');
      console.error('  SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key');
      process.exit(1);
    }

    // Ingest courses from processed_courses.csv
    console.log('📚 Ingesting courses from processed_courses.csv...');
    const coursesCsv = fs.readFileSync('processed_courses.csv', 'utf8');
    const courses = parseCoursesCSV(coursesCsv);
    console.log(`Found ${courses.length} courses to ingest`);
    
    await ingestCourses(courses);
    console.log('✅ Courses ingested successfully!');

    // Ingest courses from sample-data/courses.csv
    console.log('📚 Ingesting courses from sample-data/courses.csv...');
    const sampleCoursesCsv = fs.readFileSync('sample-data/courses.csv', 'utf8');
    const sampleCourses = parseCoursesCSV(sampleCoursesCsv);
    console.log(`Found ${sampleCourses.length} sample courses to ingest`);
    
    await ingestCourses(sampleCourses);
    console.log('✅ Sample courses ingested successfully!');

    // Ingest options from sample-data/options.csv
    console.log('📋 Ingesting options from sample-data/options.csv...');
    const optionsCsv = fs.readFileSync('sample-data/options.csv', 'utf8');
    const options = parseOptionsCSV(optionsCsv);
    console.log(`Found ${options.length} options to ingest`);
    
    await ingestOptions(options);
    console.log('✅ Options ingested successfully!');

    console.log('🎉 Data ingestion completed successfully!');
    
  } catch (error) {
    console.error('❌ Error during data ingestion:', error);
    process.exit(1);
  }
}

main();
