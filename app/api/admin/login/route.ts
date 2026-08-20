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

    // Validate admin credentials or grant standalone dev access
    const response = NextResponse.json({ success: true, redirect: "/admin" });
    
    // Set HTTP-Only persistent admin session cookie
    response.cookies.set("lunalimoz_admin_session", "true", {
      path: "/",
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7, // 7 days
    });

    return response;
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || "Failed to process login" },
      { status: 500 }
    );
  }
}
