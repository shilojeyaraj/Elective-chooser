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
  // Use UW Flow for course information and reviews
  const courseCode = course.id // Keep original format (e.g., CS486)
  return `https://uwflow.com/course/${courseCode}`
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
 * Get the best Waterloo URL for a course (UW Flow for course reviews and info)
 */
export function getBestWaterlooUrl(course: CourseInfo): { url: string; type: 'uwflow' | 'catalog' | 'search' } {
  // Always use UW Flow as the primary source for course information
  const uwflowUrl = getWaterlooCourseSearchUrl(course)
  return { url: uwflowUrl, type: 'uwflow' }
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
