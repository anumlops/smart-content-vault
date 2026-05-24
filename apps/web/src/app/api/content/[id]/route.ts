import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

function parseContent(item: any) {
  return { ...item, tags: JSON.parse(item.tags ?? "[]"), takeaways: JSON.parse(item.takeaways ?? "[]") };
}

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const content = await prisma.savedContent.findFirst({
    where: { id: params.id, userId: session.user.id },
  });

  if (!content) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json(parseContent(content));
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const content = await prisma.savedContent.findFirst({
    where: { id: params.id, userId: session.user.id },
  });

  if (!content) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  await prisma.savedContent.delete({ where: { id: params.id } });

  return NextResponse.json({ success: true });
}

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const content = await prisma.savedContent.findFirst({
    where: { id: params.id, userId: session.user.id },
  });

  if (!content) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const body = await req.json();
  const data: any = {};
  if (body.note !== undefined) data.note = body.note;
  if (body.category !== undefined) data.category = body.category;
  if (body.tags !== undefined) data.tags = JSON.stringify(body.tags);

  const updated = await prisma.savedContent.update({
    where: { id: params.id },
    data,
  });

  return NextResponse.json(parseContent(updated));
}
