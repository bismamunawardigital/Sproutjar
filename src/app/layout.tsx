import type { Metadata } from "next";
import { Nunito, Space_Grotesk } from "next/font/google";
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
  title: "Sproutjar — debt recovery coaching with Ren",
  description:
    "Sproutjar is a debt recovery coaching product for salaried professionals in the Gulf. Ren is the coach inside it: every session arrives with a length, an agenda, and a reason for that agenda.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body className={`${nunito.variable} ${spaceGrotesk.variable} antialiased`}>{children}</body>
    </html>
  );
}
