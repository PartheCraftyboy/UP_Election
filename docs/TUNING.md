# Tuning the landing page

Everything below lives in `frontend/src/components/Landing.tsx` as a named
constant near the top of the file. Line numbers move as the file changes, so
search for the name rather than trusting the number.

The page is one `<canvas>` drawn every frame from a scroll value. React
re-renders four times a page, once per section; everything else is painted.
That is why there are so many numbers here and almost no CSS.

## Scroll

Two different things get called speed.

| Constant | What it does | Now |
|---|---|---|
| `STATES * 100dvh` (in the JSX, on `scrollRef`) | The real one. The scroll distance the whole journey is spread over. `150` makes the same wheel travel cover less ground. | `4 * 100dvh` |
| `DAMPING` | How hard the drawing chases your scroll. Feel, not speed. Lower is heavier and smoother; higher is snappier. | `0.08` |
| `STATES` | How many sections. Changing it changes the length too. | `4` |

`SCROLL_HINT_THUMB` is the right-hand rail's thumb height, as a percent of
its track. The thumb's travel is computed from it, so it stays correct at any
size. Note that a percentage `translateY` resolves against the element's own
height, not the track's, which is what the travel formula corrects for.

## The tray

| Constant | What it does |
|---|---|
| `CARD_DWELL` | How long it stays out, ms |
| `TRAY_IN` / `TRAY_OUT` | Slide in and out, ms. Out is deliberately faster. |
| `CARD_REACH` | How near the pointer must be to a strand's line, px |

Hit testing measures distance to each strand's whole **segment**, not to its
start point. Raising `CARD_REACH` much past 20 starts catching the wrong
neighbour in the chamber, where strands are packed tightest.

## The colour journey

`STAGES` holds the four grounds and their inks: daylight, overcast, night,
mud. Values are interpolated in **OkLab**, not sRGB, because the sRGB path
between the night and the earth sags through a dead grey.

If you change a ground, check two things: the ink still clears 4.5:1 against
it, and the step's lightness movement still carries its hue turn. A large hue
change at equal lightness reads as a glitch. See `docs/DATA.md` for the
measurements behind the current four.

`PARTY_DAY` and `PARTY_ON_DARK` are every party's colour on a light and a
dark ground. A strand blends between its two along a precomputed ramp, driven
by the ground's own lightness rather than raw scroll position.

## Section A, the vote

| Constant | What it does |
|---|---|
| `HAND_SCENE` | Painting width, as a fraction of the smaller canvas edge |
| `HAND_BLEED` | How far past the right edge it pushes, so the arm's cut falls off screen |
| `HAND_OFFSET_Y` | Vertical placement, fraction of the viewport height |

`KALAWA` is the thread wound round the wrist. All of its positions are
fractions of the **painting**, not the canvas, so `(0, 0)` is the artwork's
top left corner.

- `centre`, `armAngle` where the band sits and which way the forearm runs
- `bandLength`, `armRadius` how wide the band is and how thick the arm is
- `wraps` visible turns of thread
- `tilt` how much each turn bows along the arm
- `twist` how far a turn slides along the arm as it crosses: this is what
  makes it a helix rather than a stack of rings
- `edgeInset` how far each arc stops short of the silhouette. The arm is not
  a cylinder, so arcs drawn to the full ellipse overshoot the real edge and
  appear to float off it
- `endFade` alpha where the thread curves out of sight

Only the front half of each turn is drawn. The back is behind the arm, so it
is not drawn faint, it is not drawn at all.

## Section B, the chamber

| Constant | What it does |
|---|---|
| `CHAMBER_DROP` | How far the arc's focus sits below the canvas centre. `0` puts it on the same point the ring and lotus are built around |
| `PARLIAMENT_WIDTH`, `PARLIAMENT_BOTTOM` | The assembly building behind the arc |
| `SEATING_ORDER` | Which party sits where, left to right |

In the arc the **column** sets the angle and the **row** sets the depth, so a
party fills a wedge from the floor bench to the back bench. Swapping those
two bands the arc in concentric rings instead, which is wrong.

## Section C, the ring and the state

`PLACES` holds the four paintings: `cx`, `cy`, `width`, `tilt` and `drift`.
`drift` is how strongly each one moves against the scroll; different rates per
painting are what stop the arrangement feeling pinned.

`WEIGHT` decides how long a strand is in the ring:

- `population` 0.45, `economy` 0.35, `office` 0.2, each normalised across all
  403 before weighting
- `swing` how dramatic the variation is, independent of the mix

`OFFICE_FLOOR` is a floor per office rank, and the floor wins where it is
higher. That is what keeps the Chief Minister, the Deputy and the Speaker as
the three longest strands however small their districts are.

`LIVE` is what makes the night move: `stars`, `flakes`, `flicker`. The flicker
composites each painting onto itself additively, which lifts only its
brightest paint, so the diyas gutter without the code knowing where a single
lamp is. Past about `0.2` they strobe.

## Section D, the lotus

`LOTUS_LAYERS` is one row per ring of petals: `petals`, `length`, `halfWidth`,
`turn`, `base`. Strands trace each petal's **outline**; 403 strands spread
across filled petals read as a starburst. `LOTUS_POD` is how many are held
back for the seed pod.

`MOON`: `cx`, `cy`, `r`, `halo`, `stars`. It sits off the lotus's axis so the
bloom keeps the centre.

## Brand and map

`BRAND_SIZE` scales the whole wordmark lockup, mark included.
`BRAND_CAPTION_SHIFT` pulls the caption up under it.

`MAP_WIDTH`, `MAP_SCROLLED_SCALE`, `MAP_CORNER` are the locator map's size,
what it shrinks to, and where it lands. `MAP_CORNER` is an offset from where
the map already sits, so it depends on the height of the brand above it:
change `BRAND_SIZE` and this needs revisiting.

Leave `MAP_TITLE_INSET` alone unless the artwork changes. It is measured: the
map's own "UTTAR PRADESH" title starts 4.98% in from the left edge of the
image, and this cancels that so the title lines up with the mark above it.

## The district layer

`DISTRICT_HOVER` is the highlight over the painted map: `fill` under the
pointer, `fillPicked` once the tray is showing that district, and `stroke` in
artwork units so it holds at either map scale.

The stroke is painted in the fill's own colour on purpose. A district is kept
as its constituencies' rings rather than a true union, so a contrasting
stroke would draw every seat boundary inside it and the highlight would read
as a mesh. Matching it instead closes the hairline gaps simplification leaves
between neighbouring seats.

The outlines themselves are generated, not tuned here; see
[DATA.md](DATA.md#the-district-outlines) for the fit and how to rebuild them.
The layer only takes the pointer on section A and never on a phone, where the
map is 132px across and a district is about ten pixels.

## Where to start

`STATES * 100dvh` for pacing, and `WEIGHT.swing` for how much the ring varies.
Those two change the feel more than anything else here.
