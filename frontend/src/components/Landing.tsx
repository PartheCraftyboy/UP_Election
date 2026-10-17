import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Constituency, UPRegion, PoliticalParty } from '../types';
import { PARTY_COLORS } from '../data/upConstituencies';
import { TabKey } from './Navbar';

interface LandingProps {
  allConstituencies: Constituency[];
  onEnter: (tab: TabKey) => void;
}

/**
 * Scroll-scrubbed hero. One strand per assembly seat, carried through four
 * formations: the incoming wire bundle, the chamber arc, the closed ring, and
 * the district clusters the terminal opens on.
 *
 * Drawn to canvas because 403 animated strands in the DOM is a different
 * conversation with the compositor. No animation dependency: the scrub is a
 * rAF loop over a scroll ratio.
 */

const STATES = 4;

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
      'Every Vidhan Sabha segment in Uttar Pradesh, scored twice an hour against 1,284 scraped Hindi and English sources.'
  },
  {
    marker: 'B',
    lead: 'THE HOUSE',
    italic: 'as it',
    tail: 'STANDS',
    body:
      'The NDA took 273 in 2022. The model has it at 231 for 2027, which still clears the 202 line by 29 seats.'
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
      'Districts carry the weight of their electors. Drag one and it springs back. Every bubble opens the seats inside it.'
  }
];

const NAV: { label: string; tab: TabKey }[] = [
  { label: 'seats', tab: 'map' },
  { label: 'districts', tab: 'bubbles' },
  { label: 'members', tab: 'mla' },
  { label: 'legislation', tab: 'laws' }
];

const REGION_SLOTS: UPRegion[] = [
  'Western UP',
  'Rohilkhand',
  'Braj',
  'Awadh',
  'Purvanchal',
  'Bundelkhand'
];

interface Strand {
  /** One formation per state: x, y, angle, length. */
  f: [number, number, number, number][];
  colour: string;
  alpha: number;
}

/** Deterministic jitter so the formation is stable across renders. */
const rnd = (i: number, salt: number): number => {
  const v = Math.sin(i * 12.9898 + salt * 78.233) * 43758.5453;
  return v - Math.floor(v);
};

const easeInOut = (t: number): number =>
  t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;

const lerp = (a: number, b: number, t: number): number => a + (b - a) * t;

export const Landing: React.FC<LandingProps> = ({ allConstituencies, onEnter }) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const progressRef = useRef(0);
  const drawnRef = useRef(-1);
  const sizeRef = useRef({ w: 0, h: 0 });

  const [progress, setProgress] = useState(0);

  const reduceMotion = useRef(
    typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches
  );

  const seats = useMemo(
    () =>
      allConstituencies.map((c) => ({
        party: c.projectedWinner2027 as PoliticalParty,
        region: c.region,
        voters: c.demographics.totalVoters
      })),
    [allConstituencies]
  );

  /** Builds every formation for the current canvas size. */
  const buildStrands = useCallback(
    (w: number, h: number): Strand[] => {
      const cx = w / 2;
      const cy = h / 2;
      const scale = Math.min(w, h);
      const maxVoters = Math.max(...seats.map((s) => s.voters));
      const rows = 9;
      const perRow = Math.ceil(seats.length / rows);

      return seats.map((seat, i) => {
        const u = i / seats.length;
        const j1 = rnd(i, 1);
        const j2 = rnd(i, 2);
        const len = (0.018 + 0.03 * Math.sqrt(seat.voters / maxVoters)) * scale;

        // A. the wire bundle, entering from the upper left
        const bt = u * 1.6 - 0.3;
        const bundle: [number, number, number, number] = [
          cx - scale * 0.42 + bt * scale * 0.5 + (j1 - 0.5) * scale * 0.12,
          cy - scale * 0.5 + bt * scale * 0.72 + (j2 - 0.5) * scale * 0.1,
          Math.PI * 0.42 + (j1 - 0.5) * 0.5,
          len * 1.5
        ];

        // B. the chamber arc, nine rows of a hemicycle
        const row = Math.floor(i / perRow);
        const col = i % perRow;
        const arcA = Math.PI + (col / Math.max(1, perRow - 1)) * Math.PI;
        const arcR = scale * (0.17 + (row / rows) * 0.17);
        const arc: [number, number, number, number] = [
          cx + Math.cos(arcA) * arcR,
          cy + scale * 0.14 + Math.sin(arcA) * arcR * 0.74,
          arcA,
          len
        ];

        // C. the closed ring, strands radiating from the iris
        const ringA = u * Math.PI * 2;
        const ringR = scale * (0.2 + j1 * 0.012);
        const ring: [number, number, number, number] = [
          cx + Math.cos(ringA) * ringR,
          cy + Math.sin(ringA) * ringR,
          ringA,
          len * (0.75 + j2 * 0.9)
        ];

        // D. district clusters, the shape the terminal opens on
        const slot = REGION_SLOTS.indexOf(seat.region);
        const sa = (slot / REGION_SLOTS.length) * Math.PI * 2 - Math.PI / 2;
        const sr = scale * 0.26;
        const spread = scale * 0.075;
        const cluster: [number, number, number, number] = [
          cx + Math.cos(sa) * sr + (j1 - 0.5) * spread * 2,
          cy + Math.sin(sa) * sr * 0.8 + (j2 - 0.5) * spread * 2,
          sa + (j1 - 0.5) * 1.2,
          len * 0.55
        ];

        return {
          f: [bundle, arc, ring, cluster],
          colour: PARTY_COLORS[seat.party]?.hex ?? '#5A6B6B',
          alpha: 0.5 + j2 * 0.45
        };
      });
    },
    [seats]
  );

  const strandsRef = useRef<Strand[]>([]);

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    const strands = strandsRef.current;
    if (!canvas || strands.length === 0) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const { w, h } = sizeRef.current;
    const p = progressRef.current * (STATES - 1);
    const idx = Math.min(STATES - 2, Math.floor(p));
    const t = easeInOut(Math.min(1, Math.max(0, p - idx)));

    ctx.clearRect(0, 0, w, h);
    ctx.lineCap = 'round';

    for (let i = 0; i < strands.length; i++) {
      const s = strands[i];
      const a = s.f[idx];
      const b = s.f[idx + 1];
      const x = lerp(a[0], b[0], t);
      const y = lerp(a[1], b[1], t);
      const ang = lerp(a[2], b[2], t);
      const len = lerp(a[3], b[3], t);

      ctx.strokeStyle = s.colour;
      ctx.globalAlpha = s.alpha;
      ctx.lineWidth = 1.15;
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.lineTo(x + Math.cos(ang) * len, y + Math.sin(ang) * len);
      ctx.stroke();
    }

    ctx.globalAlpha = 1;
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
      strandsRef.current = buildStrands(rect.width, rect.height);
      drawnRef.current = -1;
      draw();
    };

    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(canvas);
    return () => ro.disconnect();
  }, [buildStrands, draw]);

  /** Scroll scrub: one rAF loop, reading a ratio off the tall section. */
  useEffect(() => {
    let frame = 0;
    let queued = false;

    const measure = () => {
      const el = scrollRef.current;
      if (!el) return 0;
      const rect = el.getBoundingClientRect();
      const span = rect.height - window.innerHeight;
      if (span <= 0) return 0;
      return Math.min(1, Math.max(0, -rect.top / span));
    };

    const tick = () => {
      queued = false;
      const next = measure();
      const eased = reduceMotion.current
        ? Math.round(next * (STATES - 1)) / (STATES - 1)
        : next;

      if (Math.abs(eased - progressRef.current) > 0.0004) {
        progressRef.current = eased;
        draw();
        setProgress(eased);
      }
    };

    const onScroll = () => {
      if (queued) return;
      queued = true;
      frame = window.requestAnimationFrame(tick);
    };

    tick();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll, { passive: true });
    return () => {
      window.cancelAnimationFrame(frame);
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
    };
  }, [draw]);

  const p = progress * (STATES - 1);
  const active = Math.min(STATES - 1, Math.round(p));
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
                    className="group flex items-center gap-1.5 text-sm text-stone-600 hover:text-stone-900"
                  >
                    {item.label}
                    <span aria-hidden="true" className="text-stone-400 group-hover:text-live-700">
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

            <div className="flex items-end justify-between gap-8">
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
