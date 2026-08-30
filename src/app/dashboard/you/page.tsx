import { buildSnapshot } from "@/lib/user";

export const dynamic = "force-dynamic";

export default async function YouPage() {
  const snap = await buildSnapshot();

  return (
    <>
      {snap.beliefs.length > 0 ? (
        <section className="rounded-card border border-rule bg-card p-5">
          <p className="label">In your words</p>
          <ul className="mt-3 space-y-3">
            {snap.beliefs.map((item) => (
              <li key={item.id}>
                <p className="text-[16px] italic leading-snug text-ink-900">
                  &ldquo;{item.text}&rdquo;
                </p>
                <p className="mt-1 text-[12px] text-ink-300">
                  Named{" "}
                  {item.namedOn.toLocaleDateString("en-GB", { day: "numeric", month: "long" })}
                </p>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      {snap.sessions.length > 0 ? (
        <section className="rounded-card border border-rule bg-card p-5">
          <p className="label">What you&rsquo;ve worked on</p>
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
                        <span className="chip c-neutral ml-2">Not this time</span>
                      ) : null}
                    </p>
                  ) : (
                    <p className="mt-1 text-[13px] text-ink-300">
                      You asked for space. No commitment came out of it.
                    </p>
                  )}
                </li>
              );
            })}
          </ul>
        </section>
      ) : null}

      <p className="px-1 text-[12px] leading-relaxed text-ink-300">
        Sproutjar is coaching, not regulated financial, legal or religious advice. Ren routes you to
        your bank, the {snap.country.regulator} or a professional for anything that needs a ruling.
      </p>
    </>
  );
}
