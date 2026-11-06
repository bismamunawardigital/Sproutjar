import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { DEMO_COOKIE, GUEST_VIEW } from "@/lib/demo-cookie";

/**
 * Ren's webhook tools are called from ElevenLabs' servers and carry their own
 * shared secret, so they stay outside the session check. The demo entry is
 * public; routes that change personal data still need a signed-in session.
 */
const isProtected = createRouteMatcher(["/dashboard(.*)", "/onboarding(.*)", "/demo/exit(.*)", "/api/((?!tools/).*)"]);
const isGuestAccessible = createRouteMatcher(["/dashboard(.*)", "/api/((?!tools/|account|statement|onboarding|agent).*)"]);

export default clerkMiddleware(async (auth, request) => {
  if (!isProtected(request)) return;
  const guestDemo = request.cookies.get(DEMO_COOKIE)?.value === GUEST_VIEW;
  if (guestDemo && isGuestAccessible(request)) return;
  await auth.protect();
}, { signInUrl: "/sign-in", signUpUrl: "/sign-in" });

export const config = {
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest|pdf)).*)",
    "/(api|trpc)(.*)",
  ],
};
