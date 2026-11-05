import type { Metadata } from "next";
import { ClerkProvider } from "@clerk/nextjs";
import { Nunito, Space_Grotesk } from "next/font/google";
import { clerkAppearance } from "@/lib/clerk-appearance";
import "./globals.css";

const nunito = Nunito({
  variable: "--font-nunito",
  subsets: ["latin"],
  weight: ["300", "400", "600", "700", "800"],
});

const spaceGrotesk = Space_Grotesk({
  variable: "--font-space-grotesk",
  subsets: ["latin"],
  weight: ["700"],
});

export const metadata: Metadata = {
  title: "Sproutjar: grow out of debt habits into savings habits",
  description:
    "A voice-first financial wellness coach that starts with a realistic payoff plan for credit-card debt in the Gulf.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <ClerkProvider appearance={clerkAppearance} signInUrl="/sign-in" signUpUrl="/sign-in" signInFallbackRedirectUrl="/onboarding" signUpFallbackRedirectUrl="/onboarding">
      <html lang="en">
        <body className={`${nunito.variable} ${spaceGrotesk.variable} antialiased`}>{children}</body>
      </html>
    </ClerkProvider>
  );
}
