// Demo data for when Supabase is not configured
export const demoCourses = [
  {
    id: "ECE486",
    title: "Robot Dynamics and Control",
    dept: "ECE",
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
    units: 0.5,
    level: 400,
    description: "Computer architecture and organization. Topics include instruction set design, processor implementation, memory systems.",
    terms_offered: ["F", "W"],
    prereqs: "ECE 150, ECE 222",
    skills: ["computer architecture", "hardware", "systems"],
    workload: { reading: 3, assignments: 4, projects: 1, labs: 3 },
    assessments: { midterm: 30, final: 40, assignments: 20, labs: 10 },
    source_url: "https://uwaterloo.ca/electrical-computer-engineering/undergraduate-studies/course-catalog/ece-488"
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
