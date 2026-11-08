import { AccountActions } from "@/components/AccountActions";
import { YouScreen } from "@/components/YouScreen";
import { buildSnapshot } from "@/lib/user";
import { currentCaller, isDemo, isGuestDemo } from "@/lib/caller";
import { pageMetadata } from "@/lib/metadata";

export const metadata = pageMetadata("You · Sproutjar");
export const dynamic = "force-dynamic";

export default async function YouPage() {
  const caller = await currentCaller();
  const [snap, guest] = await Promise.all([buildSnapshot(caller), isGuestDemo()]);
  const demo = isDemo(caller);
  return <YouScreen snap={snap} readOnly={demo} account={<AccountActions key={snap.user.id} demo={demo} guest={guest} />} />;
}
