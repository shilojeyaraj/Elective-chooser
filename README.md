# University of Waterloo Elective Chooser

A full-stack application for helping students choose electives at the University of Waterloo.

## 🏗️ Project Structure

```
├── frontend/          # Next.js React application
│   ├── src/          # Source code
│   ├── public/       # Static assets
│   └── package.json  # Frontend dependencies
├── backend/          # Data processing and scripts
│   ├── data-to-ingest/  # CSV/JSON data files
│   ├── scripts/         # Python processing scripts
│   └── requirements.txt # Python dependencies
└── package.json      # Root package.json for monorepo
```

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- Python 3.8+
- Supabase account

### Installation
```bash
# Install all dependencies
npm run install:all

# Or install separately
npm run install:frontend  # Frontend dependencies
npm run install:backend   # Backend dependencies
```

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

## 🎨 Styling Debug

The admin page includes comprehensive styling debugging:

1. **Visual Test Section** - Shows colored boxes to test Tailwind classes
2. **Console Logging** - Detailed logs about CSS loading status
3. **Status Indicator** - Real-time styling status in the header

### Debugging Steps:
1. Open browser console (F12)
2. Look for `🎨` prefixed logs
3. Check if colored test boxes are visible
4. Verify styling status indicator

## 📁 Data Management

### Frontend (Next.js)
- **Admin Interface**: Upload and manage data
- **API Routes**: Handle file uploads and processing
- **Styling**: Tailwind CSS with debugging

### Backend (Python)
- **Data Processing**: CSV/JSON parsing and transformation
- **Database Scripts**: SQL migrations and setup
- **Data Files**: Raw and processed data storage

## 🔧 Troubleshooting

### Styling Issues
- Check browser console for `🎨` logs
- Verify Tailwind CSS is loading
- Try hard refresh (Ctrl+F5)
- Clear browser cache

### Compilation Issues
- Run `npm run clean` to clear cache
- Check TypeScript errors with `npm run type-check`
- Restart development server

### Data Upload Issues
- Check Supabase connection
- Verify environment variables
- Check browser network tab for API errors

## 📊 Features

- **Course Management**: Upload and manage course data
- **Program Options**: Handle different engineering programs
- **CSE Electives**: Specialized computer science electives
- **Technical Electives**: All engineering technical electives
- **AI Recommendations**: Smart course recommendations
- **Admin Interface**: Easy data management

## 🎯 Next Steps

1. **Test Styling**: Verify all colors and gradients are working
2. **Upload Data**: Test all upload functionality
3. **Debug Issues**: Use console logs to identify problems
4. **Optimize Performance**: Use turbo mode for faster development

## 🔄 Recent Updates (Latest)

### ✅ **Fixed Issues (December 2024)**

#### **Database Query Errors Fixed:**
- **JSONB Query Syntax**: Fixed `jsonb && unknown` operator errors
- **Session ID Generation**: Fixed UUID generation for chat sessions
- **Skills Filter**: Fixed JSONB array searching for course skills
- **Term Filter**: Fixed JSONB array searching for course terms

#### **Chatbot Improvements:**
- **Conversational Tone**: Made chatbot more friendly and chatty
- **Smart Recommendations**: Only gives recommendations when explicitly asked
- **Better Greetings**: Responds to "hello" with friendly greeting instead of immediate recommendations
- **Reduced Formality**: Removed academic jargon, made responses more natural

#### **Environment Configuration:**
- **Frontend Variables**: Added `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- **Backend Variables**: Maintained separate backend environment variables
- **Environment Files**: Created proper `.env.local` for Next.js frontend

#### **Search Functionality:**
- **Course Search**: Fixed JSONB query operators for better course filtering
- **Vector Search**: Temporarily disabled due to database function type mismatch
- **Web Search**: Disabled to prevent 404 errors from non-existent URLs
- **Skills Matching**: Improved skills-based course filtering

#### **Profile Setup:**
- **Engineering Programs**: Added comprehensive list of Waterloo Engineering programs
- **Program Names**: Included both short codes and full names (e.g., "AE - Architectural Engineering")
- **User Experience**: Improved program selection interface

### 🐛 **Known Issues:**
- **Vector Search**: Database function needs type correction (option_id should be TEXT not UUID)
- **Web Search**: Disabled due to 404 errors from mock URLs
- **RLS Policies**: May need adjustment for production use

### 🔧 **Technical Details:**
- **Database**: Supabase with PostgreSQL
- **Frontend**: Next.js 14 with TypeScript
- **Backend**: Python scripts for data processing
- **AI**: OpenAI GPT-4o-mini for chat responses
- **Search**: Course search with JSONB filtering