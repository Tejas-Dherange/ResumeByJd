# Frontend - Resume Optimizer

React frontend for the Resume Optimizer application.

## Setup

1. Install dependencies:
```bash
npm install
```

2. Start development server:
```bash
npm run dev
```

Frontend will be available at `http://localhost:3000`

## Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build

## Pages

- **Upload** (`/`) - Upload resume and paste JD
- **Analysis** (`/analysis/:id`) - View gap analysis
- **Result** (`/result/:id`) - View optimized resume and download

## Components

- `ResumeUploader` - Drag-and-drop file upload
- `JDInput` - Job description textarea
- `GapTable` - Keyword gap visualization
- `ATSScoreCard` - Circular score display

## Tech Stack

- React 18 + TypeScript
- Vite (build tool)
- TailwindCSS (styling)
- React Router (routing)
- React Hook Form (forms)
- Axios (HTTP client)
