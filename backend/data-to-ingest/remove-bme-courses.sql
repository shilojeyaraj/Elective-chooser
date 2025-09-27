-- ==============================================
-- REMOVE ALL BME COURSES FROM DATABASE
-- ==============================================
-- This script removes all BME (Biomedical Engineering) courses
-- from the courses table since they are program-specific core courses
-- that should not be available as electives for other programs
-- ==============================================

-- Delete all BME courses from the courses table
DELETE FROM courses 
WHERE dept = 'BME';

-- Show how many BME courses were removed
SELECT 'BME courses removed: ' || COUNT(*) as result
FROM courses 
WHERE dept = 'BME';

-- Show remaining course count by department
SELECT dept, COUNT(*) as course_count
FROM courses 
GROUP BY dept 
ORDER BY dept;

-- Show total remaining courses
SELECT 'Total remaining courses: ' || COUNT(*) as result
FROM courses;
