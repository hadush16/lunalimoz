import { query, mutation, internalMutation, internalQuery } from "./_generated/server";
import { v } from "convex/values";
import { Id } from "./_generated/dataModel";

// Helper for hashing password with PBKDF2
export async function hashPassword(password: string): Promise<string> {
  const enc = new TextEncoder();
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const keyMaterial = await crypto.subtle.importKey(
    "raw",
    enc.encode(password),
    { name: "PBKDF2" },
    false,
    ["deriveBits", "deriveKey"]
  );
  const key = await crypto.subtle.deriveKey(
    {
      name: "PBKDF2",
      salt,
      iterations: 100000,
      hash: "SHA-256",
    },
    keyMaterial,
    { name: "HMAC", hash: "SHA-256", length: 256 },
    true,
    ["sign", "verify"]
  );
  const exported = await crypto.subtle.exportKey("raw", key);
  const saltHex = Array.from(salt).map((b) => b.toString(16).padStart(2, "0")).join("");
  const hashHex = Array.from(new Uint8Array(exported)).map((b) => b.toString(16).padStart(2, "0")).join("");
  return `${saltHex}:${hashHex}`;
}

export async function verifyPassword(password: string, storedHash: string): Promise<boolean> {
  if (!storedHash.includes(":")) {
    // Fallback plain check for initial seed transition if needed
    return password === storedHash;
  }
  const [saltHex, originalHashHex] = storedHash.split(":");
  const salt = new Uint8Array(saltHex.match(/.{1,2}/g)!.map((byte) => parseInt(byte, 16)));
  const enc = new TextEncoder();
  const keyMaterial = await crypto.subtle.importKey(
    "raw",
    enc.encode(password),
    { name: "PBKDF2" },
    false,
    ["deriveBits", "deriveKey"]
  );
  const key = await crypto.subtle.deriveKey(
    {
      name: "PBKDF2",
      salt,
      iterations: 100000,
      hash: "SHA-256",
    },
    keyMaterial,
    { name: "HMAC", hash: "SHA-256", length: 256 },
    true,
    ["sign", "verify"]
  );
  const exported = await crypto.subtle.exportKey("raw", key);
  const hashHex = Array.from(new Uint8Array(exported)).map((b) => b.toString(16).padStart(2, "0")).join("");
  return hashHex === originalHashHex;
}

export const seedAdminUser = mutation({
  args: {
    email: v.optional(v.string()),
    password: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const email = (args.email || "admin@lunalimoz.com").toLowerCase().trim();
    const password = args.password || "password123";

    const existing = await ctx.db
      .query("admin_users")
      .withIndex("by_email", (q) => q.eq("email", email))
      .first();

    const passwordHash = await hashPassword(password);

    if (existing) {
      await ctx.db.patch(existing._id, {
        password_hash: passwordHash,
      });
      return { success: true, message: `Admin user ${email} password updated.` };
    }

    const adminId = await ctx.db.insert("admin_users", {
      email,
      password_hash: passwordHash,
      role: "owner",
      must_change_password: true,
      created_at: Date.now(),
    });

    return { success: true, adminId, message: `Owner account ${email} created.` };
  },
});

export const authenticateAdmin = mutation({
  args: {
    email: v.string(),
    password: v.string(),
    ip: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const email = args.email.toLowerCase().trim();
    const admin = await ctx.db
      .query("admin_users")
      .withIndex("by_email", (q) => q.eq("email", email))
      .first();

    if (!admin) {
      // Check legacy admin password fallback for seamless transition
      if (email === "admin@lunalimoz.com" && args.password === "password123") {
        const hash = await hashPassword(args.password);
        const id = await ctx.db.insert("admin_users", {
          email,
          password_hash: hash,
          role: "owner",
          must_change_password: true,
          created_at: Date.now(),
        });
        return { success: true, role: "owner", email, mustChangePassword: true };
      }
      return { success: false, error: "Invalid credentials" };
    }

    const isValid = await verifyPassword(args.password, admin.password_hash);
    if (!isValid) {
      return { success: false, error: "Invalid credentials" };
    }

    await ctx.db.patch(admin._id, {
      last_login_at: Date.now(),
    });

    await ctx.db.insert("audit_log", {
      actor_id: admin.email,
      action: "ADMIN_LOGIN",
      entity: "admin_users",
      entity_id: admin._id,
      ip: args.ip,
      created_at: Date.now(),
    });

    return {
      success: true,
      role: admin.role,
      email: admin.email,
      mustChangePassword: admin.must_change_password ?? false,
    };
  },
});

export const changeAdminPassword = mutation({
  args: {
    email: v.string(),
    currentPassword: v.string(),
    newPassword: v.string(),
  },
  handler: async (ctx, args) => {
    const admin = await ctx.db
      .query("admin_users")
      .withIndex("by_email", (q) => q.eq("email", args.email.toLowerCase().trim()))
      .first();

    if (!admin) throw new Error("Admin user not found");

    const isValid = await verifyPassword(args.currentPassword, admin.password_hash);
    if (!isValid) throw new Error("Incorrect current password");

    const newHash = await hashPassword(args.newPassword);
    await ctx.db.patch(admin._id, {
      password_hash: newHash,
      must_change_password: false,
    });

    await ctx.db.insert("audit_log", {
      actor_id: admin.email,
      action: "CHANGE_PASSWORD",
      entity: "admin_users",
      entity_id: admin._id,
      created_at: Date.now(),
    });

    return { success: true };
  },
});

export const listAdminUsers = query({
  args: {},
  handler: async (ctx) => {
    const users = await ctx.db.query("admin_users").collect();
    return users.map((u) => ({
      _id: u._id,
      email: u.email,
      role: u.role,
      last_login_at: u.last_login_at,
      created_at: u.created_at,
    }));
  },
});
