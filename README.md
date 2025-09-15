# Waterloo Elective Chooser

An AI-powered chatbot that helps Waterloo Engineering students choose the best electives based on their goals, program, and academic standing.

## Features

- 🤖 **AI Chatbot**: Powered by OpenAI GPT-4 with LangChain for conversation memory
- 🎯 **Personalized Recommendations**: Course suggestions based on user goals and constraints
- 🔍 **Smart Search**: Database search with web search fallback for missing information
- 📊 **Scoring System**: Comprehensive scoring algorithm considering prerequisites, workload, and goal alignment
- 🔐 **User Authentication**: Secure login with Supabase Auth
- 📱 **Modern UI**: Clean, responsive interface built with Next.js and Tailwind CSS

## Tech Stack

- **Frontend**: Next.js 15, React, TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes, Supabase
- **Database**: PostgreSQL with pgvector for embeddings
- **AI**: OpenAI GPT-4, LangChain for memory management
- **Authentication**: Supabase Auth
- **Search**: Vector similarity search + web search fallback

## Quick Start

### 1. Clone and Install

```bash
git clone <your-repo>
cd waterloo-elective-chooser
npm install
```

### 2. Set up Supabase

1. Create a new project at [supabase.com](https://supabase.com)
2. Run the SQL schema from `supabase-schema.sql` in your Supabase SQL editor
3. Get your project URL and anon key from Settings > API

### 3. Environment Variables

Create a `.env.local` file:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# OpenAI Configuration
OPENAI_API_KEY=your_openai_api_key

# Optional: Web Search API
TAVILY_API_KEY=your_tavily_api_key
```

### 4. Run the Application

```bash
npm run dev
```

Visit `http://localhost:3000` to see the application.

## Data Upload

### Upload Course Data

Use the sample CSV files in `sample-data/` or create your own:

```bash
# Upload courses
curl -X POST http://localhost:3000/api/admin/upload-courses \
  -F "file=@sample-data/courses.csv"

# Upload options
curl -X POST http://localhost:3000/api/admin/upload-options \
  -F "file=@sample-data/options.csv"
```

### CSV Format

**Courses CSV:**
```csv
id,title,dept,units,level,description,terms_offered,prereqs,skills,workload,assessments,source_url
ECE486,Robot Dynamics and Control,ECE,0.5,400,"Advanced robotics course...","[""F"",""W""]","ECE 380","[""robotics"",""control""]","{""reading"": 3, ""assignments"": 4}","{""midterm"": 30, ""final"": 40}","https://..."
```

**Options CSV:**
```csv
id,name,program,faculty,required_courses,selective_rules,description,source_url
robotics-option,Robotics Option,MTE,Engineering,"[""ECE486""]","{""selectNfrom"": [""MTE380""], ""N"": 1}","Robotics specialization...","https://..."
```

## How It Works

### 1. User Onboarding
- Users sign up and create a profile with their program, term, goals, and constraints
- Profile data is used to personalize recommendations

### 2. Chat Interface
- Users ask questions about electives, options, or academic planning
- The system searches the database for relevant courses and information
- If information is missing, it falls back to web search

### 3. Recommendation Engine
- Courses are scored based on:
  - Goal alignment (40 points)
  - Program fit (15 points)
  - Prerequisites met (15 points)
  - Term availability (10 points)
  - Workload alignment (10 points)
  - Level progression (10 points)

### 4. RAG (Retrieval Augmented Generation)
- Document chunks are stored with embeddings for semantic search
- Relevant chunks are retrieved and provided as context to the LLM
- Responses include citations and source links

## Database Schema

### Core Tables
- `courses`: Course information (prerequisites, skills, workload, etc.)
- `options`: Waterloo specializations/options
- `course_option_map`: Many-to-many mapping of courses to options
- `profiles`: User profiles and preferences
- `chat_sessions`: Chat conversation sessions
- `messages`: Individual chat messages
- `elective_docs`: Document chunks for RAG with embeddings

### Vector Search
- Uses pgvector extension for similarity search
- Embeddings generated with OpenAI text-embedding-3-large
- Supports both keyword and semantic search

## API Endpoints

- `POST /api/chat` - Main chat endpoint
- `POST /api/chat/session` - Create new chat session
- `POST /api/admin/upload-courses` - Upload course data
- `POST /api/admin/upload-options` - Upload option data

## Customization

### Adding New Programs
1. Update the programs list in `ProfileSetup.tsx`
2. Add program-specific logic in the scoring functions
3. Update the database schema if needed

### Modifying Scoring Algorithm
Edit the scoring functions in `src/lib/search.ts`:
- `calculateGoalMatch()`
- `calculateProgramFit()`
- `checkPrerequisites()`
- `checkTermAvailability()`
- `checkWorkloadAlignment()`
- `checkLevelProgression()`

### Adding New Data Sources
1. Implement text extraction in `src/lib/data-ingestion.ts`
2. Add new upload endpoints in `src/app/api/admin/`
3. Update the web search fallback in `src/lib/web-search.ts`

## Deployment

### Vercel (Recommended)
1. Connect your GitHub repository to Vercel
2. Add environment variables in Vercel dashboard
3. Deploy automatically on push to main

### Other Platforms
- **Frontend**: Deploy to Vercel, Netlify, or similar
- **Database**: Use Supabase (hosted PostgreSQL)
- **API**: Deploy to Vercel, Railway, or similar

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

MIT License - see LICENSE file for details

## Support

For questions or issues:
1. Check the GitHub issues
2. Create a new issue with detailed description
3. Contact the development team

---

Built with ❤️ for Waterloo Engineering students
