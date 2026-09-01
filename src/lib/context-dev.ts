/**
 * Live web retrieval through Context.dev. The key is read server side only, and a failed
 * retrieval returns a stated reason rather than letting dated data pass as current.
 *
 * Two steps: search the live web for the bank's own pages, then extract the offer terms from
 * the best of those pages with fact checking on, so every figure comes back with its source.
 */
const SEARCH_URL = "https://api.context.dev/v1/web/search";
const EXTRACT_URL = "https://api.context.dev/v1/web/extract";

const OFFER_SCHEMA = {
  type: "object",
  properties: {
    product: { type: "string", description: "The name of the balance transfer product." },
    promotional_rate: { type: "string", description: "The promotional rate as published, including whether it is monthly or annual." },
    promotional_period: { type: "string", description: "How long the promotional rate lasts." },
    standard_or_revert_rate: { type: "string", description: "The rate that applies after the promotional period." },
    transfer_fee: { type: "string", description: "The processing or transfer fee, including VAT if stated." },
    early_settlement_fee: { type: "string", description: "The early settlement fee, including VAT if stated." },
    islamic_profit_rate: { type: "boolean", description: "True when the page describes a profit rate rather than interest." },
  },
  required: [
    "product",
    "promotional_rate",
    "promotional_period",
    "standard_or_revert_rate",
    "transfer_fee",
    "early_settlement_fee",
    "islamic_profit_rate",
  ],
  additionalProperties: false,
} as const;

const EXTRACT_INSTRUCTIONS =
  "Extract the credit card balance transfer terms exactly as published on the page. Leave a field null when the page does not state it. Never infer a rate or a fee.";

export type RetrievedSource = {
  url: string;
  title: string;
  /** The search snippet, which is where the published figure usually shows up first. */
  summary: string;
};

export type RetrievedTerms = {
  source_url: string;
  product: string | null;
  promotional_rate: string | null;
  promotional_period: string | null;
  standard_or_revert_rate: string | null;
  transfer_fee: string | null;
  early_settlement_fee: string | null;
  islamic_profit_rate: boolean | null;
};

export type Retrieval =
  | {
      ok: true;
      retrievedAt: string;
      query: string;
      sources: RetrievedSource[];
      /** Null when the bank's own page was reachable in search but its terms could not be read. */
      terms: RetrievedTerms | null;
    }
  | { ok: false; reason: string };

type SearchResult = { url?: unknown; title?: unknown; description?: unknown };
type SearchResponse = { results?: unknown };
type ExtractResponse = { status?: unknown; data?: unknown };

export function contextDevConfigured(): boolean {
  return Boolean(process.env.CONTEXT_DEV_API_KEY);
}

function toSource(result: unknown): RetrievedSource | null {
  if (typeof result !== "object" || result === null) return null;
  const candidate = result as SearchResult;
  if (typeof candidate.url !== "string") return null;
  return {
    url: candidate.url,
    title: typeof candidate.title === "string" ? candidate.title : candidate.url,
    summary: typeof candidate.description === "string" ? candidate.description : "",
  };
}

/**
 * Banks run a site per market on the country's own domain, so emiratesnbd.com.eg must not
 * answer for a customer in the UAE. Any two letter final label that is not this market's is out.
 */
function inMarket(host: string, country: string): boolean {
  const tld = host.split(".").pop() ?? "";
  return tld.length !== 2 || tld === country.toLowerCase();
}

function hostOf(url: string): string | null {
  try {
    return new URL(url).hostname.toLowerCase();
  } catch {
    return null;
  }
}

/** The extractor spells an absent field several ways, and none of them may reach the call. */
const ABSENT = /^[/\\"'\s-]*(null|n\/a|none|not stated|not specified|unknown)[/\\"'\s.]*$/i;

function text(value: unknown): string | null {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  if (trimmed === "" || ABSENT.test(trimmed)) return null;
  return trimmed;
}

async function post(
  url: string,
  key: string,
  body: unknown,
  timeoutMs: number,
): Promise<Response> {
  return fetch(url, {
    method: "POST",
    headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
    body: JSON.stringify(body),
    cache: "no-store",
    signal: AbortSignal.timeout(timeoutMs),
  });
}

/** Read the published terms off one page, fact checked, so nothing is inferred. */
async function extractTerms(key: string, url: string): Promise<RetrievedTerms | null> {
  let response: Response;
  try {
    response = await post(
      EXTRACT_URL,
      key,
      {
        url,
        schema: OFFER_SCHEMA,
        instructions: EXTRACT_INSTRUCTIONS,
        factCheck: true,
        maxPages: 1,
        maxDepth: 0,
      },
      // Ren is mid conversation: past this, drop to the search results rather than hold the call.
      20_000,
    );
  } catch {
    return null;
  }
  if (!response.ok) return null;

  const payload: ExtractResponse = await response.json();
  if (typeof payload.data !== "object" || payload.data === null) return null;
  const data = payload.data as Record<string, unknown>;

  const terms: RetrievedTerms = {
    source_url: url,
    product: text(data.product),
    promotional_rate: text(data.promotional_rate),
    promotional_period: text(data.promotional_period),
    standard_or_revert_rate: text(data.standard_or_revert_rate),
    transfer_fee: text(data.transfer_fee),
    early_settlement_fee: text(data.early_settlement_fee),
    islamic_profit_rate:
      typeof data.islamic_profit_rate === "boolean" ? data.islamic_profit_rate : null,
  };

  const priced =
    terms.promotional_rate ??
    terms.standard_or_revert_rate ??
    terms.transfer_fee ??
    terms.early_settlement_fee;
  // A product name and nothing else is not an offer, so the caller should say it found none.
  return priced === null ? null : terms;
}

/**
 * Search the live web, then read the offer terms off the most likely official page.
 * `officialHint` is matched against result hosts so a comparison site cannot pass as the bank.
 */
export async function retrieve(
  query: string,
  options: { results?: number; country?: string; officialHint?: string; withTerms?: boolean } = {},
): Promise<Retrieval> {
  const key = process.env.CONTEXT_DEV_API_KEY;
  if (!key) {
    return { ok: false, reason: "Live retrieval is not configured on this deployment." };
  }

  let response: Response;
  try {
    response = await post(
      SEARCH_URL,
      key,
      {
        query,
        numResults: options.results ?? 10,
        country: options.country ?? "ae",
        timeoutMS: 15_000,
      },
      18_000,
    );
  } catch {
    return { ok: false, reason: "Could not reach the live retrieval service just now." };
  }

  if (!response.ok) {
    return { ok: false, reason: `Live retrieval failed with status ${response.status}.` };
  }

  const payload: SearchResponse = await response.json();
  const raw = Array.isArray(payload.results) ? payload.results : [];
  const found = raw
    .map(toSource)
    .filter((source): source is RetrievedSource => source !== null);
  const sources = found.slice(0, 4);

  if (sources.length === 0) {
    return { ok: false, reason: "Nothing current was found for that question." };
  }

  const retrievedAt = new Date().toISOString();
  if (options.withTerms === false) {
    return { ok: true, retrievedAt, query, sources, terms: null };
  }

  const hint = options.officialHint?.toLowerCase().replace(/[^a-z]/g, "") ?? "";
  const country = options.country ?? "ae";
  // The hint is matched on the host, never the path: paisabazaar.ae/emirates-nbd is not the bank.
  const onBankSite = found.filter((source) => {
    const host = hostOf(source.url);
    if (host === null || !inMarket(host, country)) return false;
    return hint.length > 2 ? host.replace(/[^a-z]/g, "").includes(hint) : true;
  });
  // The product page carries the rate; the help centre usually only carries the fees.
  const official =
    onBankSite.find((source) => !/help|support|faq/i.test(source.url)) ?? onBankSite[0];

  // No page on the named bank's own domain: return the search results and no terms, rather
  // than reading another bank's offer back as if it were theirs.
  if (!official) return { ok: true, retrievedAt, query, sources, terms: null };

  return { ok: true, retrievedAt, query, sources, terms: await extractTerms(key, official.url) };
}
