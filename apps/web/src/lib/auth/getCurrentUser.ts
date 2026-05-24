import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import { verifyToken } from "./jwt";

export async function getCurrentUser() {
  const cookieStore = await cookies();
  const token = cookieStore.get("session")?.value;
  if (!token) return null;

  try {
    const { sub } = await verifyToken(token);
    const user = await prisma.user.findUnique({ where: { id: sub } });
    return user;
  } catch {
    return null;
  }
}
