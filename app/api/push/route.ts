import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { subscriber, title, message, url } = await req.json();

    if (!subscriber || !title || !message) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    if (typeof title !== "string" || typeof message !== "string" || title.length > 200 || message.length > 500) {
      return NextResponse.json({ error: "Invalid input: title or message exceeds length limits" }, { status: 400 });
    }

    const payload = {
      subscriber: subscriber,
      title: title,
      message: message,
      url: url || "",
      icon: "https://lunalimoz.com/luna-logo.png",
    };

    const response = await fetch("https://pushalert.co/api/v1/send", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `api_key=${process.env.PUSHALERT_API_KEY}`,
      },
      body: JSON.stringify(payload),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error("PushAlert API error:", data);
      return NextResponse.json({ error: "PushAlert API failed" }, { status: 500 });
    }

    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error("Push API route error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
