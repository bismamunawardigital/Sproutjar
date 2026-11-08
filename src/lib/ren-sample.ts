/** A short recorded Ren call with Layla, played in the signed-out demo instead of a live session. */
export type SampleLine = { speaker: "ren" | "layla"; text: string };

export const REN_SAMPLE: SampleLine[] = [
  { speaker: "ren", text: "Hi Layla. First: ADCB is down to forty-eight hundred dirhams since your last payday. It's your smallest card, and it's close. Do you want to look at that today, or at the grocery week that slipped?" },
  { speaker: "layla", text: "The grocery week. I shopped the day after payday again." },
  { speaker: "ren", text: "Thanks for saying it straight. One missed week doesn't undo thirty-two good ones. What makes the day after payday hard?" },
  { speaker: "layla", text: "Everyone's out, I'm tired, and I just go." },
  { speaker: "ren", text: "So maybe it's the plan that needs changing, not you. What's one small thing you'd try before the twenty-fifth?" },
  { speaker: "layla", text: "Order the groceries on Thursday night, from the sofa." },
  { speaker: "ren", text: "Thursday night, from the sofa. I'll write that down in your words." },
];
