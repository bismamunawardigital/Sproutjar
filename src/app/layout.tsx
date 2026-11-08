import type { Metadata, Viewport } from "next";
import { ClerkProvider } from "@clerk/nextjs";
import { clerkAppearance } from "@/lib/clerk-appearance";
import { pageMetadata } from "@/lib/metadata";
import { ServiceWorker } from "@/components/ServiceWorker";
import "./globals.css";

export const metadata: Metadata = {
  ...pageMetadata("Sproutjar: grow out of debt habits into savings habits"),
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || "https://www.sproutjar.app"),
  appleWebApp: { capable: true, title: "Sproutjar", statusBarStyle: "default" },
  icons: { apple: "/icons/apple-touch-icon.png" },
};

export const viewport: Viewport = { themeColor: "#22302a" };

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <ClerkProvider appearance={clerkAppearance} signInUrl="/sign-in" signUpUrl="/sign-in" signInFallbackRedirectUrl="/onboarding" signUpFallbackRedirectUrl="/onboarding">
      <html lang="en">
        <body className="antialiased">{children}<ServiceWorker /></body>
      </html>
    </ClerkProvider>
  );
}
