import { NextResponse } from "next/server";

export async function POST() {
  const response = NextResponse.json({ success: true, redirect: "/admin/login" });
  response.cookies.set("lunalimoz_admin_session", "", {
    path: "/",
    httpOnly: true,
    expires: new Date(0),
  });
  return response;
}
