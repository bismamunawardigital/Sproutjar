"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { COUNTRIES, type CountryCode } from "@/lib/money";
import { Jar } from "@/components/Jar";

type Step = 0 | 1 | 2 | 3 | 4;

const STEPS = ["You", "Money", "Cards", "Jar", "Ready"];

const inputClass =
  "mt-1 w-full rounded-sm border border-rule bg-cream px-3 py-2.5 text-[16px] text-ink-800 outline-none focus:border-stem";

export function Onboarding() {
  const router = useRouter();
  const [step, setStep] = useState<Step>(0);
  const [busy, setBusy] = useState(false);

  const [name, setName] = useState("");
  const [country, setCountry] = useState<CountryCode>("AE");
  const [income, setIncome] = useState("");
  const [essentials, setEssentials] = useState("");
  const [card, setCard] = useState({ name: "", issuer: "", balance: "", rate: "", minimum: "" });
  const [jar, setJar] = useState({ name: "One month of the basics", target: "" });

  const currency = COUNTRIES[country].currency;
  const surplus = Math.max(0, Number(income || 0) - Number(essentials || 0));
  const suggestedTarget = useMemo(
    () => (Number(essentials) > 0 ? String(Math.round(Number(essentials))) : ""),
    [essentials],
  );

  async function finish() {
    setBusy(true);
    await fetch("/api/profile", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: name || undefined,
        country,
        monthlyIncome: Number(income || 0),
        monthlyEssentials: Number(essentials || 0),
      }),
    });

    if (card.name && Number(card.balance) > 0) {
      await fetch("/api/debts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: card.name,
          issuer: card.issuer || card.name,
          kind: "credit_card",
          balance: Number(card.balance),
          monthlyRate: Number(card.rate || 0) / 100,
          minimumPayment: Number(card.minimum || 0),
          isIslamic: false,
        }),
      });
    }

    const target = Number(jar.target || suggestedTarget || 0);
    if (jar.name && target > 0) {
      await fetch("/api/jars", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: jar.name, purpose: "buffer", target, saved: 0 }),
      });
    }

    router.push("/dashboard");
    router.refresh();
  }

  return (
    <div className="space-y-5">
      <div className="flex gap-1.5">
        {STEPS.map((label, index) => (
          <span
            key={label}
            className={`h-1.5 flex-1 rounded-full transition ${
              index <= step ? "bg-stem" : "bg-rule"
            }`}
          />
        ))}
      </div>

      {step === 0 ? (
        <section className="rounded-card border border-rule bg-card p-5">
          <h1 className="text-[24px] font-bold leading-snug text-ink-900">
            Let&rsquo;s start with your name.
          </h1>
          <p className="mt-2 text-[14px] leading-relaxed text-ink-400">
            Ren will use it on calls. Nothing here is shared with anyone.
          </p>
          <label className="mt-4 block text-[12px] font-bold text-ink-500">
            What should Ren call you?
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Layla"
              className={inputClass}
            />
          </label>
          <label className="mt-3 block text-[12px] font-bold text-ink-500">
            Where you live
            <select
              value={country}
              onChange={(e) => setCountry(e.target.value as CountryCode)}
              className={inputClass}
            >
              {Object.values(COUNTRIES).map((option) => (
                <option key={option.code} value={option.code}>
                  {option.name}
                </option>
              ))}
            </select>
          </label>
          <p className="mt-3 text-[13px] text-ink-300">
            Rates, bureaus and rules differ by country, so Ren keeps to the ones where you are.
          </p>
        </section>
      ) : null}

      {step === 1 ? (
        <section className="rounded-card border border-rule bg-card p-5">
          <h1 className="text-[24px] font-bold leading-snug text-ink-900">
            What have you got to work with?
          </h1>
          <p className="mt-2 text-[14px] leading-relaxed text-ink-400">
            Rough numbers are fine. You can change them any time.
          </p>
          <label className="mt-4 block text-[12px] font-bold text-ink-500">
            What comes in each month ({currency})
            <input
              inputMode="decimal"
              value={income}
              onChange={(e) => setIncome(e.target.value)}
              placeholder="18000"
              className={inputClass}
            />
          </label>
          <label className="mt-3 block text-[12px] font-bold text-ink-500">
            What the basics cost ({currency})
            <input
              inputMode="decimal"
              value={essentials}
              onChange={(e) => setEssentials(e.target.value)}
              placeholder="11500"
              className={inputClass}
            />
          </label>
          {surplus > 0 ? (
            <p className="mt-3 text-[14px] text-stem-700">
              That&rsquo;s{" "}
              <span className="n">
                {currency} {surplus.toLocaleString("en-US")}
              </span>{" "}
              a month you can point somewhere.
            </p>
          ) : null}
        </section>
      ) : null}

      {step === 2 ? (
        <section className="rounded-card border border-rule bg-card p-5">
          <h1 className="text-[24px] font-bold leading-snug text-ink-900">
            Add the first card.
          </h1>
          <p className="mt-2 text-[14px] leading-relaxed text-ink-400">
            One is enough to start. Seeing the real number is the part most people never do.
          </p>
          <div className="mt-4 grid gap-3">
            <label className="text-[12px] font-bold text-ink-500">
              What do you call it
              <input
                value={card.name}
                onChange={(e) => setCard({ ...card, name: e.target.value })}
                placeholder="Platinum"
                className={inputClass}
              />
            </label>
            <label className="text-[12px] font-bold text-ink-500">
              Which bank
              <input
                value={card.issuer}
                onChange={(e) => setCard({ ...card, issuer: e.target.value })}
                placeholder="Emirates NBD"
                className={inputClass}
              />
            </label>
            <label className="text-[12px] font-bold text-ink-500">
              Balance on it ({currency})
              <input
                inputMode="decimal"
                value={card.balance}
                onChange={(e) => setCard({ ...card, balance: e.target.value })}
                placeholder="18400"
                className={inputClass}
              />
            </label>
            <div className="grid grid-cols-2 gap-3">
              <label className="text-[12px] font-bold text-ink-500">
                Monthly interest %
                <input
                  inputMode="decimal"
                  value={card.rate}
                  onChange={(e) => setCard({ ...card, rate: e.target.value })}
                  placeholder="3.25"
                  className={inputClass}
                />
              </label>
              <label className="text-[12px] font-bold text-ink-500">
                Minimum payment
                <input
                  inputMode="decimal"
                  value={card.minimum}
                  onChange={(e) => setCard({ ...card, minimum: e.target.value })}
                  placeholder="920"
                  className={inputClass}
                />
              </label>
            </div>
          </div>
          <p className="mt-3 text-[13px] text-ink-300">
            Not sure about the rate? Leave it — Ren can find it with you later.
          </p>
        </section>
      ) : null}

      {step === 3 ? (
        <section className="rounded-card border border-rule bg-card p-5">
          <h1 className="text-[24px] font-bold leading-snug text-ink-900">
            Now the jar.
          </h1>
          <p className="mt-2 text-[14px] leading-relaxed text-ink-400">
            One month of the basics, set aside. It&rsquo;s what stops the next surprise going back on
            a card — so it comes before the debt, not after.
          </p>
          <div className="mt-4 flex items-center gap-4">
            <Jar pct={0} stage="seed" className="h-28 w-20" />
            <div className="flex-1">
              <label className="block text-[12px] font-bold text-ink-500">
                What you&rsquo;re filling it to ({currency})
                <input
                  inputMode="decimal"
                  value={jar.target || suggestedTarget}
                  onChange={(e) => setJar({ ...jar, target: e.target.value })}
                  className={inputClass}
                />
              </label>
              <p className="mt-2 text-[13px] text-ink-300">
                Suggested: one month of your basics.
              </p>
            </div>
          </div>
        </section>
      ) : null}

      {step === 4 ? (
        <section className="rounded-card border border-rule bg-card p-5">
          <h1 className="text-[24px] font-bold leading-snug text-ink-900">
            That&rsquo;s everything Ren needs.
          </h1>
          <ul className="mt-4 space-y-2.5 text-[14px] leading-relaxed text-ink-400">
            <li>
              <span className="font-bold text-ink-900">Home</span> shows one plant. It grows as money
              comes off the cards and as you turn up.
            </li>
            <li>
              <span className="font-bold text-ink-900">Ren</span> is a real call. Pick how long, pick
              what you want out of it, talk.
            </li>
            <li>
              <span className="font-bold text-ink-900">Growth</span> holds the cards and the jars,
              with a real date rather than a guess.
            </li>
            <li>
              <span className="font-bold text-ink-900">You</span> keeps what you&rsquo;ve said, what
              you&rsquo;ve tried, and what changed.
            </li>
          </ul>
        </section>
      ) : null}

      <div className="flex items-center gap-3">
        {step > 0 ? (
          <button
            onClick={() => setStep((s) => (s - 1) as Step)}
            className="rounded-full border border-rule px-5 py-3 text-[15px] font-bold text-ink-400"
          >
            Back
          </button>
        ) : null}
        {step < 4 ? (
          <button
            onClick={() => setStep((s) => (s + 1) as Step)}
            className="flex-1 rounded-full bg-ink-800 px-6 py-3 text-[15px] font-bold text-cream transition hover:bg-ink-700"
          >
            Next
          </button>
        ) : (
          <button
            onClick={finish}
            disabled={busy}
            className="flex-1 rounded-full bg-stem px-6 py-3 text-[15px] font-bold text-cream transition hover:opacity-90 disabled:opacity-60"
          >
            {busy ? "Setting up" : "Open Sproutjar"}
          </button>
        )}
      </div>
    </div>
  );
}
