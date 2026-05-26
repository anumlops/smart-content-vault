import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { extractMetadata } from "@/lib/processing";
import { z } from "zod";

const createSchema = z.object({
  url: z.string().url("Invalid URL"),
  note: z.string().optional(),
  contentType: z.string().optional(),
});

function detectContentType(url: string): string {
  const u = url.toLowerCase();
  if (u.includes("youtube.com") || u.includes("youtu.be")) return "youtube";
  if (u.includes("instagram.com")) return "instagram";
  if (u.includes("twitter.com") || u.includes("x.com")) return "twitter";
  if (u.includes("medium.com") || u.includes("blog.")) return "blog";
  return "website";
}

export async function GET(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const category = searchParams.get("category");
  const limit = Math.min(Number(searchParams.get("limit") ?? 20), 100);
  const offset = Math.max(Number(searchParams.get("offset") ?? 0), 0);

  const where: any = { userId: user.id };
  if (category) where.category = category;

  const [items, total] = await Promise.all([
    prisma.savedContent.findMany({
      where,
      orderBy: { createdAt: "desc" },
      take: limit,
      skip: offset,
    }),
    prisma.savedContent.count({ where }),
  ]);

  const parsed = items.map((item: any) => ({
    ...item,
    tags: JSON.parse(item.tags ?? "[]"),
    takeaways: JSON.parse(item.takeaways ?? "[]"),
  }));

  return NextResponse.json({ items: parsed, total });
}

export async function POST(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const parsed = createSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.errors[0]?.message ?? "Invalid input" },
      { status: 400 }
    );
  }

  const { url, note } = parsed.data;

  const metadata = await extractMetadata(url);

  const content = await prisma.savedContent.create({
    data: {
      userId: user.id,
      url,
      note,
      title: metadata.title,
      description: metadata.description,
      thumbnailUrl: metadata.thumbnailUrl,
      contentType: parsed.data.contentType ?? detectContentType(url),
      category: metadata.category,
      tags: JSON.stringify(metadata.tags),
      processingStatus: "completed",
    },
  });

  return NextResponse.json({
    ...content,
    tags: JSON.parse(content.tags ?? "[]"),
    takeaways: JSON.parse(content.takeaways ?? "[]"),
  }, { status: 201 });
}
