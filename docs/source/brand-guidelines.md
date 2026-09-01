# Sproutjar — Brand & Design System

**v2.0 · August 2026** · Mobile first · Light mode only

A debt-recovery coaching product for salaried professionals in the UAE. Ren is the coach inside it.

---

## Personality

Grounded · Unflinching · Warm · Precise · Patient

**Governing rule:** red never describes the user's money. Shame increases avoidance, and avoidance is the mechanism the product exists to interrupt.

**We are:** a coach who has read your statement. Specific about consequences. Comfortable saying "that's a lawyer's question."
**We are not:** a budgeting app, a sassy chatbot, a wellness brand, a debt settlement firm, a financial adviser, a scoreboard.

---

## Colour

Every value derives from the growth animation.

### Ground & surface
| Token | Hex | Use |
|---|---|---|
| `cream` | `#F2EDE4` | App background |
| `cream-2` | `#E8E1D4` | Ghost hover, neutral chip |
| `card` | `#FDFCF8` | Cards, all figure surfaces |
| `rule` | `#DED6C8` | Borders, dividers |

### Ink — text and every interactive control
| Token | Hex | Use |
|---|---|---|
| `ink-900` | `#141D19` | Deepest |
| `ink-800` | `#22302A` | **Body text. All buttons. Ren's card.** |
| `ink-700` | `#2F433A` | Button hover |
| `ink-500` | `#4A5C52` | Secondary prose |
| `ink-400` | `#5C6B62` | Labels, hints |
| `ink-300` | `#8C9990` | On-dark muted |

### Stem & leaf — growth, principal cleared
| Token | Hex | Use |
|---|---|---|
| `stem-700` | `#2F6243` | Chip text |
| `stem-600` | `#3D7A55` | **Principal cleared figures. White cards only.** |
| `stem-500` | `#4E9A6B` | — |
| `stem` | `#5FA877` | Stem, focus ring, logo field on dark |
| `leaf-400` | `#6FBF88` | Right leaves |
| `leaf-300` | `#92D3A3` | Left leaves, Ren's text on dark |
| `leaf-100` | `#DEEADF` | Growth chip |
| `leaf-50` | `#EFF6F0` | Tints |
| `lid` | `#C8DACB` | The lid, secondary button border |

The lighter greens fail contrast on cream. **Every figure sits on a white card.**

### Soil & root — cost, rent on the debt
| Token | Hex | Use |
|---|---|---|
| `soil` | `#B98F63` | The soil |
| `soil-light` | `#D4B48F` | Soil highlight |
| `root` | `#7A6248` | Roots, **all interest figures** |
| `root-50` | `#F1E9DF` | Cost chip |

**Why brown, not red:** interest is the most demoralising number in the product. An alarm colour turns a fact into a verdict. Brown keeps it botanical and reads as ground, not danger.

### Amber & danger
| Token | Hex | Use |
|---|---|---|
| `amber` | `#E8A94B` | **Breakthrough only.** Milestone sparks, debt closed, graduation |
| `amber-50` | `#FAEEDA` | Milestone chip |
| `amber-900` | `#7A5410` | Milestone chip text |
| `danger` | `#B4453A` | **Destructive UI actions only** |
| `danger-50` | `#F7E4E2` | Destructive hover |

✅ ink-800 for anything clickable · stem-600 for progress that cost the user something · root for every interest figure · amber only at a breakthrough
❌ green buttons · red on any user money figure · amber on ordinary chips · a sixth hue

---

## Type

**Nunito everywhere** with tabular numerals. **Space Grotesk 700 in the logo wordmark only.**

| Token | Size / LH | Weight | Use |
|---|---|---|---|
| display | 34 / 1.15, −0.02em | 800 | Debt-free date, hero |
| h1 | 26 / 1.2 | 800 | Screen titles |
| h2 | 20 / 1.3 | 700 | Card and session titles |
| body | 16 / 1.6 | 400 | Default, Ren's dialogue |
| body-sm | 14 / 1.55 | 400 | Table cells, secondary |
| label | 10 / 1.4, 0.08em caps | 800 | Stat and field labels |
| hint | 12 / 1.5 | 400 | Field hints, captions |
| figure-xl | 28 / 1.1 | 800 | Hero figures |
| figure | 20 / 1.3 | 800 | Stat values |

✅ every figure gets `font-variant-numeric: tabular-nums` and weight 800
❌ proportional numerals · Space Grotesk outside the logo · weight 900 · italics except a user's quoted belief

---

## Logo

Sprout cut from a solid rounded square, `rx` 26 on a 100×100 viewBox.

- Field `#22302A` on light backgrounds, `#5FA877` on dark
- Stem and upper leaf `#F2EDE4`, lower leaf `#5FA877` (inverted on the dark field)
- Wordmark: Space Grotesk 700, lowercase, −0.03em
- Clear space equals the corner radius. Minimum mark 20px
- Never: rotate, gradient, outline the field, recolour leaves, place on a photograph

---

## Space & shape

4px grid. Mobile gutters 16px. Single column below 768px. Minimum touch target 44px.

| Token | px | Use |
|---|---|---|
| `s1`–`s16` | 4, 8, 12, 16, 20, 24, 32, 40, 48, 64 | — |
| `s4` | 16 | Default gap |
| `s6` | 24 | Card padding |
| `s8` | 32 | Between groups |

| Shape | Value | Use |
|---|---|---|
| `r-btn` / `r-input` / `r-chip` | `999px` | Buttons, inputs, chips |
| `r-card` | `16px` | Cards, Ren, modals |
| `r-sm` | `10px` | Nested blocks |
| `sh-1` | `0 1px 2px rgba(34,48,42,.05)` | Cards at rest |
| `sh-2` | `0 4px 14px rgba(34,48,42,.09)` | Hover, sheets |
| `sh-3` | `0 12px 32px rgba(34,48,42,.13)` | Modals |

---

## Motion

**Four laws.**
1. Progress animates. Cost does not. A rising balance appears without ceremony.
2. Nothing shakes, flashes, or turns red in response to the user's money.
3. The plant never wilts, shrinks, or loses a leaf. Ever.
4. Springs, not eases. Squash and stretch, borrowed from the growth animation.

| Token | Duration | Easing | Use |
|---|---|---|---|
| `d-fast` | 150ms | `e-out` | Hover, press, toggle |
| `d-base` | 240ms | `e-out` | Sheet, tooltip, tab |
| `d-slow` | 420ms | `e-settle` | Screen transition |
| `d-count` | 900ms | `e-settle` | Figures counting up |
| `d-grow` | 1400ms | `e-spring` | Stem extending, leaf unfurling |
| `d-escape` | 2200ms | `e-spring` | Graduation, lid tipping |

| Easing | Curve |
|---|---|
| `e-out` | `cubic-bezier(.16,1,.3,1)` |
| `e-spring` | `cubic-bezier(.28,1.6,.5,1)` |
| `e-settle` | `cubic-bezier(.25,.6,.35,1)` |

### Micro-win sequence — 2.8s, fires when a check-in reduces principal
| t | Event |
|---|---|
| 0ms | Principal cleared counts up from 0 (`d-count`) |
| 300ms | Stem extends toward the lid (`e-spring`), small overshoot then settle |
| 900ms | New leaf pair unfurls, staggered 80ms, flutters once |
| 1600ms | Debt-free date slides to new value, old fades beneath |
| 2200ms | If a milestone was crossed: three amber sparks pop above the plant |

### Root sequence — 1.4s, fires on a commitment kept or a session completed
| t | Event |
|---|---|
| 0ms | Root strand draws downward via `stroke-dashoffset` (`d-grow`) |
| 700ms | Existing roots thicken by 0.5px |
| 1000ms | Caption fades in: "roots went deeper" |

`prefers-reduced-motion` replaces every sequence with an immediate state change plus a static caption. Information is never carried by motion alone.

---

## Components

### Buttons
| Variant | Fill | Text | Use |
|---|---|---|---|
| Primary | ink-800 | cream | One per screen |
| Secondary | transparent, lid border | ink-800 | Supporting |
| Ghost | transparent | ink-400 | Skip, dismiss, cancel |
| Ren | ink-800 | leaf-300 | Anything that opens Ren |
| Destructive | transparent, danger border | danger | Irreversible, needs confirmation |

Sizes: sm `13px / 8px 16px` · default `15px / 10px 22px` · lg `17px / 13px 28px`
Focus ring `2.5px solid #5FA877`, 2px offset, every variant.

### Forms
Labels 13px/700 ink-700. Inputs 15px, `10px 16px`, `r-input`, 1.5px rule border.
Focus: stem border + `0 0 0 3px leaf-50`. Numeric inputs tabular, weight 700.
Hints teach something true: "That's 44.28% a year."

### Chips
10px, 800, uppercase, 0.06em, `r-chip`.
`c-grow` leaf-100/stem-700 · `c-cost` root-50/root · `c-amber` amber-50/amber-900 · `c-neutral` cream-2/ink-500

### Stats
Label 10px/800/uppercase/0.08em/ink-400. Value 20px/800/tabular.
Principal in stem-600, interest in root, neutral in ink-800.

### Ren
Dark card, `ink-800` background, `r-card`, `16px 20px` padding, cream text.
Header: 24px orb + "Ren" in leaf-300, 12px, 800, 0.04em.
Orb is `radial-gradient(circle at 32% 28%, #92D3A3, #3D7A55 70%)`.

**The orb is the only gradient permitted in the system.** It is a placeholder for a reactive voice-state indicator with distinct listening, thinking and speaking states. Build against it; replace it deliberately.

### Tables
Stacked rows below 768px, table above. Headers 10px uppercase 0.08em ink-400.
Numeric columns right-aligned, tabular, two decimals always.

---

## The plant

The only progress instrument. Replaces progress bars, streaks, badges, scores. The jar never changes. The plant is the character.

| Element | Driven by | Cadence |
|---|---|---|
| **Stem height** | Principal cleared ÷ opening principal. 0% at the soil line, 100% at the lid | Every check-in |
| **Leaf pairs** | One per milestone. Threshold = opening principal ÷ 8, rounded to nearest 500 | At each threshold |
| **Root depth & count** | Weeks active, sessions completed, commitments **kept**. Never money | Weekly |
| **Amber sparks** | Milestone crossed, debt closed, graduation | Rare |
| **Lid** | Fixed. Tips off only at graduation | Once |

**The stem grows on money. The roots grow on the work.** On a slow month the stem barely moves but the roots still go down, so there is always something to come back for.

| Rule | Reason |
|---|---|
| Never wilts, shrinks, or loses a leaf | A bad week is when people abandon |
| The stem can hold still | Honesty requires it. Holding still is not punishment |
| Growth earned by principal cleared, never logins | Otherwise it's a streak counter |
| Lid stays on until every debt is cleared | Escaping is graduation and must not be spent early |

---

## Dashboard hierarchy (fixed)

1. Plant + debt-free date — largest element
2. Next session card — agenda, minutes, and **why** that agenda
3. This week's commitment — Done / Not this time, weighted equally
4. What I believe about money — user's words, editable
5. Debt list
6. What changed this week, in plain sentences
7. Session timeline

---

## Session card

Every session states **length, agenda, and why that agenda**. Never a bare "chat with Ren". The "why" cites the pattern in the data and the belief the user named, with the date they named it.

Ren opens every session with:
> "Would you like clarity, a decision, a plan, or simply space to understand it better?"

---

## Voice

| Moment | Phrasing |
|---|---|
| Challenge | "Can I take your permission to surface something I noticed?" |
| Education | "There's a mechanism that might explain this. Would it help if I explained it?" |
| After a miss | "What happened between deciding and the moment it didn't happen?" |
| Ownership | "Is that something you genuinely intend to do, or something that sounds like the right answer?" |

### Number formatting
| Rule | Format |
|---|---|
| Currency | `AED 14,900.00` |
| Compact | `14,900` |
| Never | `د.إ 14900` · `14,900 AED` · `$14,900` · `AED14,900` |
| Rate | `3.69% / month · 44.28% / year` |
| **Rate rule** | A monthly rate **never** appears without its annual equivalent |
| Debt-free date | `March 2029` |
| Date change | `6 weeks earlier` |
| Principal label | **Principal cleared** |
| Interest label | **Rent on the debt (interest)** — parenthetical on first use per screen |
| Estimates | Always carry an `Estimated` chip |
| Decimals | Two places on all money, including whole amounts |

✅ Log this week · Done · Not this time · Talk to Ren · Add a debt · Rebuild the plan · Start · 15 min · Pick up from here
❌ Submit · Continue · Get started · Learn more · Let's go! · Crush your debt · Take control · Keep your streak alive

---

## The ten rules

1. Red never describes the user's money.
2. The plant never wilts.
3. The stem grows on money. The roots grow on the work.
4. Growth is never earned by logging in.
5. Every figure is tabular and weight 800.
6. A monthly rate never appears without its annual equivalent.
7. Ren asks permission before challenging, teaching, or suggesting.
8. Every session states its length, its agenda, and why that agenda.
9. Ren speaks from the dark card. Data never does.
10. No guaranteed outcomes in any copy.

---

## Setup

React + Vite, Tailwind, shadcn/ui, Convex. Mobile first, light only.

```bash
npx shadcn@latest init
npx shadcn@latest add button input select switch card badge alert dialog sheet tabs toast
```

```html
<link href="https://fonts.googleapis.com/css2?family=Nunito:wght@300..900&family=Space+Grotesk:wght@700&display=swap" rel="stylesheet">
```

```js
// tailwind.config.js
export default {
  theme:{ extend:{
    colors:{
      cream:{DEFAULT:'#F2EDE4',2:'#E8E1D4'}, card:'#FDFCF8', rule:'#DED6C8',
      ink:{900:'#141D19',800:'#22302A',700:'#2F433A',500:'#4A5C52',400:'#5C6B62',300:'#8C9990'},
      stem:{DEFAULT:'#5FA877',700:'#2F6243',600:'#3D7A55',500:'#4E9A6B'},
      leaf:{400:'#6FBF88',300:'#92D3A3',100:'#DEEADF',50:'#EFF6F0'},
      soil:{DEFAULT:'#B98F63',light:'#D4B48F'}, root:{DEFAULT:'#7A6248',50:'#F1E9DF'},
      amber:{DEFAULT:'#E8A94B',50:'#FAEEDA',900:'#7A5410'},
      lid:'#C8DACB', danger:{DEFAULT:'#B4453A',50:'#F7E4E2'},
    },
    fontFamily:{ sans:['Nunito','system-ui','sans-serif'], logo:['Space Grotesk','sans-serif'] },
    borderRadius:{ sm:'10px', card:'16px', pill:'999px' },
    transitionTimingFunction:{
      out:'cubic-bezier(.16,1,.3,1)',
      spring:'cubic-bezier(.28,1.6,.5,1)',
      settle:'cubic-bezier(.25,.6,.35,1)' },
    transitionDuration:{ count:'900ms', grow:'1400ms', escape:'2200ms' },
  }}
}
```

```css
.n, td.num, input[type=number] {
  font-variant-numeric: tabular-nums;
  font-weight: 800;
}
```

### shadcn mapping
| shadcn token | Sproutjar |
|---|---|
| `primary` | ink-800 |
| `primary-foreground` | cream |
| `secondary` | transparent + lid border |
| `destructive` | danger, outline variant only |
| `ring` | stem |
| `background` / `card` | cream / card |
| `border` | rule |
| `muted-foreground` | ink-400 |
| `success` / `warning` | **Do not use.** This system has no warning colour by design |
