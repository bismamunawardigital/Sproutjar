import { pageMetadata } from "@/lib/metadata";
import { LegalPage } from "@/components/LegalPage";
import { SUPPORT_EMAIL } from "@/lib/legal";

export const metadata = pageMetadata("Help · Sproutjar");

export default function HelpPage() {
  return (
    <LegalPage
      label="Help"
      title="Stuck? Start here."
      intro="The questions people ask most. If yours is not here, the email at the bottom goes to a human."
      dated={false}
      sections={[
        {
          title: "Does Sproutjar connect to my bank?",
          body: <p>No. You type your numbers, paste a statement, or tell Ren. Nothing reads your account.</p>,
        },
        {
          title: "Ren cannot hear me",
          body: (
            <p>
              Check the microphone permission for Sproutjar in your phone settings, and that no other app is using the mic. Headphones help in noisy places.
            </p>
          ),
        },
        {
          title: "I paid a card. How do I update it?",
          body: <p>Plan tab, find the card, tap &quot;I paid this&quot; and type the amount. Or just tell Ren on your next call.</p>,
        },
        {
          title: "The numbers look off",
          body: (
            <p>
              Open the You tab. Take-home, essentials and payday drive the whole plan. A guessed rate or minimum on a card is marked, tap Edit on the card to fix it.
            </p>
          ),
        },
        {
          title: "My statement would not upload",
          body: <p>Only text PDFs work, the kind your bank emails. Scanned or photographed statements will not. Copy the text and paste it instead.</p>,
        },
        {
          title: "Delete my account",
          body: <p>You tab, bottom, &quot;Delete my account&quot;. Everything goes, straight away.</p>,
        },
        {
          title: "Still stuck",
          body: (
            <p>
              Email <a href={`mailto:${SUPPORT_EMAIL}`} className="font-bold text-stem-700 underline underline-offset-2">{SUPPORT_EMAIL}</a>. Say what you were doing and what you saw. A person replies within a couple of days.
            </p>
          ),
        },
      ]}
    />
  );
}
