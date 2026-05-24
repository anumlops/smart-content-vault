"""
Content classification module.

Uses AI (OpenAI or local patterns) to:
- Categorize content
- Generate tags
- Identify emotional tone
- Rate educational relevance
"""

import re
from src.config import settings

# Predefined categories with keywords for rule-based fallback
CATEGORY_KEYWORDS: dict[str, list[str]] = {
    "AI": ["artificial intelligence", "machine learning", "deep learning", "neural network",
           "llm", "gpt", "chatgpt", "ai agent", "transformer", "diffusion", "rag",
           "fine-tuning", "prompt", "token", "embedding"],
    "Deep Learning": ["transformer", "cnn", "rnn", "lstm", "attention mechanism",
                      "backpropagation", "gradient descent", "activation function",
                      "convolutional", "recurrent", "generative"],
    "Computer Vision": ["computer vision", "image recognition", "object detection",
                        "yolo", "segmentation", "stable diffusion", "dalle",
                        "visual", "image generation", "face recognition"],
    "Cybersecurity": ["cybersecurity", "hacking", "penetration", "vulnerability",
                      "exploit", "encryption", "malware", "ransomware", "firewall",
                      "zero-day", "authentication", "zero-knowledge", "privacy"],
    "Cryptocurrency": ["bitcoin", "ethereum", "crypto", "blockchain", "defi",
                       "nft", "web3", "token", "smart contract", "solana",
                       "consensus", "mining", "wallet"],
    "Business": ["business", "revenue", "market", "strategy", "growth",
                 "enterprise", "b2b", "b2c", "ceo", "startup", "funding",
                 "investment", "venture capital", "profit"],
    "Startups": ["startup", "founder", "venture capital", "seed funding",
                 "series a", "pitch", "accelerator", "yc", "y combinator",
                 "mvp", "product-market fit", "scale"],
    "Emotional": ["emotional", "heartbreaking", "touching", "tear", "cry",
                  "love", "family", "father", "mother", "son", "daughter",
                  "relationship", "feel", "emotion"],
    "Family": ["family", "parent", "child", "father", "mother", "brother",
               "sister", "marriage", "baby", "home", "together"],
    "Motivation": ["motivation", "inspire", "never give up", "success",
                   "grind", "hustle", "dream", "believe", "achievement",
                   "discipline", "focus", "determination"],
    "Automobile": ["car", "automobile", "vehicle", "engine", "tesla",
                   "electric vehicle", "ev", "racing", "driver", "motor",
                   "bike", "motorcycle", "auto"],
    "Technology": ["technology", "tech", "software", "hardware", "digital",
                   "innovation", "future", "robot", "automation", "quantum",
                   "cloud", "saas", "platform", "app"],
    "Productivity": ["productivity", "efficiency", "time management",
                     "habit", "routine", "focus", "organization",
                     "workflow", "automation", "system", "gtd"],
    "Philosophy": ["philosophy", "stoic", "existential", "consciousness",
                   "meaning", "purpose", "ethics", "moral", "thought",
                   "wisdom", "meditation", "mindfulness"],
    "Finance": ["finance", "investing", "stock", "market", "trading",
                "portfolio", "asset", "wealth", "retirement", "saving",
                "dividend", "index fund", "etf", "financial freedom"],
    "Education": ["education", "learn", "course", "tutorial", "lesson",
                  "study", "skill", "knowledge", "training", "workshop",
                  "lecture", "university", "school"],
    "Health": ["health", "fitness", "workout", "exercise", "nutrition",
               "diet", "mental health", "wellness", "yoga", "meditation",
               "sleep", "doctor", "medical"],
    "Science": ["science", "physics", "biology", "chemistry", "astronomy",
                "space", "nasa", "research", "experiment", "discovery",
                "evolution", "dna", "genetic"],
    "Entertainment": ["entertainment", "movie", "music", "game", "gaming",
                      "funny", "comedy", "show", "stream", "netflix",
                      "hollywood", "celebrity"],
    "News": ["news", "breaking", "report", "update", "current events",
             "politics", "world", "global", "economy"],
}


class Classifier:
    """Classify content by category, tags, emotion, and educational value."""

    def __init__(self):
        self._openai_client = None

    def _get_openai_client(self):
        if self._openai_client is None and settings.openai_api_key:
            from openai import OpenAI
            self._openai_client = OpenAI(api_key=settings.openai_api_key)
        return self._openai_client

    async def classify(self, title: str, description: str, text: str = "", transcript: str = "") -> dict:
        """Classify content using AI or rule-based fallback."""
        combined = f"{title} {description} {text} {transcript}".lower().strip()

        # Try OpenAI classification first
        client = self._get_openai_client()
        if client:
            try:
                return await self._classify_with_ai(client, title, description, text, transcript)
            except Exception:
                pass

        # Fallback to keyword-based classification
        return self._classify_with_keywords(combined)

    async def _classify_with_ai(self, client, title: str, description: str, text: str, transcript: str) -> dict:
        """Use OpenAI for intelligent classification."""
        prompt = f"""Analyze this content and return JSON:
Title: {title}
Description: {description}
Text: {text[:1000]}
Transcript: {transcript[:1000]}

Return a JSON object with:
1. "category": one of [AI, Deep Learning, Computer Vision, Cybersecurity, Cryptocurrency, Business, Startups, Emotional, Family, Motivation, Automobile, Technology, Productivity, Philosophy, Finance, Education, Health, Science, Entertainment, News]
2. "tags": array of 3-5 relevant topic tags
3. "emotional_tone": one of [neutral, positive, negative, inspirational, humorous, sad, exciting, thoughtful, motivational, educational]
4. "educational_relevance": number 1-10
5. "summary": 1-2 sentence summary

Return ONLY valid JSON."""

        response = client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[{"role": "user", "content": prompt}],
            response_format={"type": "json_object"},
            temperature=0.3,
            max_tokens=500,
        )

        import json
        result = json.loads(response.choices[0].message.content)

        return {
            "category": result.get("category", "Technology"),
            "tags": result.get("tags", []),
            "emotional_tone": result.get("emotional_tone", "neutral"),
            "educational_relevance": result.get("educational_relevance", 5),
            "summary": result.get("summary", ""),
        }

    def _classify_with_keywords(self, text: str) -> dict:
        """Rule-based classification using keyword matching."""
        scores: dict[str, int] = {}
        for category, keywords in CATEGORY_KEYWORDS.items():
            score = sum(1 for kw in keywords if re.search(rf"\b{re.escape(kw)}\b", text))
            if score > 0:
                scores[category] = score

        category = max(scores, key=scores.get) if scores else "Technology"

        tags = []
        matched_keywords = set()
        for kw_list in CATEGORY_KEYWORDS.values():
            for kw in kw_list:
                if re.search(rf"\b{re.escape(kw)}\b", text):
                    matched_keywords.add(kw)
        tags = list(matched_keywords)[:5]

        # Determine emotional tone
        tone = "neutral"
        if any(w in text for w in ["inspir", "motivat", "never give up", "believe"]):
            tone = "inspirational"
        elif any(w in text for w in ["funny", "humor", "comedy", "hilarious"]):
            tone = "humorous"
        elif any(w in text for w in ["sad", "heartbreaking", "cry", "tear"]):
            tone = "sad"
        elif any(w in text for w in ["exciting", "amazing", "incredible", "breakthrough"]):
            tone = "exciting"
        elif any(w in text for w in ["thought", "philosophy", "reflect", "deep"]):
            tone = "thoughtful"
        elif any(w in text for w in ["learn", "tutorial", "course", "explain"]):
            tone = "educational"
        elif any(w in text for w in ["motivat", "inspire", "dream", "success", "grind"]):
            tone = "motivational"

        educational_score = 5
        educational_keywords = ["tutorial", "learn", "course", "explain", "guide",
                                "lesson", "lecture", "education", "how to", "understanding"]
        educational_count = sum(1 for kw in educational_keywords if kw in text)
        if educational_count >= 2:
            educational_score = min(10, 5 + educational_count)

        return {
            "category": category,
            "tags": tags,
            "emotional_tone": tone,
            "educational_relevance": educational_score,
            "summary": "",
        }
