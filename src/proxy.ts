import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

/**
 * Ren's webhook tools are called from ElevenLabs' servers and carry their own
 * shared secret, so they stay outside the session check. Everything a person
 * sees or changes about their own money needs a signed-in session.
 */
const isProtected = createRouteMatcher(["/dashboard(.*)", "/onboarding(.*)", "/demo(.*)", "/api/((?!tools/).*)"]);

export default clerkMiddleware(async (auth, request) => {
  if (isProtected(request)) await auth.protect();
});

export const config = {
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest|pdf)).*)",
    "/(api|trpc)(.*)",
  ],
};
