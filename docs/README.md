# 🎓 University of Waterloo Elective Chooser

A comprehensive AI-powered web application designed to help University of Waterloo Engineering students make informed decisions about their elective courses. The platform combines advanced AI technology with comprehensive course data to provide personalized recommendations based on students' academic programs, interests, and career goals.

## 🌟 Key Features

### 🤖 AI-Powered Recommendations
- **Intelligent Chat Interface**: Natural language conversation with GPT-4o-mini
- **Personalized Suggestions**: Course recommendations based on user profile and preferences
- **Context-Aware Responses**: Maintains conversation context using LangChain memory
- **Vector Search**: Semantic search through course descriptions and requirements

### 📚 Comprehensive Course Database
- **284+ Courses**: Complete database of Waterloo Engineering courses
- **11 Engineering Programs**: Support for all major engineering disciplines
- **Detailed Course Information**: Skills, workload, assessments, prerequisites, and terms offered
- **CSE Classification**: Proper categorization for Complementary Studies Electives

### 🎯 Advanced Search & Filtering
- **Multi-Criteria Search**: Filter by department, level, skills, workload, and more
- **Skills-Based Matching**: Find courses that align with your interests
- **Program-Specific Filtering**: Recommendations tailored to your engineering program
- **JSONB Queries**: Efficient database queries for complex filtering

### 👤 User Management
- **Secure Authentication**: Supabase-powered user authentication
- **Profile Management**: Store academic program, interests, and preferences
- **Session Management**: Persistent chat history and user context
- **Admin Interface**: Data management and upload capabilities

## 🏗️ Technical Architecture

### Frontend (Next.js 15)
- **Framework**: Next.js 15 with TypeScript
- **Styling**: Tailwind CSS with dark mode support
- **UI Components**: Custom React components with responsive design
- **State Management**: React Context for theme and user state
- **API Integration**: RESTful API routes for backend communication

### Backend (Python + Supabase)
- **Database**: PostgreSQL with Supabase
- **Vector Search**: pgvector extension for semantic search
- **Data Processing**: Python scripts for data ingestion and processing
- **AI Integration**: OpenAI GPT-4o-mini and text-embedding-3-large
- **Web Scraping**: BeautifulSoup, Trafilatura for data extraction

### AI & Machine Learning
- **Language Model**: OpenAI GPT-4o-mini for chat responses
- **Embeddings**: text-embedding-3-large for vector search
- **Memory Management**: LangChain for conversation context
- **RAG (Retrieval Augmented Generation)**: Enhanced responses with course data

### Data Management
- **Course Data**: 284 courses from 11 engineering programs
- **Program Data**: Specializations, certificates, diplomas, and minors
- **Vector Embeddings**: Pre-computed embeddings for semantic search
- **Data Ingestion**: Automated CSV/JSON processing and database population

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- Python 3.8+
- Supabase account
- OpenAI API key

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd "Elective Chooser"
   ```

2. **Install dependencies**
   ```bash
   # Install all dependencies
   npm run install:all
   
   # Or install separately
   npm run install:frontend  # Frontend dependencies
   npm run install:backend   # Backend dependencies
   ```

3. **Set up environment variables**
   Create a `.env.local` file in the `frontend/` directory:
   ```env
   # Supabase Configuration
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
   
   # OpenAI Configuration
   OPENAI_API_KEY=your_openai_api_key
   ```

4. **Set up the database**
   - Go to your Supabase project dashboard
   - Navigate to SQL Editor
   - Copy and paste the contents of `backend/data-to-ingest/supabase-schema.sql`
   - Click Run to create all tables

5. **Upload course data**
   - Go to `http://localhost:3000/admin`
   - Upload `processed_courses.csv` and `processed_programs.csv`

### Development

```bash
# Start frontend development server
npm run dev

# Start with Turbopack (faster)
npm run dev:turbo

# Start with debugging
npm run dev:debug
```

### Production

```bash
# Build and start production server
npm run build
npm run start
```

## 📁 Project Structure

```
├── frontend/                 # Next.js React application
│   ├── src/
│   │   ├── app/             # App router pages and API routes
│   │   │   ├── api/         # API endpoints
│   │   │   ├── admin/       # Admin interface
│   │   │   ├── login/       # Authentication pages
│   │   │   └── signup/
│   │   ├── components/      # React components
│   │   ├── contexts/        # React contexts
│   │   └── lib/            # Utility libraries
│   ├── public/             # Static assets
│   └── package.json        # Frontend dependencies
├── backend/                 # Data processing and scripts
│   ├── data-to-ingest/     # CSV/JSON data files
│   ├── scripts/            # Python processing scripts
│   └── requirements.txt    # Python dependencies
├── docker/                 # Docker configuration
├── DEPLOYMENT.md          # Deployment guide
├── SETUP_GUIDE.md         # Quick setup instructions
└── package.json           # Root package.json for monorepo
```

## 🔧 Key Technologies

### Frontend Stack
- **Next.js 15**: React framework with App Router
- **TypeScript**: Type-safe JavaScript
- **Tailwind CSS**: Utility-first CSS framework
- **Lucide React**: Icon library
- **React 18**: UI library with hooks

### Backend Stack
- **Python 3.8+**: Data processing and web scraping
- **Supabase**: Backend-as-a-Service with PostgreSQL
- **pgvector**: Vector similarity search
- **Pandas**: Data manipulation and analysis
- **BeautifulSoup**: HTML parsing and web scraping

### AI & ML Stack
- **OpenAI API**: GPT-4o-mini and text-embedding-3-large
- **LangChain**: AI application framework
- **Vector Search**: Semantic search capabilities
- **RAG**: Retrieval Augmented Generation

### Data Processing
- **CSV/JSON Processing**: Automated data ingestion
- **Web Scraping**: Course data extraction
- **PDF Processing**: Document parsing
- **Embedding Generation**: Vector embeddings for search

## 🎨 Features in Detail

### Chat Interface
- Natural language conversation with AI
- Context-aware responses based on user profile
- Course recommendations with detailed explanations
- Program-specific advice and guidance

### Course Search
- Advanced filtering by multiple criteria
- Skills-based course matching
- Department and level filtering
- Workload and assessment type filtering

### User Profiles
- Academic program selection
- Interest and skill preferences
- Course history tracking
- Personalized recommendations

### Admin Interface
- Data upload and management
- Course and program data editing
- Database health monitoring
- User management capabilities

## 🚀 Deployment

### Vercel (Recommended)
```bash
# Install Vercel CLI
npm install -g vercel

# Deploy from frontend directory
cd frontend
vercel

# Set environment variables in Vercel dashboard
# Redeploy
vercel --prod
```

### Docker
```bash
# Build and run with Docker Compose
docker-compose up --build
```

## 📊 Data Sources

- **University of Waterloo**: Official course catalogs and program requirements
- **Engineering Faculty**: Program-specific course information
- **Course Descriptions**: Detailed course content and learning outcomes
- **Prerequisites**: Course dependency information
- **Assessment Methods**: Grading schemes and evaluation criteria

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- University of Waterloo Engineering Faculty for course data
- OpenAI for AI capabilities
- Supabase for backend infrastructure
- The open-source community for various libraries and tools

## 📞 Support

For support, email [your-email] or create an issue in the repository.

---

**Built with ❤️ for Waterloo Engineering Students**