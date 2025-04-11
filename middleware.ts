import { NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import type { NextRequest } from "next/server";

export async function middleware(req: NextRequest) {
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });

  const path = req.nextUrl.pathname;
  // Public paths
  const isPublicPath =
    path === "/auth/login" ||
    path === "/auth/signup" ||
    path === "/auth/reset-password";

  // Admin-only paths
  const isAdminPath = path.startsWith("/admin");

  // Redirect logic
  if (isPublicPath && token) {
    return NextResponse.redirect(new URL("/", req.url));
  }

  // Check admin access
  if (isAdminPath) {
    if (!token) {
      return NextResponse.redirect(new URL("/auth/login", req.url));
    }

    // Role-based access
    if (token.role !== "admin" && token.role !== "super_admin") {
      return NextResponse.redirect(new URL("/unauthorized", req.url));
    }
  }

  return NextResponse.next();
}

// See "Matching Paths" below to learn more
export const config = {
  matcher: ["/admin/:path*", "/auth/login", "/auth/signup", "/profile/:path*"],
};
