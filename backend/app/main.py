from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core.config import lifespan, allowed_origins
from app.api.routes import resumes

app = FastAPI(title="AI Resume Analyzer API", lifespan=lifespan)

# Add CORS middleware to allow the frontend to communicate with the backend
app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_origin_regex=r"https://.*\.vercel\.app",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
async def root():
    return {"message": "Backend is running successfully!"}

app.include_router(resumes.router)
