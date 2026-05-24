"""
Summarization module.

Generates concise summaries of content using AI or extraction.
"""

from src.config import settings


class Summarizer:
    """Generate summaries for content."""

    def __init__(self):
        self._openai_client = None

    def _get_openai_client(self):
        if self._openai_client is None and settings.openai_api_key:
            from openai import OpenAI
            self._openai_client = OpenAI(api_key=settings.openai_api_key)
        return self._openai_client

    async def summarize(self, title: str, description: str, text: str = "", transcript: str = "") -> str:
        """Generate a concise summary of the content."""
        client = self._get_openai_client()
        if client:
            try:
                return await self._summarize_with_ai(client, title, description, text, transcript)
            except Exception:
                pass

        return self._summarize_with_extraction(title, description, text, transcript)

    async def _summarize_with_ai(self, client, title: str, description: str, text: str, transcript: str) -> str:
        """Use OpenAI to generate a summary."""
        prompt = f"""Summarize this content in 1-2 sentences:
Title: {title}
Description: {description}
Content: {(text or transcript)[:1500]}
Summary:"""

        response = client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[{"role": "user", "content": prompt}],
            temperature=0.3,
            max_tokens=150,
        )

        return response.choices[0].message.content.strip()

    def _summarize_with_extraction(self, title: str, description: str, text: str, transcript: str) -> str:
        """Extractive summarization fallback."""
        if description and len(description) > 20:
            return description

        if transcript:
            sentences = transcript.split(".")
            summary = ".".join(sentences[:3])
            if len(summary) > 300:
                summary = summary[:300] + "..."
            return summary

        if text:
            sentences = text.split("\n")
            meaningful = [s.strip() for s in sentences if len(s.strip()) > 40]
            if meaningful:
                summary = " ".join(meaningful[:2])
                if len(summary) > 300:
                    summary = summary[:300] + "..."
                return summary

        return description or title
