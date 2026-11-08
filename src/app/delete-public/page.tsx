import Link from "next/link";
import { LegalPage } from "@/components/LegalPage";
import { SUPPORT_EMAIL } from "@/lib/legal";
import { pageMetadata } from "@/lib/metadata";

export const metadata = pageMetadata("Delete my account · Sproutjar", "How to delete your Sproutjar account, including when you cannot sign in.");

export default function PublicDeletionPage() {
  return (
    <LegalPage label="Your account" title="Delete my account" dated={false}
      intro="You don't need the app to do this. Sign in to confirm it's you, or ask for help by email."
      sections={[
        { title: "What goes", body: <p>Your cards, plan, payments, jars and saved talks with Ren are removed from Sproutjar when you delete your account. It cannot be undone. It does not touch your bank or your actual debt.</p> },
        { title: "Sign in to delete", body: <>
          <p>Sign in, open You, then choose &quot;Delete my account&quot;.</p>
          <Link href="/sign-in?redirect_url=%2Fdashboard%2Fyou" className="mt-4 flex min-h-12 items-center justify-center rounded-full bg-ink-800 px-6 py-3 font-bold text-cream">Sign in to delete</Link>
        </> },
        { title: "Cannot sign in?", body: <>
          <p>Email from the address on your account and ask to delete it. A person can help confirm it is yours.</p>
          <a href={`mailto:${SUPPORT_EMAIL}?subject=Delete%20my%20Sproutjar%20account`} className="mt-3 inline-flex min-h-11 items-center font-bold text-stem-700 underline underline-offset-2">{SUPPORT_EMAIL}</a>
        </> },
        { title: "Call transcripts", body: <p>ElevenLabs call transcripts are removed within 30 days on request. Ask for this in your email. <Link href="/privacy" className="font-bold text-stem-700 underline underline-offset-2">Read the privacy policy</Link> for details.</p> },
      ]}
    />
  );
}
