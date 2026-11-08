import { pageMetadata } from "@/lib/metadata";
import Link from "next/link";
import { LegalPage } from "@/components/LegalPage";
import { SUPPORT_EMAIL } from "@/lib/legal";

export const metadata = pageMetadata("Privacy · Sproutjar");

export default function PrivacyPage() {
  return (
    <LegalPage
      label="Privacy"
      title="Your numbers stay yours."
      intro="Sproutjar only knows what you tell it. Nothing connects to your bank. Here is what we keep, why, and how to make it go away."
      sections={[
        {
          title: "What you give us",
          body: (
            <>
              <p>Your first name, your country, and an email or Google or Apple account to sign in with.</p>
              <p>The money numbers you type or say to Ren: cards, balances, rates, take-home, essentials, payday, jar deposits, and the plans you make.</p>
              <p>Your answers to the four onboarding questions and the beliefs you choose to work on.</p>
            </>
          ),
        },
        {
          title: "Statements",
          body: (
            <p>
              When you paste or upload a statement, our server reads the balance, minimum, rate and dates off it and then drops the file. The statement itself is never stored and never leaves our server.
            </p>
          ),
        },
        {
          title: "Talking to Ren",
          body: (
            <>
              <p>Ren runs on ElevenLabs. While you are on a call, your voice is streamed to ElevenLabs to be understood and answered. ElevenLabs keeps a transcript of the call so Ren can pick up where you left off.</p>
              <p>Ren can see your numbers during a call, and can write back what you agree together, like a payment or a jar deposit.</p>
            </>
          ),
        },
        {
          title: "Who else touches it",
          body: (
            <>
              <p>Clerk handles sign-in. Convex stores your data. Vercel runs the app. ElevenLabs runs Ren&apos;s voice, using Google&apos;s Gemini model to think.</p>
              <p>None of them get your data for advertising. We do not sell it, share it with banks, or run ads.</p>
            </>
          ),
        },
        {
          title: "Where it lives",
          body: <p>Our servers are in the United States and the EU. If you are in the Gulf or elsewhere, your data travels there to be stored.</p>,
        },
        {
          title: "Delete everything",
          body: (
            <p>
              Open the You tab and tap &quot;Delete my account&quot;. Your cards, jars, sessions and sign-in are removed straight away. ElevenLabs call transcripts are removed within 30 days on request.
              {" "}<Link href="/delete-public" className="font-bold text-stem-700 underline underline-offset-2">Delete your account without the app, or if you cannot sign in.</Link>
            </p>
          ),
        },
        {
          title: "Children",
          body: <p>Sproutjar is for adults, 18 and over. We do not knowingly keep data about anyone younger.</p>,
        },
        {
          title: "Questions",
          body: (
            <p>
              Write to <a href={`mailto:${SUPPORT_EMAIL}`} className="font-bold text-stem-700 underline underline-offset-2">{SUPPORT_EMAIL}</a>. A person reads it.
            </p>
          ),
        },
      ]}
    />
  );
}
