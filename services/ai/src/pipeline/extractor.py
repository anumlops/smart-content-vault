"""
Content extraction module.

Handles extracting metadata from various content sources:
- YouTube: title, description, thumbnail, transcript
- Instagram: metadata
- Twitter/X: metadata
- Generic websites: OpenGraph data, article text
"""

import re
import httpx
from bs4 import BeautifulSoup
from urllib.parse import urlparse


class ContentExtractor:
    """Extract metadata and content from URLs."""

    async def extract(self, url: str) -> dict:
        """Extract content metadata from a URL."""
        parsed = urlparse(url)
        domain = parsed.netloc.lower()

        if any(d in domain for d in ["youtube.com", "youtu.be"]):
            return await self._extract_youtube(url)
        elif "instagram.com" in domain:
            return await self._extract_instagram(url)
        elif any(d in domain for d in ["twitter.com", "x.com"]):
            return await self._extract_twitter(url)
        else:
            return await self._extract_website(url)

    async def _extract_youtube(self, url: str) -> dict:
        """Extract YouTube video metadata."""
        video_id = self._get_youtube_id(url)
        result = {
            "title": "",
            "description": "",
            "thumbnail_url": None,
            "content_type": "youtube",
            "transcript": "",
        }

        if not video_id:
            return result

        result["thumbnail_url"] = f"https://img.youtube.com/vi/{video_id}/maxresdefault.jpg"

        # Fetch page metadata
        try:
            async with httpx.AsyncClient(timeout=10) as client:
                resp = await client.get(f"https://www.youtube.com/watch?v={video_id}")
                if resp.status_code == 200:
                    soup = BeautifulSoup(resp.text, "lxml")
                    title_tag = soup.find("meta", property="og:title")
                    desc_tag = soup.find("meta", property="og:description")

                    if title_tag:
                        result["title"] = title_tag.get("content", "")
                    if desc_tag:
                        result["description"] = desc_tag.get("content", "")
                    if not result["thumbnail_url"]:
                        img_tag = soup.find("meta", property="og:image")
                        if img_tag:
                            result["thumbnail_url"] = img_tag.get("content")
        except Exception:
            pass

        # Try to get transcript
        try:
            from youtube_transcript_api import YouTubeTranscriptApi
            transcript_list = YouTubeTranscriptApi.get_transcript(video_id, languages=["en"])
            result["transcript"] = " ".join([part["text"] for part in transcript_list[:200]])
        except Exception:
            pass

        return result

    async def _extract_instagram(self, url: str) -> dict:
        result = {
            "title": "",
            "description": "",
            "thumbnail_url": None,
            "content_type": "instagram",
        }
        try:
            async with httpx.AsyncClient(timeout=10, follow_redirects=True) as client:
                resp = await client.get(url, headers={"User-Agent": "Mozilla/5.0"})
                if resp.status_code == 200:
                    soup = BeautifulSoup(resp.text, "lxml")
                    title_tag = soup.find("meta", property="og:title")
                    desc_tag = soup.find("meta", property="og:description")
                    img_tag = soup.find("meta", property="og:image")
                    if title_tag:
                        result["title"] = title_tag.get("content", "")
                    if desc_tag:
                        result["description"] = desc_tag.get("content", "")
                    if img_tag:
                        result["thumbnail_url"] = img_tag.get("content")
        except Exception:
            pass
        return result

    async def _extract_twitter(self, url: str) -> dict:
        result = {
            "title": "",
            "description": "",
            "thumbnail_url": None,
            "content_type": "twitter",
        }
        try:
            async with httpx.AsyncClient(timeout=10) as client:
                resp = await client.get(url, headers={"User-Agent": "Mozilla/5.0"})
                if resp.status_code == 200:
                    soup = BeautifulSoup(resp.text, "lxml")
                    title_tag = soup.find("meta", property="og:title")
                    desc_tag = soup.find("meta", property="og:description")
                    img_tag = soup.find("meta", property="og:image")
                    if title_tag:
                        result["title"] = title_tag.get("content", "")
                    if desc_tag:
                        result["description"] = desc_tag.get("content", "")
                    if img_tag:
                        result["thumbnail_url"] = img_tag.get("content")
        except Exception:
            pass
        return result

    async def _extract_website(self, url: str) -> dict:
        result = {
            "title": "",
            "description": "",
            "thumbnail_url": None,
            "content_type": "website",
            "text": "",
        }
        try:
            async with httpx.AsyncClient(timeout=15, follow_redirects=True) as client:
                resp = await client.get(url, headers={"User-Agent": "Mozilla/5.0"})
                if resp.status_code == 200:
                    soup = BeautifulSoup(resp.text, "lxml")

                    # OpenGraph tags
                    for prop, field in [
                        ("og:title", "title"),
                        ("og:description", "description"),
                        ("og:image", "thumbnail_url"),
                    ]:
                        tag = soup.find("meta", property=prop)
                        if tag and not result[field]:
                            result[field] = tag.get("content", "")

                    # Fallback to HTML tags
                    if not result["title"]:
                        title_tag = soup.find("title")
                        if title_tag:
                            result["title"] = title_tag.get_text(strip=True)

                    if not result["description"]:
                        meta_desc = soup.find("meta", attrs={"name": "description"})
                        if meta_desc:
                            result["description"] = meta_desc.get("content", "")

                    # Extract article text
                    for tag in soup.find_all(["p", "h1", "h2", "h3", "h4", "h5", "h6"]):
                        text = tag.get_text(strip=True)
                        if text and len(text) > 20:
                            result["text"] += text + "\n"

                    result["text"] = result["text"][:5000]

                    if result.get("text"):
                        result["content_type"] = "article"
        except Exception:
            pass
        return result

    @staticmethod
    def _get_youtube_id(url: str) -> str | None:
        patterns = [
            r"(?:youtube\.com\/watch\?v=)([\w-]+)",
            r"(?:youtu\.be\/)([\w-]+)",
            r"(?:youtube\.com\/embed\/)([\w-]+)",
            r"(?:youtube\.com\/shorts\/)([\w-]+)",
        ]
        for pattern in patterns:
            match = re.search(pattern, url)
            if match:
                return match.group(1)
        return None
