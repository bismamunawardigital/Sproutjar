import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import vm from "node:vm";
import { renderToStaticMarkup } from "react-dom/server";
import PublicDeletionPage from "../app/delete-public/page";
import manifest from "../app/manifest";
import { SystemPage } from "../components/SystemPage";
import { SUPPORT_EMAIL } from "./legal";
import { pageMetadata } from "./metadata";
import { onboardingRedirect } from "./onboarding-route";
import config from "../../next.config";

test("completed onboarding routes to Today and new or incomplete accounts stay in onboarding", () => {
  assert.equal(onboardingRedirect(1700000000000), "/dashboard");
  assert.equal(onboardingRedirect(undefined), null);
  assert.equal(onboardingRedirect(0), null);
});

test("public deletion works without a session or a deletion request backend", () => {
  const html = renderToStaticMarkup(<PublicDeletionPage />);
  assert.match(html, /Delete my account/);
  assert.match(html, /href="\/sign-in\?redirect_url=%2Fdashboard%2Fyou"/);
  assert.ok(html.includes(`mailto:${SUPPORT_EMAIL}?subject=`));
  assert.match(html, /30 days on request/);
  assert.doesNotMatch(html, /<form|<input|email.*code|confirmation.*sent/i);
});

test("system screens have a way home, including for signed-in people", () => {
  const empty = renderToStaticMarkup(<SystemPage title="This page didn't grow." description="The link may be old. Your plan is safe." />);
  assert.match(empty, /href="\/"/);
  const error = renderToStaticMarkup(<SystemPage title="That was us, not you." description="Try again." homeHref="/dashboard"><button>Try again</button></SystemPage>);
  assert.match(error, /href="\/dashboard"/);
  assert.match(error, /<button>Try again<\/button>/);
});

test("page metadata includes a title, description and share image", () => {
  const metadata = pageMetadata("Today · Sproutjar");
  assert.equal(metadata.title, "Today · Sproutjar");
  assert.ok(metadata.description);
  assert.equal(metadata.openGraph?.title, metadata.title);
  assert.ok(metadata.openGraph?.images);
  assert.equal(pageMetadata("Help", "Support for Sproutjar").openGraph?.description, "Support for Sproutjar");
});

test("manifest and icons provide install sizes and a maskable safe zone", async () => {
  const data = manifest();
  assert.equal(data.display, "standalone");
  assert.equal(data.scope, "/");
  assert.equal(data.start_url, "/dashboard");
  assert.ok(data.icons?.some((icon) => icon.purpose === "maskable"));
  for (const icon of data.icons ?? []) {
    const png = await readFile(`public${icon.src}`);
    assert.equal(`${png.readUInt32BE(16)}x${png.readUInt32BE(20)}`, icon.sizes);
  }
});

test("security headers keep the mic and required services available", async () => {
  const routes = await config.headers!();
  const headers = routes.find((route) => route.source === "/:path*")!.headers;
  const csp = headers.find((header) => header.key === "Content-Security-Policy-Report-Only")!.value;
  for (const host of ["clerk.sproutjar.app", "*.accounts.dev", "*.convex.cloud", "wss://*.convex.cloud", "wss://*.elevenlabs.io", "wss://*.livekit.cloud", "vercel.live"]) {
    assert.ok(csp.includes(host), host);
  }
  assert.ok(headers.some((header) => header.key === "X-Content-Type-Options" && header.value === "nosniff"));
  assert.ok(headers.some((header) => header.key === "X-Frame-Options" && header.value === "SAMEORIGIN"));
  assert.ok(headers.some((header) => header.key === "Permissions-Policy" && header.value.includes("microphone=(self)")));
});

type WorkerEvent = { request?: { url: string; method: string; mode: string }; waitUntil: (promise: Promise<unknown>) => void; respondWith: (response: Promise<Response>) => void };

async function worker(offline: Response | null = new Response("offline"), online = true) {
  const listeners: Record<string, (event: WorkerEvent) => void> = {};
  const added: string[] = [];
  const deleted: string[] = [];
  const network = new Response("network");
  let claimed = false;
  vm.runInNewContext(await readFile("public/sw.js", "utf8"), {
    URL, Response,
    self: {
      location: { origin: "https://www.sproutjar.app" },
      addEventListener: (name: string, listener: (event: WorkerEvent) => void) => { listeners[name] = listener; },
      skipWaiting() {},
      clients: { claim: () => { claimed = true; } },
    },
    fetch: async () => { if (!online) throw new Error("offline"); return network; },
    caches: {
      open: async () => ({ add: async (path: string) => { added.push(path); } }),
      keys: async () => ["sproutjar-offline-v0", "sproutjar-offline-v1", "another-app"],
      delete: async (key: string) => { deleted.push(key); },
      match: async () => offline,
    },
  });
  const dispatch = async (name: string, path = "/dashboard", method = "GET", mode = "navigate") => {
    let pending: Promise<unknown> = Promise.resolve();
    let response: Promise<Response> | undefined;
    listeners[name]({
      request: { url: new URL(path, "https://www.sproutjar.app").href, method, mode },
      waitUntil: (promise) => { pending = promise; },
      respondWith: (promise) => { response = promise; },
    });
    await pending;
    return response;
  };
  return { dispatch, added, deleted, network, claimed: () => claimed };
}

test("worker caches only the public offline page and removes only its old cache", async () => {
  const sw = await worker();
  await sw.dispatch("install");
  await sw.dispatch("activate");
  assert.deepEqual(sw.added, ["/offline.html"]);
  assert.deepEqual(sw.deleted, ["sproutjar-offline-v0"]);
  assert.ok(sw.claimed());
  assert.equal(await sw.dispatch("fetch"), sw.network);
  assert.deepEqual(sw.added, ["/offline.html"]);
});

test("worker does not intercept API, auth, demo, external or non-navigation requests", async () => {
  const sw = await worker();
  for (const path of ["/api/account", "/api/tools/payoff-plan", "/sign-in", "/sign-in/sso-callback", "/sign-up", "/onboarding", "/demo", "/demo/exit", "/__clerk", "/.well-known/clerk", "https://clerk.sproutjar.app/", "https://example.convex.cloud/"]) {
    assert.equal(await sw.dispatch("fetch", path), undefined, path);
  }
  assert.equal(await sw.dispatch("fetch", "/dashboard", "POST"), undefined);
  assert.equal(await sw.dispatch("fetch", "/dashboard", "GET", "cors"), undefined);
});

test("worker falls back on connection failure and handles an empty cache", async () => {
  const sw = await worker(new Response("Could not reach Sproutjar."), false);
  assert.equal(await (await sw.dispatch("fetch"))!.text(), "Could not reach Sproutjar.");
  const empty = await worker(null, false);
  assert.equal((await empty.dispatch("fetch"))?.type, "error");
  assert.equal((await empty.dispatch("fetch"))?.status, 0);
});
