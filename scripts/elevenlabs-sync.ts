/**
 * Teaches Ren's webhook tools who is calling, and adds any tool Ren is
 * missing (today: log_card_payment, the "I paid this" tool). Each Sproutjar tool gets a
 * `user` field filled from the {{user_token}} dynamic variable the app sends
 * when a call starts; the routes verify it and look up that person's numbers.
 * Without it the tools fall back to the demo profile, so nothing breaks before
 * this runs, and nothing breaks for calls that started before it ran.
 *
 *   npx tsx scripts/elevenlabs-sync.ts            # show what would change
 *   npx tsx scripts/elevenlabs-sync.ts --apply    # change it
 */
const API = "https://api.elevenlabs.io/v1";
const apiKey = process.env.ELEVENLABS_API_KEY;
const agentId = process.env.ELEVENLABS_AGENT_ID;
const apply = process.argv.includes("--apply");
if (!apiKey || !agentId) throw new Error("ELEVENLABS_API_KEY and ELEVENLABS_AGENT_ID are required.");

const headers = { "xi-api-key": apiKey, "Content-Type": "application/json" };

type Property = Record<string, unknown>;
type Tool = {
  id: string;
  tool_config: {
    name: string;
    type: string;
    api_schema?: {
      url: string;
      method: string;
      query_params_schema?: { properties: Record<string, Property>; required?: string[] } | null;
      request_body_schema?: { properties: Record<string, Property>; required?: string[] } | null;
    };
  };
};

const userProperty: Property = {
  type: "string",
  description: "Who this call is for. Always send it exactly as given.",
  dynamic_variable: "user_token",
  is_system_provided: false,
  is_omitted: false,
  constant_value: "",
  enum: null,
  allowed_values: null,
  allowed_values_dynamic_variable: "",
};

const appUrl = (process.env.NEXT_PUBLIC_APP_URL ?? "https://www.sproutjar.app").replace(/\/$/, "");

/** Tools Ren should have. Added if no tool with that name exists yet. */
const wantedTools = [
  {
    type: "webhook",
    name: "log_card_payment",
    description:
      'Use when the person says they have paid a card ("I paid 2,000 to the Visa"). Takes the amount off that card\'s balance the same minute and keeps it in their history. Pass the card by name and the amount as a number. Read back new_balance.',
    response_timeout_secs: 20,
    api_schema: {
      url: `${appUrl}/api/tools/log-payment`,
      method: "POST",
      request_headers: { "X-API-Key": process.env.SPROUTJAR_TOOL_API_KEY ?? "" },
      request_body_schema: {
        type: "object",
        required: ["amount"],
        properties: {
          user: userProperty,
          amount: { type: "number", description: "How much they paid, as a plain number." },
          card_name: { type: "string", description: "The card as they said it, e.g. 'Emirates NBD Visa'." },
        },
      },
    },
  },
];

async function main() {
  const list = (await (await fetch(`${API}/convai/tools`, { headers })).json()) as { tools: Tool[] };
  const ours = list.tools.filter((t) => t.tool_config.api_schema?.url.includes("/api/tools/"));
  const created: string[] = [];

  for (const wanted of wantedTools) {
    if (ours.some((t) => t.tool_config.name === wanted.name)) {
      console.log(`${wanted.name}: exists`);
      continue;
    }
    console.log(`${wanted.name}: create, pointing at ${wanted.api_schema.url}`);
    if (!apply) continue;
    if (!process.env.SPROUTJAR_TOOL_API_KEY) throw new Error("SPROUTJAR_TOOL_API_KEY is required to create tools.");
    const response = await fetch(`${API}/convai/tools`, { method: "POST", headers, body: JSON.stringify({ tool_config: wanted }) });
    if (!response.ok) throw new Error(`${wanted.name}: ${response.status} ${await response.text()}`);
    const made = (await response.json()) as { id: string };
    created.push(made.id);
  }

  for (const tool of ours) {
    const schema = tool.tool_config.api_schema!;
    const key = schema.method === "GET" ? "query_params_schema" : "request_body_schema";
    const current = schema[key] ?? { type: "object", properties: {} as Record<string, Property>, required: [] };
    if (current.properties.user) {
      console.log(`${tool.tool_config.name}: already sends user`);
      continue;
    }
    const next = { ...current, properties: { ...current.properties, user: userProperty } };
    console.log(`${tool.tool_config.name}: add user to ${key}`);
    if (!apply) continue;
    const response = await fetch(`${API}/convai/tools/${tool.id}`, {
      method: "PATCH",
      headers,
      body: JSON.stringify({ tool_config: { ...tool.tool_config, api_schema: { ...schema, [key]: next } } }),
    });
    if (!response.ok) throw new Error(`${tool.tool_config.name}: ${response.status} ${await response.text()}`);
  }

  const agent = (await (await fetch(`${API}/convai/agents/${agentId}`, { headers })).json()) as {
    conversation_config: {
      agent: {
        prompt?: { tool_ids?: string[] };
        dynamic_variables?: { dynamic_variable_placeholders: Record<string, string> };
      };
    };
  };
  if (created.length) {
    const toolIds = [...(agent.conversation_config.agent.prompt?.tool_ids ?? []), ...created];
    console.log(`agent: attach ${created.length} new tool(s)`);
    const response = await fetch(`${API}/convai/agents/${agentId}`, {
      method: "PATCH",
      headers,
      body: JSON.stringify({ conversation_config: { agent: { prompt: { tool_ids: toolIds } } } }),
    });
    if (!response.ok) throw new Error(`agent tools: ${response.status} ${await response.text()}`);
  }
  const placeholders = agent.conversation_config.agent.dynamic_variables?.dynamic_variable_placeholders ?? {};
  const wanted = {
    user_token: "",
    first_name: "there",
    onboarding_why: "",
    onboarding_pattern: "",
    onboarding_carrying: "",
    onboarding_help: "",
  };
  const missing = Object.keys(wanted).filter((k) => !(k in placeholders));
  console.log(missing.length ? `agent: add placeholders ${missing.join(", ")}` : "agent: placeholders present");
  if (apply && missing.length) {
    const response = await fetch(`${API}/convai/agents/${agentId}`, {
      method: "PATCH",
      headers,
      body: JSON.stringify({
        conversation_config: {
          agent: { dynamic_variables: { dynamic_variable_placeholders: { ...placeholders, ...wanted } } },
        },
      }),
    });
    if (!response.ok) throw new Error(`agent: ${response.status} ${await response.text()}`);
  }
  console.log(apply ? "Done." : "Dry run. Add --apply to make the changes.");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
