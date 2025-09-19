// Demo data for when Supabase is not configured
export const demoCourses = [
  {
    id: "CS246",
    title: "Data Structures and Data Management",
    dept: "CS",
    number: 246,
    units: 0.5,
    level: 200,
    description: "Introduction to data structures, algorithms, and database management systems.",
    terms_offered: ["F", "W", "S"],
    prereqs: "CS 136",
    skills: ["programming", "data structures", "algorithms"],
    workload: { reading: 2, assignments: 4, projects: 1, labs: 2 },
    assessments: { midterm: 25, final: 35, assignments: 30, labs: 10 },
    source_url: "https://uwaterloo.ca/computer-science/undergraduate-studies/course-catalog/cs-246"
  },
  {
    id: "ECE222",
    title: "Digital Computers",
    dept: "ECE",
    number: 222,
    units: 0.5,
    level: 200,
    description: "Introduction to digital computer organization and assembly language programming.",
    terms_offered: ["F", "W"],
    prereqs: "ECE 150",
    skills: ["computer organization", "assembly", "hardware"],
    workload: { reading: 2, assignments: 3, projects: 1, labs: 2 },
    assessments: { midterm: 30, final: 40, assignments: 20, labs: 10 },
    source_url: "https://uwaterloo.ca/electrical-computer-engineering/undergraduate-studies/course-catalog/ece-222"
  },
  {
    id: "ECE486",
    title: "Robot Dynamics and Control",
    dept: "ECE",
    number: 486,
    units: 0.5,
    level: 400,
    description: "Advanced course covering robot kinematics, dynamics, and control systems.",
    terms_offered: ["F", "W"],
    prereqs: "ECE 380, MATH 211",
    skills: ["robotics", "control", "dynamics"],
    workload: { reading: 3, assignments: 4, projects: 2, labs: 2 },
    assessments: { midterm: 30, final: 40, assignments: 20, project: 10 },
    source_url: "https://uwaterloo.ca/electrical-computer-engineering/undergraduate-studies/course-catalog/ece-486"
  },
  {
    id: "MTE380",
    title: "Mechatronics Systems Modelling",
    dept: "MTE",
    number: 380,
    units: 0.5,
    level: 300,
    description: "Introduction to modeling and simulation of mechatronic systems.",
    terms_offered: ["F"],
    prereqs: "MATH 211, MTE 100",
    skills: ["modelling", "simulation", "control"],
    workload: { reading: 2, assignments: 3, projects: 2, labs: 1 },
    assessments: { midterm: 25, final: 35, assignments: 25, project: 15 },
    source_url: "https://uwaterloo.ca/mechanical-mechatronics-engineering/undergraduate-studies/course-catalog/mte-380"
  },
  {
    id: "ECE488",
    title: "Computer Organization and Design",
    dept: "ECE",
    number: 488,
    units: 0.5,
    level: 400,
    description: "Computer architecture and organization. Topics include instruction set design, processor implementation, memory systems.",
    terms_offered: ["F", "W"],
    prereqs: "ECE 150, ECE 222",
    skills: ["computer architecture", "hardware", "systems"],
    workload: { reading: 3, assignments: 4, projects: 1, labs: 3 },
    assessments: { midterm: 30, final: 40, assignments: 20, labs: 10 },
    source_url: "https://uwaterloo.ca/electrical-computer-engineering/undergraduate-studies/course-catalog/ece-488"
  },
  {
    id: "ECE457A",
    title: "Artificial Intelligence",
    dept: "ECE",
    number: 457,
    units: 0.5,
    level: 400,
    description: "Introduction to artificial intelligence concepts including search, knowledge representation, and machine learning.",
    terms_offered: ["F", "W"],
    prereqs: "ECE 250, STAT 206",
    skills: ["artificial intelligence", "machine learning", "algorithms"],
    workload: { reading: 3, assignments: 4, projects: 2, labs: 1 },
    assessments: { midterm: 25, final: 35, assignments: 30, project: 10 },
    source_url: "https://uwaterloo.ca/electrical-computer-engineering/undergraduate-studies/course-catalog/ece-457a"
  },
  {
    id: "CS486",
    title: "Introduction to Artificial Intelligence",
    dept: "CS",
    number: 486,
    units: 0.5,
    level: 400,
    description: "Introduction to artificial intelligence including machine learning, neural networks, and AI applications.",
    terms_offered: ["F", "W", "S"],
    prereqs: "CS 241, STAT 206",
    skills: ["artificial intelligence", "machine learning", "neural networks", "algorithms"],
    workload: { reading: 3, assignments: 4, projects: 2, labs: 1 },
    assessments: { midterm: 25, final: 35, assignments: 30, project: 10 },
    source_url: "https://uwaterloo.ca/computer-science/undergraduate-studies/course-catalog/cs-486"
  },
  {
    id: "CS448",
    title: "Machine Learning",
    dept: "CS",
    number: 448,
    units: 0.5,
    level: 400,
    description: "Introduction to machine learning algorithms, statistical learning, and data mining techniques.",
    terms_offered: ["F", "W"],
    prereqs: "CS 241, STAT 206, MATH 211",
    skills: ["machine learning", "statistical learning", "data mining", "algorithms"],
    workload: { reading: 4, assignments: 4, projects: 2, labs: 1 },
    assessments: { midterm: 20, final: 30, assignments: 35, project: 15 },
    source_url: "https://uwaterloo.ca/computer-science/undergraduate-studies/course-catalog/cs-448"
  },
  {
    id: "STAT330",
    title: "Introduction to Statistical Learning",
    dept: "STAT",
    number: 330,
    units: 0.5,
    level: 300,
    description: "Statistical methods for machine learning including regression, classification, and model selection.",
    terms_offered: ["F", "W", "S"],
    prereqs: "STAT 206, MATH 211",
    skills: ["statistical learning", "regression", "classification", "statistics"],
    workload: { reading: 3, assignments: 3, projects: 1, labs: 1 },
    assessments: { midterm: 30, final: 40, assignments: 25, project: 5 },
    source_url: "https://uwaterloo.ca/statistics-and-actuarial-science/undergraduate-studies/course-catalog/stat-330"
  },
  {
    id: "SYDE522",
    title: "Robotics and Control",
    dept: "SYDE",
    number: 522,
    units: 0.5,
    level: 500,
    description: "Advanced robotics and control systems with focus on autonomous systems and human-robot interaction.",
    terms_offered: ["F"],
    prereqs: "SYDE 352, MTE 380",
    skills: ["robotics", "autonomous systems", "control", "human-robot interaction"],
    workload: { reading: 4, assignments: 3, projects: 3, labs: 2 },
    assessments: { midterm: 20, final: 30, assignments: 25, project: 25 },
    source_url: "https://uwaterloo.ca/systems-design-engineering/undergraduate-studies/course-catalog/syde-522"
  }
]

export const demoOptions = [
  {
    id: "robotics-option",
    name: "Robotics Option",
    program: "MTE",
    faculty: "Engineering",
    required_courses: ["ECE486"],
    selective_rules: { selectNfrom: ["MTE380", "ECE488", "SYDE522"], N: 2 },
    description: "Specialization in robotics and automation systems, covering control theory, robot dynamics, and mechatronic design.",
    source_url: "https://uwaterloo.ca/mechanical-mechatronics-engineering/undergraduate-studies/options/robotics"
  },
  {
    id: "ai-option",
    name: "Artificial Intelligence Option",
    program: "ECE",
    faculty: "Engineering",
    required_courses: ["ECE457A"],
    selective_rules: { selectNfrom: ["ECE457B", "ECE457C", "ECE457D"], N: 2 },
    description: "Focus on artificial intelligence, machine learning, and intelligent systems.",
    source_url: "https://uwaterloo.ca/electrical-computer-engineering/undergraduate-studies/options/artificial-intelligence"
  }
]

export const demoProfile = {
  user_id: "demo-user",
  program: "MTE",
  current_term: "2A",
  completed_courses: ["ECE100", "ECE150", "MATH211"],
  planned_courses: [],
  gpa: 3.5,
  interests: ["robotics", "control", "embedded systems"],
  goal_tags: ["career_robotics", "industry_work"],
  constraints: {
    max_workload: 4,
    morning_labs: false,
    schedule_preferences: []
  }
}
