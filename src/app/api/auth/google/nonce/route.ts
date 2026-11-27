import { randomBytes } from "node:crypto";

import { NextResponse } from "next/server";

export const runtime = "nodejs";

export async function GET() {
  if (!process.env.GOOGLE_CLIENT_ID) {
    return NextResponse.json(
      { message: "Google sign-in has not been configured yet." },
      { status: 503 },
    );
  }

  const nonce = randomBytes(32).toString("base64url");
  const response = NextResponse.json({ nonce });
  response.headers.set("Cache-Control", "no-store");
  response.cookies.set("sv-google-nonce", nonce, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 5 * 60,
  });
  return response;
}
