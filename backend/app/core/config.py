from contextlib import asynccontextmanager
from fastapi import FastAPI
from prisma import Prisma
from openai import OpenAI
from dotenv import load_dotenv
import os

# Load environment variables from .env
load_dotenv()

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

default_origins = "http://localhost:3000,http://127.0.0.1:3000"
allowed_origins = [
    origin.strip() for origin in os.getenv("ALLOWED_ORIGINS", default_origins).split(",") if origin.strip()
]

