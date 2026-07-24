# 🚀 AI Resume Analyzer

[![Next.js](https://img.shields.io/badge/Next.js-000000?style=for-the-badge&logo=nextdotjs&logoColor=white)](https://nextjs.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-005571?style=for-the-badge&logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com/)
[![Tailwind CSS v4](https://img.shields.io/badge/Tailwind_CSS_v4-38B2AC?style=for-the-badge&logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
[![Google Gemini](https://img.shields.io/badge/Google_Gemini-8E75C2?style=for-the-badge&logo=googlegemini&logoColor=white)](https://deepmind.google/technologies/gemini/)
[![Clerk](https://img.shields.io/badge/Clerk_Auth-6C47FF?style=for-the-badge&logo=clerk&logoColor=white)](https://clerk.com/)
[![Prisma](https://img.shields.io/badge/Prisma_ORM-2D3748?style=for-the-badge&logo=prisma&logoColor=white)](https://prisma-client-py.readthedocs.io/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-316192?style=for-the-badge&logo=postgresql&logoColor=white)](https://neon.tech/)

A highly professional, production-ready, dark-themed **AI Resume Analyzer** that evaluates your resume against ATS (Applicant Tracking Systems) standards and target job descriptions. Powered by the modern **Google Gen AI SDK**, it features a hybrid text parser (with dynamic visual OCR fallback), deep ATS metrics scoring, structured critiques, dynamic inline bullet point rewrites, user history tracking, and a print-formatted PDF export option.

---

## 🏗️ System Architecture & Workflow

Here is how the application handles your documents from upload to detailed AI recommendations:

```mermaid
graph TD
    A[Frontend: Drag-and-Drop PDF] --> B(Backend: PDF Parser)
    B -->|Attempt Standard Text Extraction| C{Text Extracted?}
    C -->|Yes| E[Save Raw Text to DB]
    C -->|No: Scanned/Image PDF| D[OCR Fallback: Gemini 3.5 Multimodal PDF Parsing]
    D --> E
    E --> F[Generate Dynamic Analysis Prompt]
    F --> G[Call Gemini API with Structured Pydantic Schema]
    G -->|Parse structured response| H[Save Results]
    H --> I[Frontend Dashboard: Glassmorphic UI Render]
    I -->|User triggers| J[Inline Bullet Point AI Rewrite]
    I -->|User triggers| K[Generate Print-Ready PDF Report]
```

---

## ✨ Core Features

1. **Futuristic Dark-Mode Glassmorphism**: Tailored user interface featuring dynamic, animated purple/cyan gradient orbs, frosted glass containers (`backdrop-blur`), sleek typography, and responsive grid layouts.
2. **Hybrid Text Extraction & OCR Fallback**:
   - Primary: Fast text extraction via `pdfplumber`.
   - Secondary (OCR): Detects empty text inputs (commonly scanned PDF files) and pipes the raw PDF bytes into a multimodal prompt with the **Gemini 3.5 Flash** model for layout-preserved OCR.
3. **Structured ATS Intelligence**:
   - **General Score**: An overall ATS rating out of 100.
   - **Job Matching**: Dynamic matching metrics (0-100%) against target Job Descriptions.
   - **Gap Analysis**: Detailed list of missing keywords, frameworks, or skills.
   - **Executive Summary**: A concise professional overview of strengths and critical expansion opportunities.
4. **Actionable Critiques & Inline Rewriting**:
   - Breaks down items by Category (e.g., Formatting, Impact, Keywords).
   - Allows users to generate high-impact, quantified rewrites inside their browser card using an automated retry-mechanism endpoint.
5. **PDF Export**:
   - Uses `html2pdf.js` to compile the evaluation dashboard into a letter-format PDF.
   - Automatically cleans up the PDF report using helper attributes (`data-html2canvas-ignore="true"`) to exclude UI buttons from the generated document.
6. **Authentication & History Storage**:
   - Integrates **Clerk Auth** to partition histories.
   - Automatically synchronizes recent uploads dynamically in the sliding glass panel.

---

## 🛠️ Detailed Tech Stack

### Languages & Frameworks
| Technology | Badge | Purpose |
| :--- | :--- | :--- |
| **Python 3.11** | `![Python](https://img.shields.io/badge/Python-3776AB?style=flat-square&logo=python&logoColor=white)` | Main backend scripting language. |
| **FastAPI** | `![FastAPI](https://img.shields.io/badge/FastAPI-005571?style=flat-square&logo=fastapi&logoColor=white)` | High-performance, async web framework for API endpoints. |
| **TypeScript** | `![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=flat-square&logo=typescript&logoColor=white)` | Type-safe development for Next.js app components. |
| **Next.js 16** | `![Next.js](https://img.shields.io/badge/Next.js-000000?style=flat-square&logo=nextdotjs&logoColor=white)` | App router React architecture. |
| **Tailwind CSS v4** | `![Tailwind](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=flat-square&logo=tailwindcss&logoColor=white)` | Modern styling engine with glassmorphic variables. |

### Core Libraries & Utilities
| Folder | Library | Purpose |
| :--- | :--- | :--- |
| **Frontend** | `@clerk/nextjs` | Authentication wrapper & user session token holder. |
| | `html2pdf.js` | Direct client-side DOM-to-PDF export handler (uses `html2canvas` & `jsPDF` internally). |
| | `react-dropzone` | Drag-and-drop file inputs handler with strict PDF constraints. |
| | `lucide-react` | Standard SVG system icons. |
| **Backend** | `google-genai` | Modern Google Gemini SDK utilizing Gemini 3.5 Flash for parsing & evaluations. |
| | `prisma-client-py` | Async database client interface with database models. |
| | `pdfplumber` | Raw PDF text extraction library. |
| | `pydantic v2` | Native data structure and response schema validations. |
| | `uvicorn` | High-speed ASGI server implementation. |

### Infrastructure
| Service | Badge | Role |
| :--- | :--- | :--- |
| **Neon** | `![PostgreSQL](https://img.shields.io/badge/PostgreSQL-316192?style=flat-square&logo=postgresql&logoColor=white)` | Serverless PostgreSQL host storing raw resume data. |
| **Railway** | `![Railway](https://img.shields.io/badge/Railway-130F26?style=flat-square&logo=railway&logoColor=white)` | Deployed FastAPI backend container. |
| **Vercel** | `![Vercel](https://img.shields.io/badge/Vercel-000000?style=flat-square&logo=vercel&logoColor=white)` | Deployed Next.js static and serverless resources. |

---

## 📁 Repository Structure

```text
├── backend/
│   ├── prisma/
│   │   └── schema.prisma    # Prisma schema declaring DB tables
│   ├── main.py              # FastAPI endpoints, CORS, OCR, and Gemini integrations
│   ├── requirements.txt     # Locked backend packages
│   ├── Dockerfile           # Deploy instruction with libatomic1 dependencies
│   ├── nixpacks.toml        # Railway Nixpacks build configurations
│   └── Procfile             # Railway web process command loader
│
├── frontend/
│   ├── src/app/
│   │   ├── layout.tsx       # Root layout defining font and Clerk providers
│   │   └── page.tsx         # Main glassmorphic analysis workspace
│   ├── package.json         # Frontend package locks
│   └── .env.local           # Key-value local variables file
```

---

## ⚡ API Specification

### 1. Root / Health Check
Check if the API is active.
- **Endpoint**: `GET /`
- **Response**:
  ```json
  {
    "message": "Backend is running successfully!"
  }
  ```

### 2. Upload and Analyze Resume
Extracts, saves, and performs structured resume optimization.
- **Endpoint**: `POST /api/resumes/upload`
- **Content-Type**: `multipart/form-data`
- **Request Parameters**:
  - `file`: `UploadFile` (PDF file, required)
  - `job_description`: `str` (Optional)
  - `user_id`: `str` (Optional, for Clerk account grouping)
- **Response**:
  ```json
  {
    "message": "Resume successfully processed, saved, and analyzed!",
    "resume_id": "8b5fdfc1-1e9a-4131-a8cf-195fcae12345",
    "filename": "john_doe_resume.pdf",
    "analysis": {
      "ats_score": 85,
      "match_percentage": 78,
      "gap_analysis": ["Kubernetes", "TypeScript", "CI/CD Pipeline"],
      "summary": "The candidate has strong software engineering basics but lacks cloud infrastructure depth...",
      "critiques": [
        {
          "category": "Impact",
          "issue": "Responsible for managing standard databases.",
          "solution": "Quantify outcomes: e.g., 'Optimized SQL database indexes, reducing search queries delay by 40%'"
        }
      ]
    }
  }
  ```

### 3. Generate Inline Bullet Point Rewrite
Transforms weak bullet points into high-impact descriptions.
- **Endpoint**: `POST /api/resumes/rewrite`
- **Content-Type**: `application/json`
- **Request Body**:
  ```json
  {
    "original_text": "Responsible for managing standard databases.",
    "recommendation": "Quantify outcomes: e.g., 'Optimized SQL database indexes, reducing search queries delay by 40%'"
  }
  ```
- **Response**:
  ```json
  {
    "rewritten_text": "Architected and optimized SQL database indexes for core storage systems, reducing search query latency by 40% across 5M weekly transactions.",
    "explanation": "This version uses strong action verbs, isolates technical impact, and quantifies success to grab recruiters' attention."
  }
  ```

### 4. Fetch User Resume History
Retrieves all historical resumes for a specific authenticated user.
- **Endpoint**: `GET /api/resumes/history`
- **Query Parameters**:
  - `user_id`: `str` (Required)
- **Response**:
  ```json
  {
    "history": [
      {
        "id": "8b5fdfc1-1e9a-4131-a8cf-195fcae12345",
        "filename": "john_doe_resume.pdf",
        "content": "Full extracted resume text...",
        "userId": "user_2l7V...",
        "createdAt": "2026-07-24T03:28:00.000Z"
      }
    ]
  }
  ```

---

## ⚙️ Setup and Installation

### Database Configuration
Get a PostgreSQL connection string (e.g. from a [Neon](https://neon.tech) PostgreSQL project) and ensure it has `sslmode=require`.

### Backend Setup
1. Move to the backend folder:
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
3. Install packages:
   ```bash
   pip install -r requirements.txt
   ```
4. Create a `.env` file:
   ```env
   DATABASE_URL="postgresql://neondb_owner:***@ep-pooler.c-3.neon.tech/neondb?sslmode=require"
   GEMINI_API_KEY="your-google-gemini-key"
   ```
5. Build the Prisma database schemas:
   ```bash
   prisma db push
   ```
6. Spin up the development server:
   ```bash
   uvicorn main:app --reload --port 8000
   ```

---

### Frontend Setup
1. Move to the frontend folder:
   ```bash
   cd ../frontend
   ```
2. Install package nodes:
   ```bash
   npm install
   ```
3. Create a `.env.local` configuration:
   ```env
   NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY="pk_test_..."
   CLERK_SECRET_KEY="sk_test_..."
   NEXT_PUBLIC_API_URL="http://127.0.0.1:8000"
   ```
4. Run locally:
   ```bash
   npm run dev
   ```

---

## 🚀 Production Deployments

### Backend Deployment (Railway)
1. Link your GitHub repository.
2. In the Service settings, set the **Root Directory** to `/backend`.
3. Set your service variables:
   - `DATABASE_URL`
   - `GEMINI_API_KEY`
   - `ALLOWED_ORIGINS` (e.g., `http://localhost:3000,https://ai-resume-analyzer-yourname.vercel.app`)
4. To handle compiling the Prisma compiler, your Railway instance uses the local [Dockerfile](file:///f:/Trial%20Projects/ai-resume-analyzer/backend/Dockerfile) which installs `libatomic1` (required by Prisma's Node.js engine wrapper) and triggers `python -m prisma generate` during the container assembly.

### Frontend Deployment (Vercel)
1. Link your GitHub repository.
2. Set the **Root Directory** to `frontend`.
3. Add the following Production Environment Variables:
   - `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`
   - `CLERK_SECRET_KEY`
   - `NEXT_PUBLIC_API_URL` (points to your Railway backend URL, e.g., `https://ai-resume-analyzer-yourname.up.railway.app`)
4. Vercel compiles the optimized bundle automatically.
5. Update your whitelisted redirect paths inside your Clerk developer dashboard to allow your Vercel URL.

---

## 🛠️ Troubleshooting

#### 1. Prisma Builder Error: `libatomic.so.1` Missing on Linux
- **Cause**: Prisma's underlying Node compilation library needs `libatomic.so.1` which is absent in minimal Docker slim bases.
- **Fix**: Ensure your Docker base installs `libatomic1`. For Nixpacks deployments, include the following in `nixpacks.toml`:
  ```toml
  [phases.setup]
  aptPkgs = ["libatomic1"]
  ```

#### 2. Vercel TypeScript Check: `Html2PdfOptions` Options Mismatch
- **Cause**: TypeScript infers primitive types like `string` for inline properties, but `html2pdf.js` expects specific literal string unions.
- **Fix**: Cast string configurations like `jpeg` and `portrait` explicitly:
  ```typescript
  image: { type: 'jpeg' as const }
  jsPDF: { unit: 'in' as const, orientation: 'portrait' as const }
  ```
