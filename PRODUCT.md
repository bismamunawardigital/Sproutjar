# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Salaried professionals in the UAE and wider GCC, roughly 25–45, carrying credit card balances across
two to four cards at 2.5–3.5% monthly interest in the UAE, about 1% a month in Qatar. They usually
support family, are embarrassed to raise money with anyone they know, and have abandoned at least one
budgeting app already. They know what they owe; what they lack is somewhere safe to say it out loud.

The demo profile is Layla: AED 18,000 take-home, paid on the 25th, AED 7,200 essentials, AED 1,800
rent and fees, AED 2,000 sent home, AED 500 set aside for known lumps, so AED 6,500 a month goes to
the cards. Three cards opened at AED 87,645 and stand at AED 39,100 after thirty-two weeks, seven
conversations and one payday review, including a March bonus of AED 15,000 sent straight to RAKBANK
under a windfall rule she decided in advance, and a grocery slip of AED 640 that the review recorded
as new borrowing. She is a returning user, not a first run — history carries the story.

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

Deliberate non-goal: a chatbot. Ren can be typed to and quiet mode exists for public places (whisper
in, text out), but both are the same coach in the same room with the same memory, not a second
product.

## Operating Context

- Mobile-first web app used on a phone, often after payday has already gone.
- Calls run over ElevenLabs Conversational AI on WebRTC, typically 10–20 minutes, with an intent
  contract chosen before the call: clarity, a decision, a plan, or space to think.
- Quiet mode for the Metro or an open-plan office: audio out muted, transcript promoted, Ren told to
  keep turns short and not ask for numbers to be read aloud.
- Four surfaces: Today (living overview, one doorway into a call, the payday invitation), Ren (the
  call room, agenda pills, typed Ren, archive and contract), Plan (Clearing and Building, the payday
  review, pending proposals, the horizon after the last card), You (the money story, beliefs, talk
  history, and the editable numbers Ren works from).
- Money is entered rarely and by hand; the ledger moves through conversation and the payday review.
  A bank statement can be pasted in when memory is not enough; live bank linking is not available and
  the product says so.

## Capabilities and Constraints

- Live Convex database behind every screen and every one of Ren's tools, so the UI and the voice can
  never disagree about a balance.
- Ren's tools: live snapshot, payoff simulation, GCC balance transfer offers, credit basics per
  country, log a commitment, log a jar deposit, propose a balance move, plus client tools that push
  an on-screen comparison card and refresh the dashboard mid-call.
- Monthly amount to the cards is derived from the person's own numbers (take-home − essentials −
  priority obligations − remittances − sinking funds), or a figure they choose; the screen says
  which is in use.
- Payoff engine: snowball (smallest balance first) and avalanche (highest rate first), month-by-month
  amortisation at each card's own rate, debt-free date, per-card milestones, and "rent on the debt"
  (this month's interest). Annual rates are shown as the simple twelve times the monthly rate.
- Payday review in four numbers: debt at the start of the month, new borrowing, principal repaid,
  interest burned, with what each card received and one reflection in the person's words; the date
  recomputes from it and any gap feeds Ren's next agenda.
- Cards carry due day, statement day, minimum, type (card, BNPL, loan, overdraft) and which fields
  are estimated.
- Balance transfers are proposals, never silent mutations: Ren raises one only when the numbers
  warrant it, files it on Plan with the bank's published terms, source and retrieval time, and the
  user applies it after their bank has executed it. Applying moves principal rather than counting it
  as paid off.
- Two horizons: `clearing` while cards remain, `building` once they are gone. Plan shows the horizon
  ahead of time: the same monthly amount fills the starter reserve first, then the jars, each with a
  date. Ren never recommends products, funds, platforms or allocations.
- Before a first call, a one-time contract says what Ren does and does not do; existing users reach
  it from Ren and You.
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

- Working product with live Convex data, seeded with thirty-two weeks of Layla's real-shaped
  history: three cards, two jars (a AED 3,000 starter reserve and an Eid jar), two named beliefs,
  seven sessions, six commitments, one payday review.
- The case study carries published card terms for the UAE, Saudi Arabia and Qatar (QNB, Commercial
  Bank, Doha Bank, QIB), each with the bank's own source and the date it was read.
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
  written to Today. Ren can be typed to for anyone who cannot or would rather not speak.
- Sharia-compliant cards are labelled as profit rate rather than interest.
