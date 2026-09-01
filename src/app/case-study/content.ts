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

export const CHAPTERS: Chapter[] = [
  {
    id: "assumption",
    title: "I started with the wrong story",
    lead:
      "My first version of this product was built on shame. People do not deal with their cards, I thought, because they cannot bear to look at them.",
    body: [
      "So I ran the idea past a deliberately skeptical advisor prompt before designing anything: who exactly, what specifically breaks in their week, what they already do instead, and why anything I build would beat that. Every claim I could not source got tagged as an assumption and carried forward untouched.",
      "Then I sent those assumptions out to be researched properly rather than confirmed. The report came back and took the shame theory apart in a paragraph.",
    ],
    quotes: [
      {
        text:
          "Shame appears, but so do job loss, illness, family expenses, accumulating EMIs, cash-flow mismatch, poor habits and misunderstandings.",
        who: "Customer & Market Research Report, verdict on my own assumption",
      },
    ],
    aside: {
      title: "What the research did to each assumption",
      lines: [
        "People are struggling with cards and loans: supported, strongly, at problem level",
        "Shame is the main reason people stay stuck: contradicted as a primary explanation",
        "People mainly need education: too narrow",
        "A calculator or planner is enough: contradicted; they already have those",
        "There is a UAE card-debt crisis: not yet proven from public data",
      ],
    },
  },
  {
    id: "voice",
    title: "What people actually said",
    lead:
      "Twenty-five first-person quotes, mostly UAE threads from the last eighteen months, and the pattern underneath them was not embarrassment. It was arithmetic that does not work, plans that die on contact with a bad month, and progress nobody can feel.",
    body: [
      "The line I kept coming back to is the last one. Someone had already repaid eleven thousand and still could not experience it as success, because every interface they own shows them what is left. That is a design problem, not a finance problem, and it is the one I could actually solve.",
    ],
    quotes: [
      {
        text: "just got my salary today and in a blink of an eye its gone (debts and bills lmao)",
        who: "UAE thread, via the research report",
      },
      {
        text: "The accountability is 90% of the value for me.",
        who: "A user explaining what he paid a human coach for",
      },
      {
        text: "make a little graph in this spreadsheet showing your total debt every week and watch that line go down.",
        who: "Advice one person gave another",
      },
      {
        text: "I don’t know how to change this or be ‘happy’ with my progress.",
        who: "Someone eleven thousand dollars into paying it off",
      },
    ],
  },
  {
    id: "alternatives",
    title: "The competition is good, which was the problem",
    lead:
      "Cleo already talks to you about debt for six dollars a month. Debt Payoff Planner and Undebt.it already draw the payoff date. YNAB already changes how people spend. Spreadsheets are free and infinitely flexible.",
    body: [
      "Reading that landscape honestly killed the pitch I arrived with. “An AI financial coach that gives you a debt plan” is occupied territory, and matching it harder is not a strategy.",
      "What none of them do is hold the relationship over time: remember what you chose last month, notice when your plan and your behaviour disagree, and adapt after the month where everything went wrong. So the product became a journey with a coach inside it, and the dashboard became instrumentation for that relationship rather than the point of the product.",
    ],
  },
  {
    id: "synthetic",
    title: "Five people who do not exist",
    lead:
      "I ran a synthetic interview panel of five personas, at least one of them happy with what she already uses, and then wrote down, in the brief, that none of it counts as evidence.",
    body: [
      "Synthetic users can only reflect back the patterns already in the research they were built from. What they are genuinely good for is generating objections and testable claims, so that is all I took from them: five hypotheses, each one written so a real interview could kill it.",
      "One of those hypotheses went on to change the product more than any research finding did.",
    ],
    aside: {
      title: "The hypotheses the panel produced",
      lines: [
        "People do not know their realistic debt-free date and would value seeing decisions move it",
        "Plans get abandoned when life makes the original plan inaccurate",
        "A real segment knows what to do and cannot execute",
        "Positive psychology is valuable as method; as front-door positioning it is contested",
        "Voice is situational rather than primary",
      ],
    },
  },
  {
    id: "against-myself",
    title: "The finding that argued against the thing I wanted to build",
    lead:
      "I wanted a voice coach. The research verdict on that was one word: unsupported. Every persona rejected long scheduled calls, and the evidence validated a journey, not a modality.",
    body: [
      "I kept voice anyway, and the case study is the right place to be honest about why. Saying a number out loud to something that answers is a different act from typing it into a form, and the specific problem I found (people who know what to do and cannot keep doing it) is the problem accountability solves. Nobody has ever been held accountable by a text field.",
      "But I designed around the finding rather than through it. Sessions are ten, twenty or forty minutes and the person picks; nothing is scheduled. Quiet mode lets someone whisper on a Metro platform and read Ren's answer on screen. Every number Ren says is also on the screen behind it. And the product does not ship a text chatbot, because a chatbot would quietly become the whole product and there are eight million users at Cleo already doing that.",
      "If a real cohort tells me voice is dead weight, the journey survives without it. That was the point of building it this way round.",
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
    title: "A brief before a PRD",
    lead:
      "Between the research and the build, I wrote a foundation brief: positioning, language rules, the coaching method, the market and legal posture, and a standing instruction not to under-read a source.",
    body: [
      "Two things in it do more work than anything else. The first is a list of language that is banned rather than discouraged: no guaranteed outcomes, no guaranteed feelings, no “scientifically proven”. UAE advertising rules and the coaching literature's own failure modes point the same direction, so the rule is absolute and the copy in the product obeys it.",
      "The second is an appendix of corrections: every claim I got wrong during research, and what replaced it. A law I dated to the wrong year. An interest rate that was already out of date. A reassurance about travel bans I had to withdraw entirely, because it turns on facts I cannot verify and being wrong in either direction hurts someone. Ren now makes no claim there at all.",
    ],
    aside: {
      title: "Corrections carried into the build",
      lines: [
        "Compound interest ban treated as upcoming, already live under UAE law",
        "Cheque law dated to January 2022, in force January 2023, different instrument",
        "Card rate cited at 44.28%, currently 42%",
        "Travel-ban reassurance, withdrawn; Ren makes no claim here",
        "“Withhold validation to avoid premature interpretation”, wrong; affirmation is core to the method",
      ],
    },
  },
  {
    id: "prd",
    title: "A PRD written for a builder, not a reader",
    lead:
      "Forty-two numbered features, the unhappy paths given equal weight to the happy one, and success criteria specific enough to fail against.",
    body: [
      "The criteria are the part I would defend in a review. They are behavioural, not aspirational: the first exchange of onboarding may not ask for a number. A missed commitment must produce no red, no shrinking plant, no guilt copy. Read ten of Ren's lines aloud and none of them should sound like an assistant.",
      "The out-of-scope list is as long as the feature list, and it holds the things that would be easiest to add and worst to have: streaks, badges, points, a community feed, a human escalation, dark mode, any market beyond the two I actually researched.",
    ],
  },
  {
    id: "build",
    title: "Built for a hackathon deadline, in hours",
    lead:
      "Next.js and TypeScript, Convex for live persistence, ElevenLabs over WebRTC for the call. Nine tools wired to real API routes, so Ren reads live balances mid-sentence instead of improvising them.",
    body: [
      "That plumbing is the difference between a voice demo and a product. When Ren says the rent on your debt is one thousand three hundred and twenty-eight dirhams this month, that number came out of the same database the screen is reading, and the payoff engine that produced it runs month-by-month amortisation over every card at its own rate.",
      "Ren can write a commitment, log a belief, propose a balance transfer. Ren cannot move money, change a balance, or delete a card. The proposal lands on screen and waits for the person to confirm it after their bank has actually done it, because a coach that acts on a mishearing is worse than no coach.",
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

export const STACK = [
  {
    name: "Devin",
    role: "Built it. Paired with it as the engineer on the whole thing: the payoff engine, the Convex schema, the four surfaces, the voice plumbing, and the browser agent that later walked the journey looking for what I had missed.",
  },
  {
    name: "Claude",
    role: "Thinking partner for the research and the writing. The market report, the synthetic panel, the foundation brief and the PRD were argued out here, including the parts that came back against my own idea.",
  },
  {
    name: "Convex",
    role: "The live database under every screen and every one of Ren's tools, so a commitment logged mid-call is on the dashboard before the call ends and the voice can never quote a balance the screen disagrees with.",
  },
  {
    name: "ElevenLabs",
    role: "The call itself, over WebRTC. Ren's prompt, turn-taking and seven server tools live here; the tools call this app's own API routes, so Ren reads real balances instead of improvising them.",
  },
  {
    name: "Context.dev",
    role: "Specified, not yet wired. It is how Ren is meant to pull live rates and offers with a source and a retrieval date attached. Today those come from a dated reference table, which keeps Ren from inventing a rate but does not keep it current.",
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
];
