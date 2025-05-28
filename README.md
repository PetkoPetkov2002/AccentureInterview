# JobFair - Inclusive Job Description SaaS

A comprehensive SaaS application that helps users craft and edit inclusive job descriptions from scratch, built for JobFair as an MVP under tight development deadlines.

## Project Overview

JobFair is a full-stack application designed to assist HR professionals and recruiters in creating bias-free, inclusive job descriptions. The application leverages AI-powered agents to analyze job requirements, generate descriptions, and provide gender neutrality recommendations.

### Key Features

- **Interactive Job Description Builder**: Guided conversation flow to gather job requirements
- **AI-Powered Generation**: Automated job description creation using advanced language models
- **Gender Bias Detection**: Real-time analysis and recommendations for inclusive language
- **Version Management**: Track and manage multiple versions of job descriptions
- **Canvas Interface**: Visual editing environment with suggestion application
- **Readability Analysis**: Built-in text analysis for optimal readability scores

## Architecture

### Frontend
- **Framework**: React (Next.js App Router)
- **Styling**: CSS Modules with custom styling
- **Location**: `my-app/` directory

### Backend
- **Framework**: FastAPI (Python)
- **AI Orchestration**: Pydantic AI framework
- **Location**: `Backend/ChatbotTidy.py`

### Database
- **Primary Database**: Supabase
- **Vector Storage**: Supabase vector table for semantic similarity matching
- **Features**: Real-time subscriptions, authentication, and vector search capabilities

## Getting Started

### Prerequisites

- Python 3.8+
- Node.js 16+
- npm or yarn
- Supabase account and project

### Environment Variables

Create the following environment files:

#### Backend Environment (`.env` in root directory)
```env
OPENAI_API_KEY=your_openai_api_key
SUPABASE_URL=your_supabase_project_url
SUPABASE_ANON_KEY=your_supabase_anon_key
GROQ_API_KEY=your_groq_api_key
```

#### Frontend Environment (`my-app/.env.local`)
```env
NEXT_PUBLIC_API_URL=http://localhost:8000
```

### Backend Setup

1. **Navigate to the project root directory**
   ```bash
   cd /path/to/your/project
   ```

2. **Install Python dependencies**
   ```bash
   pip install -r requirements.txt
   ```
   
   Or if you don't have a requirements.txt, install the main dependencies:
   ```bash
   pip install fastapi uvicorn pydantic-ai openai supabase python-dotenv textstat
   ```

3. **Run the backend server**
   ```bash
   python Backend/ChatbotTidy.py
   ```
   
   The backend will start on `http://localhost:8000`

### Frontend Setup

1. **Navigate to the frontend directory**
   ```bash
   cd my-app
   ```

2. **Install Node.js dependencies**
   ```bash
   npm install
   ```

3. **Run the development server**
   ```bash
   npm run dev
   ```
   
   The frontend will start on `http://localhost:3000`

### Database Setup

1. **Create a Supabase project** at [supabase.com](https://supabase.com)

2. **Set up the required tables and functions** (refer to the database schema in the attached documentation)

3. **Configure vector extensions** for semantic similarity matching

4. **Update environment variables** with your Supabase credentials

## 📁 Project Structure

```
├── Backend/
│   ├── ChatbotTidy.py              # Main FastAPI application
│   ├── chatbot_prompts.py          # Agent system prompts
│   ├── chatbot_generation_prompts.py # Generation prompts
│   └── [other backend files]
├── my-app/                         # React frontend
│   ├── src/
│   │   ├── app/                    # Next.js app router pages
│   │   ├── components/             # Reusable React components
│   │   ├── services/               # API service functions
│   │   └── types/                  # TypeScript type definitions
│   ├── package.json
│   └── [other frontend files]
├── FinalProjectReport-21.pdf       # Comprehensive project documentation
└── README.md
```

## 🔧 API Endpoints

### Main Endpoints

- `POST /chatendpoint` - Main chat interface for requirement gathering
- `POST /edit_chat` - Edit existing job descriptions
- `POST /selection_edit` - Edit selected text portions
- `POST /apply_change` - Apply gender neutrality suggestions
- `POST /create_new_version` - Create new job description versions
- `POST /save_version` - Save current version changes
- `GET /api/threads/{thread_id}/version-histories` - Retrieve version history
- `POST /readability` - Calculate readability metrics

## 🤖 AI Agents

The application uses multiple specialized AI agents:

- **Chat Agent**: Gathers job requirements through conversational interface
- **Job Description Agent**: Generates comprehensive job descriptions
- **Editor Agent**: Handles job description modifications
- **Gender Expert Agent**: Analyzes and recommends gender-neutral language
- **Judge Agent**: Evaluates job description quality and compliance

## 📊 Features in Detail

### Conversational Job Builder
- Guided conversation flow to collect all necessary job information
- Intelligent requirement gathering with context awareness
- Thread-based conversation management

### AI-Powered Generation
- Semantic similarity matching with vector database
- Inclusive language recommendations
- Automated readability optimization

### Version Control
- Multiple job description versions per thread
- Visual diff highlighting
- Rollback capabilities

### Canvas Interface
- Interactive editing environment
- Real-time suggestion application
- Metrics dashboard with readability scores

## 📖 Documentation

Comprehensive project documentation is provided in the attached PDF report (`FinalProjectReport-21.pdf`), which includes:

- Detailed system architecture
- Database schema and relationships
- AI agent implementation details
- User interface design decisions
- Testing and validation results

## ⚠️ Development Notes

**Important**: This project was developed as an MVP under very tight deadlines for JobFair. As a solo full-stack developer, the focus was on delivering core functionality quickly. 

**Code Comments**: Adding comprehensive code comments has been identified as the next priority item on the development roadmap. The current codebase prioritizes functionality over documentation due to time constraints.

**Documentation**: While inline comments are minimal, extensive documentation is available in the attached PDF report covering all aspects of the system.

## 🚀 Deployment

### Backend Deployment
- Deploy FastAPI application to your preferred cloud provider
- Ensure all environment variables are properly configured
- Set up proper CORS policies for production

### Frontend Deployment
- Build the Next.js application: `npm run build`
- Deploy to Vercel, Netlify, or your preferred hosting platform
- Update API URLs for production environment

## 🤝 Contributing

This is currently a solo-developed MVP. Future contributions should focus on:

1. Adding comprehensive code comments
2. Implementing additional test coverage
3. Enhancing error handling and validation
4. Optimizing performance and scalability

## 📄 License

[Add your license information here]

## 📞 Support

For technical questions or support, please refer to the comprehensive documentation provided in the PDF report or contact the development team.

---

**Built with ❤️ for JobFair - Making job descriptions more inclusive, one description at a time.** 