"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.config = void 0;
var server_1 = require("@convex-dev/auth/nextjs/server");
var isAdminRoute = (0, server_1.createRouteMatcher)(["/admin(.*)"]);
var isSignInRoute = (0, server_1.createRouteMatcher)(["/admin/login"]);
exports.default = (0, server_1.convexAuthNextjsProxy)(function (request) {
    // If user is trying to access admin pages (but not the login page itself)
    if (isAdminRoute(request) && !isSignInRoute(request)) {
        // If they aren't authenticated, redirect to the login page
        if (!(0, server_1.isAuthenticatedNextjs)()) {
            return (0, server_1.nextjsProxyRedirect)(request, "/admin/login");
        }
    }
    // If user is already authenticated and tries to access the login page, redirect to the admin dashboard
    if (isSignInRoute(request) && (0, server_1.isAuthenticatedNextjs)()) {
        return (0, server_1.nextjsProxyRedirect)(request, "/admin");
    }
});
exports.config = {
    // The matcher dictates which routes this proxy function should run on.
    // We run it on things like /admin/* but skip internal next routes to save cycles.
    matcher: ["/((?!.*\\..*|_next).*)", "/", "/(api|trpc)(.*)"],
};
