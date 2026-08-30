---
name: testing-sproutjar
description: How to bring up and end-to-end test the Sproutjar Next.js app (dashboard, payoff engine, jars, commitments) and the Ren ElevenLabs voice call in a headless Devin box.
---

# Testing Sproutjar

## App shape
- Next.js 15 (App Router) + Prisma/SQLite (`DATABASE_URL="file:./dev.db"`).
- No auth: single seeded demo user (`demo@sproutjar.app`, "Layla", country AE/AED). Landing page `/`, app at `/dashboard`.
- All dashboard numbers come from `buildSnapshot()` in `src/lib/user.ts`; payoff maths in `src/lib/debt-engine.ts`, jar maths in `src/lib/jars.ts`.
- Client components drive every mutation via `fetch` + `router.refresh()`:
  `DebtBoard` (POST `/api/debts`, DELETE `/api/debts/:id`), `StrategyPicker` (PATCH `/api/profile`),
  `JarBoard` (POST `/api/jars/:id/deposit`), `CommitmentBoard` (PATCH `/api/commitments`),
  `RenSession` (GET `/api/agent/session` then ElevenLabs WebRTC).
- Agent webhook tools live under `/api/tools/*` and require an `x-api-key` header equal to `SPROUTJAR_TOOL_API_KEY`; without it they return 401 (`src/lib/tool-auth.ts`).

## Bring-up
```bash
cd <repo> && npm install
npx prisma db push && npx prisma generate && npm run db:seed
npm run dev   # http://localhost:3000
```
- After ANY change to `prisma/schema.prisma`, re-run `npx prisma db push && npx prisma generate` AND restart `next dev`.
  Symptom of a stale client: every route that calls `buildSnapshot()` (`/api/snapshot`, `/api/agent/session`,
  `/api/tools/debt-snapshot`) returns 500 with `TypeError: Cannot read properties of undefined (reading 'findMany')`.
- Do NOT run `npm run build` while `next dev` is running: the build overwrites `.next` and the dev server
  starts throwing `Cannot find module './vendor-chunks/...'`. It recovers, but a dev restart is the clean fix.
- If the page renders completely unstyled, check `curl -s localhost:3000/_next/static/css/app/layout.css?v=...`.
  A 404 there means Tailwind CSS never compiled in dev; restarting the dev server (or, as a last resort, one
  production build) regenerates it.
- Ren's ElevenLabs webhook tools point at a `cloudflared` tunnel to localhost:3000. Do not kill the tunnels or
  the port-3000 server, or Ren's tools 502.

## Making the Ren voice call testable with no audio hardware
Devin boxes have no `/dev/snd`; `getUserMedia({audio:true})` fails with `NotFoundError` and `snd-aloop` is not
available in the kernel. Create a PulseAudio virtual mic instead — Chrome does not need to be relaunched, only
its audio-service child:
```bash
sudo apt-get install -y pulseaudio pulseaudio-utils
pulseaudio --start --exit-idle-time=-1
pactl load-module module-null-sink sink_name=vsink
pactl load-module module-virtual-source source_name=vmic master=vsink.monitor
pkill -f "utility-sub-type=audio.mojom.AudioService"   # Chrome respawns it and picks up Pulse
```
Then click "Start voice session" and accept Chrome's "Use your microphones" bubble
("Allow while visiting the site"). Ren will hear silence — that is expected; what is verifiable is that the
status flips to "Ren is listening"/"Ren is speaking", the greeting appears in the transcript panel using the
seeded user's real numbers (dynamic variables are built in `src/app/api/agent/session/route.ts`), mute/unmute
toggles, and "End session" returns to idle.

## Useful invariants for assertions (default seed)
- 3 cards: ADCB Traveller 4,800 @3.25%, Emirates NBD Platinum 12,400 @3.29%, RAKBANK Titanium 21,900 @3.49%.
- Total owed AED 39,100; minimums AED 1,955/mo; surplus = 18,000 − 11,500 = AED 6,500/mo; monthly bleed AED 1,328.
- Snowball 9 months / AED 6,921 interest; avalanche 8 months / AED 5,741; snowball focus = ADCB Traveller.
- Infeasibility path: `buildPayoffPlan` returns `feasible:false` when the monthly budget is below total minimums,
  and the Debt-free card should read "Not yet" with a "short by ..." hint. Trigger it through the UI by adding a
  card whose minimum pushes total minimums above AED 6,500.
- Add-debt validation is server side only (`zod`: balance/minimum non-negative, monthlyRate 0..1). The form
  ignores the response, so an invalid submit silently leaves the board unchanged rather than showing an error.

## UI landmarks worth knowing when writing assertions
- The `Plant` SVG carries an `aria-label` of the form `A sprout in a jar. Stem at N percent, N leaf pairs, N roots.`
  That label is the cheapest way to assert plant growth — read it from the DOM alongside a screenshot.
- Plant growth is recomputed from `openingPrincipal` vs `currentPrincipal` in `src/lib/plant.ts`, so *adding* a debt
  lowers the stem percentage. If the PRD says the plant must never shrink, expect this to fail until the opening
  principal is grown alongside new debts (a huge added balance drives it to 0% / 0 leaf pairs).
- Jars show `saved / target` plus "full in N months at this rate"; when `monthsToFull` is null the copy collapses to
  a bare "· full" even for a partly-filled jar (`JarBoard.tsx`). Percent-full and stage are NOT rendered in the UI —
  verify them via `GET /api/tools/debt-snapshot` with the `x-api-key` header instead.
- Commitments disappear from "On the go" once marked and reappear as a neutral badge in "What you've worked on"
  after a reload; that is the persistence check (there is no colour change and no red styling).
- Jar deposit buttons disable while a request is in flight, so a rapid double-click registers only one deposit.

## Devin secrets needed
- `ELEVENLABS_API_KEY` (and `ELEVENLABS_AGENT_ID`, `SPROUTJAR_TOOL_API_KEY` in `.env`) for the Ren voice session.
