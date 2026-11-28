import config from "@payload-config";
import { getPayload } from "payload";
import { NextRequest, NextResponse } from "next/server";

import { authenticateGoogleCustomer } from "@/lib/auth/google";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  const origin = request.headers.get("origin");
  if (!origin || origin !== request.nextUrl.origin) {
    return NextResponse.json({ message: "Request origin could not be verified." }, { status: 403 });
  }

  const clientId = process.env.GOOGLE_CLIENT_ID;
  if (!clientId) {
    return NextResponse.json({ message: "Google sign-in has not been configured yet." }, { status: 503 });
  }

  const nonce = request.cookies.get("sv-google-nonce")?.value;
  const body = await request.json().catch(() => null) as { credential?: string } | null;
  if (!nonce || !body?.credential) {
    return NextResponse.json({ message: "Google sign-in could not be verified. Please try again." }, { status: 400 });
  }

  try {
    const payload = await getPayload({ config });
    const result = await authenticateGoogleCustomer({
      payload,
      credential: body.credential,
      nonce,
      clientId,
    });

    const authConfig = payload.collections.users.config.auth;
    const cookiePrefix = payload.config.cookiePrefix || "payload";
    const sameSite = typeof authConfig.cookies?.sameSite === "string"
      ? authConfig.cookies.sameSite.toLowerCase() as "lax" | "strict" | "none"
      : "lax";
    const response = NextResponse.json({ ok: true, user: result.user });
    response.headers.set("Cache-Control", "no-store");
    response.cookies.set(`${cookiePrefix}-token`, result.token, {
      httpOnly: true,
      secure: authConfig.cookies?.secure ?? process.env.NODE_ENV === "production",
      sameSite,
      path: "/",
      maxAge: result.tokenExpiration,
      ...(authConfig.cookies?.domain ? { domain: authConfig.cookies.domain } : {}),
    });
    response.cookies.set("sv-google-nonce", "", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 0,
    });
    return response;
  } catch {
    const response = NextResponse.json(
      { message: "Google sign-in failed. Please try again." },
      { status: 401 },
    );
    response.cookies.set("sv-google-nonce", "", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 0,
    });
    return response;
  }
}
