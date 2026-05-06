import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { auth } from "../lib/auth-server";

const PUBLIC_PATHS = ["/", "/register", "/forgot-password", "/reset-password"];

export const runtime = "nodejs";

const STATIC_FILE_REGEX =
  /\.(?:ico|svg|png|jpg|jpeg|webp|woff2?|ttf|otf|css|js|json|webmanifest|txt|xml)$/i;

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Pass through static assets and PWA files immediately
  if (STATIC_FILE_REGEX.test(pathname)) {
    return NextResponse.next();
  }

  if (PUBLIC_PATHS.some((path) => pathname === path)) {
    return NextResponse.next();
  }

  if (pathname.startsWith("/api/")) {
    return NextResponse.next();
  }

  // Check session using Better Auth
  try {
    const session = await auth.api.getSession({ headers: request.headers });

    if (!session) {
      return NextResponse.redirect(new URL("/", request.url));
    }

    return NextResponse.next();
  } catch (error) {
    console.error("Auth check failed:", error);
    return NextResponse.redirect(new URL("/", request.url));
  }
}

export const config = {
  matcher: ["/((?!_next/static|_next/image).*)"],
};
