import { createHmac, timingSafeEqual } from "node:crypto";

/**
 * Ren's tools are called from ElevenLabs' servers, which know nothing about
 * our sessions. The browser hands the call a token naming the person, signed
 * with the same shared secret the tools already send, so a tampered token
 * cannot read someone else's numbers.
 */
function secret(): string {
  const key = process.env.SPROUTJAR_TOOL_API_KEY;
  if (!key) throw new Error("SPROUTJAR_TOOL_API_KEY is not configured on the server.");
  return key;
}

function sign(userKey: string): string {
  return createHmac("sha256", secret()).update(userKey).digest("base64url");
}

export function renUserToken(userKey: string, sessionId?: string): string {
  const payload = sessionId ? `call:${Buffer.from(JSON.stringify({ userKey, sessionId })).toString("base64url")}` : userKey;
  return `${payload}.${sign(payload)}`;
}

/** The user key inside a valid token, or null when it is missing or forged. */
function readClaims(token: string | null | undefined): { userKey: string; sessionId?: string } | null {
  if (!token) return null;
  const at = token.lastIndexOf(".");
  if (at <= 0) return null;
  const userKey = token.slice(0, at);
  const given = Buffer.from(token.slice(at + 1));
  const expected = Buffer.from(sign(userKey));
  if (given.length !== expected.length || !timingSafeEqual(given, expected)) return null;
  if (!userKey.startsWith("call:")) return { userKey };
  try {
    const claims = JSON.parse(Buffer.from(userKey.slice(5), "base64url").toString("utf8"));
    return typeof claims.userKey === "string" && typeof claims.sessionId === "string" && claims.userKey && claims.sessionId ? claims : null;
  } catch { return null; }
}

export function readRenUserToken(token: string | null | undefined): string | null {
  return readClaims(token)?.userKey ?? null;
}

export function readRenSessionToken(token: string | null | undefined): string | null {
  return readClaims(token)?.sessionId ?? null;
}
