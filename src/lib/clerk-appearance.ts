import type { ComponentProps } from "react";
import type { ClerkProvider } from "@clerk/nextjs";

type Appearance = NonNullable<ComponentProps<typeof ClerkProvider>["appearance"]>;

/** Clerk's hosted sign-in, dressed in the Sproutjar palette and type. */
export const clerkAppearance: Appearance = {
  variables: {
    colorPrimary: "#2f6243",
    colorBackground: "#fdfcf8",
    colorForeground: "#141d19",
    colorMutedForeground: "#5c6b62",
    colorInput: "#f2ede4",
    colorInputForeground: "#141d19",
    colorBorder: "#ded6c8",
    colorDanger: "#b4453a",
    borderRadius: "12px",
    fontFamily: "var(--font-nunito), ui-sans-serif, system-ui, sans-serif",
    fontSize: "15px",
  },
  elements: {
    card: "shadow-none border border-rule",
    cardBox: "shadow-none",
    headerTitle: "text-[21px] font-bold",
    socialButtonsBlockButton: "rounded-full py-3 font-bold border-rule",
    formButtonPrimary: "rounded-full py-3 text-[15px] font-bold shadow-none",
    formFieldInput: "rounded-sm py-3",
    footer: "hidden",
  },
};
