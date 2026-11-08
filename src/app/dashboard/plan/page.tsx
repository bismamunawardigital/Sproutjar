import { PlanScreen } from "@/components/PlanScreen";
import { currentCaller, isDemo } from "@/lib/caller";
import { buildSnapshot } from "@/lib/user";
import { pageMetadata } from "@/lib/metadata";

export const metadata = pageMetadata("Your plan · Sproutjar");
export const dynamic = "force-dynamic";

export default async function PlanPage() {
  const caller = await currentCaller();
  return <PlanScreen snap={await buildSnapshot(caller)} readOnly={isDemo(caller)} />;
}
