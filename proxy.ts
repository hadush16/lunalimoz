import { convexAuthNextjsMiddleware, createRouteMatcher, isAuthenticatedNextjs, nextjsMiddlewareRedirect } from "@convex-dev/auth/nextjs/server";

const isAdminRoute = createRouteMatcher(["/admin(.*)"]);
const isSignInRoute = createRouteMatcher(["/admin/login"]);

export default convexAuthNextjsMiddleware(async (request) => {
  // If user is trying to access admin pages (but not the login page itself)
  if (isAdminRoute(request) && !isSignInRoute(request)) {
    // If they aren't authenticated, redirect to the login page
    if (!(await isAuthenticatedNextjs())) {
      return nextjsMiddlewareRedirect(request, "/admin/login");
    }
  }

  // If user is already authenticated and tries to access the login page, redirect to the admin dashboard
  if (isSignInRoute(request) && (await isAuthenticatedNextjs())) {
      return nextjsMiddlewareRedirect(request, "/admin");
  }
});

export const config = {
  // The matcher dictates which routes this proxy function should run on.
  // We run it on things like /admin/* but skip internal next routes to save cycles.
  matcher: ["/((?!.*\\..*|_next).*)", "/", "/(api|trpc)(.*)"],
};
