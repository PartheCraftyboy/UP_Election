import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Constituency, PoliticalParty } from '../types';
import { PARTY_COLORS } from '../data/upConstituencies';
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

/** Fallback until the file loads and reports its own. */
const HAND_IMAGE_RATIO = 2834 / 2658;

/** Painting width as a fraction of the smaller canvas edge. */
const HAND_SCENE = 0.96;

/**
 * The painting is anchored to the right of the viewport and pushed slightly
 * past it, so the arm's cut edge falls off screen and the hand reads as
 * reaching in from outside the window rather than from a floating rectangle.
 */
const HAND_BLEED = 0.05;
/** Vertical nudge, as a fraction of the painting's height. */
const HAND_OFFSET_Y = -0.065;

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
  centre: [0.6674, 0.1757] as [number, number],
  /** Direction along the forearm, radians. */
  armAngle: -0.28,
  /** How far the band runs along the arm, as a fraction of painting width. */
  bandLength: 0.0505,
  /** Half the arm's thickness here, as a fraction of painting height. */
  armRadius: 0.0664,
  /** How much each turn bows along the arm. More reads as rounder. */
  tilt: 0.4,
  /** Visible turns of thread. */
  wraps: 13
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
    y: (canvasH - h) / 2 + HAND_OFFSET_Y * h,
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
  const anchorRef = useRef({ cx: 0, cy: 0, scale: 0 });
  const strandsRef = useRef<Strand[]>([]);

  const [active, setActive] = useState(0);
  const heroImage = useRef<HTMLImageElement | null>(null);
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
        // Half a turn only: the other half is behind the arm.
        const theta = within * Math.PI;
        const slide = ((wrapIndex + 0.5) / KALAWA.wraps - 0.5) * bandLen;
        const wrapX = rect.x + KALAWA.centre[0] * rect.w + armX * slide;
        const wrapY = rect.y + KALAWA.centre[1] * rect.h + armY * slide;

        const cosT = Math.cos(theta);
        const sinT = Math.sin(theta);
        const tangentX = -acrossX * armHalf * sinT + armX * lean * cosT;
        const tangentY = -acrossY * armHalf * sinT + armY * lean * cosT;

        // 0 at the arm's silhouette, 1 across the middle of it.
        const facing = sinT;
        const kalawa: [number, number, number, number] = [
          wrapX + acrossX * armHalf * cosT + armX * lean * sinT,
          wrapY + acrossY * armHalf * cosT + armY * lean * sinT,
          Math.atan2(tangentY, tangentX),
          ((Math.PI * armHalf) / perWrap) * 1.5 * (0.55 + 0.45 * facing)
        ];
        const cordAlpha = 0.45 + 0.5 * facing;

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
          cy + scale * 0.14 + Math.sin(arcA) * arcR * 0.74,
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

    ctx.clearRect(0, 0, w, h);

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

    // The speaker's chair, at the focus of the hemicycle. Fades in with the
    // arc and back out again, so it never floats over the other formations.
    const arcPresence = Math.max(0, 1 - Math.abs(p - 1));
    if (arcPresence > 0.01) {
      const { cx, cy, scale } = anchorRef.current;
      const seatY = cy + scale * 0.14;
      ctx.globalAlpha = 0.2 * arcPresence;
      ctx.fillStyle = '#0E1A1A';
      ctx.beginPath();
      ctx.arc(cx, seatY, Math.max(3, scale * 0.0075), 0, Math.PI * 2);
      ctx.fill();
      ctx.globalAlpha = 0.1 * arcPresence;
      ctx.strokeStyle = '#0E1A1A';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.arc(cx, seatY, Math.max(9, scale * 0.022), Math.PI, Math.PI * 2);
      ctx.stroke();
    }

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

      ctx.strokeStyle = s.colour;
      ctx.globalAlpha = idx === 0 ? lerp(s.cordAlpha, s.alpha, t) : s.alpha;
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.lineTo(x + Math.cos(ang) * len, y + Math.sin(ang) * len);
      ctx.stroke();
    }

    ctx.globalAlpha = 1;
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

  const section = SECTIONS[active];

  return (
    <div className="bg-paper text-stone-900">
      <div ref={scrollRef} style={{ height: `${STATES * 100}dvh` }} className="relative">
        <div className="sticky top-0 h-dvh overflow-hidden">
          <canvas
            ref={canvasRef}
            className="absolute inset-0 w-full h-full"
            aria-hidden="true"
          />

          <div className="relative h-full flex flex-col px-6 md:px-10 py-6 md:py-8">
            <div className="flex items-start justify-between gap-8">
              <span className="font-mono-term text-sm tracking-[0.12em] text-stone-900">
                (UP_27)
              </span>
              <nav aria-label="Jump into the terminal" className="flex flex-col items-end gap-1.5">
                {NAV.map((item) => (
                  <button
                    key={item.tab}
                    type="button"
                    onClick={() => onEnter(item.tab)}
                    className="group flex items-center gap-1.5 text-sm text-paper hover:text-white"
                  >
                    {item.label}
                    <span aria-hidden="true" className="text-paper/70 group-hover:text-white">
                      &#8599;
                    </span>
                  </button>
                ))}
              </nav>
            </div>

            <div className="flex-1 flex items-center">
              <div className="w-full flex items-center justify-between gap-8">
                <div className="max-w-[34rem]">
                  <h1 className="font-display text-[clamp(2.25rem,5.2vw,4rem)] leading-[1.04] text-stone-900">
                    {section.lead}{' '}
                    <span className="italic font-normal">{section.italic}</span>
                    <br />
                    {section.tail}
                  </h1>
                  <p className="mt-6 max-w-sm text-sm leading-relaxed text-stone-600">
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
                  className="font-mono-term text-sm tracking-[0.3em] text-stone-500 hidden md:block"
                  aria-hidden="true"
                >
                  ( {section.marker} )
                </span>
              </div>
            </div>

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
                      <span className="font-mono-term text-[11px] tracking-[0.1em] text-stone-600">
                        {p}
                      </span>
                    </li>
                  ))}
                </ul>
                <div className="flex items-center gap-4">
                  <button
                    type="button"
                    onClick={() => onEnter('bubbles')}
                    className="font-mono-term text-[11px] uppercase tracking-[0.14em] text-stone-500 hover:text-stone-900"
                  >
                    Skip to terminal
                  </button>
                  <span className="font-mono-term text-[11px] uppercase tracking-[0.14em] text-stone-400">
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
                      className={`h-0.5 w-8 ${i <= active ? 'bg-live-600' : 'bg-stone-300'}`}
                    />
                  ))}
                </div>
                <span className="font-mono-term tnum text-[11px] tracking-[0.12em] text-stone-500">
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
