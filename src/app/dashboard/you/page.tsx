import { ProfileForm } from "@/components/ProfileForm";
import { formatMoneyShort } from "@/lib/money";
import { buildSnapshot } from "@/lib/user";

export const dynamic = "force-dynamic";

export default async function YouPage() {
  const snap = await buildSnapshot();
  const currency = snap.country.currency;
  const kept = snap.recentCommitments.filter((c) => c.status === "kept").length;

  return (
    <>
      <section className="rounded-card border border-rule bg-card p-5">
        <p className="label">What you&rsquo;ve done so far</p>
        <dl className="mt-3 grid grid-cols-3 gap-3">
          <div>
            <dt className="text-[12px] text-ink-400">Paid off</dt>
            <dd className="n mt-1 text-[18px] text-stem-700">
              {formatMoneyShort(snap.cleared, currency)}
            </dd>
          </div>
          <div>
            <dt className="text-[12px] text-ink-400">Talks with Ren</dt>
            <dd className="n mt-1 text-[18px] text-ink-900">{snap.sessions.length}</dd>
          </div>
          <div>
            <dt className="text-[12px] text-ink-400">Things you followed through on</dt>
            <dd className="n mt-1 text-[18px] text-ink-900">{kept}</dd>
          </div>
        </dl>
      </section>

      <ProfileForm
        name={snap.user.name}
        country={snap.user.country}
        monthlyIncome={snap.user.monthlyIncome}
        monthlyEssentials={snap.user.monthlyEssentials}
        currency={currency}
      />
      {snap.beliefs.length > 0 ? (
        <section className="rounded-card border border-rule bg-card p-5">
          <p className="label">Things you&rsquo;ve said</p>
          <ul className="mt-3 space-y-3">
            {snap.beliefs.map((item) => (
              <li key={item.id}>
                <p className="text-[16px] italic leading-snug text-ink-900">
                  &ldquo;{item.text}&rdquo;
                </p>
                <p className="mt-1 text-[12px] text-ink-300">
                  You said this on{" "}
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

      <p className="px-1 text-[12px] leading-relaxed text-ink-300">
        Sproutjar is coaching, not financial, legal or religious advice. For anything that needs a
        ruling, Ren will point you to your bank, the {snap.country.regulator}, or someone qualified.
      </p>
    </>
  );
}
