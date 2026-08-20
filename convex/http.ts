import { httpRouter } from "convex/server";
import { auth } from "./auth";
import { stripeWebhookHandler } from "./stripe_webhook";

const http = httpRouter();

auth.addHttpRoutes(http);

http.route({
  path: "/webhooks/stripe",
  method: "POST",
  handler: stripeWebhookHandler,
});

export default http;
