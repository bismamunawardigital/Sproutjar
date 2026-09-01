"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type Question = {
  id: "why" | "pattern" | "carrying" | "help";
  title: string;
  note: string;
  options: { value: string; label: string; mirror: string }[];
};

/**
 * Onboarding is four questions about your relationship with money, not a form.
 * Nothing financial is asked here — that lives in the app, later, if you want it.
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
        label: "I'm okay — I just want a plan I'd stick to",
        mirror: "Then the plan gets built with you, in your words, not handed to you.",
      },
    ],
  },
  {
    id: "pattern",
    title: "When money comes up, what usually happens?",
    note: "The honest one, not the good-sounding one.",
    options: [
      {
        value: "go-quiet",
        label: "I go quiet and deal with it later",
        mirror: "",
      },
      {
        value: "plan-drop",
        label: "I make a plan, then it fades in a week or two",
        mirror: "",
      },
      {
        value: "handle-repeat",
        label: "I handle it, then it comes back around",
        mirror: "",
      },
      {
        value: "behind",
        label: "I feel behind everyone around me",
        mirror: "",
      },
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

export function Onboarding() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState(false);

  const question = QUESTIONS[step];
  const done = step >= QUESTIONS.length;

  function pick(value: string) {
    setAnswers({ ...answers, [question.id]: value });
    setStep(step + 1);
  }

  async function begin() {
    setBusy(true);
    const belief = BELIEF_FROM[answers.pattern ?? ""];
    if (belief) {
      await fetch("/api/beliefs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: belief }),
      });
    }
    router.push("/dashboard");
  }

  if (done) {
    const why = QUESTIONS[0].options.find((o) => o.value === answers.why);
    return (
      <div className="space-y-4">
        <section className="rounded-card border border-rule bg-card p-6">
          <p className="label">Here&rsquo;s what you said</p>
          <p className="mt-3 text-[19px] font-bold leading-snug text-ink-900">
            {why?.label ?? "You want money to feel quieter."}
          </p>
          {why?.mirror ? (
            <p className="mt-2 text-[15px] leading-relaxed text-ink-400">{why.mirror}</p>
          ) : null}
        </section>

        <section className="rounded-card border border-rule bg-card p-6">
          <p className="label">What Sproutjar does with that</p>
          <ul className="mt-3 space-y-3 text-[15px] leading-relaxed text-ink-700">
            <li>
              <span className="font-bold text-ink-900">Ren, out loud.</span> A coach you talk to,
              who already knows your numbers, so you never start from scratch.
            </li>
            <li>
              <span className="font-bold text-ink-900">One plant, one picture.</span> Debt going
              down and savings going up are the same growth, not two scoreboards.
            </li>
            <li>
              <span className="font-bold text-ink-900">One small step a week.</span> Chosen by you
              at the end of each call. Missing it is information, not a failure.
            </li>
          </ul>
        </section>

        <button
          onClick={begin}
          disabled={busy}
          className="w-full rounded-full bg-ink-800 px-5 py-3.5 text-[16px] font-bold text-cream transition hover:bg-ink-700 disabled:opacity-60"
        >
          {busy ? "One moment" : "Go in"}
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex gap-1.5" aria-hidden>
        {QUESTIONS.map((q, index) => (
          <span
            key={q.id}
            className={`h-1 flex-1 rounded-full ${index <= step ? "bg-stem" : "bg-rule"}`}
          />
        ))}
      </div>

      <section className="rounded-card border border-rule bg-card p-6">
        <h1 className="text-[21px] font-bold leading-snug text-ink-900">{question.title}</h1>
        {question.note ? (
          <p className="mt-1.5 text-[13px] text-ink-400">{question.note}</p>
        ) : null}

        <div className="mt-5 space-y-2.5">
          {question.options.map((option) => (
            <button
              key={option.value}
              onClick={() => pick(option.value)}
              className="w-full rounded-card border border-rule bg-cream px-4 py-3.5 text-left text-[15px] leading-snug text-ink-800 transition hover:border-stem hover:shadow-sh-2"
            >
              {option.label}
            </button>
          ))}
        </div>
      </section>

      {step > 0 ? (
        <button
          onClick={() => setStep(step - 1)}
          className="text-[13px] font-bold text-ink-300 underline underline-offset-2"
        >
          Back
        </button>
      ) : null}
    </div>
  );
}
