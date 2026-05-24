import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { processContentInline } from "@/lib/processing";
import { z } from "zod";

const createSchema = z.object({
  url: z.string().url("Invalid URL"),
  note: z.string().optional(),
  contentType: z.string().optional(),
});

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const category = searchParams.get("category");
  const limit = Math.min(Number(searchParams.get("limit") ?? 20), 100);
  const offset = Math.max(Number(searchParams.get("offset") ?? 0), 0);

  const where: any = { userId: session.user.id };
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

  const parsed = items.map((item) => ({
    ...item,
    tags: JSON.parse(item.tags ?? "[]"),
  }));

  return NextResponse.json({ items: parsed, total });
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
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

  const content = await prisma.savedContent.create({
    data: {
      userId: session.user.id,
      url,
      note,
      contentType: parsed.data.contentType ?? detectContentType(url),
      processingStatus: "pending",
    },
  });

  processContent(content.id, url).catch(console.error);

  return NextResponse.json({ ...content, tags: JSON.parse(content.tags ?? "[]") }, { status: 201 });
}

function detectContentType(url: string): string {
  const u = url.toLowerCase();
  if (u.includes("youtube.com") || u.includes("youtu.be")) return "youtube";
  if (u.includes("instagram.com")) return "instagram";
  if (u.includes("twitter.com") || u.includes("x.com")) return "twitter";
  if (u.includes("medium.com") || u.includes("blog.")) return "blog";
  return "website";
}

async function processContent(id: string, url: string) {
  try {
    await prisma.savedContent.update({
      where: { id },
      data: { processingStatus: "processing" },
    });

    let title: string | undefined;
    let description: string | undefined;
    let thumbnailUrl: string | null | undefined;
    let contentType: string | undefined;
    let summary: string | undefined;
    let category: string | undefined;
    let tags: string[] | undefined;
    let emotionalTone: string | undefined;
    let educationalRelevance: number | undefined;

    try {
      const aiServiceUrl = process.env.AI_SERVICE_URL ?? "http://localhost:8000";
      const res = await fetch(`${aiServiceUrl}/api/ai/process`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, url }),
        signal: AbortSignal.timeout(15000),
      });

      if (res.ok) {
        const result = await res.json();
        title = result.title;
        description = result.description;
        thumbnailUrl = result.thumbnail_url;
        contentType = result.content_type;
        summary = result.summary;
        category = result.category;
        tags = result.tags ?? [];
        emotionalTone = result.emotional_tone;
        educationalRelevance = result.educational_relevance;
      } else {
        throw new Error(`AI service error: ${res.status}`);
      }
    } catch {
      console.log("AI service unavailable, using inline processing");
      const inline = await processContentInline(url);
      title = inline.title;
      description = inline.description;
      thumbnailUrl = inline.thumbnailUrl;
      contentType = inline.contentType;
      summary = inline.summary;
      category = inline.category;
      tags = inline.tags;
      emotionalTone = inline.emotionalTone;
      educationalRelevance = inline.educationalRelevance;
    }

    await prisma.savedContent.update({
      where: { id },
      data: {
        title,
        description,
        thumbnailUrl,
        contentType,
        summary,
        category,
        tags: JSON.stringify(tags ?? []),
        emotionalTone,
        educationalRelevance,
        processingStatus: "completed",
      },
    });
  } catch (err) {
    console.error("Processing failed:", err);
    await prisma.savedContent.update({
      where: { id },
      data: { processingStatus: "failed" },
    }).catch(() => {});
  }
}
