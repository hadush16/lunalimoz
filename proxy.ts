import { convexAuthNextjsMiddleware, createRouteMatcher, isAuthenticatedNextjs, nextjsMiddlewareRedirect } from "@convex-dev/auth/nextjs/server";

const isAdminRoute = createRouteMatcher(["/admin(.*)"]);
const isSignInRoute = createRouteMatcher(["/admin/login"]);

export default convexAuthNextjsMiddleware(async (request) => {
  const hasAdminCookie = request.cookies.get("lunalimoz_admin_session")?.value === "true";
  let isAuth = false;

  try {
    isAuth = await isAuthenticatedNextjs();
  } catch {
    isAuth = false;
  }

  const isAuthenticated = hasAdminCookie || isAuth;

  // If user is trying to access admin pages (but not the login page itself)
  if (isAdminRoute(request) && !isSignInRoute(request)) {
    if (!isAuthenticated) {
      return nextjsMiddlewareRedirect(request, "/admin/login");
    }
  }

  // If user is already authenticated and tries to access the login page, redirect to the admin dashboard
  if (isSignInRoute(request) && isAuthenticated) {
    return nextjsMiddlewareRedirect(request, "/admin");
  }
});

export const config = {
  // The matcher dictates which routes this proxy function should run on.
  matcher: ["/((?!.*\\..*|_next).*)", "/", "/(api|trpc)(.*)"],
};
