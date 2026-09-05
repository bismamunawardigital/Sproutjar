import { redirect } from "next/navigation";

/** The screen was called Growth for its first seven weeks; old links still land. */
export default function GrowthRedirect() {
  redirect("/dashboard/plan");
}
