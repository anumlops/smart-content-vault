from pydantic import BaseModel


class ContentProcessRequest(BaseModel):
    id: str
    url: str


class ContentProcessResponse(BaseModel):
    id: str
    title: str
    description: str
    thumbnail_url: str | None = None
    content_type: str
    summary: str
    category: str
    tags: list[str]
    emotional_tone: str
    educational_relevance: int


class EmbedRequest(BaseModel):
    id: str
    text: str


class SearchRequest(BaseModel):
    q: str
    user_id: str
    limit: int = 20


class SearchResult(BaseModel):
    content_id: str
    score: float
