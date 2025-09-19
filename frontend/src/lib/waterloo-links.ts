/**
 * Utility functions for generating Waterloo course-related URLs
 */

export interface CourseInfo {
  id: string
  title: string
  dept: string
  number: number
}

/**
 * Generate Waterloo course search URL based on course information
 */
export function getWaterlooCourseSearchUrl(course: CourseInfo): string {
  const courseCode = course.id.replace(/([A-Z]+)(\d+)/, '$1 $2') // Convert CS486 to CS 486
  
  // Determine the best search strategy based on department
  if (course.dept === 'CS' || course.dept === 'ECE' || course.dept === 'SE') {
    // Computer Science, Computer Engineering, Software Engineering
    return `https://uwaterloo.ca/search?q=${encodeURIComponent(courseCode + ' ' + course.title + ' computer science engineering')}`
  } else if (course.dept === 'STAT' || course.dept === 'MATH') {
    // Mathematics and Statistics
    return `https://uwaterloo.ca/search?q=${encodeURIComponent(courseCode + ' ' + course.title + ' mathematics statistics')}`
  } else if (['MTE', 'ME', 'SYDE', 'CIVE', 'CHE', 'BME', 'ENVE', 'GEOE', 'AE', 'NANO'].includes(course.dept)) {
    // Engineering departments
    return `https://uwaterloo.ca/search?q=${encodeURIComponent(courseCode + ' ' + course.title + ' engineering')}`
  } else if (['ANTH', 'BET', 'ECON', 'ENGL', 'HIST', 'PHIL', 'PSYCH', 'SOC'].includes(course.dept)) {
    // Arts and Humanities (CSE electives)
    return `https://uwaterloo.ca/search?q=${encodeURIComponent(courseCode + ' ' + course.title + ' arts humanities')}`
  } else {
    // General search
    return `https://uwaterloo.ca/search?q=${encodeURIComponent(courseCode + ' ' + course.title + ' course')}`
  }
}

/**
 * Generate Waterloo course catalog URL (if available)
 */
export function getWaterlooCourseCatalogUrl(course: CourseInfo): string | null {
  const courseCode = course.id.replace(/([A-Z]+)(\d+)/, '$1 $2')
  
  // Try to construct direct course catalog URLs for known patterns
  if (course.dept === 'CS') {
    return `https://uwaterloo.ca/computer-science/undergraduate-studies/course-catalog/${course.id.toLowerCase()}`
  } else if (course.dept === 'ECE') {
    return `https://uwaterloo.ca/electrical-computer-engineering/undergraduate-studies/course-catalog/${course.id.toLowerCase()}`
  } else if (course.dept === 'SE') {
    return `https://uwaterloo.ca/software-engineering/undergraduate-studies/course-catalog/${course.id.toLowerCase()}`
  } else if (course.dept === 'MTE') {
    return `https://uwaterloo.ca/mechanical-mechatronics-engineering/undergraduate-studies/course-catalog/${course.id.toLowerCase()}`
  } else if (course.dept === 'ME') {
    return `https://uwaterloo.ca/mechanical-mechatronics-engineering/undergraduate-studies/course-catalog/${course.id.toLowerCase()}`
  } else if (course.dept === 'SYDE') {
    return `https://uwaterloo.ca/systems-design-engineering/undergraduate-studies/course-catalog/${course.id.toLowerCase()}`
  } else if (course.dept === 'CIVE') {
    return `https://uwaterloo.ca/civil-environmental-engineering/undergraduate-studies/course-catalog/${course.id.toLowerCase()}`
  } else if (course.dept === 'CHE') {
    return `https://uwaterloo.ca/chemical-engineering/undergraduate-studies/course-catalog/${course.id.toLowerCase()}`
  } else if (course.dept === 'BME') {
    return `https://uwaterloo.ca/biomedical-engineering/undergraduate-studies/course-catalog/${course.id.toLowerCase()}`
  } else if (course.dept === 'ENVE') {
    return `https://uwaterloo.ca/civil-environmental-engineering/undergraduate-studies/course-catalog/${course.id.toLowerCase()}`
  } else if (course.dept === 'GEOE') {
    return `https://uwaterloo.ca/geological-engineering/undergraduate-studies/course-catalog/${course.id.toLowerCase()}`
  } else if (course.dept === 'AE') {
    return `https://uwaterloo.ca/architectural-engineering/undergraduate-studies/course-catalog/${course.id.toLowerCase()}`
  } else if (course.dept === 'NANO') {
    return `https://uwaterloo.ca/nanotechnology-engineering/undergraduate-studies/course-catalog/${course.id.toLowerCase()}`
  } else if (course.dept === 'STAT') {
    return `https://uwaterloo.ca/statistics-and-actuarial-science/undergraduate-studies/course-catalog/${course.id.toLowerCase()}`
  } else if (course.dept === 'MATH') {
    return `https://uwaterloo.ca/mathematics/undergraduate-studies/course-catalog/${course.id.toLowerCase()}`
  }
  
  return null
}

/**
 * Get the best Waterloo URL for a course (catalog if available, otherwise search)
 */
export function getBestWaterlooUrl(course: CourseInfo): { url: string; type: 'catalog' | 'search' } {
  const catalogUrl = getWaterlooCourseCatalogUrl(course)
  
  if (catalogUrl) {
    return { url: catalogUrl, type: 'catalog' }
  }
  
  return { url: getWaterlooCourseSearchUrl(course), type: 'search' }
}

/**
 * Generate Waterloo electives search URL
 */
export function getWaterlooElectivesSearchUrl(program?: string): string {
  if (program) {
    return `https://uwaterloo.ca/search?q=${encodeURIComponent(program + ' engineering electives')}`
  }
  return `https://uwaterloo.ca/search?q=${encodeURIComponent('engineering electives')}`
}

/**
 * Generate Waterloo course planning URL
 */
export function getWaterlooCoursePlanningUrl(program?: string): string {
  if (program) {
    return `https://uwaterloo.ca/search?q=${encodeURIComponent(program + ' engineering course planning')}`
  }
  return `https://uwaterloo.ca/search?q=${encodeURIComponent('engineering course planning')}`
}
