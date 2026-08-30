# Sproutjar

Financial wellness life-coaching for people carrying credit card debt in the Gulf, built around
**Ren**, a voice-first coach running on ElevenLabs Conversational AI.

Ren is not a chatbot bolted onto a budgeting app. A session follows a real coaching arc — check in,
agenda in the user's own words, strengths, one positive-psychology technique, action with real
numbers, and a close that names the distance travelled. Sproutjar is the product around that
session: the balances Ren reads from, the payoff maths it quotes, and the commitment it writes back.

## What is here

| Layer | What it does |
| --- | --- |
| `src/lib/debt-engine.ts` | Month-by-month payoff simulation with compounding. Snowball vs avalanche, per-card milestones, debt-free date, monthly bleed, "months of your life back" |
| `src/lib/jars.ts` | Savings jars, growth stages, and the surplus split that fills a one-month buffer before attacking the cards |
| `src/lib/money.ts` | Six GCC countries, their currencies, bureaus, regulators and debt-burden caps. Three-decimal handling for KWD/BHD/OMR, plus speakable rounding for voice |
| `src/app/api/tools/*` | The server tools Ren calls mid-conversation (see below) |
| `src/app/api/*` | App CRUD: profile, debts, jars, deposits, commitments, snapshot |
| `src/app/dashboard` | The app: live voice session with Ren, payoff timeline, strategy picker, jars, commitments |
| `src/app/page.tsx` | Landing page |

## Ren's server tools

Every tool is a `GET`/`POST` route guarded by the `X-API-Key` header (`SPROUTJAR_TOOL_API_KEY`).

| Route | Ren uses it to |
| --- | --- |
| `GET /api/tools/debt-snapshot` | Open a call already knowing every card, rate, jar and open commitment |
| `GET /api/tools/payoff-plan?monthly_payment=&strategy=` | Answer "what if I put 2,000 a month at this" with a real date, live |
| `GET /api/tools/balance-transfer-offers?bank=` | Quote today's actual transfer offer, fee and post-promo rate instead of a remembered figure |
| `GET /api/tools/credit-basics?country=` | Get the bureau, regulator, DBR cap and minimum-payment rule for the user's country |
| `POST /api/tools/log-commitment` | Write the WOOP commitment from the close of the session to the dashboard |
| `POST /api/tools/jar-deposit` | Add to a savings jar when the user commits to an amount out loud |

The browser never sees the ElevenLabs API key: `GET /api/agent/session` mints a short-lived WebRTC
conversation token server side and returns it alongside the dynamic variables (name, country,
currency, total debt, surplus, debt-free date, jar progress, open commitment) that Ren is primed
with, so the call never opens by asking the user to re-explain their situation.

## Running it

```bash
npm install
cp .env.example .env      # fill in ELEVENLABS_API_KEY and ELEVENLABS_AGENT_ID
npm run db:push
npm run db:seed
npm run dev
```

Open http://localhost:3000 for the landing page and http://localhost:3000/dashboard for the app.

### Environment

| Variable | Purpose |
| --- | --- |
| `DATABASE_URL` | SQLite file, e.g. `file:./dev.db` |
| `ELEVENLABS_API_KEY` | Server-side only. Mints conversation tokens |
| `ELEVENLABS_AGENT_ID` | The Ren agent |
| `SPROUTJAR_TOOL_API_KEY` | Shared secret Ren sends as `X-API-Key` when calling the tool routes |

### Pointing Ren at a deployment

The tool routes must be reachable from ElevenLabs' servers. After deploying, update each webhook
tool's URL on the agent to `https://<your-domain>/api/tools/<route>` and set the same
`X-API-Key` value the deployment uses.

## Scope and safety

Sproutjar coaches behaviour, mindset and planning. It is not a bank, a licensed financial advisor,
or a debt collector, and it gives no investment, legal or tax advice. Hardship, restructuring,
bounced cheques or an inability to meet minimums are routed to a human at the user's bank — the
payoff engine returns an explicit infeasible result rather than inventing a plan.
