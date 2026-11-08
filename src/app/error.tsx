"use client";

import { useEffect } from "react";
import { SystemPage } from "@/components/SystemPage";
import { useAuth } from "@clerk/nextjs";

export default function ErrorPage({ retry }: { error: Error & { digest?: string }; retry: () => void }) {
  const { isSignedIn } = useAuth();
  useEffect(() => { document.title = "Something broke · Sproutjar"; }, []);
  return (
    <SystemPage title="That was us, not you." description="Something did not load. Try again, or go back home." homeHref={isSignedIn ? "/dashboard" : "/"}>
      <button onClick={retry} className="mt-8 min-h-12 w-full rounded-full border border-rule px-6 py-3 text-[16px] font-bold text-ink-900">
        Try again
      </button>
    </SystemPage>
  );
}
