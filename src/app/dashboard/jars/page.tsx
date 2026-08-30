import { JarBoard } from "@/components/JarBoard";
import { buildSnapshot } from "@/lib/user";

export const dynamic = "force-dynamic";

export default async function JarsPage() {
  const snap = await buildSnapshot();

  return <JarBoard jars={snap.jars} currency={snap.country.currency} />;
}
