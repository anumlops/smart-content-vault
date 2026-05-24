"""
AI Service - Content Archive

FastAPI application that provides:
- Content extraction (YouTube, Instagram, Twitter, websites)
- AI-powered classification and categorization
- Embedding generation and semantic search via pgvector
- Content summarization

To run: uvicorn src.main:app --reload --port 8000
"""

from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from src.routers import content, search
from src.db.client import init_vector_extension


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Initialize database extensions on startup."""
    try:
        init_vector_extension()
        print("pgvector extension initialized")
    except Exception as e:
        print(f"Warning: Could not init pgvector: {e}")
    yield


app = FastAPI(
    title="Content Archive AI Service",
    description="AI-powered content extraction, classification, and semantic search",
    version="0.1.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(content.router)
app.include_router(search.router)


@app.get("/health")
async def health():
    """Health check endpoint."""
    return {"status": "ok", "service": "ai-service"}
