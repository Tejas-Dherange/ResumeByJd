# Resume Optimizer - JD-Aligned Resume Optimization System

An AI-powered full-stack application that optimizes resumes based on job descriptions while preserving structure and preventing hallucinations.

## 🎯 Features

- **📄 Resume Parsing**: Extracts DOCX structure using XML parsing while preserving formatting
- **🔍 Gap Analysis**: Identifies which keywords are strong, weak, or missing
- **🤖 AI Optimization**: Uses Gemini 2.0-flash to strengthen weak keywords
- **✅ Hallucination Detection**: Validates that no false skills are added
- **📊 ATS Scoring**: Calculates before/after scores with detailed breakdown
- **💾 DOCX Rendering**: Generates optimized resume maintaining original design

## 🏗️ Tech Stack

### Backend
- **Node.js** + **Express.js** + **TypeScript**
- **PostgreSQL** + **Prisma ORM**
- **OpenAI SDK** (for Gemini-compatible API)
- **Gemini 2.0-flash** model
- **Multer** (file uploads)
- **fast-xml-parser** (DOCX parsing)
- **docxtemplater** + **pizzip** (DOCX generation)

### Frontend
- **React 18** + **TypeScript**
- **Vite** (build tool)
- **TailwindCSS** (styling)
- **React Router** (routing)
- **React Hook Form** (form handling)
- **Axios** (API calls)

## 📦 Installation

### Prerequisites
- Node.js 18+
- PostgreSQL 14+
- Gemini API key ([Get one here](https://aistudio.google.com/))

### 1. Clone Repository
```bash
git clone <repository-url>
cd ResumeAsPerJd
```

### 2. Backend Setup
```bash
cd backend

# Install dependencies
npm install

# Copy environment file
cp .env.example .env

# Edit .env and add your credentials:
# - DATABASE_URL
# - GEMINI_API_KEY

# Generate Prisma client
npx prisma generate

# Run database migrations
npx prisma migrate dev

# Start backend server
npm run dev
```

Backend will run on `http://localhost:5000`

### 3. Frontend Setup
```bash
cd ../frontend

# Install dependencies
npm install

# Start frontend dev server
npm run dev
```

Frontend will run on `http://localhost:3000`

## 🚀 Usage

1. **Open** `http://localhost:3000` in your browser

2. **Upload** your resume (.docx file)

3. **Paste** the job description

4. **Click "Analyze Resume"** - The system will:
   - Parse your resume structure
   - Extract job requirements
   - Perform gap analysis

5. **Review** gap analysis results showing:
   - ✅ Strong keywords (present)
   - ⚠️ Weak keywords (needs strengthening)
   - ❌ Missing keywords (won't be added)

6. **Click "Optimize My Resume"** - The AI will:
   - Rephrase bullets with weak keywords
   - Avoid adding new skills
   - Validate for hallucinations

7. **Download** your optimized resume with improved ATS score!

## 📡 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/resume/upload` | Upload resume + JD |
| `POST` | `/api/resume/analyze` | Perform gap analysis |
| `POST` | `/api/resume/optimize` | Optimize resume |
| `GET` | `/api/resume/download/:id` | Download optimized DOCX |
| `GET` | `/api/resume/score/:id` | Get ATS scores |

## 🏛️ Architecture

```
┌─────────────┐
│   Frontend  │  React + TailwindCSS
│   (Vite)    │
└──────┬──────┘
       │ HTTP
       ▼
┌─────────────┐
│   Backend   │  Express + TypeScript
│   (Node.js) │
└──────┬──────┘
       │
       ├──▶ Prisma ──▶ PostgreSQL
       │
       └──▶ Gemini API (via OpenAI SDK)
```

## 🔒 Core Constraints

- ✅ Resume structure MUST remain unchanged
- ✅ NO new skills/tools may be added
- ✅ Only rephrase existing content
- ✅ Validate for hallucinations
- ✅ ATS scores must be explainable

## 🧪 Testing

### Test Resume Parsing
```bash
cd backend
# Place a sample.docx in the uploads folder
node -e "const service = require('./dist/services/resumeParser.service'); service.resumeParserService.parseResume('./uploads/sample.docx').then(console.log)"
```

### Test End-to-End Flow
1. Upload a resume through the UI
2. Paste a real job description
3. Verify gap analysis is accurate
4. Check optimized resume downloads correctly
5. Confirm ATS score improved

## 📝 Environment Variables

### Backend `.env`
```env
DATABASE_URL="postgresql://user:password@localhost:5432/resume_optimizer"
GEMINI_API_KEY="your-gemini-api-key"
PORT=5000
UPLOAD_DIR=./uploads
MAX_FILE_SIZE=10485760
```

## 🛠️ Development

### Backend Development
```bash
cd backend
npm run dev  # Auto-reload with ts-node-dev
```

### Frontend Development
```bash
cd frontend
npm run dev  # Hot reload with Vite
```

### Database Management
```bash
cd backend
npx prisma studio  # Visual database editor
npx prisma migrate dev  # Create new migration
```

## 📚 Project Structure

```
ResumeAsPerJd/
├── backend/
│   ├── src/
│   │   ├── services/         # Core business logic
│   │   ├── controllers/      # API request handlers
│   │   ├── routes/           # API endpoints
│   │   ├── llm/             # Gemini client + prompts
│   │   ├── utils/           # Helper functions
│   │   ├── middlewares/     # Express middlewares
│   │   └── types/           # TypeScript types
│   ├── prisma/
│   │   └── schema.prisma    # Database schema
│   └── uploads/             # Uploaded files
│
└── frontend/
    ├── src/
    │   ├── pages/           # Upload, Analysis, Result
    │   ├── components/      # Reusable UI components
    │   ├── services/        # API integration
    │   ├── hooks/           # Custom React hooks
    │   └── types/           # TypeScript types
    └── public/              # Static assets
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

MIT

## 🙏 Acknowledgments

- **Google Gemini** for AI-powered optimization
- **Prisma** for database ORM
- **TailwindCSS** for beautiful UI

---

**Built with ❤️ using Gemini AI**
