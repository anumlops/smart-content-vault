"""
Embedding generation module.

Supports:
- OpenAI embeddings (text-embedding-3-small)
- Local sentence-transformers models for offline use
"""

import numpy as np
from src.config import settings


class Embedder:
    """Generate embeddings for text content."""

    def __init__(self):
        self._model = None
        self._openai_client = None

    def _get_openai_client(self):
        if self._openai_client is None and settings.openai_api_key:
            from openai import OpenAI
            self._openai_client = OpenAI(api_key=settings.openai_api_key)
        return self._openai_client

    def _get_local_model(self):
        if self._model is None:
            from sentence_transformers import SentenceTransformer
            self._model = SentenceTransformer(settings.embedding_model)
        return self._model

    async def embed(self, text: str) -> list[float]:
        """Generate embedding vector for text."""
        if not text or not text.strip():
            return [0.0] * settings.embedding_dimensions

        if settings.use_local_embeddings:
            return await self._embed_local(text)
        else:
            return await self._embed_openai(text)

    async def _embed_local(self, text: str) -> list[float]:
        """Generate embedding using local sentence-transformers model."""
        model = self._get_local_model()
        embedding = model.encode(text, normalize_embeddings=True)
        return embedding.tolist()

    async def _embed_openai(self, text: str) -> list[float]:
        """Generate embedding using OpenAI API."""
        client = self._get_openai_client()
        if not client:
            return await self._embed_local(text)

        response = client.embeddings.create(
            model=settings.openai_embedding_model,
            input=text[:8000],
        )
        return response.data[0].embedding

    async def embed_batch(self, texts: list[str]) -> list[list[float]]:
        """Generate embeddings for multiple texts."""
        if not texts:
            return []

        if settings.use_local_embeddings:
            model = self._get_local_model()
            embeddings = model.encode(texts, normalize_embeddings=True)
            return embeddings.tolist()
        else:
            return [await self._embed_openai(text) for text in texts]
