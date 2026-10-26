/**
 * Teaches Ren's webhook tools who is calling. Each Sproutjar tool gets a
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

async function main() {
  const list = (await (await fetch(`${API}/convai/tools`, { headers })).json()) as { tools: Tool[] };
  const ours = list.tools.filter((t) => t.tool_config.api_schema?.url.includes("/api/tools/"));

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
    conversation_config: { agent: { dynamic_variables?: { dynamic_variable_placeholders: Record<string, string> } } };
  };
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
