from contextlib import asynccontextmanager
from fastapi import FastAPI
from prisma import Prisma
from openai import OpenAI
import os

# Initialize the Prisma client
db = Prisma()

# Initialize the Groq client using the OpenAI SDK standard
# Groq is OpenAI-compatible, so we just point to their base URL
ai_client = OpenAI(
    api_key=os.environ.get("GROQ_API_KEY"),
    base_url="https://api.groq.com/openai/v1",
)

# Handles connecting to the database when the server starts and disconnecting on shutdown
@asynccontextmanager
async def lifespan(app: FastAPI):
    await db.connect()
    yield
    await db.disconnect()

allowed_origins = [
    origin.strip() for origin in os.getenv("ALLOWED_ORIGINS", "http://localhost:3000").split(",") if origin.strip()
]
