import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { internal } from "./_generated/api";

export const submit = mutation({
  args: {
    name: v.string(),
    email: v.string(),
    subject: v.string(),
    message: v.string(),
  },
  handler: async (ctx, args) => {
    const inquiryId = await ctx.db.insert("contactInquiries", {
      name: args.name,
      email: args.email,
      subject: args.subject,
      message: args.message,
      isRead: false,
      createdAt: Date.now(),
    });

    const settings = await ctx.db.query("settings").first();
    const adminEmail = settings?.email || "admin@lunalimo.com";

    await ctx.scheduler.runAfter(0, internal.emails.sendContactInquiryEmail, {
      inquiryId,
      adminEmail,
    });

    return inquiryId;
  },
});

export const list = query({
  args: {
    isRead: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const inquiries = await ctx.db.query("contactInquiries").order("desc").take(200);
    if (args.isRead !== undefined) {
      return inquiries.filter((i) => i.isRead === args.isRead);
    }
    return inquiries;
  },
});

export const markAsRead = mutation({
  args: { id: v.id("contactInquiries") },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.id, { isRead: true });
  },
});

export const markAllAsRead = mutation({
  args: {},
  handler: async (ctx) => {
    const inquiries = await ctx.db.query("contactInquiries").order("desc").take(200);
    for (const inquiry of inquiries) {
      if (!inquiry.isRead) {
        await ctx.db.patch(inquiry._id, { isRead: true });
      }
    }
  },
});

export const remove = mutation({
  args: { id: v.id("contactInquiries") },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.id);
  },
});

export const getUnreadCount = query({
  args: {},
  handler: async (ctx) => {
    const inquiries = await ctx.db.query("contactInquiries").order("desc").take(200);
    return inquiries.filter((i) => !i.isRead).length;
  },
});
