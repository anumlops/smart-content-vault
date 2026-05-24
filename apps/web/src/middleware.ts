import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const protectedPaths = ["/dashboard", "/search", "/timeline", "/content"];
const authPaths = ["/login", "/register"];

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const token = req.cookies.get("session")?.value;

  const isProtected = protectedPaths.some((p) => pathname === p || pathname.startsWith(p + "/"));
  const isAuth = authPaths.some((p) => pathname === p || pathname.startsWith(p + "/"));

  if (isProtected && !token) {
    const loginUrl = new URL("/login", req.url);
    loginUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(loginUrl);
  }

  if (isAuth && token) {
    return NextResponse.redirect(new URL("/dashboard", req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*", "/search/:path*", "/timeline/:path*", "/content/:path*", "/login", "/register"],
};
