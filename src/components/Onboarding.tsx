"use client";

import { useRef, useState, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { Plant } from "@/components/Plant";
import { RenHello } from "@/components/RenHello";
import { StatementImport, type StatementReading } from "@/components/StatementImport";
import { COUNTRIES, formatMoney } from "@/lib/money";
import { INITIAL_ONBOARDING, MONEY_HELPS, MONEY_REASONS, ONBOARDING_QUESTIONS, onboardingMoney, onboardingPlanLabel, onboardingVoiceContext, type OnboardingAnswers, type OnboardingCard, type OnboardingProgress, type OnboardingStep } from "@/lib/onboarding";

const SEED = { stemPct: 0.02, leafPairs: 0, rootDepth: 0.05, sparks: false, cleared: false };
const primary = "w-full rounded-full bg-ink-800 px-5 py-3.5 text-[16px] font-bold text-cream hover:bg-ink-700 disabled:opacity-60";
const option = "w-full rounded-card border border-rule bg-cream px-4 py-3.5 text-left text-[15px] leading-snug text-ink-800 hover:border-stem aria-pressed:border-stem aria-pressed:bg-leaf-100";
const link = "w-full py-2 text-[13px] font-bold text-ink-400 underline underline-offset-2";
const input = "mt-1 w-full rounded-sm border border-rule bg-card px-3 py-3 text-[16px] text-ink-900 outline-none placeholder:text-ink-300 focus:border-stem";
function Field({ label, hint, children }: { label: string; hint?: string; children: ReactNode }) {
  return <label className="block text-[12px] font-bold text-ink-500">{label}{children}{hint ? <span className="mt-1 block text-[12px] font-normal text-ink-400">{hint}</span> : null}</label>;
}
function number(value: string) {
  const clean = value.replace(/[,\s]/g, "");
  return clean === "" ? 0 : /^\d+(\.\d+)?$/.test(clean) ? Number(clean) : NaN;
}
function cardForm(card?: OnboardingCard) {
  return card ? { name: card.name, balance: String(card.balance), rate: card.estimatedFields?.includes("rate") ? "" : String(Number((card.monthlyRate * 100).toFixed(6))), minimum: card.estimatedFields?.includes("minimum") ? "" : String(card.minimumPayment) } : { name: "", balance: "", rate: "", minimum: "" };
}

export function Onboarding({ initialName, initialCountry, initialAnswers = {}, initialProgress = INITIAL_ONBOARDING, initialCards = [] }: { initialName: string; initialCountry: string; initialAnswers?: OnboardingAnswers; initialProgress?: OnboardingProgress; initialCards?: OnboardingCard[] }) {
  const router = useRouter();
  const [progress, setProgress] = useState(initialProgress);
  const [answers, setAnswers] = useState(initialAnswers);
  const [name, setName] = useState(initialName);
  const [country, setCountry] = useState(initialCountry in COUNTRIES ? initialCountry : "AE");
  const [cards, setCards] = useState(initialCards);
  const [card, setCard] = useState(() => cardForm(initialCards[initialProgress.cardSlot]));
  const [money, setMoney] = useState(() => Object.fromEntries(Object.entries(initialProgress.money).map(([key, value]) => [key, value ? String(value) : ""])) as Record<keyof OnboardingProgress["money"], string>);
  const [busy, setBusy] = useState(false);
  const pending = useRef(false);
  const [error, setError] = useState<string | null>(null);
  const step = progress.step;
  const currency = COUNTRIES[country as keyof typeof COUNTRIES]?.currency ?? "AED";
  const m = (amount: number) => formatMoney(amount, currency);
  const values = { income: number(money.income), bills: number(money.bills), family: number(money.family), everyday: number(money.everyday) };
  const outlook = onboardingMoney(cards, values, progress.payment);
  const savedOutlook = onboardingMoney(cards, { income: progress.payment ?? 0, bills: 0, family: 0, everyday: 0 });
  const planLabel = onboardingPlanLabel(progress.hasMore, cards.length);
  const minimumLabel = outlook.guessed ? "Estimated minimum required" : "Minimum required";

  async function post(url: string, body: unknown) {
    const response = await fetch(url, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) }).catch(() => { throw new Error("Could not reach Sproutjar. Check your connection and try again."); });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(data.error ?? "Something did not save. Try again.");
    return data;
  }
  async function run(action: () => Promise<void>) {
    if (pending.current) return;
    pending.current = true; setBusy(true); setError(null);
    try { await action(); } catch (caught) { setError((caught as Error).message); }
    finally { pending.current = false; setBusy(false); }
  }
  async function go(next: OnboardingStep, fields: Partial<OnboardingProgress> = {}, nextAnswers = answers, saveMoney = false, complete = false) {
    await run(async () => {
      const state = { ...progress, ...fields, step: next };
      await post("/api/onboarding", { name: name.trim() || undefined, country, answers: nextAnswers, progress: state, saveMoney, complete });
      setAnswers(nextAnswers); setProgress(state); window.scrollTo(0, 0);
      if (complete && state.callFirst) router.push("/dashboard/ren");
    });
  }
  async function saveCard(reading?: StatementReading) {
    const balance = reading ? reading.balance ?? 0 : number(card.balance);
    const cardName = reading ? reading.name ?? reading.issuer ?? "Card" : card.name.trim();
    const rate = reading ? reading.monthlyRatePct : card.rate.trim() === "" ? null : number(card.rate);
    const minimum = reading ? reading.minimumPayment : card.minimum.trim() === "" ? null : number(card.minimum);
    if (!cardName) { setError("Give it a name you'd recognise."); return; }
    if (!Number.isFinite(balance) || balance <= 0) { setError("Add what you owe, even a rough figure."); return; }
    if ((rate !== null && (!Number.isFinite(rate) || rate < 0 || rate > 100)) || (minimum !== null && (!Number.isFinite(minimum) || minimum < 0))) { setError("Check the rate and minimum against your statement."); return; }
    await run(async () => {
      const existing = cards[progress.cardSlot];
      const data = await post("/api/onboarding/card", { slot: progress.cardSlot, name: cardName, issuer: reading?.issuer ?? cardName.split(" ")[0], balance, monthlyRate: rate === null ? 0.0325 : rate / 100, minimumPayment: minimum === null ? Math.round(balance * 0.05) : minimum, dueDay: reading?.dueDay ?? existing?.dueDay, statementDay: reading?.statementDay ?? existing?.statementDay, estimatedFields: [rate === null ? "rate" : "", minimum === null ? "minimum" : ""].filter(Boolean).join(",") });
      setCards((current) => { const copy = [...current]; copy[progress.cardSlot] = data.card; return copy; });
      setCard(cardForm(data.card)); setProgress(data.progress); window.scrollTo(0, 0);
    });
  }
  async function saveMoney() {
    if (Object.values(values).some((value) => !Number.isFinite(value) || value < 0)) { setError("Just the number, like 12000. No minus signs or letters."); return; }
    if (!values.income) { setError("Add a rough figure, or skip this for now."); return; }
    await go(outlook.left >= outlook.minimums ? "plan" : "tight", { money: values, payment: outlook.payment, moneySkipped: false }, answers, true);
  }
  const minimumNote = outlook.guessed ? <p className="text-[12px] leading-relaxed text-ink-400">Your minimum is an estimate: usually around {m(outlook.minimums)}. Check your statement when you can.</p> : null;
  const stage = step.startsWith("q") ? (step === "q1" ? 1 : 2) : step === "name" ? 3 : ["card", "type", "statement", "more"].includes(step) ? 4 : step === "money" ? 5 : ["plan", "tight", "why", "renready"].includes(step) ? 6 : 7;
  const title = (text: string) => <h1 className="text-[23px] font-bold leading-tight tracking-tight text-ink-900">{text}</h1>;
  const note = (text: string) => <p className="text-[14px] leading-relaxed text-ink-400">{text}</p>;
  let body: ReactNode;
  let footer: ReactNode;
  let back: OnboardingStep | undefined;

  if (step.startsWith("q")) {
    const index = Number(step.slice(1)) - 1;
    const question = ONBOARDING_QUESTIONS[index];
    body = <>{title(question.title)}<div className="space-y-3">{question.options.map((answer) => <button key={answer} aria-pressed={answers[question.id] === answer} className={option} onClick={() => void go(index === 2 ? "name" : index === 0 ? "q2" : "q3", {}, { ...answers, [question.id]: answer })}>{answer}</button>)}</div></>;
    back = index === 1 ? "q1" : index === 2 ? "q2" : undefined;
  } else if (step === "name") {
    body = <>{title("First, what should Ren call you?")}<Field label="Your name"><input autoComplete="given-name" value={name} maxLength={40} onChange={(event) => setName(event.target.value)} className={input} /></Field><Field label="Where you live" hint="Sets your currency and which bank rules Ren checks."><select value={country} onChange={(event) => setCountry(event.target.value)} className={input}>{Object.entries(COUNTRIES).map(([code, profile]) => <option key={code} value={code}>{profile.name} ({profile.currency})</option>)}</select></Field></>;
    footer = <button className={primary} onClick={() => name.trim() ? void go("card") : setError("Add a name, even a nickname. Ren will use it.")}>Next</button>; back = "q3";
  } else if (step === "card") {
    body = <>{title("One card to start with?")}{note("Just one. The rest can wait for Ren.")}<button className={option} onClick={() => void go("statement")}><b>Upload or paste a statement</b><span className="mt-1 block text-[13px] text-ink-400">The PDF your bank emails, or its text. Read on Sproutjar&apos;s side, keeping only the figures you confirm.</span></button><button className={option} onClick={() => void go("type")}><b>Type it in</b><span className="mt-1 block text-[13px] text-ink-400">Name and balance is enough.</span></button></>; back = "name";
  } else if (step === "type") {
    const interest = number(card.balance) * number(card.rate) / 100;
    body = <>{title("Your card")}<Field label="What you call it"><input value={card.name} onChange={(event) => setCard({ ...card, name: event.target.value })} placeholder="Emirates NBD Visa" className={input} /></Field><Field label={`What you owe on it (${currency})`}><input value={card.balance} onChange={(event) => setCard({ ...card, balance: event.target.value })} inputMode="decimal" className={input} /></Field><Field label="Monthly interest (optional)"><input value={card.rate} onChange={(event) => setCard({ ...card, rate: event.target.value })} inputMode="decimal" placeholder="3.25%" className={input} /></Field><Field label={`Minimum required (optional, ${currency})`} hint="Not sure of it or the rate? Leave them, and Ren marks them as guesses."><input value={card.minimum} onChange={(event) => setCard({ ...card, minimum: event.target.value })} inputMode="decimal" className={input} /></Field><details className="rounded-sm border border-rule p-3 text-[13px] leading-relaxed text-ink-500"><summary className="cursor-pointer font-bold">What is this?</summary><p className="mt-2">The smallest amount your bank asks you to pay each month. It is usually printed on your statement.</p><p className="mt-2"><b>Pay just this:</b> your account stays in good standing, but much of the money goes to interest, so what you owe barely moves.</p><p className="mt-2"><b>Pay less, or late:</b> your bank may charge a fee, and it can hurt your credit record.</p>{interest > 0 ? <p className="mt-2">On {m(number(card.balance))} at {card.rate}% a month, about {m(interest)} of what you pay goes to interest each month.</p> : null}</details>{card.minimum !== "" && interest > 0 && number(card.minimum) <= interest ? <div className="rounded-card bg-root/10 p-4 text-[13px] text-root" role="status"><b>This minimum doesn&apos;t cover the interest.</b><p className="mt-1">At {card.rate}% a month the interest is about {m(interest)}, so paying {m(number(card.minimum))} never brings it down. Worth checking the figures against your statement.</p></div> : null}</>;
    footer = <button className={primary} onClick={() => void saveCard()}>Next</button>; back = "card";
  } else if (step === "statement") {
    body = <StatementImport currency={currency} onRead={(reading) => void saveCard(reading)} onClose={() => void go("card")} />; back = "card";
  } else if (step === "more") {
    body = <>{title("Is this the only card or loan you're paying off?")}{note("So the date on your plan means what it says.")}<button className={option} onClick={() => void go("money", { hasMore: false })}><b>{cards.length > 1 ? "Yes, that's all of them" : "Yes, just this one"}</b><span className="mt-1 block text-[13px] text-ink-400">Your plan shows when you&apos;re debt-free.</span></button><button className={option} onClick={() => void go("money", { hasMore: true })}><b>I have more. I&apos;ll add them later</b><span className="mt-1 block text-[13px] text-ink-400">Your plan shows when {cards.length > 1 ? "these cards are" : "this card is"} paid off. Ren can add the rest with you.</span></button><button className={option} onClick={() => { setCard(cardForm()); void go("type", { cardSlot: cards.length }); }}><b>Add another now</b><span className="mt-1 block text-[13px] text-ink-400">Name and balance is enough.</span></button><p className="text-[12px] text-ink-400">{cards.length} {cards.length === 1 ? "card saved" : "cards saved"}</p></>; back = "type";
  } else if (step === "money") {
    body = <>{title("Roughly, what comes in and what goes out?")}{note("A rough number is fine. You can change it any time.")}{([
      ["income", "Take-home pay", ""], ["bills", "Bills that leave on their own", "Rent, school, loans, phone. Not your cards."], ["family", "Family support", "What you give or send each month. It stays in your plan."], ["everyday", "Everyday spending", "Food, transport, going out."],
    ] as const).map(([key, label, hint]) => <Field key={key} label={`${label} (${currency})`} hint={hint}><input value={money[key]} onChange={(event) => { setMoney({ ...money, [key]: event.target.value }); setProgress({ ...progress, payment: undefined }); }} inputMode="decimal" className={input} /></Field>)}{values.income > 0 && Object.values(values).every(Number.isFinite) ? <div role="status" className={`space-y-3 rounded-card p-4 ${outlook.tier === "short" || outlook.tier === "none" ? "bg-root/10 text-root" : "bg-leaf-100 text-ink-800"}`}><p className="text-[12px] font-bold">{outlook.tier === "room" ? "Towards your cards" : outlook.left < 0 ? "More goes out than comes in, by" : "That leaves for your cards"}</p><p className="text-[25px] font-bold tabular-nums">{m(outlook.tier === "room" ? outlook.payment : Math.abs(outlook.left))} a month</p>{outlook.tier === "room" ? <><input type="range" min={outlook.minimums} max={outlook.left} step="any" value={outlook.payment} onChange={(event) => setProgress({ ...progress, payment: Number(event.target.value) })} aria-label="How much goes towards your cards each month" className="w-full accent-stem" /><div className="flex justify-between gap-4 text-[11px]"><span>{m(outlook.minimums)}, {minimumLabel.toLowerCase()}</span><span>{m(outlook.left)}, all that&apos;s left</span></div><p className="text-[13px]">{planLabel}<b className="mt-1 block text-[18px]">{outlook.hasDate ? outlook.plan.debtFreeOn : "Not yet"}</b></p>{outlook.left > outlook.payment ? <p className="text-[13px]">{m(outlook.left - outlook.payment)} stays with you each month.</p> : null}</> : <p className="text-[13px]">{minimumLabel}: {m(outlook.minimums)}.{outlook.tier === "just" ? " That covers the minimum, with nothing extra yet." : outlook.tier === "short" ? outlook.guessed ? " This may be tight. Check the minimum against your statement." : ` That leaves a gap of ${m(outlook.minimums - outlook.left)}.` : " Ren can work through the month with you."}</p>}{minimumNote}</div> : null}</>;
    footer = <><button className={primary} onClick={() => void saveMoney()}>See my plan</button><button className={link} onClick={() => void go("plan", { payment: outlook.minimums, moneySkipped: true }, answers, true)}>Skip, I&apos;ll tell Ren</button></>; back = "more";
  } else if (step === "tight") {
    const left = progress.money.income - progress.money.bills - progress.money.family - progress.money.everyday;
    body = <><Plant state={SEED} className="mx-auto h-36 w-24" />{title(left <= 0 ? left < 0 ? "More is going out than coming in." : "There's nothing left for your cards right now." : outlook.guessed ? "This may be tight." : "This month is tight.")}{note(left > 0 ? `You have ${m(left)} for your cards, ${outlook.guessed ? "and the minimum is probably around" : "and the minimum required is"} ${m(outlook.minimums)}. Thanks for saying so. Ren can work on it with you.` : "That's hard to carry alone, and you don't have to. Thanks for saying so. Ren can work on it with you.")}{minimumNote}</>;
    footer = <><button className={primary} onClick={() => void go("why")}>Let&apos;s work on it</button>{left > 0 ? <button className={link} onClick={() => void go("plan", { payment: outlook.minimums }, answers, true)}>See the plan at {m(outlook.minimums)}</button> : null}</>; back = "money";
  } else if (step === "why") {
    body = <>{title("What's making it hard right now?")}<div className="space-y-2">{Object.entries(MONEY_REASONS).map(([key, value]) => <button key={key} className={option} aria-pressed={progress.reason === key} onClick={() => setProgress({ ...progress, reason: key as OnboardingProgress["reason"] })}>{value[0]}</button>)}</div><h2 className="text-[19px] font-bold">What would help most?</h2><div className="space-y-2">{Object.entries(MONEY_HELPS).map(([key, value]) => <button key={key} className={option} aria-pressed={progress.help === key} onClick={() => setProgress({ ...progress, help: key as OnboardingProgress["help"] })}>{value[0]}</button>)}</div></>;
    footer = <><button className={primary} onClick={() => void go("renready")}>Next</button><button className={link} onClick={() => void go("renready", { reason: undefined, help: undefined })}>Skip and talk to Ren</button></>; back = "tight";
  } else if (step === "renready") {
    body = <><div className="flex items-center gap-3"><span className="h-12 w-12 rounded-full bg-stem/40 shadow-[0_0_25px_8px_#5fa87740]" aria-hidden /><div><h1 className="text-[23px] font-bold">Ren</h1><p className="text-[13px] text-ink-400">Your AI voice coach</p></div></div>{progress.reason ? note(MONEY_REASONS[progress.reason][1]) : null}<section className="rounded-card border border-rule p-4"><h2 className="text-[13px] font-bold">Ren will already know</h2><ul className="mt-3 list-disc space-y-2 pl-4 text-[14px]"><li>{(progress.payment ?? 0) > 0 ? `You have ${m(progress.payment ?? 0)} for your cards` : "There's nothing left for your cards right now"}</li><li>{minimumLabel}: {m(outlook.minimums)}</li>{progress.reason ? <li>{MONEY_REASONS[progress.reason][0]}</li> : null}</ul>{minimumNote}</section><section className="rounded-card border border-rule p-4"><h2 className="text-[13px] font-bold">On this call</h2><ol className="mt-3 list-decimal space-y-2 pl-4 text-[14px]"><li>{progress.help ? MONEY_HELPS[progress.help][1] : "Talk through what's going on"}</li><li>Pick one small thing to try</li></ol></section></>;
    footer = <><button className={primary} onClick={() => void go("save", { callFirst: true })}>Call Ren</button>{(progress.payment ?? 0) > 0 ? <button className={link} onClick={() => void go("plan", { payment: Math.max(progress.payment ?? 0, outlook.minimums), callFirst: false }, answers, true)}>Not now, see the plan at {m(Math.max(progress.payment ?? 0, outlook.minimums))}</button> : null}</>; back = "money";
  } else if (step === "plan") {
    const focusId = savedOutlook.focusId;
    body = <>
      <Plant state={SEED} className="mx-auto h-36 w-24" />
      <p className="text-center text-[12px] font-bold uppercase tracking-wide text-root">Estimated</p>
      {savedOutlook.hasDate ? <>
        {title(planLabel)}
        <p className="text-[30px] font-bold leading-tight text-stem">{savedOutlook.plan.debtFreeOn}</p>
        {note(`At ${m(progress.payment ?? 0)} a month.`)}
        <div className="space-y-3 rounded-card border border-rule p-4">
          <h2 className="text-[13px] font-bold">This month, pay</h2>
          {cards.map((item) => {
            const focus = focusId === item.id;
            const amount = savedOutlook.firstMonthPayments.get(item.id) ?? 0;
            return <div key={item.id} className="flex justify-between gap-3 border-t border-rule pt-3 text-[13px]"><span>{item.name}{focus && cards.length > 1 ? " (focus)" : ""}</span><b className="whitespace-nowrap">{m(amount)}</b></div>;
          })}
        </div>
        {savedOutlook.firstMonthPayment < (progress.payment ?? 0) ? note("Your plan also starts a small reserve in the first month.") : null}
      </> : <>{title("No date yet. That's a place to start.")}{note("At this payment, the balance won't come down far enough for a date. Ren can help you work through what could change.")}</>}
      {minimumNote}
      {note(`${cards.some((item) => item.estimatedFields) ? "The rate or minimum is a guess for now. " : ""}Assumes no new spending on the card and rates staying the same.${progress.moneySkipped ? " You skipped the money question, so this uses the minimum required. Ren can help find the real figure." : ""}`)}
      {!progress.moneySkipped && (progress.payment ?? 0) > outlook.left ? note(`This plan uses ${m(progress.payment ?? 0)} a month. Your money figures leave ${m(outlook.left)}; Ren can help you work through the gap.`) : null}
    </>;
    footer = <button className={primary} onClick={() => void go("save", { callFirst: !savedOutlook.hasDate })}>{savedOutlook.hasDate ? "Save my plan" : "Save this and talk to Ren"}</button>; back = "money";
  } else if (step === "save") {
    body = <>{title("Keep this plan.")}{note("So Ren remembers it, and you can open it on any phone.")}{note("Your plan is saved to your signed-in account.")}</>;
    footer = <button className={primary} onClick={() => void go(progress.callFirst ? "seed" : "hello", {}, answers, false, progress.callFirst)}>{progress.callFirst ? "Save this and talk to Ren" : "Meet Ren"}</button>; back = progress.callFirst ? "renready" : "plan";
  } else if (step === "hello") {
    body = <><p className="text-[12px] font-bold uppercase tracking-wide text-root">Nearly there</p>{title("Meet Ren. Twenty seconds, out loud.")}{note("Your AI voice coach. Your phone will ask to use the microphone. Ren only hears you while a call is open, and the call is written down so you can read it or delete it later.")}<RenHello onDone={() => void go("seed", {}, answers, false, true)} answers={{ first_name: name.trim().split(" ")[0] || "there", context: onboardingVoiceContext(answers, progress, cards) }} /></>;
  } else {
    body = <><Plant state={SEED} className="mx-auto h-56 w-40" /><p className="text-center text-[12px] font-bold uppercase tracking-wide text-root">Day one</p>{title("It starts here.")}{note("It grows as the cards go down and the jar fills up. One picture for both. Nothing else to set up today.")}</>;
    footer = <button className={primary} onClick={() => router.push("/dashboard")}>Take me in</button>;
  }
  return <div className="space-y-5" data-onboarding-step={step}><div className="flex gap-1.5" role="progressbar" aria-label={`Step ${stage} of 7`} aria-valuemin={1} aria-valuemax={7} aria-valuenow={stage}>{Array.from({ length: 7 }, (_, index) => <span key={index} className={`h-1 flex-1 rounded-full ${index < stage ? "bg-stem" : "bg-rule"}`} />)}</div><fieldset disabled={busy} className="min-w-0 space-y-5 rounded-card border border-rule bg-card p-5" aria-busy={busy}><div className="space-y-5">{body}</div>{error ? <p role="alert" className="text-[13px] text-root">{error}</p> : null}<div className="space-y-2">{busy ? <p role="status" className="text-center text-[13px] text-ink-400">One moment</p> : null}{footer}{back ? <button className={link} onClick={() => void go(back)}>Back</button> : null}</div></fieldset></div>;
}
