import { NextResponse, type NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";
import createIntlMiddleware from "next-intl/middleware";
import { routing } from "@/i18n/routing";

const FORCED_PATH = "/admin/change-password";
const SIGN_IN_PATH = "/admin/login";

const intlMiddleware = createIntlMiddleware(routing);

const PUBLIC_ADMIN_PATHS = (path: string) =>
  path === SIGN_IN_PATH ||
  path.startsWith("/admin/forgot-password") ||
  path.startsWith("/admin/reset-password");

export default async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  try {
    // ── Admin: auth-gated, never localized ──────────────────────────
    if (pathname.startsWith("/admin")) {
      if (PUBLIC_ADMIN_PATHS(pathname)) {
        return NextResponse.next();
      }

      let token: Awaited<ReturnType<typeof getToken>> = null;
      try {
        token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
      } catch (err) {
        console.error("[middleware] getToken failed", err);
        // Force re-auth on token failures rather than 500ing the page.
        const url = req.nextUrl.clone();
        url.pathname = SIGN_IN_PATH;
        url.search = `?callbackUrl=${encodeURIComponent(pathname)}`;
        return NextResponse.redirect(url);
      }

      if (!token) {
        const url = req.nextUrl.clone();
        url.pathname = SIGN_IN_PATH;
        url.search = `?callbackUrl=${encodeURIComponent(pathname)}`;
        return NextResponse.redirect(url);
      }

      if (token.mustChangePassword && pathname !== FORCED_PATH) {
        const url = req.nextUrl.clone();
        url.pathname = FORCED_PATH;
        url.search = "";
        return NextResponse.redirect(url);
      }

      return NextResponse.next();
    }

    // ── Everything else: next-intl handles locale routing ───────────
    return intlMiddleware(req);
  } catch (err) {
    // Never let the middleware itself 500 the request — the SSR layer
    // will give a more useful error if the route handler throws.
    console.error("[middleware] unhandled error", { pathname, err });
    return NextResponse.next();
  }
}

export const config = {
  // Skip Next internals, API routes, and static files.
  matcher: ["/((?!api|_next|_vercel|.*\\..*).*)"],
};
