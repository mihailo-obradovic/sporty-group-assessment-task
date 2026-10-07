# Design System

**Trigger:** writing or changing anything visual in `app/` — a colour, a font, a size, a slant, a Nuxt UI theme config in `app/config/nuxt-ui/`, or `app/assets/styles/main.css`.

The project's instance of `stacks/frontend/_common/design-system.md`, holding the values of the mockup at `design/league-list-mockup.html` (2026-10-07) as they map onto Nuxt UI. The mockup is the picture; this annex is the rule set. Sections the mockup does not decide are left out, and the template's house defaults apply there.

## 1. Colour

**Dark only** (user, 2026-10-07). The colour-mode module is off (`ui.colorMode: false`) and the root element carries `class="dark"` permanently, so there is no light token set and no toggle. This waives the template's "both themes, every colour flips" rule; a light theme is a feature 001 non-goal.

Ramps are Tailwind's own, chosen as the nearest to the mockup's hexes, so no hand-derived ramp exists to drift. Aliases in `app/app.config.ts` (`ui.colors`); Nuxt UI's dark mode reads shade 400 of each alias and the neutral shades below.

| Mockup role                       | Alias / Nuxt UI token                 | Value               | Mockup    |
| --------------------------------- | ------------------------------------- | ------------------- | --------- |
| Signal red, the one accent        | `primary: 'red'`                      | red-400 `#ff6467`   | `#FF3D3D` |
| Pitch green, live source only     | `success: 'green'`                    | green-400 `#05df72` | `#35D07F` |
| Amber, fixture banner only        | `warning: 'amber'`                    | amber-400 `#ffb900` | `#FFB020` |
| Stadium navy background           | `neutral: 'slate'`, `--ui-bg`         | slate-900 `#0f172b` | `#0E1626` |
| Card surface                      | `bg-elevated/50` over `--ui-bg`       | ≈ `#162034`         | `#162136` |
| Expanded card, inputs             | `--ui-bg-elevated`                    | slate-800 `#1d293d` | `#1D2B45` |
| Lines (card ring, dividers)       | `--ui-border-accented`                | slate-700 `#314158` | `#28395A` |
| Body text / headings              | `--ui-text` / `--ui-text-highlighted` | slate-200 / white   | `#F2F5FA` |
| Muted text (Alternate name, meta) | `--ui-text-muted`                     | slate-400 `#90a1b9` | `#93A1BB` |

- **Red appears on action only:** Retry, Clear filters, the card blade on hover and expand, focus rings. Never on a badge, a heading, or decoration. The Sport tag is neutral.
- **Status keeps its own hue:** green marks the live source, amber the sample data; neither is used for anything else.
- **Solid red takes dark text.** White on red fails contrast (§6), so a solid `primary` button keeps Nuxt UI's `text-inverted` (slate-900) on red-400.
- `--ui-text-dimmed` (slate-500) is not used for text: it fails contrast (§6).

## 2. Typography

| Token            | Font                                      | Loaded at                       |
| ---------------- | ----------------------------------------- | ------------------------------- |
| `--font-sans`    | Barlow                                    | 400, 500, 600                   |
| `--font-display` | Barlow Condensed (utility `font-display`) | 700 and 800 italic, 700 upright |

Fonts are self-hosted by `@nuxt/fonts` (registered by Nuxt UI, configured in the `fonts` key after `ui`), downloaded at build time; Latin and Latin Extended cover every League name in the data.

| Role                         | Size (px → token)    | Weight / style       | Line height | Font             |
| ---------------------------- | -------------------- | -------------------- | ----------- | ---------------- |
| Wordmark                     | 26 → `text-wordmark` | 800 italic           | 1           | `--font-display` |
| League name (card `h2`)      | 28 → `text-league`   | 700 italic           | 1           | `--font-display` |
| Empty-state title            | 32 → `text-empty`    | 700 italic           | 1           | `--font-display` |
| Season label                 | 24 → `text-season`   | 700, tabular figures | 1           | `--font-display` |
| Result count (figure)        | 20 → `text-count`    | 700, tabular figures | 1           | `--font-display` |
| Body                         | 15 → `text-body`     | 400–600              | 1.5         | `--font-sans`    |
| Meta (Alternate name, notes) | 13–14 → `text-sm`    | 400                  | 1.4         | `--font-sans`    |

The size tokens are `--text-*` entries in `main.css`'s `@theme`, so each is a utility. Headings follow document order (one `h1`, the wordmark; cards are `h2`), not size.

## 3. The slant

**The slant is the brand move, and only three things skew:** the wordmark's bar (`skewX(-18deg)`), the card blade (`skewX(-10deg)`, a 6px strip on the card's left edge, line colour at rest and red on hover or expand), and the Sport tag (`skewX(-12deg)`, text counter-skewed upright). Each is one named `@utility` in `main.css` — `slant-bar`, `card-blade`, `slant-tag` — never a class string repeated per component (`customization.md`, When the theme cannot express it).

## 4. Sizing And Radius

- Touch targets 44px: the search input and Sport select, each card (the whole card is the toggle), Retry and Clear filters. The source toggle's segments are 36px, above the 24px floor.
- Radius: cards 12px (`rounded-xl`), inputs 10px, buttons and tags Nuxt UI's defaults.
- Card padding 16px, with 22px on the left to clear the blade; minimum height 108px.

## 5. Layout And Breakpoints

Viewport breakpoints only, Tailwind's defaults: single column and stacked filters below `md` (768), two columns from `md`, three from `lg` (1024). The filter bar is `sticky` at the top of `main`, which is the page's only scrolling region (`page-layout.md`), on a translucent background with a blur. Verification widths: 320, 375, 768, 1024, 1280, 1536.

## 6. Accessibility

Contrast measured from the token values above (oklch converted to sRGB), worst case:

| Foreground                               | On                      | Ratio | Passes                                             |
| ---------------------------------------- | ----------------------- | ----- | -------------------------------------------------- |
| `--ui-text` slate-200                    | slate-900 / slate-800   | 11.90 | AA                                                 |
| `--ui-text-muted` slate-400              | slate-900 / slate-800   | 5.58  | AA                                                 |
| `primary` red-400                        | slate-900 / slate-800   | 5.07  | AA                                                 |
| slate-900 on `primary` red-400           | —                       | 6.17  | AA                                                 |
| `success` green-400, `warning` amber-400 | slate-900               | 10.05 | AA                                                 |
| white on red-500                         | — (the mockup's button) | 3.82  | fails — not used                                   |
| `--ui-text-dimmed` slate-500             | slate-900               | 3.74  | fails body text — not used for text                |
| Input outline slate-500                  | slate-900               | 3.74  | 3:1 non-text — inputs use it, not slate-700 (1.73) |

Motion: the chevron turn, the spinner, and the blade colour are guarded by `motion-safe:` or a `prefers-reduced-motion` rule; skeleton pulses are opacity fades and stay.
