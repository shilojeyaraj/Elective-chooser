# UW Elective Chooser 🎓

An AI-powered elective recommendation system for University of Waterloo Engineering students. Get personalized course recommendations based on your program, interests, and career goals.

## 🌟 Features

- **AI-Powered Recommendations**: Get personalized elective suggestions using OpenAI GPT-4
- **Program-Aware**: Understands your engineering program and current term
- **Career Goal Alignment**: Recommendations based on your interests and career aspirations
- **Course Details**: Comprehensive course information with prerequisites, workload, and assessments
- **UW Flow Integration**: Direct links to course reviews and ratings
- **Option & Specialization Analysis**: Track progress toward engineering options and specializations
- **CSE Course Support**: Find Complementary Studies Electives (List A, B, C, D)

## 🏗️ Architecture

```
├── frontend/                 # Next.js React application
│   ├── src/
│   │   ├── app/             # Next.js app router pages
│   │   ├── components/      # React components
│   │   └── lib/            # Utility functions and types
├── database/                # Database files and data
│   ├── complete_database_setup.sql
│   └── *.json              # Course data files
├── scripts/                # Python scripts for data processing
├── deployment/             # Deployment configurations
└── docs/                  # Documentation files
```

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ and npm
- Python 3.8+
- Supabase account
- OpenAI API key

### 1. Clone and Setup

```bash
git clone <repository-url>
cd uw-elective-chooser
```

### 2. Environment Setup

Create `.env.local` in the frontend directory:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_KEY=your_supabase_service_key
OPENAI_API_KEY=your_openai_api_key
```

### 3. Database Setup

Run the complete database setup:

```sql
-- Execute database/complete_database_setup.sql in your Supabase SQL editor
```

### 4. Install Dependencies

```bash
cd frontend
npm install
```

### 5. Run Development Server

```bash
npm run dev
```

Visit `http://localhost:3000` to see the application.

## 📊 Database Schema

The application uses PostgreSQL with Supabase and includes:

- **Users & Profiles**: User authentication and profile management
- **Courses**: Comprehensive course database with embeddings
- **Options & Specializations**: Engineering options and specializations
- **Chat System**: Session-based conversation storage
- **Vector Search**: AI-powered course recommendations

## 🔧 Data Ingestion

To populate the database with course data:

```bash
cd scripts
python ingest_courses.py
python ingest_specializations.py
```

## 🚀 Deployment

### Vercel (Recommended)

1. Connect your GitHub repository to Vercel
2. Set environment variables in Vercel dashboard
3. Deploy automatically on push to main branch

### Docker

```bash
cd deployment
docker-compose up -d
```

## 🎯 Usage

1. **Sign Up**: Create an account with your email
2. **Profile Setup**: Select your program, interests, and career goals
3. **Get Recommendations**: Chat with the AI to get personalized course suggestions
4. **Explore Courses**: View detailed course information and UW Flow links
5. **Track Progress**: Monitor your progress toward options and specializations

## 🤖 AI Features

- **Contextual Understanding**: Knows your program, term, and completed courses
- **Smart Filtering**: Recommends appropriate level courses based on your current term
- **Diverse Results**: Provides varied recommendations when asked for "more" or "different" courses
- **CSE Knowledge**: Understands Complementary Studies Elective requirements
- **Option Analysis**: Can analyze your progress toward specific engineering options

## 📁 Project Structure

### Frontend (`/frontend`)
- **Pages**: Login, signup, profile setup, chatbot interface
- **Components**: Chat interface, course recommendations, modals
- **API Routes**: Chat, profile management, data ingestion
- **Lib**: Search functions, types, utilities

### Database (`/database`)
- **SQL Files**: Complete database setup and migrations
- **JSON Data**: Course data, specializations, options

### Scripts (`/scripts`)
- **Data Processing**: Course ingestion, data cleaning
- **Database Management**: Schema updates, data migration

### Deployment (`/deployment`)
- **Docker**: Container configurations
- **Batch Files**: Windows deployment scripts
- **Environment**: Configuration templates

## 🔍 Key Technologies

- **Frontend**: Next.js 15, React, TypeScript, Tailwind CSS
- **Backend**: Supabase, PostgreSQL, pgvector
- **AI**: OpenAI GPT-4, LangChain, RAG
- **Deployment**: Vercel, Docker
- **Database**: PostgreSQL with vector embeddings

## 📈 Performance

- **Vector Search**: Fast similarity search using pgvector
- **Caching**: Optimized database queries and response caching
- **Responsive**: Mobile-first design with Tailwind CSS
- **Real-time**: Live chat interface with session persistence

## 🛠️ Development

### Adding New Features

1. **Database Changes**: Update `database/complete_database_setup.sql`
2. **API Routes**: Add to `frontend/src/app/api/`
3. **Components**: Create in `frontend/src/components/`
4. **Types**: Update `frontend/src/lib/types.ts`

### Data Updates

1. **New Courses**: Add to `database/` JSON files
2. **Run Scripts**: Execute appropriate Python scripts
3. **Update Embeddings**: Regenerate vector embeddings

## 📝 License

This project is licensed under the MIT License.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## 📞 Support

For questions or issues, please open a GitHub issue or contact the development team.

---

**Built with ❤️ for University of Waterloo Engineering Students**
