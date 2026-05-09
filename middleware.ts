import { NextResponse, type NextRequest } from "next/server";
import { withAuth, type NextRequestWithAuth } from "next-auth/middleware";
import createIntlMiddleware from "next-intl/middleware";
import { routing } from "@/i18n/routing";

const FORCED_PATH = "/admin/change-password";

const intlMiddleware = createIntlMiddleware(routing);

const adminAuthMiddleware = withAuth(
  function middleware(req: NextRequestWithAuth) {
    const token = req.nextauth.token;
    const path = req.nextUrl.pathname;

    // If the user must change their password, lock them on the change page
    // until they do. Hitting /admin/login while logged in stays allowed
    // (so signOut redirects after change still work).
    if (token?.mustChangePassword && path !== FORCED_PATH && path !== "/admin/login") {
      const url = req.nextUrl.clone();
      url.pathname = FORCED_PATH;
      url.search = "";
      return NextResponse.redirect(url);
    }
    return NextResponse.next();
  },
  { pages: { signIn: "/admin/login" } },
);

export default function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Admin routes go through NextAuth, never through next-intl.
  if (pathname.startsWith("/admin")) {
    // Login + public auth pages bypass auth check entirely.
    if (
      pathname === "/admin/login" ||
      pathname.startsWith("/admin/forgot-password") ||
      pathname.startsWith("/admin/reset-password")
    ) {
      return NextResponse.next();
    }
    // withAuth expects to be called as a function — let TS see the cast.
    return (adminAuthMiddleware as unknown as (r: NextRequest) => Response | Promise<Response>)(req);
  }

  // Everything else: next-intl handles locale routing.
  return intlMiddleware(req);
}

export const config = {
  // Skip Next internals, API routes, and static files.
  matcher: ["/((?!api|_next|_vercel|.*\\..*).*)"],
};
