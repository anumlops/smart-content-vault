import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

async function fetchSemanticSearch(query: string, userId: string, limit: number): Promise<Map<string, number>> {
  const aiServiceUrl = process.env.AI_SERVICE_URL ?? "http://localhost:8000";
  const scoreMap = new Map<string, number>();

  try {
    const res = await fetch(
      `${aiServiceUrl}/api/search?q=${encodeURIComponent(query)}&user_id=${userId}&limit=${limit}`,
      { signal: AbortSignal.timeout(5000) }
    );
    if (res.ok) {
      const data = await res.json();
      for (const result of data.results ?? []) {
        scoreMap.set(result.content_id, result.score);
      }
    }
  } catch (err) {
    console.error("Semantic search unavailable:", err);
  }

  return scoreMap;
}

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const query = searchParams.get("q") ?? "";
  const type = searchParams.get("type") ?? "hybrid";
  const category = searchParams.get("category");
  const limit = Math.min(Number(searchParams.get("limit") ?? 20), 100);
  const offset = Math.max(Number(searchParams.get("offset") ?? 0), 0);

  if (!query && !category) {
    return NextResponse.json({ results: [], total: 0 });
  }

  const where: any = { userId: session.user.id };

  if (query && type !== "semantic") {
    where.OR = [
      { title: { contains: query } },
      { description: { contains: query } },
      { summary: { contains: query } },
      { category: { contains: query } },
      { note: { contains: query } },
      { tags: { contains: query.toLowerCase() } },
    ];
  }
  if (category) {
    where.category = category;
  }

  const [items, total] = await Promise.all([
    prisma.savedContent.findMany({
      where,
      orderBy: { createdAt: "desc" },
      take: limit,
      skip: offset,
    }),
    prisma.savedContent.count({ where }),
  ]);

  // Get semantic scores if applicable
  let semanticScores = new Map<string, number>();
  if ((type === "hybrid" || type === "semantic") && query) {
    semanticScores = await fetchSemanticSearch(query, session.user.id, limit);
  }

  const results = items.map((item) => {
    let score = 0.5;
    let matchType: "semantic" | "keyword" | "hybrid" = "keyword";

    const semanticScore = semanticScores.get(item.id);

    if (type === "semantic" && semanticScore != null) {
      score = semanticScore;
      matchType = "semantic";
    } else if (type === "hybrid") {
      if (semanticScore != null) {
        score = 0.6 * semanticScore + 0.4 * 0.5;
        matchType = "hybrid";
      } else {
        score = type === "hybrid" ? 0.4 : 0.5;
      }
    }

    return {
      content: { ...item, tags: JSON.parse(item.tags ?? "[]") },
      score: Math.round(score * 100) / 100,
      matchType,
    };
  });

  // Sort by score descending for semantic/hybrid
  if (type !== "keyword") {
    results.sort((a, b) => b.score - a.score);
  }

  await prisma.searchHistory.create({
    data: { userId: session.user.id, query, resultCount: total },
  }).catch(() => {});

  return NextResponse.json({ results, total });
}
