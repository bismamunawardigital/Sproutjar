"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plant } from "@/components/Plant";
import { RenHello } from "@/components/RenHello";
import { StatementImport, type StatementReading } from "@/components/StatementImport";
import { COUNTRIES } from "@/lib/money";

type Question = {
  id: "why" | "pattern" | "carrying" | "help";
  title: string;
  note: string;
  options: { value: string; label: string; mirror: string }[];
};

/**
 * Four questions about your relationship with money, not a form. The numbers
 * come after, and only if you want to give them now.
 */
const QUESTIONS: Question[] = [
  {
    id: "why",
    title: "What made you open this?",
    note: "No wrong answer. Pick the closest one.",
    options: [
      {
        value: "balance-stuck",
        label: "I pay every month and the balance barely moves",
        mirror: "Most of that payment is interest. You can see exactly how much, on day one.",
      },
      {
        value: "want-savings",
        label: "I want something set aside, for once",
        mirror: "A small buffer is what stops the card getting used again. That's where we start.",
      },
      {
        value: "avoiding",
        label: "I've been avoiding the numbers",
        mirror: "Looking once, with someone, is easier than looking alone every night.",
      },
      {
        value: "want-plan",
        label: "I'm okay, I just want a plan I'd stick to",
        mirror: "Then the plan gets built with you, in your words, not handed to you.",
      },
    ],
  },
  {
    id: "pattern",
    title: "When money comes up, what usually happens?",
    note: "The honest one, not the good-sounding one.",
    options: [
      { value: "go-quiet", label: "I go quiet and deal with it later", mirror: "" },
      { value: "plan-drop", label: "I make a plan, then it fades in a week or two", mirror: "" },
      { value: "handle-repeat", label: "I handle it, then it comes back around", mirror: "" },
      { value: "behind", label: "I feel behind everyone around me", mirror: "" },
    ],
  },
  {
    id: "carrying",
    title: "What would you most want to stop carrying?",
    note: "",
    options: [
      { value: "interest", label: "What the interest costs me", mirror: "" },
      { value: "not-knowing", label: "Not knowing where I actually stand", mirror: "" },
      { value: "alone", label: "Doing it on my own", mirror: "" },
      { value: "after-spending", label: "How I feel after I spend", mirror: "" },
    ],
  },
  {
    id: "help",
    title: "What would help most right now?",
    note: "",
    options: [
      { value: "think-aloud", label: "Someone to think out loud with", mirror: "" },
      { value: "real-number", label: "A number I can trust", mirror: "" },
      { value: "one-step", label: "One small thing a week", mirror: "" },
      { value: "space", label: "Space, mostly. No pushing.", mirror: "" },
    ],
  },
];

const BELIEF_FROM: Record<string, string> = {
  "go-quiet": "When money comes up, I go quiet and deal with it later.",
  "plan-drop": "I make a plan and it fades after a week or two.",
  "handle-repeat": "I handle it, and then it comes back around.",
  behind: "I'm behind everyone around me.",
};

const STEPS = ["you", "q1", "q2", "q3", "q4", "card", "hello", "seed"] as const;
type Step = (typeof STEPS)[number];

type Card = { name: string; balance: string; ratePct: string; minimum: string; dueDay: string };
const EMPTY_CARD: Card = { name: "", balance: "", ratePct: "", minimum: "", dueDay: "" };

const SEED = { stemPct: 0.02, leafPairs: 0, rootDepth: 0.05, sparks: false, cleared: false };

export function Onboarding({ initialName, initialCountry }: { initialName: string; initialCountry: string }) {
  const router = useRouter();
  const [stepIndex, setStepIndex] = useState(0);
  const [name, setName] = useState(initialName);
  const [country, setCountry] = useState(initialCountry in COUNTRIES ? initialCountry : "AE");
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [cardMode, setCardMode] = useState<"pick" | "type" | "statement">("pick");
  const [card, setCard] = useState<Card>(EMPTY_CARD);
  const [cardSaved, setCardSaved] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const step: Step = STEPS[stepIndex];
  const currency = COUNTRIES[country as keyof typeof COUNTRIES]?.currency ?? "AED";
  const firstName = name.trim().split(" ")[0] || "there";

  function next() {
    setStepIndex((index) => Math.min(index + 1, STEPS.length - 1));
  }
  function back() {
    setStepIndex((index) => Math.max(index - 1, 0));
  }

  async function post(url: string, body: unknown, method = "POST") {
    const response = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    if (!response.ok) {
      const data = (await response.json().catch(() => ({}))) as { error?: string };
      throw new Error(data.error ?? "Something went wrong. Try again.");
    }
    return response.json();
  }

  async function saveProfile() {
    if (!name.trim()) return;
    setBusy(true);
    setError(null);
    try {
      await post("/api/profile", { name: name.trim(), country }, "PATCH");
      next();
    } catch (caught) {
      setError((caught as Error).message);
    } finally {
      setBusy(false);
    }
  }

  function pick(questionId: string, value: string) {
    setAnswers({ ...answers, [questionId]: value });
    next();
  }

  async function saveAnswersAndContinue() {
    setBusy(true);
    setError(null);
    try {
      await post("/api/onboarding", { name: name.trim() || undefined, country, answers });
      const belief = BELIEF_FROM[answers.pattern ?? ""];
      if (belief) await post("/api/beliefs", { text: belief });
      next();
    } catch (caught) {
      setError((caught as Error).message);
    } finally {
      setBusy(false);
    }
  }

  async function saveCard(input: {
    name: string;
    issuer: string;
    balance: number;
    monthlyRate: number | null;
    minimumPayment: number | null;
    dueDay: number | null;
    statementDay?: number | null;
  }) {
    setBusy(true);
    setError(null);
    try {
      const estimated: string[] = [];
      const monthlyRate = input.monthlyRate ?? 0.0299;
      if (input.monthlyRate === null) estimated.push("rate");
      const minimumPayment = input.minimumPayment ?? Math.max(100, Math.round(input.balance * 0.05));
      if (input.minimumPayment === null) estimated.push("minimum");
      await post("/api/debts", {
        name: input.name,
        issuer: input.issuer,
        balance: input.balance,
        monthlyRate,
        minimumPayment,
        dueDay: input.dueDay ?? undefined,
        statementDay: input.statementDay ?? undefined,
        estimatedFields: estimated.join(",") || undefined,
      });
      setCardSaved(input.name);
      await saveAnswersAndContinue();
    } catch (caught) {
      setError((caught as Error).message);
    } finally {
      setBusy(false);
    }
  }

  function saveTypedCard() {
    const balance = Number(card.balance.replace(/[^0-9.]/g, ""));
    if (!card.name.trim() || !(balance > 0)) {
      setError("A name and a balance are enough to start.");
      return;
    }
    const ratePct = Number(card.ratePct);
    const minimum = Number(card.minimum.replace(/[^0-9.]/g, ""));
    const dueDay = Number(card.dueDay);
    void saveCard({
      name: card.name.trim(),
      issuer: card.name.trim().split(" ")[0],
      balance,
      monthlyRate: ratePct > 0 ? ratePct / 100 : null,
      minimumPayment: minimum > 0 ? minimum : null,
      dueDay: dueDay >= 1 && dueDay <= 31 ? dueDay : null,
    });
  }

  function saveStatement(reading: StatementReading) {
    if (reading.balance === null) {
      setError("That statement had no balance on it. Type the card in instead.");
      setCardMode("type");
      return;
    }
    const issuer = reading.issuer ?? "Card";
    void saveCard({
      name: reading.name ?? issuer,
      issuer,
      balance: reading.balance,
      monthlyRate: reading.monthlyRatePct !== null ? reading.monthlyRatePct / 100 : null,
      minimumPayment: reading.minimumPayment,
      dueDay: reading.dueDay,
      statementDay: reading.statementDay,
    });
  }

  const progress = (
    <div className="flex gap-1.5" aria-hidden>
      {STEPS.slice(0, -1).map((s, index) => (
        <span key={s} className={`h-1 flex-1 rounded-full ${index <= stepIndex ? "bg-stem" : "bg-rule"}`} />
      ))}
    </div>
  );

  const input = "mt-1 w-full rounded-sm border border-rule bg-card px-3 py-3 text-[16px] text-ink-900 outline-none placeholder:text-ink-300 focus:border-stem";
  const primary = "w-full rounded-full bg-ink-800 px-5 py-3.5 text-[16px] font-bold text-cream transition hover:bg-ink-700 disabled:opacity-60";
  const option = "w-full rounded-card border border-rule bg-cream px-4 py-3.5 text-left text-[15px] leading-snug text-ink-800 transition hover:border-stem hover:shadow-sh-2";

  if (step === "you") {
    return (
      <div className="space-y-4">
        {progress}
        <section className="rounded-card border border-rule bg-card p-6">
          <h1 className="text-[21px] font-bold leading-snug text-ink-900">First, what should Ren call you?</h1>
          <label className="mt-5 block text-[12px] font-bold text-ink-500">
            First name
            <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Layla" autoFocus className={input} />
          </label>
          <label className="mt-4 block text-[12px] font-bold text-ink-500">
            Where you live
            <select value={country} onChange={(e) => setCountry(e.target.value)} className={input}>
              {Object.entries(COUNTRIES).map(([code, profile]) => (
                <option key={code} value={code}>
                  {profile.name} ({profile.currency})
                </option>
              ))}
            </select>
          </label>
          <p className="mt-2 text-[12px] text-ink-300">Sets your currency and which bank rules Ren checks.</p>
          {error ? <p className="mt-3 text-[13px] text-root">{error}</p> : null}
          <button onClick={saveProfile} disabled={busy || !name.trim()} className={`${primary} mt-5`}>
            {busy ? "One moment" : "Next"}
          </button>
        </section>
      </div>
    );
  }

  if (step.startsWith("q")) {
    const question = QUESTIONS[Number(step.slice(1)) - 1];
    return (
      <div className="space-y-4">
        {progress}
        <section className="rounded-card border border-rule bg-card p-6">
          <h1 className="text-[21px] font-bold leading-snug text-ink-900">{question.title}</h1>
          {question.note ? <p className="mt-1.5 text-[13px] text-ink-400">{question.note}</p> : null}
          <div className="mt-5 space-y-2.5">
            {question.options.map((o) => (
              <button key={o.value} onClick={() => pick(question.id, o.value)} className={`${option} ${answers[question.id] === o.value ? "border-stem" : ""}`}>
                {o.label}
              </button>
            ))}
          </div>
        </section>
        <button onClick={back} className="text-[13px] font-bold text-ink-300 underline underline-offset-2">
          Back
        </button>
      </div>
    );
  }

  if (step === "card") {
    const why = QUESTIONS[0].options.find((o) => o.value === answers.why);
    return (
      <div className="space-y-4">
        {progress}
        {why?.mirror && cardMode === "pick" ? (
          <section className="rounded-card border border-rule bg-card p-5">
            <p className="label">Heard</p>
            <p className="mt-2 text-[15px] leading-relaxed text-ink-700">{why.mirror}</p>
          </section>
        ) : null}
        <section className="rounded-card border border-rule bg-card p-6">
          <h1 className="text-[21px] font-bold leading-snug text-ink-900">One card to start with?</h1>
          <p className="mt-1.5 text-[13px] text-ink-400">Just one. The rest can wait for Ren.</p>

          {cardMode === "pick" ? (
            <div className="mt-5 space-y-2.5">
              <button onClick={() => setCardMode("statement")} className={option}>
                <span className="font-bold text-ink-900">Upload or paste a statement</span>
                <span className="mt-0.5 block text-[13px] text-ink-400">The PDF your bank emails, or its text. Read on our side, nothing stored.</span>
              </button>
              <button onClick={() => setCardMode("type")} className={option}>
                <span className="font-bold text-ink-900">Type it in</span>
                <span className="mt-0.5 block text-[13px] text-ink-400">Name and balance is enough.</span>
              </button>
              <button onClick={saveAnswersAndContinue} disabled={busy} className={`${option} text-ink-500`}>
                {busy ? "One moment" : "Skip, I'll tell Ren"}
              </button>
            </div>
          ) : null}

          {cardMode === "type" ? (
            <div className="mt-5 space-y-3">
              <label className="block text-[12px] font-bold text-ink-500">
                Card
                <input value={card.name} onChange={(e) => setCard({ ...card, name: e.target.value })} placeholder="Emirates NBD Visa" autoFocus className={input} />
              </label>
              <label className="block text-[12px] font-bold text-ink-500">
                Balance owed ({currency})
                <input value={card.balance} onChange={(e) => setCard({ ...card, balance: e.target.value })} inputMode="decimal" placeholder="12400" className={input} />
              </label>
              <div className="grid grid-cols-3 gap-3">
                <label className="block text-[12px] font-bold text-ink-500">
                  Rate % a month
                  <input value={card.ratePct} onChange={(e) => setCard({ ...card, ratePct: e.target.value })} inputMode="decimal" placeholder="2.99" className={input} />
                </label>
                <label className="block text-[12px] font-bold text-ink-500">
                  Minimum
                  <input value={card.minimum} onChange={(e) => setCard({ ...card, minimum: e.target.value })} inputMode="decimal" placeholder="620" className={input} />
                </label>
                <label className="block text-[12px] font-bold text-ink-500">
                  Due day
                  <input value={card.dueDay} onChange={(e) => setCard({ ...card, dueDay: e.target.value })} inputMode="numeric" placeholder="10" className={input} />
                </label>
              </div>
              <p className="text-[12px] text-ink-300">Not sure of the rate or minimum? Leave them. Ren marks them as guesses.</p>
              {error ? <p className="text-[13px] text-root">{error}</p> : null}
              <button onClick={saveTypedCard} disabled={busy} className={primary}>
                {busy ? "Saving" : "Save this card"}
              </button>
              <button onClick={() => setCardMode("pick")} className="w-full text-[13px] font-bold text-ink-300 underline underline-offset-2">
                Back
              </button>
            </div>
          ) : null}

          {cardMode === "statement" ? (
            <>
              {error ? <p className="mt-3 text-[13px] text-root">{error}</p> : null}
              <StatementImport currency={currency} onRead={saveStatement} onClose={() => setCardMode("pick")} title="Your statement" />
            </>
          ) : null}
        </section>
        {cardMode === "pick" ? (
          <button onClick={back} className="text-[13px] font-bold text-ink-300 underline underline-offset-2">
            Back
          </button>
        ) : null}
      </div>
    );
  }

  if (step === "hello") {
    const labelOf = (id: Question["id"]) =>
      QUESTIONS.find((q) => q.id === id)?.options.find((o) => o.value === answers[id])?.label ?? "";
    return (
      <div className="space-y-4">
        {progress}
        <section className="rounded-card border border-rule bg-card p-6">
          <p className="label">Nearly there</p>
          <h1 className="mt-2 text-[21px] font-bold leading-snug text-ink-900">Meet Ren. Twenty seconds, out loud.</h1>
          <p className="mt-2 text-[14px] leading-relaxed text-ink-400">
            Ren already knows what you just said{cardSaved ? ` and that ${cardSaved} is on the table` : ""}. One hello, one question, then your plant.
          </p>
          <div className="mt-6">
            <RenHello
              onDone={next}
              answers={{
                first_name: firstName,
                why: labelOf("why"),
                pattern: labelOf("pattern"),
                carrying: labelOf("carrying"),
                help: labelOf("help"),
              }}
            />
          </div>
        </section>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <section className="rounded-card border border-rule bg-card p-6 text-center">
        <Plant state={SEED} className="mx-auto h-56 w-40" />
        <p className="label mt-4">Day one</p>
        <h1 className="mt-2 text-[21px] font-bold leading-snug text-ink-900">This is your plant, {firstName}.</h1>
        <p className="mt-2 text-[14px] leading-relaxed text-ink-400">
          It grows as the cards go down and the jar fills up. One picture for both. Nothing else to set up today.
        </p>
        <button onClick={() => router.push("/dashboard")} className={`${primary} mt-6`}>
          Go in
        </button>
      </section>
    </div>
  );
}
