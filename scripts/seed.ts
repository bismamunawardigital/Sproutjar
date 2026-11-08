import { ConvexHttpClient } from "convex/browser";
import { api } from "../convex/_generated/api";
import { LAYLA_SEED } from "../src/lib/layla";

/**
 * Seeds invented Layla data: three cards, two jars, four beliefs, six talks
 * and their commitments, with a generated balance history. Idempotent.
 *
 * Run against the dev deployment only; production keeps whatever it holds.
 */
const url = process.env.NEXT_PUBLIC_CONVEX_URL;
if (!url) throw new Error("NEXT_PUBLIC_CONVEX_URL is not set.");

const convex = new ConvexHttpClient(url);


async function main() {
  const result = await convex.mutation(api.sproutjar.seed, {
    caller: { serverKey: process.env.SPROUTJAR_SERVER_KEY ?? "", userKey: "demo" },
    ...LAYLA_SEED,
  });
  console.log("Seeded Convex:", result.userId);
}

main();
