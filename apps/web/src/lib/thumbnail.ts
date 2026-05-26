function getDomain(url: string): string {
  try {
    return new URL(url).hostname.replace("www.", "");
  } catch {
    return url;
  }
}

const platformMap: Record<string, string> = {
  "youtube.com": "youtube",
  "youtu.be": "youtube",
  "instagram.com": "instagram",
  "twitter.com": "twitter",
  "x.com": "twitter",
  "github.com": "github",
  "linkedin.com": "linkedin",
  "medium.com": "medium",
};

export function getPlaceholderPath(url: string): string {
  const domain = getDomain(url);
  for (const [key, name] of Object.entries(platformMap)) {
    if (domain === key || domain.endsWith("." + key)) {
      return `/assets/placeholders/${name}.svg`;
    }
  }
  return "/assets/placeholders/website.svg";
}

export function getPlaceholderFromContentType(contentType: string): string {
  const map: Record<string, string> = {
    youtube: "/assets/placeholders/youtube.svg",
    instagram: "/assets/placeholders/instagram.svg",
    twitter: "/assets/placeholders/twitter.svg",
  };
  return map[contentType] || "/assets/placeholders/website.svg";
}

export function getBestThumbnail(
  thumbnailUrl: string | null,
  ogImage: string | null,
  url: string,
  contentType: string
): string {
  if (thumbnailUrl) return thumbnailUrl;
  if (ogImage) return ogImage;
  const domain = getDomain(url);
  if (domain) {
    return `https://www.google.com/s2/favicons?domain=${domain}&sz=64`;
  }
  return getPlaceholderFromContentType(contentType);
}
