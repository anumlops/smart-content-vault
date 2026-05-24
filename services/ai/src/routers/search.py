"""Semantic search endpoint using vector similarity."""

from fastapi import APIRouter, Query, HTTPException
from src.pipeline.embedder import Embedder
from src.db.client import search_similar

router = APIRouter(prefix="/api", tags=["search"])
embedder = Embedder()


@router.get("/search")
async def semantic_search(
    q: str = Query(..., description="Search query"),
    user_id: str = Query(..., description="User ID"),
    limit: int = Query(20, ge=1, le=100),
):
    """Perform semantic search using vector similarity."""
    try:
        # Generate embedding for the query
        query_embedding = await embedder.embed(q)

        # Search similar content
        results = search_similar(query_embedding, user_id, limit)

        return {"results": results, "query": q}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
