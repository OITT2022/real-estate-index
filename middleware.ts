import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

const FORCED_PATH = "/admin/change-password";

export default withAuth(
  function middleware(req) {
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

// Matcher excludes login (auth handled by NextAuth) and the public
// forgot/reset pages (must be reachable without a session).
export const config = {
  matcher: ["/admin/((?!login|forgot-password|reset-password).*)"],
};
