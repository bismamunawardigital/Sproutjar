import { NextResponse } from "next/server";

/**
 * Ren calls these routes from ElevenLabs' servers, so they are public URLs guarded by
 * a shared secret sent as X-API-Key.
 */
export function assertToolKey(request: Request): NextResponse | null {
  const expected = process.env.SPROUTJAR_TOOL_API_KEY;
  if (!expected) {
    return NextResponse.json(
      { error: "SPROUTJAR_TOOL_API_KEY is not configured on the server." },
      { status: 500 },
    );
  }
  if (request.headers.get("x-api-key") !== expected) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  return null;
}
