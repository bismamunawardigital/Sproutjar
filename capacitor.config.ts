import type { CapacitorConfig } from "@capacitor/cli";

/**
 * The phone app is a thin shell: the WebView loads the live site, so every
 * change shipped to www.sproutjar.app reaches the app without a store update.
 * `webDir` only holds the offline fallback page.
 */
const config: CapacitorConfig = {
  appId: "app.sproutjar",
  appName: "Sproutjar",
  webDir: "capacitor/www",
  backgroundColor: "#f2ede4",
  server: {
    url: "https://www.sproutjar.app",
    allowNavigation: ["www.sproutjar.app", "sproutjar.app", "*.clerk.accounts.dev", "accounts.google.com", "appleid.apple.com"],
  },
  android: {
    allowMixedContent: false,
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 0,
      backgroundColor: "#f2ede4",
      splashImmersive: false,
    },
    // Cream background everywhere, so dark icons in the status and gesture bars.
    SystemBars: {
      style: "LIGHT",
    },
  },
};

export default config;
