import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Constituency, PoliticalParty } from '../types';
import { PARTY_COLORS } from '../data/upConstituencies';
import { MLA_NAMES_HINDI } from '../data/mlaRegistry';
import { TabKey } from './Navbar';

interface LandingProps {
  allConstituencies: Constituency[];
  onEnter: (tab: TabKey) => void;
}

/**
 * Scroll-scrubbed hero. One strand per sitting member, coloured by their
 * party's own colour, carried through four formations: the incoming wire
 * bundle, the chamber arc, the closed ring, and the district clusters the
 * terminal opens on.
 *
 * Smoothness comes from three things, in order of how much they matter:
 *   1. React never re-renders on scroll. The canvas reads refs; state changes
 *      only when the active section index does, so four times a page.
 *   2. The scroll ratio is not drawn directly. A damped follow eases the drawn
 *      value toward it every frame, frame-rate independent, so a coarse wheel
 *      tick becomes a glide rather than a jump.
 *   3. The loop runs continuously and the strands breathe, so the object is
 *      never frozen between scrolls.
 *
 * No animation dependency: this is a rAF loop and a lerp.
 */

const STATES = 4;

/**
 * How far the chamber's focus sits below the canvas centre, as a fraction of
 * the smaller edge. 0 puts the speaker's chair on the exact centre, the same
 * point the ring and the lotus are built around, so all four formations share
 * one axis.
 */
const CHAMBER_DROP = 0;

/**
 * The scroll darkens. Daylight at the vote, dusk in the chamber, night at the
 * ring, and wet earth for the lotus, which rises out of mud.
 *
 * One entry per section: the ground it paints, the ink the type takes on that
 * ground, and the dim applied to the hairlines. Every value between two
 * sections is interpolated, so the page changes continuously as you scroll
 * rather than stepping.
 */
const STAGES: { bg: [number, number, number]; ink: [number, number, number] }[] = [
  { bg: [225, 231, 229], ink: [14, 26, 26] }, //   daylight     #E1E7E5
  { bg: [191, 208, 208], ink: [14, 26, 26] }, //   overcast     #BFD0D0
  { bg: [53, 32, 86], ink: [230, 225, 236] }, //   deep night   #352056
  { bg: [31, 8, 0], ink: [239, 226, 206] } //      mud          #1F0800
];

/** Party colour on a dark ground, where the daylight inks go muddy. */
const PARTY_ON_DARK: Record<string, string> = {
  BJP: '#FFA23A',
  SP: '#E8536B',
  BSP: '#4D9BFF',
  INC: '#34D399',
  RLD: '#8FD17A',
  'AD(S)': '#9D8CFF',
  NISHAD: '#49C3E3',
  SBSP: '#F5D50A',
  'Jansatta Dal': '#F277A6',
  IND: '#AFC0BE',
  OTH: '#AFC0BE'
};

/** Steps in each strand's daylight to night colour ramp. */
const TONE_STEPS = 16;

const toRgb = (hex: string): [number, number, number] => {
  const h = hex.replace('#', '');
  return [
    parseInt(h.slice(0, 2), 16),
    parseInt(h.slice(2, 4), 16),
    parseInt(h.slice(4, 6), 16)
  ];
};

const srgbToLinear = (c: number): number => {
  const v = c / 255;
  return v <= 0.04045 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
};

const linearToSrgb = (c: number): number => {
  const v = c <= 0.0031308 ? 12.92 * c : 1.055 * Math.pow(c, 1 / 2.4) - 0.055;
  return Math.max(0, Math.min(255, Math.round(v * 255)));
};

/** sRGB to OkLab. */
const toOklab = (c: [number, number, number]): [number, number, number] => {
  const r = srgbToLinear(c[0]);
  const g = srgbToLinear(c[1]);
  const b = srgbToLinear(c[2]);
  const l = Math.cbrt(0.4122214708 * r + 0.5363325363 * g + 0.0514459929 * b);
  const m = Math.cbrt(0.2119034982 * r + 0.6806995451 * g + 0.1073969566 * b);
  const s2 = Math.cbrt(0.0883024619 * r + 0.2817188376 * g + 0.6299787005 * b);
  return [
    0.2104542553 * l + 0.793617785 * m - 0.0040720468 * s2,
    1.9779984951 * l - 2.428592205 * m + 0.4505937099 * s2,
    0.0259040371 * l + 0.7827717662 * m - 0.808675766 * s2
  ];
};

const fromOklab = (lab: [number, number, number]): [number, number, number] => {
  const l = Math.pow(lab[0] + 0.3963377774 * lab[1] + 0.2158037573 * lab[2], 3);
  const m = Math.pow(lab[0] - 0.1055613458 * lab[1] - 0.0638541728 * lab[2], 3);
  const s2 = Math.pow(lab[0] - 0.0894841775 * lab[1] - 1.291485548 * lab[2], 3);
  return [
    linearToSrgb(4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s2),
    linearToSrgb(-1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s2),
    linearToSrgb(-0.0041960863 * l - 0.7034186147 * m + 1.707614701 * s2)
  ];
};

/**
 * Blend in OkLab, not sRGB. Between the night blue and the clay the sRGB path
 * sags through a dead grey-purple; the perceptual path keeps its chroma and
 * reads as light changing rather than colour flipping.
 */
const mixPerceptual = (
  a: [number, number, number],
  b: [number, number, number],
  t: number
): { css: string; L: number } => {
  const la = toOklab(a);
  const lb = toOklab(b);
  const mixed: [number, number, number] = [
    la[0] + (lb[0] - la[0]) * t,
    la[1] + (lb[1] - la[1]) * t,
    la[2] + (lb[2] - la[2]) * t
  ];
  const rgb = fromOklab(mixed);
  return { css: `rgb(${rgb[0]},${rgb[1]},${rgb[2]})`, L: mixed[0] };
};

const mixRgb = (
  a: [number, number, number],
  b: [number, number, number],
  t: number
): string => mixPerceptual(a, b, t).css;

/** Built once per party pair, not per frame. */
const buildTone = (light: string, dark: string): string[] => {
  const a = toRgb(light);
  const b = toRgb(dark);
  const out: string[] = [];
  for (let i = 0; i <= TONE_STEPS; i++) out.push(mixRgb(a, b, i / TONE_STEPS));
  return out;
};

/** Where the page sits on the journey, given scroll progress. */
const stageAt = (p: number) => {
  const i = Math.min(STAGES.length - 2, Math.max(0, Math.floor(p)));
  const t = Math.min(1, Math.max(0, p - i));
  const bg = mixPerceptual(STAGES[i].bg, STAGES[i + 1].bg, t);
  return {
    bg: bg.css,
    ink: mixRgb(STAGES[i].ink, STAGES[i + 1].ink, t),
    /**
     * How far the strands have shifted toward their night colours. Driven by
     * the ground's own lightness, so they come back toward daylight on the
     * pale clay at the end instead of staying dark on a light ground.
     */
    night: Math.min(1, Math.max(0, (0.923 - bg.L) / (0.923 - 0.3)))
  };
};

/** Follow strength per 60fps frame. Lower is heavier and smoother. */
const DAMPING = 0.08;

/**
 * The opening formation is the act itself: a painted voter's hand lowering a
 * ballot into the box, with every member of the house wound round the wrist
 * as a kalawa.
 *
 * The hand is a painting, not strands. Tracing it in line segments was tried
 * and read as scattered dashes, because a hand is a shape people spot as
 * wrong instantly. So the painting carries the scene and all 403 strands make
 * the thread, each in its own party colour: the kalawa's red and orange come
 * out of the house's own composition rather than being painted on.
 *
 * On scroll the painting fades out and the thread unwinds into the chamber.
 */
const HAND_IMAGE = '/scene.png';

/**
 * The assembly building, behind the chamber. It fades in with the arc and out
 * again, so it only exists while the house is on screen.
 */
const PARLIAMENT_IMAGE = '/parliament.png';
const PARLIAMENT_RATIO = 2912 / 1440;
/** Width as a fraction of the canvas. */
const PARLIAMENT_WIDTH = 0.82;
/** How far its base sits above the bottom edge, as a fraction of the height. */
const PARLIAMENT_BOTTOM = -0.05;

/**
 * The state itself, behind the ring. Four paintings scattered at different
 * sizes and slight angles rather than set in a grid, two of them running off
 * the edges, so it reads as a place rather than a gallery wall. Each drifts
 * at its own rate as the section passes, which is what keeps the arrangement
 * from feeling pinned.
 *
 * cx, cy and width are fractions of the canvas; tilt is radians; drift is how
 * strongly it moves against the scroll.
 */
const PLACES: {
  src: string;
  cx: number;
  cy: number;
  width: number;
  tilt: number;
  drift: number;
}[] = [
  { src: '/places/taj.png', cx: 0.19, cy: 0.33, width: 0.48, tilt: -0.055, drift: 0.55 },
  { src: '/places/ayodhya.png', cx: 0.77, cy: 0.2, width: 0.35, tilt: 0.07, drift: 1.05 },
  { src: '/places/kumbh.png', cx: 0.85, cy: 0.69, width: 0.44, tilt: -0.04, drift: 0.8 },
  { src: '/places/varanasi.png', cx: 0.33, cy: 0.83, width: 0.32, tilt: 0.06, drift: 1.25 }
];

/**
 * What makes the night live. All of it is a function of the clock, so it
 * keeps moving whether or not the page is scrolling, and all of it is skipped
 * under reduced motion.
 */
const LIVE = {
  /** Points of light in the sky. A few twinkle hard, the rest breathe. */
  stars: 100,
  /** Flakes drifting down across the whole scene. */
  flakes: 60,
  /** How hard the lamps flicker: an additive pass that lifts only the golds. */
  flicker: 0.05
};

/**
 * The moon over the mud. Placed off the lotus's axis so the bloom keeps the
 * centre, with a soft halo rather than a hard disc: a painted moon, not a
 * drawn one. Positions are fractions of the canvas.
 */
const MOON = {
  cx: 0.8,
  cy: 0.19,
  /** Radius as a fraction of the smaller canvas edge. */
  r: 0.052,
  /** How far the halo reaches beyond the disc. */
  halo: 1.7,
  /** Stars over the mud. Fewer and warmer than the night sky's. */
  stars: 60
};

/** How long a picked member's card stays up, in ms. */
const CARD_DWELL = 5000;
/** How near a double click has to land, in px, to count as hitting a strand. */
const CARD_REACH = 26;

/**
 * The dataset names eleven real members; the other 392 rows are generated
 * placeholders, with names like "MLA Rae Bareli 215" and synthetic elector
 * counts. The card says so rather than presenting them as people.
 */
const isGeneratedRow = (c: Constituency): boolean => /^MLA\s/.test(c.currentMla);

const compactElectors = (n: number): string =>
  n >= 10000000 ? `${(n / 10000000).toFixed(2)} cr` : `${(n / 100000).toFixed(1)} lakh`;

/**
 * Layered sines at unrelated periods. Never repeats on a countable beat, so
 * the lamps read as flame rather than as a loop.
 */
const flameAt = (ts: number, seed: number): number => {
  const a = Math.sin(ts * 0.0041 + seed * 1.7);
  const b = Math.sin(ts * 0.0113 + seed * 4.1);
  const c = Math.sin(ts * 0.0263 + seed * 2.9);
  return 0.5 + 0.5 * (a * 0.5 + b * 0.32 + c * 0.18);
};

/** Fallback until the file loads and reports its own. */
const HAND_IMAGE_RATIO = 1792 / 2400;

/** Painting width as a fraction of the smaller canvas edge. */
const HAND_SCENE = 0.72;

/**
 * The painting is anchored to the right of the viewport and pushed slightly
 * past it, so the arm's cut edge falls off screen and the hand reads as
 * reaching in from outside the window rather than from a floating rectangle.
 */
/**
 * The locator map under the wordmark. Served at full resolution, 2048 square.
 * `/up-map-state.png` is the same artwork cropped to the state outline, with
 * the title block and scale bar removed.
 */
const MAP_IMAGE = '/up-map.png';
/** Wordmark size in px. The mark beside it scales with this. */
const BRAND_SIZE = 72;
/** Pulls the caption up under the wordmark. Negative tightens the gap. */
const BRAND_CAPTION_SHIFT = -20;

/** Displayed width in px, in section A. */
const MAP_WIDTH = 400;

/**
 * The map's own "UTTAR PRADESH" title starts 4.98% in from the left edge of
 * the artwork. Pulling the image left by that much puts the title flush with
 * the brand mark above it. It is a fraction, so the alignment survives any
 * change to MAP_WIDTH.
 */
const MAP_TITLE_INSET = 0.0498;
/** What it shrinks to once the page scrolls past section A. */
const MAP_SCROLLED_SCALE = 0.5;
/**
 * Where it lands when it shrinks, in px relative to where it already sits.
 * The overlay is inset by its padding, so negative values pull the map out to
 * the true top left corner of the window.
 */
const MAP_CORNER: [number, number] = [-10, -10];

const HAND_BLEED = 0.002;
/**
 * Vertical placement, as a fraction of the viewport height. 0 pins the top of
 * the painting to the top of the window, so the hand stays whole and the tall
 * box runs off the bottom. Negative lifts it further.
 */
const HAND_OFFSET_Y = 0.04;

/**
 * Where the thread crosses the wrist, as fractions of the PAINTING, not the
 * canvas: (0, 0) is its top left corner and (1, 1) its bottom right. Tune
 * these two against the artwork.
 */
const HAND_BAND_A: [number, number] = [0.705, 0.1];
const HAND_BAND_B: [number, number] = [0.755, 0.32];

/**
 * The thread, as wraps rather than one long helix. Each wrap is the FRONT arc
 * of an ellipse crossing the wrist, edge to edge, bowed along the arm. The
 * back of every turn is behind the arm, so it is not drawn at all rather than
 * drawn faint: that is what makes the thread read as wound round rather than
 * painted on. Strands taper and fade towards the silhouette, where the thread
 * curves away out of sight.
 *
 * All of it is in fractions of the PAINTING: (0, 0) is its top left corner,
 * (1, 1) its bottom right. Verified against the artwork before shipping.
 */
const KALAWA = {
  /** Middle of the band, on the bare wrist. */
  centre: [0.688, 0.145] as [number, number],
  /** Direction along the forearm, radians. */
  armAngle: -0.38,
  /** How far the band runs along the arm, as a fraction of painting width. */
  bandLength: 0.03,
  /** Half the arm's thickness here, as a fraction of painting height. */
  armRadius: 0.065,
  /** How much each turn bows along the arm. More reads as rounder. */
  tilt: 0.35,
  /**
   * Longitudinal twist: how far a turn slides along the arm as it crosses
   * from one silhouette edge to the other, as a fraction of the arm's half
   * thickness. This is what makes it a helix rather than a stack of parallel
   * rings. 0 is a flat ribbon; negative twists the other way.
   */
  twist: 0.3,
  /**
   * How far each arc stops short of the silhouette, as a fraction of the half
   * turn. The arm is not a perfect cylinder, so arcs drawn all the way to the
   * ellipse's ends overshoot the real edge and appear to float off it. Raise
   * this to tuck the ends further inside the arm.
   */
  edgeInset: 0.15,
  /** Alpha at the tucked ends, where the thread curves out of sight. */
  endFade: 0.3,
  /** Visible turns of thread. */
  wraps: 14
};

const SECTIONS: {
  marker: string;
  lead: string;
  italic: string;
  tail: string;
  body: string;
}[] = [
  {
    marker: 'A',
    lead: 'FOUR HUNDRED',
    italic: 'and three',
    tail: 'SEATS',
    body:
      'Every Vidhan Sabha segment in Uttar Pradesh, wound into one thread and scored twice an hour against 1,284 scraped Hindi and English sources.'
  },
  {
    marker: 'B',
    lead: 'THE HOUSE',
    italic: 'as it',
    tail: 'STANDS',
    body:
      'One strand per sitting member, in their party colour, seated as the chamber seats them. The NDA took 273 of these in 2022.'
  },
  {
    marker: 'C',
    lead: 'WHERE THE',
    italic: 'margin',
    tail: 'THINS',
    body:
      '71 seats sit inside three points. Sugarcane arrears in the west and the caste census push in Purvanchal move the same voters.'
  },
  {
    marker: 'D',
    lead: 'OPEN THE',
    italic: 'working',
    tail: 'TERMINAL',
    body:
      'Four hundred and three members, read as one house. Inside, districts carry the weight of their electors: drag one and it springs back, or split it into the seats it holds.'
  }
];

const NAV: { label: string; tab: TabKey }[] = [
  { label: 'seats', tab: 'map' },
  { label: 'districts', tab: 'bubbles' },
  { label: 'members', tab: 'mla' },
  { label: 'legislation', tab: 'laws' }
];

const KEY_PARTIES: PoliticalParty[] = ['BJP', 'SP', 'BSP', 'RLD'];

/**
 * Seating order for the chamber arc, treasury benches first and the main
 * opposition at the far end, so the hemicycle reads as party blocks the way
 * a real chamber does rather than scattering colour by seat number.
 */
const SEATING_ORDER: PoliticalParty[] = [
  'BJP',
  'AD(S)',
  'NISHAD',
  'RLD',
  'SBSP',
  'IND',
  'OTH',
  'Jansatta Dal',
  'BSP',
  'INC',
  'SP'
];

/**
 * Lotus geometry, outermost layer first. Strands trace each petal's OUTLINE
 * rather than filling it: 403 strands spread across filled petals read as a
 * starburst, but laid along the edges they draw the bloom. `turn` offsets each
 * ring so its petals sit in the gaps of the ring outside it.
 */
const LOTUS_LAYERS: {
  petals: number;
  length: number;
  halfWidth: number;
  turn: number;
  base: number;
}[] = [
  { petals: 8, length: 0.335, halfWidth: 0.095, turn: 0, base: 0.045 },
  { petals: 7, length: 0.24, halfWidth: 0.078, turn: Math.PI / 7, base: 0.05 },
  { petals: 6, length: 0.15, halfWidth: 0.058, turn: Math.PI / 12, base: 0.055 }
];

/** Strands held back from the petals to form the seed pod. */
const LOTUS_POD = 20;


interface Strand {
  /** Daylight colour through to night colour, precomputed. */
  tone: string[];
  /** One formation per state: x, y, angle, length. */
  f: [number, number, number, number][];
  colour: string;
  alpha: number;
  /** Alpha for the opening cord, darker on the near side of each turn. */
  cordAlpha: number;
  /** Phase offset so the idle breathing is not in lockstep. */
  phase: number;
}

/** Deterministic jitter, so a formation is identical across rebuilds. */
const rnd = (i: number, salt: number): number => {
  const v = Math.sin(i * 12.9898 + salt * 78.233) * 43758.5453;
  return v - Math.floor(v);
};

const easeInOut = (t: number): number =>
  t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;

const lerp = (a: number, b: number, t: number): number => a + (b - a) * t;

/** Where the painting is drawn. The band is positioned against this rect. */
const imageRect = (
  canvasW: number,
  canvasH: number,
  scale: number,
  ratio: number
) => {
  const w = scale * HAND_SCENE;
  const h = w / ratio;
  return {
    x: canvasW - w * (1 - HAND_BLEED),
    y: HAND_OFFSET_Y * canvasH,
    w,
    h
  };
};

export const Landing: React.FC<LandingProps> = ({ allConstituencies, onEnter }) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const targetRef = useRef(0);
  const currentRef = useRef(0);
  const activeRef = useRef(0);
  const sizeRef = useRef({ w: 0, h: 0 });
  const scaleRef = useRef(0);
  /** Every strand's drawn position this frame, for hit testing. */
  const hitsRef = useRef<Float32Array>(new Float32Array(0));
  const anchorRef = useRef({ cx: 0, cy: 0, scale: 0 });
  const strandsRef = useRef<Strand[]>([]);

  const [active, setActive] = useState(0);
  const [picked, setPicked] = useState<Constituency | null>(null);
  const heroImage = useRef<HTMLImageElement | null>(null);
  const parliamentImage = useRef<HTMLImageElement | null>(null);
  const placeImages = useRef<(HTMLImageElement | null)[]>(PLACES.map(() => null));
  const heroReady = useRef(false);
  const ratioRef = useRef(HAND_IMAGE_RATIO);
  const [artVersion, setArtVersion] = useState(0);

  const reduceMotion = useRef(
    typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches
  );

  /** One strand per sitting member. */
  const members = useMemo(
    () =>
      allConstituencies.map((c) => ({
        party: c.mlaParty as PoliticalParty,
        region: c.region,
        voters: c.demographics.totalVoters
      })),
    [allConstituencies]
  );

  const buildStrands = useCallback(
    (w: number, h: number): Strand[] => {
      const cx = w / 2;
      const cy = h / 2;
      const scale = Math.min(w, h);
      const maxVoters = Math.max(...members.map((m) => m.voters));
      const rows = 9;

      // Position in the chamber, by party block. Used by the arc and the ring
      // so both read as party affiliation; the bundle and the clusters keep
      // their own logic.
      const rank = (party: PoliticalParty) => {
        const r = SEATING_ORDER.indexOf(party);
        return r === -1 ? SEATING_ORDER.length : r;
      };
      const seated = members
        .map((m, i) => i)
        .sort((a, b) => rank(members[a].party) - rank(members[b].party) || a - b);

      // Members sit in party order with no break between blocks: the colour
      // change is the boundary, and an empty column reads as a missing bench.
      const seatPos = new Array<number>(members.length);
      seated.forEach((memberIndex, position) => {
        seatPos[memberIndex] = position;
      });
      const slot = members.length;
      const columns = Math.max(1, Math.ceil(slot / rows));

      // Gapless position in party order, so the bloom layers by party the way
      // the chamber seats by party.
      const seatRank = new Array<number>(members.length);
      seated.forEach((memberIndex, position) => {
        seatRank[memberIndex] = position;
      });

      const petalEdge = (
        layer: (typeof LOTUS_LAYERS)[number],
        axis: number,
        t: number,
        side: number
      ): [number, number] => {
        const ca = Math.cos(axis);
        const sa = Math.sin(axis);
        const d = scale * (layer.base + t * layer.length);
        const wItem = scale * layer.halfWidth * Math.pow(Math.sin(Math.PI * t), 0.85);
        return [cx + ca * d - sa * wItem * side, cy + sa * d + ca * wItem * side];
      };

      const petalSlots = LOTUS_LAYERS.reduce((sum, l) => sum + l.petals, 0);
      const podStart = members.length - LOTUS_POD;
      const perPetal = podStart / petalSlots;

      return members.map((member, i) => {
        const u = i / members.length;
        const sp = seatPos[i];
        const su = sp / Math.max(1, slot);
        const j1 = rnd(i, 1);
        const j2 = rnd(i, 2);
        const len = (0.018 + 0.03 * Math.sqrt(member.voters / maxVoters)) * scale;

        // A. the kalawa, wound round the wrist. Each member is one piece of
        // one turn, in its own party colour.
        const rect = imageRect(w, h, scale, ratioRef.current);
        const rank = seatRank[i];
        const armX = Math.cos(KALAWA.armAngle);
        const armY = Math.sin(KALAWA.armAngle);
        const acrossX = -armY;
        const acrossY = armX;
        const bandLen = KALAWA.bandLength * rect.w;
        const armHalf = KALAWA.armRadius * rect.h;
        const lean = KALAWA.tilt * armHalf;
        const perWrap = members.length / KALAWA.wraps;

        const wrapIndex = Math.min(KALAWA.wraps - 1, Math.floor(rank / perWrap));
        const within = (rank - wrapIndex * perWrap) / perWrap;
        // Half a turn only: the other half is behind the arm, and both ends
        // stop short of the silhouette so they do not overshoot the edge.
        const span = Math.PI * (1 - 2 * KALAWA.edgeInset);
        const theta = Math.PI * KALAWA.edgeInset + within * span;
        const slide = ((wrapIndex + 0.5) / KALAWA.wraps - 0.5) * bandLen;
        const wrapX = rect.x + KALAWA.centre[0] * rect.w + armX * slide;
        const wrapY = rect.y + KALAWA.centre[1] * rect.h + armY * slide;

        const cosT = Math.cos(theta);
        const sinT = Math.sin(theta);

        // The helix: the turn advances along the arm as it crosses it, so
        // each arc is slanted rather than parallel to its neighbours.
        const advance = (within - 0.5) * armHalf * KALAWA.twist;
        const advanceRate = (armHalf * KALAWA.twist) / Math.PI;

        const tangentX =
          -acrossX * armHalf * sinT + armX * lean * cosT + armX * advanceRate;
        const tangentY =
          -acrossY * armHalf * sinT + armY * lean * cosT + armY * advanceRate;

        // 0 at the arm's silhouette, 1 across the middle of it.
        const facing = sinT;
        const kalawa: [number, number, number, number] = [
          wrapX + acrossX * armHalf * cosT + armX * (lean * sinT + advance),
          wrapY + acrossY * armHalf * cosT + armY * (lean * sinT + advance),
          Math.atan2(tangentY, tangentX),
          ((Math.PI * armHalf) / perWrap) * 1.5 * (0.4 + 0.6 * facing)
        ];
        const cordAlpha = KALAWA.endFade + (0.95 - KALAWA.endFade) * facing;

        // B. the chamber arc. The column sets the angle and the row sets the
        // depth, so a party fills a wedge from the floor to the back bench
        // instead of banding the arc in concentric rings.
        const col = Math.floor(sp / rows);
        const row = sp % rows;
        // Flipped: column 0 is the first party in seating order, placed on
        // the right of the chamber.
        const arcA =
          Math.PI + (1 - col / Math.max(1, columns - 1)) * Math.PI;
        const arcR = scale * (0.17 + (row / rows) * 0.17);
        const arc: [number, number, number, number] = [
          cx + Math.cos(arcA) * arcR,
          cy + scale * CHAMBER_DROP + Math.sin(arcA) * arcR * 0.74,
          arcA,
          len
        ];

        // C. the closed ring, same party order carried round. Mirrored about
        // the vertical axis to match the flipped chamber, so the treasury
        // benches stay on the right across both formations.
        // Treasury benches open at twelve o'clock and run round to the
        // right, mirroring the chamber arc below it.
        const ringA = -Math.PI / 2 + su * Math.PI * 2;
        const ringR = scale * (0.2 + j1 * 0.012);
        const ring: [number, number, number, number] = [
          cx + Math.cos(ringA) * ringR,
          cy + Math.sin(ringA) * ringR,
          ringA,
          len * (0.75 + j2 * 0.9)
        ];

        // D. the lotus, drawn as petal outlines with a seed pod at the core.
        // `rank` is the party-order position already read for the hand scene.
        let lotus: [number, number, number, number];
        if (rank >= podStart) {
          const k = rank - podStart;
          const podA = (k / LOTUS_POD) * Math.PI * 2;
          const podR = scale * 0.02 * (0.55 + rnd(i, 4) * 0.5);
          lotus = [
            cx + Math.cos(podA) * podR,
            cy + Math.sin(podA) * podR,
            podA + Math.PI / 2,
            scale * 0.013
          ];
        } else {
          const petalSlot = Math.min(petalSlots - 1, Math.floor(rank / perPetal));
          let acc = 0;
          let layer = LOTUS_LAYERS[0];
          for (const candidate of LOTUS_LAYERS) {
            layer = candidate;
            if (petalSlot < acc + candidate.petals) break;
            acc += candidate.petals;
          }
          const petal = petalSlot - acc;
          const within = rank / perPetal - petalSlot;
          // First half of a petal's strands run up one edge, the rest back
          // down the other.
          const side = within < 0.5 ? 1 : -1;
          // Stop short of the apex, where the two edges would cross.
          const t = 0.03 + (((within * 2) % 1) * 0.93);

          const axis =
            ((petal + 0.5) / layer.petals) * Math.PI * 2 + layer.turn - Math.PI / 2;
          const [px, py] = petalEdge(layer, axis, t, side);
          const [nx, ny] = petalEdge(layer, axis, Math.min(0.999, t + 0.012), side);
          const taper = 0.35 + 0.65 * Math.pow(Math.sin(Math.PI * t), 0.6);
          lotus = [px, py, Math.atan2(ny - py, nx - px), len * taper * 0.9];
        }

        return {
          f: [kalawa, arc, ring, lotus],
          // The party's own colour. A strand is thin, but 403 of them make a
          // field, which is what carries saffron on a light ground.
          colour: PARTY_COLORS[member.party]?.flag ?? '#8A9B9A',
          tone: buildTone(
            PARTY_COLORS[member.party]?.flag ?? '#8A9B9A',
            PARTY_ON_DARK[member.party] ?? '#AFC0BE'
          ),
          alpha: 0.62 + j2 * 0.33,
          cordAlpha,
          phase: rnd(i, 3) * Math.PI * 2
        };
      });
    },
    [members]
  );

  /** Reads refs only. Never triggers a React render. */
  const draw = useCallback((ts: number) => {
    const canvas = canvasRef.current;
    const strands = strandsRef.current;
    if (!canvas || strands.length === 0) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const { w, h } = sizeRef.current;
    const p = currentRef.current * (STATES - 1);
    const idx = Math.min(STATES - 2, Math.floor(p));
    const t = easeInOut(Math.min(1, Math.max(0, p - idx)));
    const breathe = reduceMotion.current ? 0 : ts * 0.0006;

    const stage = stageAt(p);
    ctx.clearRect(0, 0, w, h);
    ctx.fillStyle = stage.bg;
    ctx.fillRect(0, 0, w, h);
    const toneStep = Math.round(stage.night * TONE_STEPS);

    // The painting, fading out as the chamber takes over.
    const handPresence = idx === 0 ? 1 - t : 0;
    const img = heroImage.current;
    if (handPresence > 0.01 && img && heroReady.current) {
      const { scale } = anchorRef.current;
      const rect = imageRect(w, h, scale, ratioRef.current);
      ctx.globalAlpha = handPresence;
      ctx.drawImage(img, rect.x, rect.y, rect.w, rect.h);
      ctx.globalAlpha = 1;
    }

    // The state, behind the ring. Drawn before the strands so the house
    // always reads on top of the places it governs.
    const ring = Math.max(0, 1 - Math.abs(p - 2));
    if (ring > 0.01) {
      PLACES.forEach((place, i) => {
        const img = placeImages.current[i];
        if (!img || img.naturalWidth === 0) return;
        const pw = w * place.width;
        const ph = (pw * img.naturalHeight) / img.naturalWidth;
        const glide = (p - 2) * place.drift * h * 0.07;
        ctx.save();
        ctx.globalAlpha = ring * 0.96;
        ctx.translate(w * place.cx, h * place.cy - glide);
        ctx.rotate(place.tilt);
        ctx.drawImage(img, -pw / 2, -ph / 2, pw, ph);
        ctx.restore();
      });
      ctx.globalAlpha = 1;
    }

    // What makes it live: the lamps flicker, the stars breathe, snow drifts.
    if (ring > 0.01 && !reduceMotion.current) {
      // Flame. Compositing each painting onto itself additively lifts only
      // its brightest paint, which is exactly where the lamps are, so the
      // diyas and the aarti fires gutter without touching the dark.
      ctx.globalCompositeOperation = 'lighter';
      PLACES.forEach((place, i) => {
        const img = placeImages.current[i];
        if (!img || img.naturalWidth === 0) return;
        const pw = w * place.width;
        const ph = (pw * img.naturalHeight) / img.naturalWidth;
        const glide = (p - 2) * place.drift * h * 0.07;
        ctx.save();
        ctx.globalAlpha = ring * LIVE.flicker * flameAt(ts, i * 3.3);
        ctx.translate(w * place.cx, h * place.cy - glide);
        ctx.rotate(place.tilt);
        ctx.drawImage(img, -pw / 2, -ph / 2, pw, ph);
        ctx.restore();
      });

      // Stars. Every fifth one twinkles sharply; the rest only breathe.
      for (let i = 0; i < LIVE.stars; i++) {
        const sx = rnd(i, 21) * w;
        const sy = rnd(i, 22) * h * 0.62;
        const sharp = i % 5 === 0;
        const phase = rnd(i, 23) * Math.PI * 2;
        const speed = sharp ? 0.0032 : 0.0011;
        const wave = 0.5 + 0.5 * Math.sin(ts * speed + phase);
        const lift = sharp ? Math.pow(wave, 4) : 0.45 + 0.55 * wave;
        ctx.globalAlpha = ring * (0.2 + 0.7 * lift) * (0.4 + rnd(i, 24) * 0.6);
        ctx.fillStyle = i % 7 === 0 ? '#FFE9B8' : '#EAE6FF';
        ctx.beginPath();
        ctx.arc(sx, sy, 0.7 + rnd(i, 25) * 1.5, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalCompositeOperation = 'source-over';

      // Snow, falling at its own pace and swaying as it goes.
      for (let i = 0; i < LIVE.flakes; i++) {
        const fall = 14 + rnd(i, 31) * 34;
        const sway = Math.sin(ts * 0.0006 + i * 1.3) * (8 + rnd(i, 32) * 22);
        const fx = (rnd(i, 33) * w + sway + w) % w;
        const fy = ((rnd(i, 34) * h + (ts / 1000) * fall) % (h + 60)) - 30;
        ctx.globalAlpha = ring * (0.18 + rnd(i, 35) * 0.42);
        ctx.fillStyle = '#F2F4FF';
        ctx.beginPath();
        ctx.arc(fx, fy, 0.8 + rnd(i, 36) * 1.7, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalAlpha = 1;
    }

    // Night over the mud: a moon off the lotus's axis, and warm stars.
    const mud = Math.max(0, 1 - Math.abs(p - 3));
    if (mud > 0.01) {
      const mr = scaleRef.current * MOON.r;
      const mx = w * MOON.cx;
      const my = h * MOON.cy;

      const halo = ctx.createRadialGradient(mx, my, mr * 0.2, mx, my, mr * MOON.halo);
      halo.addColorStop(0, 'rgba(255,236,196,0.34)');
      halo.addColorStop(0.35, 'rgba(255,224,170,0.12)');
      halo.addColorStop(1, 'rgba(255,214,150,0)');
      ctx.globalAlpha = mud;
      ctx.fillStyle = halo;
      ctx.beginPath();
      ctx.arc(mx, my, mr * MOON.halo, 0, Math.PI * 2);
      ctx.fill();

      ctx.globalAlpha = mud * 0.92;
      ctx.fillStyle = '#FBEFD2';
      ctx.beginPath();
      ctx.arc(mx, my, mr, 0, Math.PI * 2);
      ctx.fill();

      // A shallow bite out of one side, so it reads as a moon not a lamp.
      ctx.globalCompositeOperation = 'destination-out';
      ctx.globalAlpha = mud * 0.75;
      ctx.beginPath();
      ctx.arc(mx + mr * 0.62, my - mr * 0.3, mr * 0.95, 0, Math.PI * 2);
      ctx.fill();
      ctx.globalCompositeOperation = 'source-over';

      if (!reduceMotion.current) {
        for (let i = 0; i < MOON.stars; i++) {
          const sx = rnd(i, 41) * w;
          const sy = rnd(i, 42) * h * 0.58;
          const phase = rnd(i, 43) * Math.PI * 2;
          const sharp = i % 6 === 0;
          const wave = 0.5 + 0.5 * Math.sin(ts * (sharp ? 0.0029 : 0.001) + phase);
          const lift = sharp ? Math.pow(wave, 4) : 0.5 + 0.5 * wave;
          ctx.globalAlpha = mud * (0.16 + 0.6 * lift) * (0.4 + rnd(i, 44) * 0.6);
          ctx.fillStyle = i % 4 === 0 ? '#FFE3AE' : '#F6E9D6';
          ctx.beginPath();
          ctx.arc(sx, sy, 0.6 + rnd(i, 45) * 1.4, 0, Math.PI * 2);
          ctx.fill();
        }
      }
      ctx.globalAlpha = 1;
    }

    // The assembly building, behind the chamber and under the strands.
    const chamber = Math.max(0, 1 - Math.abs(p - 1));
    const building = parliamentImage.current;
    if (chamber > 0.01 && building) {
      const pw = w * PARLIAMENT_WIDTH;
      const ph = pw / PARLIAMENT_RATIO;
      ctx.globalAlpha = chamber;
      ctx.drawImage(building, (w - pw) / 2, h - ph - PARLIAMENT_BOTTOM * h, pw, ph);
      ctx.globalAlpha = 1;
    }

    if (hitsRef.current.length !== strands.length * 2) {
      hitsRef.current = new Float32Array(strands.length * 2);
    }
    const hits = hitsRef.current;

    ctx.lineCap = 'round';
    ctx.lineWidth = 1.4;

    for (let i = 0; i < strands.length; i++) {
      const s = strands[i];
      const a = s.f[idx];
      const b = s.f[idx + 1];
      const wobble = breathe === 0 ? 0 : Math.sin(breathe + s.phase);

      const x = lerp(a[0], b[0], t);
      const y = lerp(a[1], b[1], t);
      const ang = lerp(a[2], b[2], t) + wobble * 0.035;
      const len = lerp(a[3], b[3], t) * (1 + wobble * 0.045);

      if (hits.length > i * 2 + 1) {
        hits[i * 2] = x;
        hits[i * 2 + 1] = y;
      }

      ctx.strokeStyle = s.tone[toneStep];
      ctx.globalAlpha = idx === 0 ? lerp(s.cordAlpha, s.alpha, t) : s.alpha;
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.lineTo(x + Math.cos(ang) * len, y + Math.sin(ang) * len);
      ctx.stroke();
    }

    ctx.globalAlpha = 1;
  }, []);

  /** The four places. A missing file is not an error. */
  useEffect(() => {
    PLACES.forEach((place, i) => {
      const img = new Image();
      img.onload = () => {
        placeImages.current[i] = img;
      };
      img.src = place.src;
    });
  }, []);

  /** The assembly building. A missing file is not an error. */
  useEffect(() => {
    const img = new Image();
    img.onload = () => {
      parliamentImage.current = img;
    };
    img.src = PARLIAMENT_IMAGE;
  }, []);

  /** The painted opening scene. A missing file is not an error. */
  useEffect(() => {
    const img = new Image();
    img.onload = () => {
      heroImage.current = img;
      heroReady.current = true;
      if (img.naturalHeight > 0) {
        ratioRef.current = img.naturalWidth / img.naturalHeight;
      }
      // Rebuild the thread against the painting's true proportions.
      setArtVersion((v) => v + 1);
    };
    img.onerror = () => {
      heroReady.current = false;
    };
    img.src = HAND_IMAGE;
  }, []);

  /** Canvas sizing, device pixel ratio aware. */
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      const dpr = Math.min(2, window.devicePixelRatio || 1);
      canvas.width = Math.round(rect.width * dpr);
      canvas.height = Math.round(rect.height * dpr);
      const ctx = canvas.getContext('2d');
      if (ctx) ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      sizeRef.current = { w: rect.width, h: rect.height };
      scaleRef.current = Math.min(rect.width, rect.height);
      anchorRef.current = {
        cx: rect.width / 2,
        cy: rect.height / 2,
        scale: Math.min(rect.width, rect.height)
      };
      strandsRef.current = buildStrands(rect.width, rect.height);
      draw(performance.now());
    };

    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(canvas);
    return () => ro.disconnect();
  }, [buildStrands, draw, artVersion]);

  /**
   * One continuous loop. Scroll only writes a target; the drawn value chases
   * it with a damped follow, which is what turns a wheel tick into a glide.
   */
  useEffect(() => {
    let raf = 0;
    let last = 0;

    const measure = () => {
      const el = scrollRef.current;
      if (!el) return 0;
      const rect = el.getBoundingClientRect();
      const span = rect.height - window.innerHeight;
      if (span <= 0) return 0;
      return Math.min(1, Math.max(0, -rect.top / span));
    };

    const onScroll = () => {
      const raw = measure();
      targetRef.current = reduceMotion.current
        ? Math.round(raw * (STATES - 1)) / (STATES - 1)
        : raw;
    };

    const loop = (ts: number) => {
      const dt = Math.min(64, last === 0 ? 16.7 : ts - last);
      last = ts;

      const target = targetRef.current;
      const delta = target - currentRef.current;

      if (Math.abs(delta) < 0.00008) {
        currentRef.current = target;
      } else {
        // Frame-rate independent damping: the same feel at 60 and 120Hz.
        currentRef.current += delta * (1 - Math.pow(1 - DAMPING, dt / 16.667));
      }

      draw(ts);

      const next = Math.min(
        STATES - 1,
        Math.round(currentRef.current * (STATES - 1))
      );
      if (next !== activeRef.current) {
        activeRef.current = next;
        setActive(next);
      }

      raf = window.requestAnimationFrame(loop);
    };

    onScroll();
    currentRef.current = targetRef.current;
    raf = window.requestAnimationFrame(loop);
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll, { passive: true });

    return () => {
      window.cancelAnimationFrame(raf);
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
    };
  }, [draw]);

  useEffect(() => {
    if (!picked) return;
    const id = window.setTimeout(() => setPicked(null), CARD_DWELL);
    return () => window.clearTimeout(id);
  }, [picked]);

  /** Double click anywhere: find the nearest strand and name its member. */
  const pickStrand = (e: React.MouseEvent) => {
    const target = e.target as HTMLElement;
    if (target.closest('button') || target.closest('a')) return;
    // Clear anything the browser managed to select before we got here.
    window.getSelection()?.removeAllRanges();
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const mx = e.clientX - rect.left;
    const my = e.clientY - rect.top;
    const hits = hitsRef.current;
    let best = -1;
    let bestD = CARD_REACH * CARD_REACH;
    for (let i = 0; i < allConstituencies.length; i++) {
      const dx = hits[i * 2] - mx;
      const dy = hits[i * 2 + 1] - my;
      const d = dx * dx + dy * dy;
      if (d < bestD) {
        bestD = d;
        best = i;
      }
    }
    if (best >= 0) setPicked(allConstituencies[best]);
  };

  const section = SECTIONS[active];
  // The DOM follows the journey in steps, one per section, and CSS eases
  // between them. The canvas scrubs it continuously.
  const domStage = stageAt(active);
  const accent = active <= 1 ? '#066566' : '#63D8D2';

  return (
    <div
      style={{
        background: domStage.bg,
        color: domStage.ink,
        transition: 'background-color 700ms ease, color 700ms ease'
      }}
    >
      <div ref={scrollRef} style={{ height: `${STATES * 100}dvh` }} className="relative">
        <div
          className="sticky top-0 h-dvh overflow-hidden"
          onDoubleClick={pickStrand}
          // A second mousedown is what starts the browser's word selection.
          // Cancelling only that leaves ordinary click-and-drag selection
          // working everywhere else.
          onMouseDown={(e) => {
            if (e.detail > 1) e.preventDefault();
          }}
        >
          <canvas
            ref={canvasRef}
            className="absolute inset-0 w-full h-full"
            aria-hidden="true"
          />

          <div className="relative h-full flex flex-col px-6 md:px-10 py-6 md:py-8">
            <div className="flex items-start justify-between gap-8">
              <div className="flex flex-col gap-3">
                <div className="flex items-stretch gap-4">
                  {/* The mark: six turns of thread in the kalawa's colours,
                      the same motif the hero winds round the wrist. */}
                  <svg
                    width={BRAND_SIZE * 0.42}
                    height={BRAND_SIZE * 1.1}
                    viewBox="0 0 30 80"
                    fill="none"
                    role="img"
                    aria-label="UP27 mark"
                    style={{ flexShrink: 0 }}
                  >
                    {[0, 1, 2, 3, 4, 5].map((i) => (
                      <line
                        key={i}
                        x1={2}
                        y1={12 + i * 11.6}
                        x2={26}
                        y2={4 + i * 11.6}
                        stroke={['#C5121E', '#F2700C', '#E0491A'][i % 3]}
                        strokeWidth={5}
                        strokeLinecap="round"
                      />
                    ))}
                  </svg>

                  <div className="flex flex-col justify-between py-0.5">
                    <div
                      className="font-mono-term font-semibold"
                      style={{
                        fontSize: BRAND_SIZE,
                        lineHeight: 0.88,
                        letterSpacing: '-0.04em'
                      }}
                    >
                      UP<span style={{ color: accent }}>27</span>
                    </div>
                    <div
                      className="flex items-center gap-3"
                      style={{ marginTop: BRAND_CAPTION_SHIFT }}
                    >
                      <span className="h-px w-8 bg-current opacity-50" aria-hidden="true" />
                      <span className="font-mono-term text-[11px] uppercase tracking-[0.26em] opacity-60">
                        Vidhan Sabha / 403 seats
                      </span>
                    </div>
                  </div>
                </div>
                <img
                  src={MAP_IMAGE}
                  alt="District map of Uttar Pradesh"
                  width={2048}
                  height={2048}
                  style={{
                    width: MAP_WIDTH,
                    height: 'auto',
                    // Shrinks into the corner as the page leaves section A.
                    transformOrigin: 'top left',
                    // The title's inset is cancelled at whatever scale the
                    // map is drawn at, so it stays flush with the mark above
                    // in both the large and the shrunk state.
                    transform:
                      active === 0
                        ? `translate(${-MAP_TITLE_INSET * MAP_WIDTH}px, 0px) scale(1)`
                        : `translate(${
                            MAP_CORNER[0] -
                            MAP_SCROLLED_SCALE * MAP_TITLE_INSET * MAP_WIDTH
                          }px, ${MAP_CORNER[1]}px) scale(${MAP_SCROLLED_SCALE})`,
                    transition: 'transform 500ms cubic-bezier(0.4, 0, 0.2, 1)',
                    pointerEvents: 'none'
                  }}
                />
              </div>
              <nav aria-label="Jump into the terminal" className="flex flex-col items-end gap-1.5">
                {NAV.map((item) => (
                  <button
                    key={item.tab}
                    type="button"
                    onClick={() => onEnter(item.tab)}
                    className="group flex items-center gap-1.5 font-mono-term font-semibold text-[17px] tracking-[0.02em] hover:opacity-70"
                  >
                    {item.label}
                    <span aria-hidden="true" className="opacity-70">
                      &#8599;
                    </span>
                  </button>
                ))}
              </nav>
            </div>

            <div className="flex-1 flex items-center">
              <div className="w-full flex items-center justify-between gap-8">
                <div className="max-w-[34rem]">
                  <h1 className="font-display text-[clamp(2.25rem,5.2vw,4rem)] leading-[1.04]">
                    {section.lead}{' '}
                    <span className="italic font-normal">{section.italic}</span>
                    <br />
                    {section.tail}
                  </h1>
                  <p className="mt-6 max-w-sm text-sm leading-relaxed opacity-75">
                    {section.body}
                  </p>
                  {active === STATES - 1 && (
                    <button
                      type="button"
                      onClick={() => onEnter('bubbles')}
                      className="mt-8 h-11 px-6 rounded-full bg-live-600 text-white text-sm font-medium hover:bg-live-700"
                    >
                      Open the terminal
                    </button>
                  )}
                </div>

                <span
                  className="font-mono-term text-sm tracking-[0.3em] opacity-60 hidden md:block"
                  aria-hidden="true"
                >
                  ( {section.marker} )
                </span>
              </div>
            </div>

            {picked && (
              <aside
                role="status"
                aria-live="polite"
                className="absolute right-6 md:right-10 bottom-24 w-72 p-5 rounded-md"
                style={{
                  background: domStage.bg,
                  color: domStage.ink,
                  border: `1px solid ${PARTY_COLORS[picked.mlaParty]?.flag ?? accent}`,
                  boxShadow: '0 10px 40px rgba(0,0,0,0.18)'
                }}
              >
                <div className="flex items-baseline justify-between gap-3 mb-3">
                  <span className="font-mono-term text-[10px] uppercase tracking-[0.18em] opacity-60">
                    Member
                  </span>
                  <span
                    className="font-mono-term text-[11px] font-semibold"
                    style={{ color: PARTY_COLORS[picked.mlaParty]?.flag }}
                  >
                    {picked.mlaParty}
                  </span>
                </div>

                {isGeneratedRow(picked) ? (
                  <div className="text-base leading-snug opacity-55">
                    Not named in the sample data
                  </div>
                ) : (
                  <>
                    <div className="text-lg font-medium leading-snug">
                      {picked.currentMla}
                    </div>
                    {MLA_NAMES_HINDI[picked.acNumber] && (
                      <div className="font-dv text-sm opacity-70">
                        {MLA_NAMES_HINDI[picked.acNumber]}
                      </div>
                    )}
                  </>
                )}

                <dl className="mt-4 space-y-2">
                  <div className="flex items-baseline justify-between gap-3">
                    <dt className="font-mono-term text-[10px] uppercase tracking-[0.14em] opacity-55">
                      Constituency
                    </dt>
                    <dd className="text-sm text-right">
                      {picked.name}
                      <span className="font-mono-term tnum opacity-60"> / {picked.acNumber}</span>
                    </dd>
                  </div>
                  <div className="flex items-baseline justify-between gap-3">
                    <dt className="font-mono-term text-[10px] uppercase tracking-[0.14em] opacity-55">
                      District
                    </dt>
                    <dd className="text-sm">{picked.district}</dd>
                  </div>
                  <div className="flex items-baseline justify-between gap-3">
                    <dt className="font-mono-term text-[10px] uppercase tracking-[0.14em] opacity-55">
                      Electors
                    </dt>
                    <dd className="font-mono-term tnum text-sm">
                      {isGeneratedRow(picked)
                        ? '--'
                        : compactElectors(picked.demographics.totalVoters)}
                    </dd>
                  </div>
                  <div className="flex items-baseline justify-between gap-3">
                    <dt className="font-mono-term text-[10px] uppercase tracking-[0.14em] opacity-55">
                      Elected
                    </dt>
                    <dd className="font-mono-term tnum text-sm">
                      {isGeneratedRow(picked) ? '--' : '2022'}
                    </dd>
                  </div>
                </dl>

                <p className="mt-3 font-mono-term text-[10px] uppercase tracking-[0.12em] opacity-45">
                  {isGeneratedRow(picked)
                    ? 'Generated row, not a real member'
                    : '18th Vidhan Sabha'}
                </p>
              </aside>
            )}

            <div className="flex items-end justify-between gap-8 flex-wrap">
              <div className="flex flex-col gap-3">
                <ul className="flex flex-wrap items-center gap-x-4 gap-y-2">
                  {KEY_PARTIES.map((p) => (
                    <li key={p} className="flex items-center gap-2">
                      <span
                        aria-hidden="true"
                        className="w-2.5 h-2.5 rounded-full"
                        style={{ background: PARTY_COLORS[p].flag }}
                      />
                      <span className="font-mono-term text-[11px] tracking-[0.1em] opacity-75">
                        {p}
                      </span>
                    </li>
                  ))}
                </ul>
                <div className="flex items-center gap-4">
                  <button
                    type="button"
                    onClick={() => onEnter('bubbles')}
                    className="font-mono-term text-[11px] uppercase tracking-[0.14em] opacity-60 hover:opacity-100"
                  >
                    Skip to terminal
                  </button>
                  <span className="font-mono-term text-[11px] uppercase tracking-[0.14em] opacity-45">
                    Sample dataset
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div
                  className="hidden sm:flex items-center gap-1.5"
                  role="progressbar"
                  aria-valuemin={1}
                  aria-valuemax={STATES}
                  aria-valuenow={active + 1}
                  aria-label="Scroll progress"
                >
                  {SECTIONS.map((s, i) => (
                    <span
                      key={s.marker}
                      className={`h-0.5 w-8 ${i <= active ? '' : 'bg-current opacity-25'}`}
                      style={i <= active ? { background: accent } : undefined}
                    />
                  ))}
                </div>
                <span className="font-mono-term tnum text-[11px] tracking-[0.12em] opacity-60">
                  [ 00{active + 1} /00{STATES} ]
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Landing;
