# Backend - Resume Optimizer

Backend API for the Resume Optimizer system.

## Setup

1. Install dependencies:
```bash
npm install
```

2. Configure environment:
```bash
cp .env.example .env
# Edit .env with your credentials
```

3. Setup database:
```bash
npx prisma generate
npx prisma migrate dev
```

4. Start server:
```bash
npm run dev
```

## Scripts

- `npm run dev` - Start development server with auto-reload
- `npm run build` - Build for production
- `npm start` - Start production server
- `npx prisma studio` - Open database GUI
- `npx prisma migrate dev` - Run migrations

## API Documentation

See [API.md](./API.md) for detailed endpoint documentation.

## Services

- **resumeParser** - Parses DOCX to structured JSON
- **jdParser** - Extracts requirements from job descriptions
- **gapAnalysis** - Compares resume vs JD requirements
- **resumeRewrite** - Optimizes resume content
- **hallucinationValidator** - Prevents false information
- **atsScorer** - Calculates compatibility scores
- **resumeRenderer** - Generates DOCX from JSON
