import { SystemPage } from "@/components/SystemPage";
import { pageMetadata } from "@/lib/metadata";
import { auth } from "@clerk/nextjs/server";

export const metadata = pageMetadata("Page not found · Sproutjar");

export default async function NotFound() {
  const { userId } = await auth();
  return <SystemPage title="This page didn't grow." description="The link may be old. Your plan is safe." homeHref={userId ? "/dashboard" : "/"} />;
}
