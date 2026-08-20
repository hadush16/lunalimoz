import { internalAction, internalQuery } from "./_generated/server";
import { v } from "convex/values";
import { internal } from "./_generated/api";
import { Doc } from "./_generated/dataModel";

export const notifyAdmins = internalAction({
  args: {
    title: v.string(),
    message: v.string(),
    url: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const allAdmins = await ctx.runQuery(internal.push.getAllAdmins);
    const admins = allAdmins.filter((a: Doc<"users">) => !!a.pushAlertSubscriberId);
    
    console.log(`Push Alert: Found ${allAdmins.length} total admins, ${admins.length} with push IDs.`);

    if (admins.length === 0) {
      if (allAdmins.length > 0) {
        console.warn("Push Alert: Admins exist, but none have registered for push notifications yet.");
        console.log("Admin Emails:", allAdmins.map((a: Doc<"users">) => a.email).join(", "));
      } else {
        console.warn("Push Alert: No admins found at all (isAdmin: true).");
      }
      return;
    }

    const apiKey = process.env.PUSHALERT_API_KEY;
    if (!apiKey) {
      console.error("Push Alert: PUSHALERT_API_KEY is not defined.");
      return;
    }

    console.log(`Push Alert: Using API Key starting with ${apiKey.substring(0, 4)}...`);
    const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL || 'https://lunalimoz.com').replace(/\/$/, "");

    for (const admin of admins) {
      console.log(`Push Alert: Sending to admin ${admin.email} (${admin.pushAlertSubscriberId})`);
      
      try {
        const absoluteUrl = args.url ? (args.url.startsWith("/") ? `${siteUrl}${args.url}` : args.url) : siteUrl;

        if (!admin.pushAlertSubscriberId) continue;
        const params = new URLSearchParams();
        params.append("subscriber", admin.pushAlertSubscriberId);
        params.append("title", args.title);
        params.append("message", args.message);
        params.append("url", absoluteUrl);
        params.append("icon", `${siteUrl}/luna-logo.png`);

        const response = await fetch("https://api.pushalert.co/rest/v1/send", {
          method: "POST",
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
            "Authorization": `api_key=${apiKey}`,
          },
          body: params.toString(),
        });

        const result = await response.json().catch(() => ({}));
        
        if (!response.ok) {
          console.error(`Push Alert Error [Status ${response.status}]:`, result);
        } else {
          console.log(`Push Alert Success for ${admin.email}:`, result);
        }
      } catch (error) {
        console.error(`Push Alert Request Error:`, error);
      }
    }
  },
});

export const getAllAdmins = internalQuery({
  args: {},
  handler: async (ctx) => {
    return await ctx.db
      .query("users")
      .withIndex("by_admin", (q) => q.eq("isAdmin", true))
      .collect();
  },
});
