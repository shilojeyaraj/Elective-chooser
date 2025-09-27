-- ==============================================
-- REMOVE ONLY BME121 FROM DATABASE
-- ==============================================
-- This script removes only BME121 from the courses table
-- since it's being incorrectly recommended as an elective
-- ==============================================

-- Delete only BME121 from the courses table
DELETE FROM courses 
WHERE id = 'BME121';

-- Show confirmation that BME121 was removed
SELECT 
  CASE 
    WHEN COUNT(*) = 0 THEN 'BME121 successfully removed from database'
    ELSE 'BME121 still exists in database'
  END as result
FROM courses 
WHERE id = 'BME121';

-- Show remaining BME courses (if any)
SELECT 'Remaining BME courses:' as info;
SELECT id, title, dept 
FROM courses 
WHERE dept = 'BME'
ORDER BY id;
