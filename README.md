# 🚀 AI Resume Analyzer

[![Next.js](https://img.shields.io/badge/Next.js-000000?style=for-the-badge&logo=nextdotjs&logoColor=white)](https://nextjs.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-005571?style=for-the-badge&logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com/)
[![Tailwind CSS v4](https://img.shields.io/badge/Tailwind_CSS_v4-38B2AC?style=for-the-badge&logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
[![Groq](https://img.shields.io/badge/Groq-F55036?style=for-the-badge&logo=groq&logoColor=white)](https://groq.com/)
[![Clerk](https://img.shields.io/badge/Clerk_Auth-6C47FF?style=for-the-badge&logo=clerk&logoColor=white)](https://clerk.com/)
[![Prisma](https://img.shields.io/badge/Prisma_ORM-2D3748?style=for-the-badge&logo=prisma&logoColor=white)](https://prisma-client-py.readthedocs.io/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-316192?style=for-the-badge&logo=postgresql&logoColor=white)](https://neon.tech/)
[![Render](https://img.shields.io/badge/Render-46E3B7?style=for-the-badge&logo=render&logoColor=white)](https://render.com/)
[![Vercel](https://img.shields.io/badge/Vercel-000000?style=for-the-badge&logo=vercel&logoColor=white)](https://vercel.com/)

> **Live Demo**: [https://ai-resume-analyzer-chi-blond.vercel.app](https://ai-resume-analyzer-chi-blond.vercel.app)  
> **API Backend**: [https://ai-resume-analyzer-u5ko.onrender.com](https://ai-resume-analyzer-u5ko.onrender.com)

A professional, production-ready, dark-themed **AI Resume Analyzer** that evaluates your resume against ATS (Applicant Tracking Systems) standards and target job descriptions. Powered by high-speed **Groq LPUs**, it features instant text extraction, deep ATS metrics scoring, structured diagnostic audits, dynamic inline bullet point rewrites, user history tracking via Clerk, and print-formatted PDF exports.

---

## 🏗️ System Architecture & Workflow

```mermaid
graph TD
    A[Frontend: Drag-and-Drop PDF] --> B(Backend: PDF Parser)
    B -->|Attempt Text Extraction| C{Text Extracted?}
    C -->|Yes| E[Save Raw Text to DB via Prisma]
    C -->|No: Scanned/Image PDF| D[Error: Scanned Image PDF]
    E --> F[Generate Evaluation Prompt & Schema]
    F --> G[Call Groq LPUs API with Pydantic JSON Schema]
    G -->|Self-healing schema validation| H[Structured ATS Results]
    H --> I[Frontend Dashboard: Glassmorphic UI Render]
    I -->|User triggers| J[Inline Bullet Point AI Rewrite]
    I -->|User triggers| K[Generate Print-Ready PDF Report]
```

---

## ✨ Core Features

1. **Futuristic Glassmorphic Interface**: Custom dark-mode UI with vibrant gradient orbs, frosted glass containers (`backdrop-blur`), modern typography, and smooth micro-animations.
2. **Robust Text Extraction & Diagnostics**:
   - Primary: Fast text parsing via `pdfplumber`.
   - Validation: Detects unreadable/scanned image PDFs and provides descriptive guidance.
3. **Comprehensive ATS Intelligence**:
   - **General ATS Score**: Overall rating out of 100 based on machine readability and structure.
   - **Sub-Scores**: Granular metrics across Impact, ATS Compatibility, Skills Density, Brevity, and Formatting.
   - **Job Matching & Gap Analysis**: 0-100% role match percentage with missing technical keywords and soft skills.
   - **Section-by-Section Audits**: Health diagnostics for Contact, Summary, Experience, Skills, and Education.
4. **Actionable Critiques & Inline Rewriting**:
   - Prioritizes issues by severity (`critical`, `warning`, `suggestion`).
   - Generates high-impact, quantified rewrites with before-and-after comparisons.
5. **PDF Export**:
   - Client-side document rendering with Letter-format PDF downloads.
6. **Authentication & History Storage**:
   - Integrated with **Clerk Auth** and **Neon PostgreSQL** via **Prisma ORM** for persistent scan history.

---

## 🛠️ Detailed Tech Stack

### Languages & Frameworks
| Technology | Badge | Purpose |
| :--- | :--- | :--- |
| **Python 3.11** | `![Python](https://img.shields.io/badge/Python-3776AB?style=flat-square&logo=python&logoColor=white)` | Async FastAPI backend logic. |
| **FastAPI** | `![FastAPI](https://img.shields.io/badge/FastAPI-005571?style=flat-square&logo=fastapi&logoColor=white)` | High-performance ASGI REST API with Pydantic v2 schemas. |
| **TypeScript** | `![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=flat-square&logo=typescript&logoColor=white)` | Type-safe React & Next.js architecture. |
| **Next.js 16** | `![Next.js](https://img.shields.io/badge/Next.js-000000?style=flat-square&logo=nextdotjs&logoColor=white)` | App Router React frontend framework. |
| **Tailwind CSS v4** | `![Tailwind](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=flat-square&logo=tailwindcss&logoColor=white)` | Modern design system and glassmorphism tokens. |

### Core Libraries & Utilities
| Folder | Library | Purpose |
| :--- | :--- | :--- |
| **Frontend** | `@clerk/nextjs` | Authentication wrapper & user session token holder. |
| | `html2canvas-pro` & `jspdf` | Client-side DOM-to-PDF export handler. |
| | `react-dropzone` | Drag-and-drop file inputs handler with strict PDF constraints. |
| | `lucide-react` | Modern SVG system icon set. |
| **Backend** | `openai` SDK | Groq-compatible inference client. |
| | `prisma-client-py` | Async ORM client interface with Neon PostgreSQL. |
| | `pdfplumber` | Raw PDF text extraction. |
| | `pydantic v2` | Self-healing schema validation & data parsing. |
| | `uvicorn` | High-speed ASGI server implementation. |

### Infrastructure
| Service | Badge | Role |
| :--- | :--- | :--- |
| **Neon** | `![Neon](https://img.shields.io/badge/PostgreSQL-316192?style=flat-square&logo=postgresql&logoColor=white)` | Serverless PostgreSQL database. |
| **Render** | `![Render](https://img.shields.io/badge/Render-46E3B7?style=flat-square&logo=render&logoColor=white)` | Live FastAPI backend web service. |
| **Vercel** | `![Vercel](https://img.shields.io/badge/Vercel-000000?style=flat-square&logo=vercel&logoColor=white)` | Live Next.js frontend deployment. |

---

## 📁 Repository Structure

```text
├── backend/
│   ├── app/
│   │   ├── api/             # API routes and endpoints
│   │   ├── core/            # Core configuration (DB, CORS, AI client, dotenv)
│   │   ├── models/          # Pydantic data schemas & resilient validators
│   │   └── main.py          # FastAPI application entry point with Vercel CORS regex
│   ├── prisma/
│   │   └── schema.prisma    # Prisma database models
│   ├── requirements.txt     # Python backend dependencies
│   ├── Dockerfile           # Multi-stage production container definition
│   └── Procfile             # Process manager start command
│
├── frontend/
│   ├── src/
│   │   ├── app/             # Next.js App Router pages
│   │   ├── components/      # Glassmorphic UI components (UploadCard, Dashboard, etc.)
│   │   ├── lib/             # API client with automatic URL sanitization
│   │   └── types/           # TypeScript definitions
│   ├── package.json         # Frontend dependencies & scripts
│   └── .env.local           # Local environment variables
```

---

## ⚙️ Setup and Installation

### Database Configuration
Create a PostgreSQL database on [Neon.tech](https://neon.tech) and copy your connection string (`DATABASE_URL`).

### Backend Setup (Local)
1. Navigate to the backend folder:
   ```bash
   cd backend
   ```
2. Set up a virtual environment:
   ```bash
   python -m venv venv
   # Windows:
   venv\Scripts\activate
   # macOS/Linux:
   source venv/bin/activate
   ```
3. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```
4. Create a `.env` file in the `backend/` directory:
   ```env
   DATABASE_URL="postgresql://username:password@ep-pooler.neon.tech/neondb?sslmode=require"
   GROQ_API_KEY="your-groq-api-key"
   GROQ_MODEL="openai/gpt-oss-120b"
   ```
5. Generate Prisma client & push schema:
   ```bash
   prisma db push
   ```
6. Start the development server:
   ```bash
   uvicorn app.main:app --reload --port 8000
   ```

---

### Frontend Setup (Local)
1. Navigate to the frontend folder:
   ```bash
   cd ../frontend
   ```
2. Install Node dependencies:
   ```bash
   npm install
   ```
3. Create a `.env.local` configuration:
   ```env
   NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY="pk_test_..."
   CLERK_SECRET_KEY="sk_test_..."
   NEXT_PUBLIC_API_URL="http://localhost:8000"
   ```
4. Start the frontend dev server:
   ```bash
   npm run dev
   ```

---

## 🚀 Production Deployment

### Backend Deployment (Render)
1. Create a **New Web Service** on [Render.com](https://render.com) and link this repository.
2. Configure settings:
   - **Root Directory**: `backend`
   - **Runtime**: `Python 3`
   - **Build Command**: `pip install -r requirements.txt && python -m prisma generate`
   - **Start Command**: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
3. Add Environment Variables:
   - `DATABASE_URL`: *(Your Neon DB connection string)*
   - `GROQ_API_KEY`: *(Your Groq API key)*
   - `GROQ_MODEL`: `openai/gpt-oss-120b`

### Frontend Deployment (Vercel)
1. Import the repository into [Vercel](https://vercel.com).
2. Set **Root Directory** to `frontend`.
3. Add Environment Variables:
   - `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`: *(Your Clerk publishable key)*
   - `CLERK_SECRET_KEY`: *(Your Clerk secret key)*
   - `NEXT_PUBLIC_API_URL`: `https://ai-resume-analyzer-u5ko.onrender.com`
4. Deploy and verify at your Vercel production domain!

