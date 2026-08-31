import { Collapse } from "@/components/Collapse";
import { ProfileForm } from "@/components/ProfileForm";
import { formatMoneyShort } from "@/lib/money";
import { buildSnapshot } from "@/lib/user";

export const dynamic = "force-dynamic";

export default async function YouPage() {
  const snap = await buildSnapshot();
  const currency = snap.country.currency;
  const weeks = snap.user.weeksActive;

  return (
    <>
      <section className="overflow-hidden rounded-card border border-rule bg-card">
        <div className="flex items-center gap-4 bg-ink-800 px-5 py-5 text-cream">
          <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-leaf-300 text-[20px] font-bold text-ink-900">
            {snap.user.name.trim().charAt(0).toUpperCase()}
          </span>
          <div className="min-w-0">
            <p className="text-[20px] font-bold leading-tight">{snap.user.name}</p>
            <p className="mt-0.5 text-[13px] text-leaf-300">
              <span className="n">{weeks}</span> weeks in · {snap.country.name}
            </p>
          </div>
        </div>

        <dl className="grid grid-cols-2 divide-x divide-rule">
          <div className="px-4 py-4">
            <dt className="text-[11px] uppercase tracking-wide text-ink-300">Paid off</dt>
            <dd className="n mt-1 text-[17px] text-stem-700">
              {formatMoneyShort(snap.cleared, currency)}
            </dd>
          </div>
          <div className="px-4 py-4">
            <dt className="text-[11px] uppercase tracking-wide text-ink-300">Talks</dt>
            <dd className="n mt-1 text-[17px] text-ink-900">{snap.sessions.length}</dd>
          </div>
        </dl>
      </section>

      {snap.user.moneyPurpose ? (
        <section className="rounded-card border border-leaf-300 bg-leaf-50 p-5">
          <p className="label">What the money is for</p>
          <p className="mt-2 text-[18px] font-bold leading-snug text-ink-900">
            {snap.user.moneyPurpose}
          </p>
          <p className="mt-2 text-[13px] text-ink-400">
            Ren comes back to this when a month goes sideways.
          </p>
        </section>
      ) : null}

      {snap.user.goodDecision ? (
        <section className="rounded-card border border-rule bg-card p-5">
          <p className="label">Something you already did that worked</p>
          <p className="mt-2 text-[16px] leading-relaxed text-ink-800">{snap.user.goodDecision}</p>
        </section>
      ) : null}

      {snap.user.upbringing ? (
        <section className="rounded-card border border-rule bg-card p-5">
          <p className="label">Where your money story starts</p>
          <p className="mt-2 text-[16px] italic leading-relaxed text-ink-700">
            &ldquo;{snap.user.upbringing}&rdquo;
          </p>
        </section>
      ) : null}

      {snap.beliefs.length > 0 ? (
        <section className="rounded-card border border-rule bg-card p-5">
          <p className="label">Things you&rsquo;ve said out loud</p>
          <p className="mt-1.5 text-[13px] text-ink-400">
            Naming one is most of the work. They&rsquo;re here so you can see whether they still
            hold.
          </p>
          <ul className="mt-4 space-y-4">
            {snap.beliefs.map((item) => (
              <li key={item.id} className="border-l-2 border-leaf-300 pl-3.5">
                <p className="text-[16px] italic leading-snug text-ink-900">
                  &ldquo;{item.text}&rdquo;
                </p>
                <p className="mt-1 text-[12px] text-ink-300">
                  {item.namedOn.toLocaleDateString("en-GB", { day: "numeric", month: "long" })}
                </p>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      {snap.sessions.length > 0 ? (
        <section className="rounded-card border border-rule bg-card p-5">
          <p className="label">Your talks with Ren</p>
          <p className="mt-1 text-[13px] text-root">
            One root in the jar for each of these. They only go down.
          </p>
          <ul className="mt-3 divide-y divide-rule">
            {snap.sessions.map((session) => {
              const produced = session.commitments[0];
              return (
                <li key={session.id} className="py-3.5 first:pt-0">
                  <div className="flex items-baseline justify-between gap-3">
                    <p className="text-[15px] font-bold text-ink-900">{session.agenda}</p>
                    <p className="text-[12px] text-ink-300">
                      {session.startedAt.toLocaleDateString("en-GB", {
                        day: "numeric",
                        month: "short",
                      })}
                    </p>
                  </div>
                  {produced ? (
                    <p className="mt-1 text-[13px] text-ink-400">
                      {produced.wish}
                      {produced.status === "kept" ? (
                        <span className="chip c-grow ml-2">Done</span>
                      ) : produced.status === "missed" ? (
                        <span className="chip c-neutral ml-2">Another time</span>
                      ) : null}
                    </p>
                  ) : (
                    <p className="mt-1 text-[13px] text-ink-300">
                      You just wanted to think out loud. Nothing to do after it, and that was fine.
                    </p>
                  )}
                </li>
              );
            })}
          </ul>
        </section>
      ) : null}

      <Collapse title="Your details" hint="Income, essentials, where you are">
        <ProfileForm
          name={snap.user.name}
          country={snap.user.country}
          monthlyIncome={snap.user.monthlyIncome}
          monthlyEssentials={snap.user.monthlyEssentials}
          currency={currency}
        />
      </Collapse>

      <p className="px-1 text-[12px] leading-relaxed text-ink-300">
        Sproutjar is coaching, not financial, legal or religious advice. For anything that needs a
        ruling, Ren will point you to your bank, the {snap.country.regulator}, or someone qualified.
      </p>
    </>
  );
}
