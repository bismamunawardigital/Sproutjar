export type Quote = { text: string; who: string };

export type Shot = { src: string; alt: string; label: string };

export type Chapter = {
  id: string;
  title: string;
  lead: string;
  body: string[];
  quotes?: Quote[];
  aside?: { title: string; lines: string[] };
  shots?: Shot[];
  pull?: string;
};

/** Eleven weekly balance readings from the seeded demo profile the product ships with. */
export const HISTORY = [
  { at: "2026-06-22", total: 87645 },
  { at: "2026-06-29", total: 82791 },
  { at: "2026-07-06", total: 77936 },
  { at: "2026-07-13", total: 73082 },
  { at: "2026-07-20", total: 68227 },
  { at: "2026-07-27", total: 63373 },
  { at: "2026-08-03", total: 58518 },
  { at: "2026-08-10", total: 53664 },
  { at: "2026-08-17", total: 48809 },
  { at: "2026-08-24", total: 43955 },
  { at: "2026-08-31", total: 39100 },
];

export const TALK_DATES = [
  "2026-06-22",
  "2026-07-06",
  "2026-07-21",
  "2026-08-04",
  "2026-08-18",
  "2026-08-29",
];

/**
 * The six sessions in the seeded demo profile: the agenda the app proposed, the commitment the
 * person made in their own words, and the balance after they held it.
 */
export const SESSION_LADDER: {
  when: string;
  agenda: string;
  commitment: string;
  habit: string;
  balance: string;
}[] = [
  {
    when: "Session 1, 22 June",
    agenda: "What is this money for, and what does it actually cost",
    commitment: "“I will stop using the ADCB card while we clear it.”",
    habit: "New spending stops on the card being cleared",
    balance: "87,645",
  },
  {
    when: "Session 2, 6 July",
    agenda: "Pick the payoff order, highest rate first",
    commitment: "“I will pay the day the salary lands, not the day before the due date.”",
    habit: "Payment moves to payday",
    balance: "77,936",
  },
  {
    when: "Session 3, 21 July",
    agenda: "Where the surplus goes before it gets spent",
    commitment: "“I will move AED 2,000 to the jar the same morning.”",
    habit: "The surplus is moved, not left in the account",
    balance: "68,227",
  },
  {
    when: "Session 4, 4 August",
    agenda: "The month that broke, and what changes in the plan",
    commitment: "“I will keep the plan, at a smaller number, for one month.”",
    habit: "A bad month re plans instead of restarting",
    balance: "58,518",
  },
  {
    when: "Session 5, 18 August",
    agenda: "The card that keeps refilling, and the limit on it",
    commitment: "“I will ask the bank to cut the limit on the cleared card.”",
    habit: "Controlled access to an emptied card",
    balance: "48,809",
  },
  {
    when: "Session 6, 29 August",
    agenda: "The belief that this is who I am with money",
    commitment: "“I will write down what changed, in my own words, weekly.”",
    habit: "Progress is recorded by the person, not the app",
    balance: "39,100",
  },
];

/** The numbers that make the Gulf version of this problem different, each one sourced. */
export const RATE_FACTS: { figure: string; label: string; note: string }[] = [
  {
    figure: "39% to 44%",
    label: "What a UAE card actually costs a year",
    note: "Emirates NBD works its own examples at 3.25% and 3.69% a month. Citibank UAE publishes 42% moving to 44.28%. The US baseline in the source material was around 21.5%.",
  },
  {
    figure: "36.28% to 36.75%",
    label: "What a Saudi card costs a year",
    note: "Riyad Bank publishes a monthly term cost of 2.50% to 2.55% on its platinum and signature cards, stated as an annual profit rate of 36.28% to 36.75%. Islamic structure, same order of magnitude as Dubai.",
  },
  {
    figure: "2% to 4%",
    label: "How every Gulf bank quotes it: per month",
    note: "A monthly rate does not feel like anything, and it is the convention from Dubai to Riyadh. Rule in the product: never leave a rate in monthly form, always show the year and the money charged this month.",
  },
  {
    figure: "+0.5% / month",
    label: "Penalty for being late twice in six months",
    note: "Emirates NBD's schedule of charges raises the finance charge on an account past due twice in six months. Roughly six points a year, with a specific trigger.",
  },
  {
    figure: "0 days grace",
    label: "If you pay most of the balance, not all of it",
    note: "Interest runs from the transaction date unless 100% is paid by the due date. People paying nearly everything believe they are being responsible and are not. Cash advances never get grace.",
  },
  {
    figure: "40% to 50%",
    label: "How much salary can go to repayments, and it moves by country",
    note: "The CBUAE caps the debt burden ratio at half of gross salary, and banks commonly count a slice of unused card limits. Kuwait's central bank caps instalments at 40% of net salary, 30% for pensioners. The plan has to be built from the person's own numbers, not a regional rule of thumb.",
  },
];

export const CHAPTERS: Chapter[] = [
  {
    id: "problem",
    title: "Credit card debt in the Gulf costs about twice what the internet thinks it does",
    lead:
      "Every payoff calculator, budgeting book and Reddit thread a person in Dubai reads was written for a market where a card charges around 21% a year. Here it is 39% to 44%, quoted at 3.25% a month so it sounds like nothing.",
    body: [
      "That gap is the whole reason this product is local rather than generic. At 44% the cost of hesitating for a year is not an inconvenience, it is a holiday, a school term, a chunk of a salary. And the mechanics that decide the outcome are the ones nobody reads: pay 95% of your statement and interest still runs from the transaction date, go late twice in six months and the rate itself goes up, keep a dormant card open and it eats your borrowing capacity under the 50% debt burden cap.",
      "Retail credit in the UAE grew 16.1% last year and personal loans 8.6%, so more households are carrying more of this. But bad loans fell to 3.3%, and no public source breaks revolving card distress down by age, income or number of cards. So I wrote the honest version into the brief and kept it: the problem is strongly evidenced, the market size is not, and anyone who tells you the size of the UAE card crisis is guessing.",
    ],
    pull: "Never leave a rate in monthly form.",
  },
  {
    id: "research",
    title: "How the research was actually run",
    lead:
      "I did not ask for a report that agreed with me. I ran my own idea past a deliberately skeptical advisor prompt first: who exactly, what breaks in their week, what they already do instead, and why anything I built would beat that.",
    body: [
      "Every claim I could not source was tagged as an assumption and carried forward untouched, so the research had something specific to attack. Sources were kept in separate buckets and never blended: first person customer voice from UAE threads, institutional material from the CBUAE rulebook and bank key facts statements, vendor and pricing pages for the alternatives, and academic literature for the coaching claims. Anything that survived only in a vendor's marketing copy stayed labelled as such.",
      "Then the verdicts came back, including on the assumption the first version of the product had been built on. I had believed people avoid their cards out of shame. That got contradicted as a primary explanation, and the product changed shape because of it.",
    ],
    quotes: [
      {
        text:
          "Shame appears, but so do job loss, illness, family expenses, accumulating EMIs, cash-flow mismatch, poor habits and misunderstandings.",
        who: "Customer and market research report, verdict on my own assumption",
      },
    ],
    aside: {
      title: "My assumptions, and what the research did to them",
      lines: [
        "People are struggling with cards and loans: supported strongly, at problem level",
        "Shame is the main reason they stay stuck: contradicted as a primary explanation",
        "They mainly need financial education: too narrow",
        "A calculator or planner is enough: contradicted, they already have those",
        "There is a UAE card debt crisis: not yet proven from public data",
        "Voice should be the hero feature: not supported, the evidence validates a journey",
        "Affordable coaching is an opportunity: partially supported, willingness to pay unvalidated",
      ],
    },
  },
  {
    id: "voice",
    title: "What people actually said",
    lead:
      "Twenty five first person quotes, mostly UAE threads from the last eighteen months. The pattern underneath them was not embarrassment. It was arithmetic that does not work, plans that die on contact with a bad month, and progress nobody can feel.",
    body: [
      "People were handing complete strangers every card, rate, EMI, salary and expense they had, in the hope that somebody would build them the plan. The stated need was almost always a number. The revealed need was a sequence: what do I pay, in what order, this month, given my actual life.",
      "The line I keep coming back to is the last one. Someone had already repaid eleven thousand dollars and still could not experience it as success, because every interface they own shows them what is left. That is a design problem rather than a finance problem, and it is the one I could actually solve.",
    ],
    quotes: [
      {
        text: "just got my salary today and in a blink of an eye its gone (debts and bills lmao)",
        who: "UAE thread, via the research report",
      },
      {
        text: "Please make this plan easy to read and understand without using complicated credit and finance terminology.",
        who: "Someone asking strangers for a payoff plan",
      },
      {
        text: "The accountability is 90% of the value for me.",
        who: "A user explaining what he paid a human coach for",
      },
      {
        text: "I don’t know how to change this or be ‘happy’ with my progress.",
        who: "Someone eleven thousand dollars into paying it off",
      },
    ],
    aside: {
      title: "The unmet needs, ranked by how often they appeared",
      lines: [
        "A realistic personalised path from today to debt free",
        "Knowing what is genuinely affordable this month",
        "Help sticking to the plan, not just receiving it",
        "A plan that adapts after a bad month or a shock",
        "Understanding the mechanics at the moment a decision is being made",
        "Knowing how to deal with banks and hardship processes",
        "Being able to see and feel progress",
        "Support that encourages without removing responsibility",
      ],
    },
  },
  {
    id: "alternatives",
    title: "Nothing on the market is trying to change a habit",
    lead:
      "The tools people already use are good at exactly one slice each. None of them owns the sentence that matters: this was your plan, this changed, here is the new plan, and here is what we do differently next month.",
    body: [
      "Budgeting apps categorise the past. YNAB genuinely changes spending behaviour and costs USD 109 a year to do it, but it is a budgeting system with debt inside it rather than a route out. Cleo will talk to you and produce a paydown plan for USD 5.99 a month, and it is the closest thing to a competitor, which is why an AI that gives you a debt plan is not a strategy. Debt Payoff Planner and Undebt.it draw the date beautifully for two dollars a month or ten dollars a year, and then leave you alone with it. Spreadsheets are free, flexible, and stop being true the first month you go off plan.",
      "The alternative that actually works is a human coach. One person in the research paid about USD 3,000 for six sessions and said the accountability was ninety percent of the value. That is the shape of the opportunity and the shape of the problem: it works because someone is in the loop with you, and it does not scale.",
      "So the target is not calculation, and it is not education. It is behaviour: a new spending habit, a saving habit that survives a good month, and a plan that gets adapted instead of abandoned. Everything in the product exists to serve that, and the dashboard is instrumentation for it rather than the point of it.",
    ],
    pull: "Never use a financial product to solve a behavioural problem, and never use a behavioural lecture to solve an insolvency problem.",
  },
  {
    id: "panel",
    title: "I built a synthetic user panel of promoters and detractors, and interviewed all five",
    lead:
      "Before I could reach real customers I wrote five personas and ran a full interview with each: two who should love this, two who are sceptical, and one who should refuse to buy it. The point was not applause. It was to hear, in one place, why someone would pay for this and why someone would not touch it.",
    body: [
      "Zayd was the most useful. He knows what avalanche means, has built the spreadsheet twice, and abandons it the month reality diverges from it. His objection is the one the whole business has to answer: why is this not just ChatGPT plus Excel. Omar gave me the sentence I now use to explain the product, that the debt cycle is like dieting, austerity then relief then relapse. Leena showed why the mathematically optimal plan is often the personally unsustainable one. And Maya, who is organised and fine, said the quiet part out loud about my own positioning.",
      "Building the panel with detractors in it is the reason it was useful. Five enthusiasts would have confirmed everything and changed nothing. This produced five buying objections and one clear non customer, which is a cheaper way to find them than shipping. None of it is evidence, and I do not treat it as any: a synthetic panel generates objections and hypotheses, and only real interviews can settle them.",
      "Nobody on the panel wanted a forty minute scheduled call with an AI about their credit cards. That matched the research verdict on voice, and it is why sessions are ten, twenty or forty minutes at the person's choice, nothing is scheduled, and Ren is a room in the product rather than the product.",
    ],
    quotes: [
      {
        text: "I know exactly what I'm supposed to do. That's kind of the problem.",
        who: "Zayd, 28, synthetic persona",
      },
      {
        text: "Once the spreadsheet is wrong, I kind of stop looking at it. Don't tell me I failed. Re-plan.",
        who: "Zayd, 28, synthetic persona",
      },
      {
        text: "It's like dieting.",
        who: "Omar, 37, on paying cards off and rebuilding them",
      },
      {
        text: "I don't want an app telling me I can't go see my family because that's financially optimal.",
        who: "Leena, 30, who sends money home",
      },
      {
        text: "Positive psychology makes it sound less serious, not more serious.",
        who: "Maya, 34, the persona I should not try to acquire",
      },
    ],
    aside: {
      title: "What the panel changed",
      lines: [
        "Adaptation joined the core loop: understand, plan, act, adapt, continue",
        "Positive psychology moved out of the copy and into the method",
        "Voice became situational, never scheduled, never the front door",
        "Onboarding had to stop teaching APR to people with fifteen years of salary",
        "Reflection had to be grounded in real financial events, not feelings",
      ],
    },
  },
  {
    id: "coaching",
    title: "The coaching research, and how Ren was built out of it",
    lead:
      "I read the literature before writing a word of Ren's prompt, because financial coaching is a field where the marketing is far ahead of the evidence and I did not want to ship a motivational chatbot with a plant on it.",
    body: [
      "Three findings did the most work. The working alliance matters: a meta analysis across 27 samples and 3,563 coaching processes found the quality of the relationship moderately associated with outcomes, and with fewer unintended harms. Monitoring closes the loop: across 138 studies and 19,951 participants, interventions that increased progress monitoring improved goal attainment, more so when progress was recorded and reported back. And no branded framework wins: the evidence favours flexible integration of solution focused work, cognitive behavioural coping and strengths, not a proprietary model.",
      "Positive psychology, read properly, is not compulsory optimism. A coach should be positive about human possibility rather than positive about every human experience, and prematurely reframing someone's fear about a 44% balance into gratitude is bad coaching. The evidence on financial coaching specifically is genuinely mixed: one randomised evaluation found improvements in money management, savings, debt and financial confidence, while a 2026 systematic review of eleven controlled studies found small effects, heavy heterogeneity and methodological weaknesses in ten of them. So the product describes itself as structured support for behaviour change, and never as a cure.",
      "Those findings became rules in Ren's prompt rather than vibes. Ren asks permission before challenging, teaching or suggesting. Ren decomposes a global self judgment into a behaviour before agreeing with it. Ren reflects using the person's own words and their actual balances. Every session ends with one commitment the person believes they can keep, and every session opens by returning to the last one, kept or not, without a score.",
    ],
    pull: "A positive psychology coach should be positive about human possibility, not compulsively positive about every human experience.",
  },
  {
    id: "strategy",
    title: "The escape route, localised",
    lead:
      "The payoff engine is the easy part. The judgment is knowing which layer someone is on, because avalanche versus snowball is irrelevant while the balance is still growing.",
    body: [
      "At 39% to 44%, choosing snowball for the feeling over avalanche for the maths costs more here than in any American guide. So the product leans avalanche, and clears a trivial balance only where that releases a minimum payment or closes a card. This is the order Ren works down, before any payoff method matters.",
    ],
    aside: {
      title: "What Ren will not do",
      lines: [
        "Issue a religious ruling, or declare a product permissible",
        "Promise a debt free date it cannot derive from real balances",
        "Give investment, tax or legal advice",
        "Claim a travel ban outcome, since it turns on facts nobody can verify remotely",
        "Describe UAE card interest as compounding on interest, which is prohibited here",
        "Move money, or record transferred principal as progress",
      ],
    },
  },
  {
    id: "against-myself",
    title: "Why this is voice first, and not another chat window",
    lead:
      "A text agent answers questions. That is not the problem here. The problem is a person who already knows the answer and cannot keep doing it, and the thing that moves that is a relationship with something that talks back.",
    body: [
      "Three reasons voice earns its place. Saying a number out loud is a different act from typing it: people admit the real balance, the loan they left out of the spreadsheet, the month they hid, because speech is confession and a form is data entry. Tone carries what the text never sends, so when someone flattens out on the sentence about their family, Ren has a signal a chat box does not get and can slow down, ask, or drop the agenda for the one that matters. And voice has a personality: pace, warmth, the pauses. You do not build accountability with a text field, you build it with somebody who is expecting you.",
      "Ren is an ElevenLabs conversational agent joined over WebRTC from the app, with a signed session minted server side so no key reaches the browser. The prompt is written from the coaching research, not from a persona sketch: permission before challenging, teaching or suggesting, reflection in the person's own words, one commitment at the end. Turn taking took as much work as the words, because the default failure of a voice agent is interrupting somebody who is thinking; the silence timeout is long, and Ren never asks whether you are still there. Seven server tools point at this app's own API routes, so mid call Ren can read live balances, run the payoff plan, log a commitment, capture a belief and file an offer.",
      "I designed around the honest limits rather than through them. The research verdict on voice as a modality is unsupported, and no persona wanted a forty minute scheduled call, so the person picks the length and the agenda before the call, nothing is scheduled, quiet mode lets someone whisper on a Metro platform and read the reply on screen, and every number Ren says is also on screen behind it. If a real cohort tells me voice is dead weight, the journey survives without it.",
    ],
    shots: [
      {
        src: "/case/app-ren.png",
        alt: "The Ren tab: a call orb, twenty minutes, intent pills reading clarity, a decision, a plan, space to think, and a quiet mode option.",
        label:
          "The person sets the contract before the call: how long, and what would make it worth it. Quiet mode sits next to it.",
      },
    ],
  },
  {
    id: "brief",
    title: "How I actually worked: research, brief, PRD, flows, then build",
    lead:
      "The order was deliberate and it is the part I would defend in a review. Research fed a positioning brief, the brief fed a PRD of forty two numbered features, the PRD fed the user flows, and only then did anything get built.",
    body: [
      "The brief came first because it decides what the product is allowed to be, down to the language that is banned rather than discouraged. Success criteria in the PRD are written behaviourally so they can be failed: read ten of Ren's lines aloud and none should sound like an assistant.",
    ],
    pull: "Do not compete on conversation. Compete on continuity.",
    aside: {
      title: "Corrections carried into the build",
      lines: [
        "Compound interest ban treated as upcoming, already live under UAE law",
        "Cheque law dated to January 2022, in force January 2023, different instrument",
        "Card rate cited at 44.28%, currently 42%",
        "Travel ban reassurance, withdrawn, Ren makes no claim here",
        "“Withhold validation to avoid premature interpretation”, wrong, affirmation is core to the method",
      ],
    },
  },
  {
    id: "build",
    title: "The build, and the plumbing that makes it a product",
    lead:
      "Next.js and TypeScript, Convex for live persistence, ElevenLabs over WebRTC for the call, seven server tools wired to this app's own API routes.",
    body: [
      "That plumbing is the difference between a voice demo and a product. When Ren says the rent on your debt is one thousand three hundred and twenty eight dirhams this month, the number came out of the same database the screen is reading, and the payoff engine behind it runs month by month amortisation over every card at its own rate.",
      "The demo I judge it on is the balance transfer. Mid call I asked Ren what to do about the Emirates NBD card. It read the live balance and the 3.69% monthly rate out of Convex through its debt snapshot tool, worked the transfer against the fee and the promotional window, said the annual figure out loud rather than the monthly one, and proposed it. The offer appeared as a card in the call and filed itself on the Growth screen, unapplied, because Ren cannot move money and will not record transferred principal as progress. The person confirms it after their bank has actually done it. A coach that acts on a mishearing is worse than no coach.",
      "That offer is now checked live. Context.dev is wired server side: Ren's tool searches the web for the bank's own pages, reads the published terms off the official page with fact checking on, and returns the promotional rate, the window, the revert rate and the fees with the source URL and the retrieval time attached. The key sits on our server, never in ElevenLabs and never in the browser. When retrieval fails, Ren says so in the call rather than reading the dated table out as this morning's rate.",
    ],
    shots: [
      {
        src: "/case/app-dashboard.png",
        alt: "Home: the plant in its jar, a debt-free date of June 2027, left to pay, paid off, and the monthly interest labelled rent on the debt.",
        label:
          "Home. The plant, the date, and the interest named as rent, the number nobody quotes you when you take the card.",
      },
      {
        src: "/case/app-growth.png",
        alt: "Growth: a clearing and building toggle, three cards with balances, monthly and annual rates, interest this month, and amounts paid off.",
        label:
          "Growth. Every card at its own rate, what it costs this month, and what has already gone. One card marked Start here.",
      },
      {
        src: "/case/app-you.png",
        alt: "You: Layla, eleven weeks in, paid off and talks, what the money is for, something that already worked, and beliefs said out loud.",
        label:
          "You. Their reason, their own past success, and the beliefs they have said out loud, in their words, dated, still editable.",
      },
    ],
  },
];

/** Rendered as a table inside the alternatives chapter. */
export const ALTERNATIVES: {
  name: string;
  price: string;
  serves: string;
  leaves: string;
}[] = [
  {
    name: "YNAB",
    price: "USD 109 / year",
    serves: "A whole budgeting method, and it genuinely changes spending",
    leaves: "Debt is a category inside a budget, not a route out of one",
  },
  {
    name: "Cleo, Debt Reset",
    price: "USD 5.99 / month",
    serves: "Conversational AI, spending data, a paydown plan",
    leaves: "No memory of your plan across months, no adaptation when the month breaks",
  },
  {
    name: "Debt Payoff Planner",
    price: "About USD 2 / month",
    serves: "Snowball, avalanche, a payoff schedule and a date",
    leaves: "Draws the date, then leaves you alone with it",
  },
  {
    name: "Undebt.it",
    price: "Free, or USD 12 / year",
    serves: "A capable manual payoff planner with several methods",
    leaves: "You maintain it, and nothing happens when you stop",
  },
  {
    name: "A spreadsheet",
    price: "Free",
    serves: "Anything you can model, exactly how you want it",
    leaves: "Stops being true the first month you go off plan",
  },
  {
    name: "A human coach",
    price: "About USD 3,000 for six sessions, in one researched case",
    serves: "Context, accountability, and real behaviour change",
    leaves: "Priced out of reach of the person who needs it, and it does not scale",
  },
];

/** The panel, as a table rather than five paragraphs of prose. */
export const PERSONAS: {
  who: string;
  situation: string;
  behaviour: string;
  doubt: string;
}[] = [
  {
    who: "Aisha, 25",
    situation: "Two years into her first serious salary, first cards and BNPL",
    behaviour: "Pays what is due, occasionally panics and pays extra",
    doubt: "Low. Wants the debt free date, does not want to be talked to like a child",
  },
  {
    who: "Zayd, 28",
    situation: "Tech professional, two to three cards and a personal loan",
    behaviour: "Built the tracker twice, abandoned it after a disrupted month",
    doubt: "Medium. Why is this not just ChatGPT plus Excel",
  },
  {
    who: "Leena, 30",
    situation: "Expat, sends money home, debt accumulated gradually",
    behaviour: "Follows finance creators, drowning in conflicting advice",
    doubt: "Medium. Will it tell her not to fly home",
  },
  {
    who: "Omar, 37",
    situation: "Family, good salary, cards plus a car loan",
    behaviour: "Has cleared the cards before and rebuilt the balance",
    doubt: "Medium to high. Do not teach him what a credit card is",
  },
  {
    who: "Maya, 34",
    situation: "Organised, automated, has a working system already",
    behaviour: "Tracks it, automates it, runs her own scenarios",
    doubt: "High. She is the one who told me not to build it",
  },
];

/** The loop the panel argued the product was missing a step of. */
export const LOOP: { step: string; note: string }[] = [
  { step: "Understand", note: "Every balance, rate and minimum in one place" },
  { step: "Plan", note: "A payoff order and a date derived from real numbers" },
  { step: "Act", note: "One commitment for the month, chosen by the person" },
  { step: "Adapt", note: "The month broke, so the plan changes, not the person" },
  { step: "Continue", note: "Next session opens on the last commitment, kept or not" },
  { step: "Debt free", note: "The date arrives, and the habit outlasts it" },
];

/** The order of operations Ren works through, before any payoff method matters. */
export const LADDER: string[] = [
  "Stop creating new principal",
  "Separate a survival problem from a spending problem",
  "Protect a small anti relapse reserve",
  "Reduce the price of the debt",
  "Choose a payoff order the person will actually execute",
  "Free up cash flow",
  "Defend against relapse",
  "Rebuild reserves, then rebuild wealth",
];

/** A balance transfer only works when all four hold. Any one missing and it is a rearrangement. */
export const TRANSFER_CONDITIONS: { test: string; detail: string }[] = [
  { test: "A real rate cut, net of fees", detail: "Including the 1.05% early settlement fee on a transferred balance, which the bank must disclose with a worked example" },
  { test: "A schedule that clears before the promo ends", detail: "Otherwise the revert rate lands on whatever is left" },
  { test: "No new spending on either card", detail: "New principal on the emptied card undoes the whole move" },
  { test: "Controlled access to the emptied card", detail: "Limit cut, card frozen, or closed" },
];

/** Two local layers that sit above the maths. */
export const LOCAL_LAYERS: { title: string; body: string }[] = [
  {
    title: "The rights layer",
    body: "The counselling obligation here sits on the creditor, not a free charity. A genuinely useful right, attached to a genuine conflict of interest. Use it, knowing who the counsellor works for.",
  },
  {
    title: "The riba layer",
    body: "User triggered by design, never a setting and never a default. The moment someone says avoiding interest matters to them, the plan moves fully into that frame. Ren describes what a contract does, and sends rulings to a scholar.",
  },
];

/**
 * The whole build as one AI-assisted pipeline, in the order it actually ran. Each step names the
 * tool or artefact so the workflow is legible without reading the chapters.
 */
export const AI_WORKFLOW: { step: string; tool: string }[] = [
  { step: "Deep research", tool: "Skeptical advisor prompt, sources bucketed" },
  { step: "Debt strategies", tool: "Gulf rate mechanics, the escape ladder" },
  { step: "Synthetic interviews", tool: "Five personas, promoters and detractors" },
  { step: "Voice agent trained", tool: "ElevenLabs, prompt from the coaching research" },
  { step: "Live retrieval wired", tool: "Context.dev, current bank offers with a source" },
  { step: "PRD written", tool: "42 features, unhappy paths weighted the same" },
  { step: "Brand built", tool: "Logo, palette, the plant animation" },
  { step: "Flows mapped", tool: "Onboarding, session, post call, relapse" },
  { step: "Built with Devin", tool: "Next.js, TypeScript, the payoff engine" },
  { step: "Versioned", tool: "GitHub, a PR per change" },
  { step: "Live data", tool: "Convex, real balances mid call" },
  { step: "Shipped", tool: "Vercel, a preview URL per branch" },
  { step: "Walkthrough recorded", tool: "Loom, the full journey end to end" },
  { step: "UX stress tested", tool: "Gemini 3 Pro audit of the recording" },
  { step: "UX fixed", tool: "Commitment loop, momentum, screen overlap" },
  { step: "Audited again", tool: "Second pass on the rebuilt flows" },
  { step: "Next", tool: "In progress, revealed soon" },
];

/** Research to build, in order, with the artefact each step produced. */
export const PIPELINE: { step: string; made: string }[] = [
  { step: "Research", made: "Skeptical advisor prompt, sources kept in separate buckets" },
  { step: "Brief", made: "Who it is for, the method, the legal posture, the banned language" },
  { step: "PRD", made: "42 numbered features, unhappy paths weighted the same" },
  { step: "Flows", made: "Onboarding, session, post call, relapse" },
  { step: "Build", made: "Live balances, seven server tools, a working call" },
];

export const PRD_STATS: { figure: string; label: string }[] = [
  { figure: "42", label: "Numbered features, unhappy paths weighted like the happy ones" },
  { figure: "4", label: "User flows mapped before a screen was drawn" },
  { figure: "0", label: "Streaks, badges, points, feeds, text chatbot" },
];

/** Banned outright in the brief, not discouraged. */
export const BANNED_PHRASES: string[] = [
  "guaranteed outcomes",
  "guaranteed feelings",
  "scientifically proven",
  "crush your debt",
  "debt free in 6 months",
  "you failed",
];

export const FLOWS: { name: string; rule: string }[] = [
  { name: "Onboarding", rule: "Opens on what the money is for. The first exchange may not ask for a number." },
  { name: "The session", rule: "A contract before a conversation: length, intent, and an agenda proposed from what changed." },
  { name: "Post call", rule: "The commitment is written in the person's own words and filed, or the app says nothing landed." },
  { name: "The month that broke", rule: "No red, no restart. A re plan, and the next session opens on the last commitment." },
];

export const DESIGN_TOKENS: { hex: string; name: string; use: string }[] = [
  { hex: "#F2EDE4", name: "Cream", use: "Canvas" },
  { hex: "#FDFCF8", name: "Card", use: "Surfaces" },
  { hex: "#141D19", name: "Ink 900", use: "Text, call view" },
  { hex: "#2F6243", name: "Stem 700", use: "Principal cleared" },
  { hex: "#5FA877", name: "Stem", use: "Growth, the plant" },
  { hex: "#92D3A3", name: "Leaf 300", use: "Leaves, mood" },
  { hex: "#B98F63", name: "Soil", use: "The jar" },
  { hex: "#7A6248", name: "Root", use: "The cost of debt" },
  { hex: "#E8A94B", name: "Amber", use: "Breakthroughs only" },
  { hex: "#B4453A", name: "Danger", use: "Destructive actions, never money" },
];

export const DESIGN_RULES: string[] = [
  "Red never describes the user's money. Interest is root brown, cleared principal is stem green.",
  "Amber is for breakthroughs, not for warnings and not for decoration.",
  "The orb is the only gradient in the product.",
  "Every money figure uses tabular numerals so columns do not dance as they update.",
  "Space Grotesk is the wordmark only. Everything a person reads is Nunito.",
  "The plant never wilts, never shrinks and never loses a leaf.",
  "The stem grows on principal cleared. Roots grow on work: weeks, sessions, kept commitments.",
  "The jar never changes, because the container is not the achievement.",
  "Every estimate carries an Estimated chip, everywhere it appears.",
  "Every session states its length, its agenda and why it is worth having.",
];

export const NUMBER_RULES: { wrong: string; right: string; why: string }[] = [
  {
    wrong: "3.69% monthly",
    right: "3.69% / month · 44.28% / year",
    why: "The monthly quote is the single biggest comprehension failure in this market.",
  },
  {
    wrong: "-14900",
    right: "AED 14,900.00",
    why: "No negative money, no minus signs on a person's own balance, always tabular.",
  },
  {
    wrong: "Interest charged",
    right: "Rent on the debt",
    why: "Interest is an abstraction. Rent is a thing people already understand paying for nothing.",
  },
  {
    wrong: "Debt free in 21 months",
    right: "June 2027 · Estimated",
    why: "A month someone can picture, marked as a projection rather than a promise.",
  },
];

export const BANNED_COPY: string[] = [
  "Crush your debt",
  "Take control",
  "Keep your streak alive",
  "Never feel stressed about money again",
  "Scientifically proven",
  "Submit",
];

/** GitHub as process evidence. No repository link: the screenshots are the point. */
export const GITHUB_SHOTS: Shot[] = [
  {
    src: "/case/gh-pulls.png",
    alt: "The repository's pull request list, showing successive merged pull requests for the app, the brand system, the audit fixes and the case study.",
    label:
      "Every change arrived as a pull request, so the history reads as a record of decisions rather than a pile of commits.",
  },
  {
    src: "/case/gh-pr-body.png",
    alt: "A pull request description setting out what changed and the reasoning behind each decision, including the balance transfer logic and what was left untested.",
    label:
      "The reasoning is written down, including the rule that Ren proposes a balance transfer rather than editing the ledger, and an explicit list of what was not tested in a real call.",
  },
  {
    src: "/case/gh-commits.png",
    alt: "A list of commit messages describing product decisions, such as giving Ren its own call room and stopping the chart claiming credit for the payoff.",
    label:
      "Commit messages are written as decisions rather than tasks, so the history says why the product changed. Roughly forty of them across four days.",
  },
];

export const HYPOTHESES: { id: string; claim: string; test: string }[] = [
  {
    id: "H1",
    claim:
      "People carrying manageable debt do not know their realistic debt free date, and would value seeing decisions move it.",
    test: "Ask what month they will be completely debt free. Before showing them anything.",
  },
  {
    id: "H2",
    claim: "Plans get abandoned because life made the plan inaccurate, not because motivation ran out.",
    test: "Ask about the last repayment plan they stopped following, and what happened that month.",
  },
  {
    id: "H3",
    claim: "A real segment already knows what to do and cannot execute consistently.",
    test: "Ask what stops them doing the thing they already know they should do.",
  },
  {
    id: "H4",
    claim: "Positive psychology is valuable as method and weak as positioning.",
    test: "Two descriptions, one naming the psychology and one naming the benefit. Measure which one gets a reply.",
  },
  {
    id: "H5",
    claim: "Voice is situational, wanted at decisions and setbacks rather than on a schedule.",
    test: "Ask when they would talk rather than type, not whether they would like voice coaching.",
  },
];

export const NEXT: { title: string; body: string }[] = [
  {
    title: "An Impeccable design pass",
    body: "The product works and it is not finished. Next is a full craft pass over every surface: type scale and rhythm, the plant at every state, empty and error states, motion timing, the call view on a small phone, and the details that building fast swallowed.",
  },
  {
    title: "Auditing the UX again, then with people",
    body: "The last audit scored the brand at 92 and the action loop at 44. The loop has been rebuilt, so it gets re audited, and then the same journey goes in front of real people in Dubai carrying real balances.",
  },
  {
    title: "The twelve questions",
    body: "A real customer interview guide that never pitches Ren until the end, built to kill H1 to H5 rather than collect encouragement. That is the next piece of work that could change the product, and none of it exists yet.",
  },
];

export const DECISIONS: {
  question: string;
  chose: string;
  instead: string;
  why: string;
}[] = [
  {
    question: "A call ends and nobody committed to anything.",
    chose:
      "Three different endings: a logged commitment, a summary of what the person said with an editable commitment offered, or an honest “nothing landed today, here is what to pick up next time”.",
    instead: "Infer a commitment from the transcript so the screen looks productive.",
    why:
      "A commitment the person never made is a lie the product then holds them to. The third ending had to exist for the other two to mean anything.",
  },
  {
    question: "Home and Ren had become the same screen.",
    chose:
      "Home is the overview with a doorway; Ren is a coaching room with its own archive and intent pills that set the contract before the call.",
    instead: "Keep the big call button on both and call it consistency.",
    why: "Two tabs that do the same thing teach people that one of them is decoration.",
  },
  {
    question: "What does the chart claim?",
    chose: "“Cleared while coaching with Ren, across six conversations.”",
    instead: "“Your progress.”",
    why:
      "The line falls because someone paid it down, not because they installed an app. The wording had to stop short of claiming the app caused it.",
  },
  {
    question: "Growth still said “start here” on a card the person had already settled.",
    chose: "Zero-balance cards are excluded from payoff ordering and move to a cleared list.",
    instead: "Leave it; it is technically the smallest balance.",
    why:
      "Found by a browser agent walking the flow after the build. It was pointing someone at a finished job while the real one waited.",
  },
  {
    question: "The You tab counted how often someone followed through.",
    chose: "Deleted the stat.",
    instead: "Keep it and colour it green when it is high.",
    why:
      "A follow-through percentage is a shame instrument with a progress bar on it. The session list already shows what happened, per session, without a score.",
  },
  {
    question: "How does the plant grow?",
    chose:
      "Cleared principal grows the stem. Each conversation adds one root. Nothing ever shrinks.",
    instead: "Grow it on activity, or wilt it when someone goes quiet.",
    why:
      "A slow month still has to show something true, and a plant that dies while you are unemployed is the product taking a side against you.",
  },
  {
    question: "Ren finds a balance transfer worth taking.",
    chose:
      "Ren proposes, the offer appears as a card in the call and files itself on Growth, and the person applies it only after their bank has executed it.",
    instead: "Let the tool move the balance when the person says yes on the call.",
    why:
      "Voice mishears. Money must not move on a mishearing, and transferred principal is not progress: the engine records it at zero cleared.",
  },
  {
    question: "Someone says avoiding interest matters to them religiously.",
    chose: "The whole plan moves into that frame from that moment, and never before it.",
    instead: "A setting, or a market segment, or a default for the region.",
    why:
      "The coaching evidence is explicit that values work only when the values are the person's own. Ren describes what a contract does and sends rulings to a scholar.",
  },
  {
    question: "What happens when the debt reaches zero?",
    chose: "Ren changes horizon: jars, months of cover, the asks now that money is visible.",
    instead: "Congratulate and go quiet.",
    why:
      "The research is explicit that people slip back. The strongest retention argument and the strongest user argument happen to be the same one, and Ren still recommends no investment product, fund or allocation.",
  },
  {
    question: "Someone is in public and cannot talk.",
    chose: "Quiet mode: whisper in, Ren replies in text on screen.",
    instead: "Tell them to come back later, or ship a chatbot.",
    why: "Voice being situational was a research finding. This is the accommodation, not a second product.",
  },
  {
    question: "How much of the session does the person see afterwards?",
    chose:
      "Session cards expand to show what they came for, how long it ran, their own closing words and their own commitment.",
    instead: "Show Ren's summary of the session.",
    why:
      "Reading back a machine's interpretation of your own hard conversation is a small violence. Their words, or nothing.",
  },
  {
    question: "Red for debt?",
    chose: "Root brown for the cost of debt. Red never represents the person's money.",
    instead: "The convention every finance app uses.",
    why: "Red is an alarm. Nothing in a person's own balance is an emergency they need to be alarmed about at 11pm.",
  },
  {
    question: "Which numbers are allowed to be estimates?",
    chose: "Any estimated figure carries an “Estimated” chip, everywhere it appears.",
    instead: "Round it and move on.",
    why:
      "The product's whole claim is that it works from real numbers. One unmarked guess costs more credibility than ten marked ones.",
  },
];

export const AUDIT = {
  verdict: "A brilliant debt-recovery narrative held back by a broken commitment loop.",
  score: "65.2 / 100 composite, across five UI and UX dimensions",
  scoreLine:
    "Brand system scored 92 and was called world-class adherence to the guidelines. Action state and feedback scored 44 and was marked critical. That gap is the whole finding: the product looked like itself and did not close its own loop.",
  images: [
    {
      src: "/case/audit-verdict-cards.png",
      alt: "Three audit cards. The genius: culturally grounded framing. The breaking point: the post-session drop-off. The number one fix: a unified commitment loop.",
      label:
        "The audit's own summary. What worked, what broke, and the single fix it argued for.",
    },
    {
      src: "/case/audit-scorecard.png",
      alt: "Scorecard: information architecture 54, financial data density 62, brand system 92 strong, action state management 44 critical, mobile ergonomics 66.",
      label:
        "Five dimensions scored. The brand scored highest, the behaviour loop lowest, which is the uncomfortable version of the result.",
    },
    {
      src: "/case/audit-inspector-handshake.png",
      alt: "The audit's prescribed post-call debrief sheet next to its notes: the handshake is missing from the application entirely.",
      label:
        "The missing screen, drawn. A thirty second debrief that turns what was agreed out loud into the commitment on Home.",
    },
    {
      src: "/case/audit-inspector-growth.png",
      alt: "The audit's redesign of the debt clearing screen with avalanche target badges and explicit actions, beside the friction it found in the shipped version.",
      label:
        "Growth, rebuilt by the auditor: bold balance, the monthly cost as a badge, and 'Take it off' replaced by actions that say what they do.",
    },
  ],
  findings: [
    {
      found:
        "When a call ends, nothing is captured. Home goes back to “Nothing here yet” for someone eleven weeks and six sessions in.",
      verdict:
        "Named the breaking point of the product: the agreement reached out loud never becomes state, so the burden falls back on the person's memory.",
      did: "Built the ending. A call now finishes with the commitment written, or the person's own words with an editable commitment offered, or an honest nothing landed today. Home holds it until it is done or adapted.",
    },
    {
      found: "Home and Ren were the same screen: two tabs, one dark card, one Call Ren button.",
      verdict:
        "Information architecture scored 54. Two tabs doing one job collapses the map of the app.",
      did: "Home became the overview with a doorway. Ren became the coaching room and the archive, with intent pills that set the contract before the call starts.",
    },
    {
      found: "'Take it off' on a debt card. Does it mean paid, deleted, or excluded from the plan?",
      verdict: "Flagged as dangerous ambiguity on the one screen where a wrong tap loses history.",
      did: "Explicit actions, and settled cards leave the payoff order for a cleared list instead of being deleted.",
    },
    {
      found:
        "The You tab counted follow-through as four out of six, and the timeline headline read “what your talks have moved”.",
      verdict:
        "Called both out: the count reads as punitive to a user whose main risk is shame, and the headline claims the coach caused what the person's own money did.",
      did: "The count is gone. The line now says cleared while coaching with Ren, across six conversations, which is the most it can honestly say.",
    },
    {
      found: "Manual +100, +250 and +500 buttons on the savings side.",
      verdict:
        "Called an arcade ledger that contradicts the product's own promise to end spreadsheet maintenance.",
      did: "Kept, and I disagree with the fix. Milestone tiers without bank connections would be a nicer looking way to be wrong about someone's balance. The tap is honest until there is real account data behind it.",
    },
  ],
};

export const STACK: { name: string; logo: string; role: string }[] = [
  {
    name: "Devin",
    logo: "/case/logos/devin.png",
    role: "The engineer. Payoff engine, schema, four surfaces, voice plumbing, and the browser agent that walked the journey afterwards finding what I had missed.",
  },
  {
    name: "Claude",
    logo: "/case/logos/claude.svg",
    role: "Thinking partner for the research, the brief and the PRD, including the verdicts that came back against my own idea.",
  },
  {
    name: "Convex",
    logo: "/case/logos/convex.png",
    role: "Live database under every screen and every tool, so the voice can never quote a balance the screen disagrees with.",
  },
  {
    name: "ElevenLabs",
    logo: "/case/logos/elevenlabs.svg",
    role: "The call, over WebRTC. Ren's prompt, turn taking and seven server tools that hit this app's own API routes.",
  },
  {
    name: "Context.dev",
    logo: "/case/logos/context.png",
    role: "Live retrieval behind Ren's balance transfer tool. Searches the bank's own pages and reads the published terms, with a source URL and a retrieval time on every figure.",
  },
  {
    name: "GitHub",
    logo: "/case/logos/github.svg",
    role: "Pull requests with the reasoning written down, so the build history is a record of decisions.",
  },
  {
    name: "Vercel",
    logo: "/case/logos/vercel.svg",
    role: "Hosting, with a preview URL per branch so the work could be opened on a real phone.",
  },
];

export const TESTING = [
  {
    found: "Growth pointed at a card that was already settled",
    then: "Zero-balance cards are excluded from payoff ordering and listed as cleared.",
  },
  {
    found: "The first call could sit on “Connecting…” after the audio had already started",
    then: "Live state is derived from the SDK's own connection and transcript evidence rather than a hopeful flag.",
  },
  {
    found: "Transcript turns concatenated and repeated themselves as Ren spoke",
    then: "Progressive updates replace the turn in place instead of appending another copy of it.",
  },
  {
    found: "Quiet mode's audio muting could not be measured on a virtual machine",
    then: "Still unverified. It needs a person with headphones, and I am not claiming it works.",
  },
];

export const NOT_PROVEN = [
  "No real users. Nobody outside this project has used it, and the balances on screen belong to a seeded demo profile.",
  "The five personas are synthetic. They generate hypotheses; they cannot validate anything, and any price they name is fiction.",
  "Willingness to pay is untested, in a market where the good alternatives run from free to about fifteen dollars a month.",
  "Market size is unverified. Public UAE data does not expose revolving card distress by age, income or card count.",
  "Coaching efficacy for debt payoff specifically is not established: one randomised evaluation supports financial coaching, a 2026 systematic review calls the evidence base too weak to conclude.",
  "Quiet mode's audio muting could not be measured on the machine I tested on. It needs a human ear before I would claim it works.",
  "Live retrieval reads what a bank publishes on its own page, which is not the same as the rate that bank would approve for one person. The offer is a proposal until their bank confirms it.",
];
