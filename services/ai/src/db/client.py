import psycopg2
import psycopg2.extras
from src.config import settings


def get_connection():
    """Get a database connection for vector operations."""
    conn = psycopg2.connect(settings.database_url)
    return conn


def init_vector_extension():
    """Ensure pgvector extension is enabled."""
    conn = get_connection()
    try:
        cur = conn.cursor()
        cur.execute("CREATE EXTENSION IF NOT EXISTS vector")
        conn.commit()
        cur.close()
    finally:
        conn.close()


def store_embedding(content_id: str, embedding: list[float], dimensions: int = 384):
    """Store an embedding vector for a content item."""
    conn = get_connection()
    try:
        cur = conn.cursor()
        cur.execute(
            f"""
            UPDATE "SavedContent"
            SET embedding = %s::vector({dimensions})
            WHERE id = %s
            """,
            (embedding, content_id),
        )
        conn.commit()
        cur.close()
    finally:
        conn.close()


def search_similar(
    query_embedding: list[float],
    user_id: str,
    limit: int = 20,
    dimensions: int = 384,
) -> list[dict]:
    """Search for similar content using cosine similarity on embeddings."""
    conn = get_connection()
    try:
        cur = conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)
        cur.execute(
            f"""
            SELECT
                id,
                1 - (embedding <=> %s::vector({dimensions})) as similarity
            FROM "SavedContent"
            WHERE "userId" = %s
                AND embedding IS NOT NULL
            ORDER BY embedding <=> %s::vector({dimensions})
            LIMIT %s
            """,
            (query_embedding, user_id, query_embedding, limit),
        )
        results = cur.fetchall()
        cur.close()

        return [
            {
                "content_id": row["id"],
                "score": float(row["similarity"]),
            }
            for row in results
        ]
    finally:
        conn.close()
