import {
  createHmac,
  createPublicKey,
  randomBytes,
  randomUUID,
  verify,
} from "node:crypto";

import type { Payload } from "payload";

type GoogleClaims = {
  aud?: string | string[];
  email?: string;
  email_verified?: boolean;
  exp?: number;
  iat?: number;
  iss?: string;
  nonce?: string;
  sub?: string;
};

type GoogleJWK = JsonWebKey & { kid?: string; alg?: string };

const decodeSegment = <T,>(segment: string): T =>
  JSON.parse(Buffer.from(segment, "base64url").toString("utf8")) as T;

async function verifyGoogleCredential(
  credential: string,
  expectedNonce: string,
  clientId: string,
): Promise<GoogleClaims> {
  const parts = credential.split(".");
  if (parts.length !== 3) throw new Error("Invalid Google credential.");

  const header = decodeSegment<{ alg?: string; kid?: string }>(parts[0]);
  if (header.alg !== "RS256" || !header.kid) {
    throw new Error("Unsupported Google credential.");
  }

  const response = await fetch("https://www.googleapis.com/oauth2/v3/certs", {
    cache: "no-store",
  });
  if (!response.ok) throw new Error("Google verification is temporarily unavailable.");

  const jwks = (await response.json()) as { keys?: GoogleJWK[] };
  const jwk = jwks.keys?.find((key) => key.kid === header.kid && key.alg === "RS256");
  if (!jwk) throw new Error("Google signing key was not found.");

  const publicKey = createPublicKey({ key: jwk, format: "jwk" });
  const signingInput = Buffer.from(`${parts[0]}.${parts[1]}`);
  const signature = Buffer.from(parts[2], "base64url");
  if (!verify("RSA-SHA256", signingInput, publicKey, signature)) {
    throw new Error("Google credential signature is invalid.");
  }

  const claims = decodeSegment<GoogleClaims>(parts[1]);
  const now = Math.floor(Date.now() / 1000);
  const audienceMatches = Array.isArray(claims.aud)
    ? claims.aud.includes(clientId)
    : claims.aud === clientId;

  if (
    !audienceMatches ||
    !["https://accounts.google.com", "accounts.google.com"].includes(claims.iss ?? "") ||
    typeof claims.exp !== "number" ||
    claims.exp <= now ||
    typeof claims.iat !== "number" ||
    claims.iat > now + 60 ||
    claims.nonce !== expectedNonce ||
    claims.email_verified !== true ||
    typeof claims.email !== "string" ||
    typeof claims.sub !== "string"
  ) {
    throw new Error("Google account verification failed.");
  }

  return claims;
}

export async function authenticateGoogleCustomer({
  payload,
  credential,
  nonce,
  clientId,
}: {
  payload: Payload;
  credential: string;
  nonce: string;
  clientId: string;
}) {
  const claims = await verifyGoogleCredential(credential, nonce, clientId);
  const email = claims.email!.trim().toLowerCase();

  const existing = await payload.find({
    collection: "users",
    where: { email: { equals: email } },
    limit: 1,
    pagination: false,
    overrideAccess: true,
  });

  let user = existing.docs[0];
  if (!user) {
    user = await payload.create({
      collection: "users",
      overrideAccess: true,
      data: {
        email,
        password: randomBytes(48).toString("base64url"),
        roles: ["customer"],
      },
    });
  }

  const authConfig = payload.collections.users.config.auth;
  const tokenExpiration = authConfig.tokenExpiration || 60 * 60 * 24 * 7;
  const issuedAt = Math.floor(Date.now() / 1000);
  const expiresAt = issuedAt + tokenExpiration;
  let sid: string | undefined;

  if (authConfig.useSessions) {
    sid = randomUUID();
    const fullUser = await payload.findByID({
      collection: "users",
      id: user.id,
      overrideAccess: true,
      showHiddenFields: true,
    });
    const now = new Date();
    const sessions = Array.isArray(fullUser.sessions)
      ? fullUser.sessions.filter((session) => new Date(session.expiresAt).getTime() > now.getTime())
      : [];

    sessions.push({
      id: sid,
      createdAt: now,
      expiresAt: new Date(now.getTime() + tokenExpiration * 1000),
    });

    await payload.db.updateOne({
      collection: "users",
      id: user.id,
      data: { sessions },
      returning: false,
    });
  }

  const tokenHeader = Buffer.from(
    JSON.stringify({ alg: "HS256", authVersion: 1, typ: "JWT" }),
  ).toString("base64url");
  const tokenPayload = Buffer.from(
    JSON.stringify({
      id: user.id,
      collection: "users",
      email,
      ...(sid ? { sid } : {}),
      iat: issuedAt,
      exp: expiresAt,
    }),
  ).toString("base64url");
  const unsignedToken = `${tokenHeader}.${tokenPayload}`;
  const signature = createHmac("sha256", payload.secret)
    .update(unsignedToken)
    .digest("base64url");

  return {
    token: `${unsignedToken}.${signature}`,
    tokenExpiration,
    user: {
      id: user.id,
      email,
      roles: "roles" in user ? user.roles : ["customer"],
    },
  };
}
