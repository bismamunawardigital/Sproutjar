import { redirect } from "next/navigation";
import { pageMetadata } from "@/lib/metadata";

export const metadata = pageMetadata("Your plan · Sproutjar");

/** The screen was called Growth for its first seven weeks; old links still land. */
export default function GrowthRedirect() {
  redirect("/dashboard/plan");
}
