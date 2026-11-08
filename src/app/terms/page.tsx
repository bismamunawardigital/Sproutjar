import { pageMetadata } from "@/lib/metadata";
import { LegalPage } from "@/components/LegalPage";
import { SUPPORT_EMAIL } from "@/lib/legal";

export const metadata = pageMetadata("Terms · Sproutjar");

export default function TermsPage() {
  return (
    <LegalPage
      label="Terms of use"
      title="The short version, in plain words."
      intro="Using Sproutjar means you are okay with what is below. We kept it readable on purpose."
      sections={[
        {
          title: "Coaching, not advice",
          body: (
            <>
              <p>Ren is a coach. Ren is not a financial adviser, a bank, a lawyer or a religious authority. Nothing in Sproutjar is a recommendation to buy, sell, borrow or move money.</p>
              <p>The plans and dates you see are worked out from the numbers you gave. Check anything important with your bank or someone qualified before you act on it.</p>
            </>
          ),
        },
        {
          title: "Your account",
          body: (
            <>
              <p>You need to be 18 or over. Keep your sign-in to yourself. You are responsible for what happens under it.</p>
              <p>One account per person. You can delete it any time from the You tab.</p>
            </>
          ),
        },
        {
          title: "Your numbers",
          body: <p>You own what you put in. You give us permission to store it and show it back to you and to Ren, so the app can work. That is all we use it for. See the privacy page for detail.</p>,
        },
        {
          title: "Fair use",
          body: <p>Do not try to break, scrape, copy or resell Sproutjar, or use it for anyone other than yourself. Do not feed Ren content meant to harm anyone.</p>,
        },
        {
          title: "What we cannot promise",
          body: (
            <p>
              Sproutjar is offered as it is. We work hard to keep it up and accurate, but we cannot guarantee it will always be available, free of mistakes, or right for your situation. We are not liable for money decisions you make, or for losses that come from using the app.
            </p>
          ),
        },
        {
          title: "Changes and endings",
          body: (
            <p>
              We may change the app or these terms. If a change matters, we will say so in the app. We may close accounts that break these terms. You can leave whenever you like.
            </p>
          ),
        },
        {
          title: "Which law",
          body: <p>These terms follow the laws of the United Arab Emirates.</p>,
        },
        {
          title: "Talk to us",
          body: (
            <p>
              Anything unclear, write to <a href={`mailto:${SUPPORT_EMAIL}`} className="font-bold text-stem-700 underline underline-offset-2">{SUPPORT_EMAIL}</a>.
            </p>
          ),
        },
      ]}
    />
  );
}
