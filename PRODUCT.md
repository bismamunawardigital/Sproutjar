# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Salaried professionals in the UAE and wider GCC, roughly 25–45, carrying credit card balances across
two to four cards at 2.5–3.5% monthly interest. They usually support family, are embarrassed to raise
money with anyone they know, and have abandoned at least one budgeting app already. They know what
they owe; what they lack is somewhere safe to say it out loud.

The demo profile is Layla: AED 18,000 income, AED 11,500 essentials, three cards opening at AED
87,645 and now at AED 39,100, eleven weeks and six conversations in. She is a returning user, not a
first run — history carries the story.

## Product Purpose

Sproutjar is financial wellness life-coaching with an AI voice coach, Ren, for people clearing credit
card debt and starting to save. Success is that someone finishes a call having said something true
out loud and chosen one small action themselves, and that months later the balances have actually
moved. Never budgeting spreadsheets, never a lecture.

## Positioning

Ren already knows the numbers. It reads live balances, rates, minimums, surplus, jars and past
commitments from the database before it speaks, so the user never types their finances and never
explains themselves twice. A general assistant cannot do that, and a budgeting app cannot hold a
conversation. The coaching is grounded in positive psychology and coaching practice, not motivation:
it explores before advising, asks permission before challenging, and never fabricates a commitment.

Deliberate non-goal: text chat. Quiet mode exists for public places (whisper in, text out), but
Sproutjar does not ship a chatbot.

## Operating Context

- Mobile-first web app used on a phone, often after payday has already gone.
- Calls run over ElevenLabs Conversational AI on WebRTC, typically 10–20 minutes, with an intent
  contract chosen before the call: clarity, a decision, a plan, or space to think.
- Quiet mode for the Metro or an open-plan office: audio out muted, transcript promoted, Ren told to
  keep turns short and not ask for numbers to be read aloud.
- Four surfaces: Home (living overview and doorway into a call), Ren (the call room and archive),
  Growth (Clearing and Building), You (the money story, beliefs, and talk history).
- Money is entered rarely and by hand; the ledger is meant to move through conversation, not forms.

## Capabilities and Constraints

- Live Convex database behind every screen and every one of Ren's tools, so the UI and the voice can
  never disagree about a balance.
- Ren's tools: live snapshot, payoff simulation, GCC balance transfer offers, credit basics per
  country, log a commitment, log a jar deposit, propose a balance move, plus client tools that push
  an on-screen comparison card and refresh the dashboard mid-call.
- Payoff engine: snowball and avalanche, real compounding, debt-free date, per-card milestones, and
  "rent on the debt" (this month's interest).
- Balance transfers are proposals, never silent mutations: Ren files one, the user applies it on
  Growth, and applying moves principal rather than counting it as paid off.
- Two horizons: `clearing` while cards remain, `building` once they are gone, where the headline
  number becomes months of cover and Ren's agendas turn to jars, runway, boundaries with family, and
  a first investment. Ren never recommends products, funds, platforms or allocations.
- Single-tenant demo auth: every request resolves to the seeded profile.
- Coaching, not financial, legal or religious advice, and Ren says so when a question needs a ruling.

## Brand Commitments

- Palette: Warm Neutral Canvas #FAF7F2, Deep Pine #163323, Seedling Green #3B7A57, Subdued Rust
  #B85D38. The call orb is the only permitted gradient.
- Money uses tabular numerals; estimated figures carry an "Estimated" chip.
- Red never represents the user's money. Root brown is the cost of debt. Amber is reserved for
  breakthroughs.
- The plant is the progress instrument: the stem is principal actually cleared, one root per talk,
  and it never wilts. Growth is not earned by logging in.
- Voice: plain, specific, never shaming, never congratulatory for nothing. Banned: "journey",
  "empower", "amazing", "crush your debt", "you've got this", "I'm here to help", "let's dive in",
  "as an AI", "I understand how you feel".
- Claims stay truthful: the chart says money was cleared *while* coaching with Ren, not because of it.

## Evidence on Hand

- Working product with live Convex data, seeded with eleven weeks of Layla's real-shaped history:
  three cards, two jars, two named beliefs, six sessions, five commitments.
- `docs/demo-story.md` — the recorded demo narrative.
- A third-party UX audit of a recorded session, and the decisions taken against it, are the source of
  most recent changes.
- No customers, no testimonials, no pricing, no benchmarks. None may be invented.

## Product Principles

1. Reality before positivity. Say the true number, then talk about it.
2. The person owns the goal and the action; Ren reflects, clarifies and asks permission.
3. Never claim a commitment they did not make, and never let the screen say something the ledger
   cannot support.
4. Nothing moves on a mishearing: voice can propose, only a tap can change money.
5. Progress must be visible on a flat month — the work counts, not just the balance.

## Accessibility & Inclusion

- Quiet mode: full participation without hearing Ren, for public and shared spaces.
- Every voice moment has an on-screen equivalent: transcript, comparison cards, and the commitment
  written to Home.
- Sharia-compliant cards are labelled as profit rate rather than interest.
