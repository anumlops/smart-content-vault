from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    database_url: str = "postgresql://postgres:postgres@localhost:5432/content_archive"
    openai_api_key: str = ""
    use_local_embeddings: bool = True
    embedding_model: str = "all-MiniLM-L6-v2"
    openai_embedding_model: str = "text-embedding-3-small"
    embedding_dimensions: int = 384

    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"


settings = Settings()
