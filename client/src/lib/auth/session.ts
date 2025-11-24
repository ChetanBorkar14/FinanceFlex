import { cookies } from "next/headers";
import { SignJWT, jwtVerify, type JWTPayload } from "jose";

const supabaseJwtSecret = process.env.SUPABASE_JWT_SECRET;
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;

if (!supabaseJwtSecret) {
  throw new Error("SUPABASE_JWT_SECRET is not set.");
}

const secret = new TextEncoder().encode(supabaseJwtSecret);

export const SESSION_COOKIE_NAME =
  process.env.AUTH_SESSION_COOKIE ?? "ff-session-token";

const SESSION_MAX_AGE =
  Number.parseInt(process.env.AUTH_SESSION_MAX_AGE ?? "", 10) ||
  60 * 60 * 24 * 7; // 7 days

export interface SessionPayload {
  sub: string;
  email: string;
  name?: string | null;
}

export async function createSessionToken(payload: SessionPayload) {
  const issuer = supabaseUrl ?? "financeflex";

  return new SignJWT({
    email: payload.email,
    name: payload.name ?? null,
    role: "authenticated",
  })
    .setProtectedHeader({ alg: "HS256", typ: "JWT" })
    .setIssuer(issuer)
    .setAudience("authenticated")
    .setSubject(payload.sub)
    .setIssuedAt()
    .setExpirationTime(`${SESSION_MAX_AGE}s`)
    .sign(secret);
}

export async function verifySessionToken(token: string) {
  try {
    const { payload } = await jwtVerify(token, secret, {
      audience: "authenticated",
    });

    return payload as JWTPayload & SessionPayload;
  } catch {
    return null;
  }
}

export async function setSessionCookie(token: string) {
  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_MAX_AGE,
  });
}

export async function clearSessionCookie() {
  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE_NAME, "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  });
}

