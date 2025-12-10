import { NextResponse } from "next/server";

export function middleware(req) {
  const token = req.cookies.get("auth")?.value; // WORKS in Next.js 16

  if (!token && req.nextUrl.pathname.startsWith("/dashboard")) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  return NextResponse.next();
}

// (opsional) tentukan route mana yang kena middleware
export const config = {
  matcher: ["/dashboard/:path*"],
};
