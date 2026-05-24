import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

type SavedContentItem = Awaited<ReturnType<typeof prisma.savedContent.findMany>>[number];

export async function GET() {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userId = user.id;

  const [totalSaves, recentSaves, tagsRaw, weeklyRaw] = await Promise.all([
    prisma.savedContent.count({ where: { userId } }),
    prisma.savedContent.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      take: 10,
    }),
    prisma.savedContent.findMany({
      where: { userId, tags: { not: "[]" } },
      select: { tags: true, category: true },
    }),
    prisma.savedContent.findMany({
      where: {
        userId,
        createdAt: { gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) },
      },
      select: { createdAt: true },
    }),
  ]);

  const categoryDistribution: Record<string, number> = {};
  const tagCounts: Record<string, number> = {};

  for (const row of tagsRaw) {
    if (row.category) {
      categoryDistribution[row.category] = (categoryDistribution[row.category] ?? 0) + 1;
    }
    try {
      const parsed = JSON.parse(row.tags);
      if (Array.isArray(parsed)) {
        for (const tag of parsed) {
          tagCounts[tag] = (tagCounts[tag] ?? 0) + 1;
        }
      }
    } catch {}
  }

  const topTags = Object.entries(tagCounts)
    .map(([tag, count]) => ({ tag, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 10);

  const insights = generateInsights(categoryDistribution, topTags, totalSaves);

  const popularCategories = Object.entries(categoryDistribution)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 4)
    .map(([name, count]) => ({ name, count, percentage: totalSaves > 0 ? Math.round((count / totalSaves) * 100) : 0 }));

  const weeklyActivity = buildWeeklyActivity(weeklyRaw.map((r: { createdAt: Date }) => r.createdAt));

  const recentParsed = recentSaves.map((item: SavedContentItem) => ({
    ...item,
    tags: JSON.parse(item.tags ?? "[]"),
  }));

  return NextResponse.json({
    totalSaves,
    categoryDistribution,
    popularCategories,
    recentSaves: recentParsed,
    topTags,
    insights,
    weeklyActivity,
  });
}

function buildWeeklyActivity(dates: Date[]): { date: string; count: number }[] {
  const dayMap: Record<string, number> = {};
  const now = new Date();
  for (let i = 6; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(d.getDate() - i);
    const key = d.toISOString().split("T")[0];
    dayMap[key] = 0;
  }
  for (const date of dates) {
    const key = date.toISOString().split("T")[0];
    if (key in dayMap) dayMap[key]++;
  }
  return Object.entries(dayMap).map(([date, count]) => ({ date, count }));
}

function generateInsights(
  categories: Record<string, number>,
  tags: { tag: string; count: number }[],
  totalSaves: number
): string[] {
  const insights: string[] = [];

  if (totalSaves === 0) return insights;

  const sortedCategories = Object.entries(categories).sort((a, b) => b[1] - a[1]);
  if (sortedCategories.length > 0) {
    const top = sortedCategories[0];
    const allCats = sortedCategories.length;
    insights.push(`Your top category is "${top[0]}" with ${top[1]} of ${totalSaves} saved items. You have content across ${allCats} categories.`);
  }

  if (tags.length > 0) {
    insights.push(`You frequently save content about "${tags[0].tag}" (${tags[0].count} items).`);
  }

  if (totalSaves > 10) {
    insights.push(`You've saved ${totalSaves} items total ${getEmoji(totalSaves)}`);
  }

  if (sortedCategories.length >= 2) {
    const [first, second] = sortedCategories;
    insights.push(`Your interests span "${first[0]}" and "${second[0]}".`);
  }

  return insights;
}

function getEmoji(count: number): string {
  if (count > 50) return "\u2014 great curation!";
  if (count > 25) return "\u2014 nice collection!";
  if (count > 10) return "\u2014 keep going!";
  return "";
}
