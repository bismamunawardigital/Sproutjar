import { ConvexHttpClient } from "convex/browser";

const url = process.env.NEXT_PUBLIC_CONVEX_URL;

if (!url) {
  throw new Error("NEXT_PUBLIC_CONVEX_URL is not set. Run `npx convex dev` to provision a deployment.");
}

/**
 * Every read and write of a user's money goes through Convex. The dashboard,
 * the API routes and Ren's tools all talk to the same live deployment, so a jar
 * deposit Ren logs mid-call is on screen by the time she finishes the sentence.
 */
export const convex = new ConvexHttpClient(url);
