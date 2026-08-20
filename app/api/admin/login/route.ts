import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    let email = "";
    let password = "";

    const contentType = request.headers.get("content-type") || "";
    if (contentType.includes("application/json")) {
      const body = await request.json();
      email = (body.email || "").trim().toLowerCase();
      password = (body.password || "").trim();
    } else {
      const formData = await request.formData();
      email = ((formData.get("email") as string) || "").trim().toLowerCase();
      password = ((formData.get("password") as string) || "").trim();
    }

    if (email === "admin@lunalimoz.com" && password === "password123") {
      const response = NextResponse.json({ success: true, redirect: "/admin" });
      response.cookies.set("lunalimoz_admin_session", "true", {
        httpOnly: true,
        path: "/",
        sameSite: "lax",
        maxAge: 60 * 60 * 24 * 7,
      });
      return response;
    }

    return NextResponse.json(
      { success: false, error: "Invalid admin email or passcode." },
      { status: 401 }
    );
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message || "Failed to process login" },
      { status: 500 }
    );
  }
}
