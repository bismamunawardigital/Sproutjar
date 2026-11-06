import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { DEMO_COOKIE, GUEST_VIEW } from "@/lib/demo-cookie";

/**
 * Ren's webhook tools are called from ElevenLabs' servers and carry their own
 * shared secret, so they stay outside the session check. The demo entry is
 * public; routes that change personal data still need a signed-in session.
 */
const isProtected = createRouteMatcher(["/dashboard(.*)", "/onboarding(.*)", "/demo/exit(.*)", "/api/((?!tools/).*)"]);
const isGuestAccessible = createRouteMatcher(["/dashboard(.*)", "/api/((?!tools/|account|statement|onboarding|agent).*)"]);
const isAgentSession = createRouteMatcher(["/api/agent/session"]);
const isApiRoute = createRouteMatcher(["/api(.*)"]);

export default clerkMiddleware(async (auth, request) => {
  if (isAgentSession(request)) return;
  if (!isProtected(request)) return;
  const guestDemo = request.cookies.get(DEMO_COOKIE)?.value === GUEST_VIEW;
  if (guestDemo && isGuestAccessible(request)) return;
  if (isApiRoute(request)) {
    await auth.protect();
    return;
  }
  const { userId, redirectToSignIn } = await auth();
  if (!userId) return redirectToSignIn({ returnBackUrl: request.url });
}, { signInUrl: "/sign-in", signUpUrl: "/sign-in" });

export const config = {
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest|pdf)).*)",
    "/(api|trpc)(.*)",
  ],
};
