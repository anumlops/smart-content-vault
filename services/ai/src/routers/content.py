"""Content processing and embedding endpoints."""

from fastapi import APIRouter, HTTPException
from src.models.schemas import ContentProcessRequest, EmbedRequest
from src.pipeline.extractor import ContentExtractor
from src.pipeline.classifier import Classifier
from src.pipeline.summarizer import Summarizer
from src.pipeline.embedder import Embedder
from src.db.client import store_embedding

router = APIRouter(prefix="/api/ai", tags=["content"])
extractor = ContentExtractor()
classifier = Classifier()
summarizer = Summarizer()
embedder = Embedder()


@router.post("/process")
async def process_content(req: ContentProcessRequest):
    """Extract, classify, and summarize content from a URL."""
    try:
        # Step 1: Extract metadata
        metadata = await extractor.extract(req.url)

        # Step 2: Classify content
        classification = await classifier.classify(
            title=metadata.get("title", ""),
            description=metadata.get("description", ""),
            text=metadata.get("text", ""),
            transcript=metadata.get("transcript", ""),
        )

        # Step 3: Generate summary if classification didn't
        summary = classification.get("summary", "")
        if not summary:
            summary = await summarizer.summarize(
                title=metadata.get("title", ""),
                description=metadata.get("description", ""),
                text=metadata.get("text", ""),
                transcript=metadata.get("transcript", ""),
            )

        return {
            "id": req.id,
            "title": metadata.get("title", "Untitled"),
            "description": metadata.get("description", ""),
            "thumbnail_url": metadata.get("thumbnail_url"),
            "content_type": metadata.get("content_type", "website"),
            "summary": summary,
            "category": classification.get("category", "Technology"),
            "tags": classification.get("tags", []),
            "emotional_tone": classification.get("emotional_tone", "neutral"),
            "educational_relevance": classification.get("educational_relevance", 5),
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/embed")
async def embed_content(req: EmbedRequest):
    """Generate and store embedding for content."""
    try:
        embedding = await embedder.embed(req.text)
        store_embedding(req.id, embedding)
        return {"status": "ok", "dimensions": len(embedding)}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
