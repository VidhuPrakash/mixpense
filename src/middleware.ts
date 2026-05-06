import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { auth } from "../lib/auth-server";

const PUBLIC_PATHS = ["/", "/register", "/forgot-password", "/reset-password"];

export const runtime = "nodejs";

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

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
  // Only run middleware on actual app pages — never on static files or Next.js internals
  matcher: [
    "/((?!_next/static|_next/image|_next/webpack-hmr|favicon\\.ico|favicon\\.svg|favicon-96x96\\.png|apple-touch-icon\\.png|web-app-manifest-192x192\\.png|web-app-manifest-512x512\\.png|manifest\\.webmanifest|sw\\.js|logo\\.png|site\\.webmanifest).*)",
  ],
};
