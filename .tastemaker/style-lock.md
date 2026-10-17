# Style lock: UP27 Vidhan Sabha Intelligence Terminal

Established 2026-10-17 for the five-screen mockup set
(claude.ai artifact 35kXZBgZzccXtMYFvgs3J7), then implemented 2026-10-18 in
`frontend/src/index.css`. Reuse these tokens for every later screen in this
project instead of re-deriving a palette.

Decided: the light surface is the product. The terminal is kept as a reference
for the dense seat matrix, not as the default.

Mood: technical. Screen classes: app shell / data view (all five). No
marketing page in scope, so no macrostructure rotation applies.

Two surfaces, one product:

- **Paper**, the default product chrome. Light, near-achromatic, hairline
  rules, generous section rhythm.
- **Terminal**, an opt-in dense mode for the seat matrix. Bloomberg idiom:
  black ground, amber signal, monospace only, radius 0.

## Color contract

Generated with `generate_palette.py --mood technical --seed 2027`, light and
dark from the same seed, so the two surfaces are a companion pair.

### Paper (light), as implemented in `frontend/src/index.css`

The mockups used `#F0FBFB`; the build moved one step cooler and brighter. The
ramp overrides Tailwind's warm `stone` scale, so the pre-existing components
re-themed without touching their class names.

    stone-50   #F6FAFA   paper, the page ground
    stone-100  #ECF2F2   panel
    stone-200  #DCE6E5   rule
    stone-300  #C3D2D1   hairline, decorative
    stone-400  #748A89   icons and meta (3.48 on paper, UI-safe only)
    stone-500  #5A6B6B   muted text (5.33)
    stone-600  #465756   (7.24)
    stone-700  #354443   (9.70)
    stone-800  #1F2E2D   body text (13.43)
    stone-900  #0E1A1A   headings (16.91)

Teal signal ramp, named `live-*`, replaces the old `amber-*` usage. It is
interactive and live chrome only, never data:

    live-100  #D2EBEB
    live-200  #A8DADA
    live-600  #077D7E   fill only; white label clears 4.95
    live-700  #066566   text-safe on paper 6.52 and panel 6.06
    live-800  #054E4F   9.04 / 8.40

`live-600` fails as text on the panel ground (4.37), which is why `amber-600`
mapped to `live-700` and not `live-600` in the migration.

### Terminal (dark)

    text      #E5F6F6
    bg        #070E0E
    surface   #111919
    border    #1D2525
    muted     #8A9797   (6.45 on bg)
    signal    #FFB000   (10.63 on bg)

## Party colors are data, not theme

Chrome stays near-achromatic so party color is the only saturated thing on
screen. Two sets, because the repo's `PARTY_COLORS` hexes do not survive a
black ground.

    Party          Paper ink   Terminal
    BJP            #9A3412     #FFA23A
    SP             #B91C1C     #E8536B
    BSP            #1D4ED8     #4D9BFF
    INC            #047857     #34D399
    RLD            #B45309     #FFD782
    AD(S)          #7E22CE     #C9A0FF
    NISHAD         #0E7490     #4D9BFF
    SBSP           #6D28D9     #C9A0FF
    Jansatta Dal   #BE185D     #E8536B
    IND            #465756     #8A9797
    OTH            #5A6B6B     #8A9797

The paper column is live in `PARTY_COLORS` in
`frontend/src/data/upConstituencies.ts`.

Rules that came out of running the numbers:

- On paper, party color is **ink or a swatch beside a label**, never a fill
  under white text: white on `#EA580C` is 3.56 and on `#059669` is 3.77, both
  short of 4.5. On the terminal, party fills carry `#070E0E` labels instead.
- BJP and SP sit close in hue, so every use also carries the party ticker in
  text. Color is never the only carrier.
- `#C2410C` fails on `#E6F1F1` (4.49), which is why BJP ink is `#9A3412`.

## Type

    UI and body     Instrument Sans   400 / 500 / 600
    Figures         IBM Plex Mono     400 / 500, tabular-nums
    Devanagari      Noto Sans Devanagari   400 / 500
    Terminal        IBM Plex Mono only

Every number in the product is mono and tabular so columns align. Display
sizes 40-48px at -0.02em; body 16px/1.6; dense table text 12px.

## Density and spacing

Scale 4 / 8 / 12 / 16 / 24 / 32 / 48. Paper: page padding 40, section rhythm
32-48, card padding 20 and never more than the gap between cards. Terminal:
row padding 7px compact, 11px comfortable; panel padding 14.

Radius 3 on paper, 0 on the terminal. **No shadows anywhere**, hairline
`1px` rules only.

## Dark mode

Not a runtime toggle. Terminal is a separate mode a user opts into, not a
theme switch over the same layout.

## Assets

No photography, illustration or icon set fetched: these are data screens, and
every visual is drawn from the project's own numbers (cartogram cells, bars,
histogram, propagation diagram). Icons are inline stroke SVG, one family,
1.5-2px weight. No emoji.

## Motion

The app-shell track, not a scroll track: these are screens people work inside.

Implemented: the district bubble magnet in `DistrictBubbles.tsx`. `forceX` and
`forceY` hold every bubble against a home point per region, so a dragged
bubble is pinned with `fx`/`fy` while held and springs back when released. A
dashed tether is drawn from the home point to the held bubble so the pull is
legible, and `prefers-reduced-motion` runs the simulation to a settled layout
once, then snaps a released bubble home with no spring.

No animation dependency was added. `d3-force` and `d3-drag` were already in
`package.json`, which is also why GSAP and Motion are absent: the physics here
is a simulation, not a timeline. Motion's `dragSnapToOrigin` would be the
React-idiomatic alternative if a dependency becomes acceptable.

The landing page runs the one scroll track in the product: a sticky canvas
over a four-viewport section, scrubbed by a rAF loop reading the section's
scroll ratio. 403 strands, one per seat, coloured by projected winner, move
through four formations (wire bundle, chamber arc, closed ring, district
clusters). Reduced motion snaps to the nearest formation.

Still owed: panel and tab transitions, staggered table entrances on data load,
skeleton states.

## Landing page

Reference: `idea.mp4` in the repo root, an IRIS_AI concept. What was taken is
the structure, never the artwork: near-white ground, a single object that
transforms continuously as the page scrolls while the copy swaps around it,
parenthesised wordmark, right-aligned nav with north-east arrows, section
markers `( A )` to `( D )`, an `[ 001 /004 ]` counter, and an oversized
display headline broken by one italic word. The reference's amber fibre render
is replaced by the product's own seat data, which is also why there is no
decorative glow: the only saturated colour on the page is party colour.

## Geography note

The seat map screen proposes a **403-cell cartogram grouped by region**
instead of the geographic choropleth. One cell per segment means a city seat
reads as loud as a rural one. The geojson map in `frontend/public` stays the
alternate view, not the default.
