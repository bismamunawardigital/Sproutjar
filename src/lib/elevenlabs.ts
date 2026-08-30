const API_BASE = "https://api.elevenlabs.io/v1";

export function elevenLabsConfig() {
  const apiKey = process.env.ELEVENLABS_API_KEY;
  const agentId = process.env.ELEVENLABS_AGENT_ID;
  return { apiKey, agentId, configured: Boolean(apiKey && agentId) };
}

/** WebRTC conversation token, minted server side so the API key never reaches the browser. */
export async function fetchConversationToken(agentId: string, apiKey: string): Promise<string> {
  const response = await fetch(
    `${API_BASE}/convai/conversation/token?agent_id=${encodeURIComponent(agentId)}`,
    { headers: { "xi-api-key": apiKey }, cache: "no-store" },
  );
  if (!response.ok) {
    throw new Error(`ElevenLabs returned ${response.status}: ${await response.text()}`);
  }
  const data = (await response.json()) as { token: string };
  return data.token;
}
