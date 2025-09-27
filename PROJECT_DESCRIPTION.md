# UW Elective Chooser - Project Description

## Project Overview

**UW Elective Chooser** is a comprehensive AI-powered web application designed to help University of Waterloo Engineering students make informed decisions about their elective courses. The platform combines advanced AI technology with extensive course data to provide personalized recommendations based on students' academic programs, interests, and career goals.

## Problem Statement

Choosing electives in engineering programs can be overwhelming due to:
- Hundreds of available courses across 11 engineering programs
- Complex prerequisite chains and program requirements
- Difficulty aligning course choices with career goals
- Lack of personalized guidance for course selection
- Scattered course information across multiple platforms

## Solution

A full-stack web application that provides:
- **AI-powered personalized recommendations** using GPT-4o-mini
- **Natural language chat interface** for intuitive course discovery
- **Comprehensive course database** with 284+ courses from all Waterloo Engineering programs
- **Vector-based semantic search** for intelligent course matching
- **User profile management** for personalized experiences
- **Real-time chat sessions** with context-aware responses

## Technical Architecture

### Frontend Stack
- **Framework**: Next.js 15 with TypeScript
- **UI Library**: React 18 with custom components
- **Styling**: Tailwind CSS with dark mode support
- **State Management**: React Context API
- **Icons**: Lucide React
- **Build Tool**: Next.js built-in bundler

### Backend Stack
- **Database**: PostgreSQL with Supabase (Backend-as-a-Service)
- **Vector Search**: pgvector extension for semantic search
- **Authentication**: Supabase Auth with JWT tokens
- **API**: Next.js API routes with TypeScript
- **Data Processing**: Python 3.8+ with automated scripts

### AI & Machine Learning
- **Language Model**: OpenAI GPT-4o-mini for chat responses
- **Embeddings**: OpenAI text-embedding-3-large for vector search
- **Framework**: LangChain for AI application development
- **Memory Management**: LangChain conversation memory
- **RAG Implementation**: Retrieval Augmented Generation for context-aware responses

### Data Processing Pipeline
- **Web Scraping**: BeautifulSoup and Trafilatura for course data extraction
- **Data Processing**: Pandas and NumPy for data manipulation
- **PDF Processing**: PyPDF, PDFMiner, and Unstructured for document parsing
- **Database Population**: Automated CSV/JSON ingestion scripts
- **Vector Generation**: Automated embedding generation for semantic search

## Key Features

### 1. AI-Powered Chat Interface
- Natural language conversation with GPT-4o-mini
- Context-aware responses based on user profile and conversation history
- Personalized course recommendations with detailed explanations
- Program-specific advice and guidance
- Session persistence with LangChain memory management

### 2. Comprehensive Course Database
- **284+ courses** from all 11 Waterloo Engineering programs
- Detailed course information including:
  - Prerequisites and corequisites
  - Skills and learning outcomes
  - Workload estimates and assessment types
  - Terms offered and course codes
  - CSE (Complementary Studies Elective) classifications
- Vector embeddings for semantic search capabilities

### 3. Advanced Search & Filtering
- Multi-criteria search by department, level, skills, workload
- Skills-based course matching algorithm
- Program-specific filtering based on user's engineering discipline
- JSONB queries for efficient complex filtering
- Vector similarity search for semantic course discovery

### 4. User Management System
- Secure authentication with Supabase Auth
- Comprehensive user profiles with academic information
- Interest and skill preference tracking
- Course history and planning capabilities
- Admin interface for data management

### 5. Vector Search Implementation
- Semantic search through course descriptions using pgvector
- OpenAI text-embedding-3-large for high-quality embeddings
- Fast similarity search for relevant course recommendations
- Context-aware retrieval for RAG implementation

## Database Schema

### Core Tables
- **profiles**: User authentication and academic information
- **courses**: Comprehensive course database with vector embeddings
- **programs**: Engineering program definitions and requirements
- **options**: Engineering options and specializations
- **chat_sessions**: Persistent conversation management
- **messages**: Chat message storage with citations
- **elective_docs**: RAG document chunks for enhanced responses

### Key Features
- **JSONB columns** for flexible data storage (interests, constraints, course lists)
- **Vector columns** for semantic search capabilities
- **Foreign key relationships** for data integrity
- **Indexing** for optimized query performance
- **UUID primary keys** for scalability

## Technical Challenges Solved

### 1. Vector Search Implementation
- **Challenge**: Implementing semantic search across course descriptions
- **Solution**: Integrated pgvector with OpenAI embeddings for fast similarity search
- **Impact**: Enabled natural language course discovery and intelligent recommendations

### 2. RAG (Retrieval Augmented Generation)
- **Challenge**: Providing context-aware AI responses with course data
- **Solution**: Implemented LangChain-based RAG with vector search and conversation memory
- **Impact**: Delivered accurate, personalized course recommendations with proper citations

### 3. Data Ingestion Pipeline
- **Challenge**: Processing and normalizing data from multiple sources (CSV, JSON, web scraping)
- **Solution**: Built automated Python scripts for data cleaning, validation, and database population
- **Impact**: Maintained data consistency and enabled easy updates to course information

### 4. User Experience Optimization
- **Challenge**: Creating intuitive interface for complex course selection process
- **Solution**: Designed chat-based interface with progressive disclosure and context-aware responses
- **Impact**: Simplified complex decision-making process into conversational experience

### 5. Performance Optimization
- **Challenge**: Fast response times for vector search and AI chat
- **Solution**: Implemented database indexing, query optimization, and efficient vector operations
- **Impact**: Achieved sub-second response times for most operations

## Development Process

### Phase 1: Data Collection & Processing
- Web scraping course data from University of Waterloo websites
- Data cleaning and normalization using Python and Pandas
- Database schema design and implementation
- Vector embedding generation for semantic search

### Phase 2: Backend Development
- Supabase integration for authentication and database
- API route development for chat and profile management
- Vector search implementation with pgvector
- RAG system development with LangChain

### Phase 3: Frontend Development
- Next.js application with TypeScript
- Responsive UI design with Tailwind CSS
- Chat interface implementation
- User profile and authentication flows

### Phase 4: AI Integration
- OpenAI API integration for chat responses
- LangChain implementation for conversation memory
- RAG system for context-aware responses
- Vector search integration for course recommendations

### Phase 5: Testing & Deployment
- Comprehensive testing of all features
- Performance optimization and monitoring
- Vercel deployment with environment configuration
- Documentation and user guides

## Performance Metrics

- **Response Time**: Sub-second response times for most operations
- **Database Queries**: Optimized queries with proper indexing
- **Vector Search**: Fast similarity search using pgvector
- **User Experience**: Responsive design with mobile-first approach
- **Scalability**: Designed for concurrent user sessions

## Security & Privacy

- **Authentication**: Secure JWT-based authentication via Supabase
- **Data Protection**: User data encrypted in transit and at rest
- **API Security**: Rate limiting and input validation
- **Privacy**: No sensitive personal information stored beyond academic preferences

## Deployment & Infrastructure

- **Frontend**: Deployed on Vercel with automatic CI/CD
- **Database**: Supabase managed PostgreSQL with pgvector
- **AI Services**: OpenAI API for language model and embeddings
- **Monitoring**: Built-in error tracking and performance monitoring
- **Environment**: Production-ready with environment variable management

## Future Enhancements

- **Machine Learning**: Custom recommendation algorithms based on user behavior
- **Integration**: UW Flow API integration for real-time course reviews
- **Analytics**: User behavior tracking and recommendation improvement
- **Mobile App**: React Native mobile application
- **Advanced Features**: Course scheduling, conflict detection, and academic planning

## Technical Skills Demonstrated

### Frontend Development
- Next.js 15 with App Router and TypeScript
- React 18 with hooks and context management
- Tailwind CSS for responsive design
- Component architecture and state management
- API integration and error handling

### Backend Development
- PostgreSQL database design and optimization
- Supabase integration and authentication
- Python data processing and web scraping
- API development with Next.js
- Vector database operations and semantic search

### AI/ML Implementation
- OpenAI API integration (GPT-4o-mini, embeddings)
- LangChain framework for AI applications
- RAG (Retrieval Augmented Generation) implementation
- Vector similarity search and semantic matching
- Conversation memory and context management

### Data Engineering
- Web scraping with BeautifulSoup and Trafilatura
- Data processing with Pandas and NumPy
- Database schema design and migration
- Automated data ingestion pipelines
- Vector embedding generation and storage

### DevOps & Deployment
- Vercel deployment and CI/CD
- Environment configuration and secrets management
- Docker containerization
- Performance monitoring and optimization
- Database migration and version control

## Impact & Results

- **User Experience**: Simplified complex course selection process
- **Personalization**: AI-powered recommendations based on individual preferences
- **Efficiency**: Reduced time spent researching course options
- **Accuracy**: Context-aware recommendations with proper prerequisites
- **Accessibility**: Intuitive chat interface accessible to all users
- **Scalability**: Architecture supports growth and additional features

## Code Quality & Best Practices

- **TypeScript**: Full type safety throughout the application
- **Code Organization**: Modular architecture with clear separation of concerns
- **Error Handling**: Comprehensive error handling and user feedback
- **Documentation**: Well-documented code with clear comments
- **Testing**: Unit tests and integration testing where applicable
- **Performance**: Optimized queries and efficient data structures
- **Security**: Secure authentication and data protection measures

This project demonstrates expertise in full-stack development, AI/ML integration, database design, and user experience optimization, making it an excellent showcase for technical skills and problem-solving abilities.
