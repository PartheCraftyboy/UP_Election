import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  forceSimulation,
  forceX,
  forceY,
  forceCollide,
  forceManyBody,
  Simulation,
  SimulationNodeDatum
} from 'd3-force';
import { drag as d3Drag } from 'd3-drag';
import { select } from 'd3-selection';
import { Constituency, UPRegion, PoliticalParty } from '../types';
import { PARTY_COLORS } from '../data/upConstituencies';
import { Users, Scissors, RotateCcw, ArrowRight } from 'lucide-react';

interface DistrictBubblesProps {
  allConstituencies: Constituency[];
  onSelectConstituency: (c: Constituency) => void;
}

/** Where each region's cluster is pulled to, as a fraction of the canvas. */
const REGION_ANCHORS: Record<UPRegion, [number, number]> = {
  'Western UP': [0.16, 0.3],
  Rohilkhand: [0.42, 0.18],
  Braj: [0.2, 0.74],
  Awadh: [0.52, 0.6],
  Purvanchal: [0.84, 0.36],
  Bundelkhand: [0.78, 0.82]
};

const REGION_ORDER: UPRegion[] = [
  'Western UP',
  'Rohilkhand',
  'Braj',
  'Awadh',
  'Purvanchal',
  'Bundelkhand'
];

interface BubbleNode extends SimulationNodeDatum {
  id: string;
  kind: 'district' | 'seat';
  label: string;
  labelHindi?: string;
  region: UPRegion;
  seats: Constituency[];
  voters: number;
  avgMomentum: number;
  leader: PoliticalParty;
  r: number;
  homeX: number;
  homeY: number;
  /** Set only on seat nodes, so a split cluster can be folded back. */
  parentId?: string;
}

const CANVAS_H = 560;

const majority = (values: PoliticalParty[]): PoliticalParty => {
  const tally = new Map<PoliticalParty, number>();
  values.forEach((v) => tally.set(v, (tally.get(v) ?? 0) + 1));
  return [...tally.entries()].sort((a, b) => b[1] - a[1])[0][0];
};

const compactVoters = (n: number): string =>
  n >= 10000000
    ? `${(n / 10000000).toFixed(2)} cr`
    : `${(n / 100000).toFixed(1)} lakh`;

export const DistrictBubbles: React.FC<DistrictBubblesProps> = ({
  allConstituencies,
  onSelectConstituency
}) => {
  const wrapRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const simRef = useRef<Simulation<BubbleNode, undefined> | null>(null);

  const [width, setWidth] = useState(1000);
  const [frame, setFrame] = useState<BubbleNode[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [splitId, setSplitId] = useState<string | null>(null);
  const [draggingId, setDraggingId] = useState<string | null>(null);

  const reduceMotion = useRef(
    typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches
  );

  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;
    const ro = new ResizeObserver(([entry]) => {
      setWidth(Math.max(560, entry.contentRect.width));
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  /** One bubble per district, area proportional to the elector count. */
  const districts = useMemo<BubbleNode[]>(() => {
    const byDistrict = new Map<string, Constituency[]>();
    allConstituencies.forEach((c) => {
      const list = byDistrict.get(c.district);
      if (list) list.push(c);
      else byDistrict.set(c.district, [c]);
    });

    const raw = [...byDistrict.entries()].map(([district, seats]) => {
      const voters = seats.reduce((sum, s) => sum + s.demographics.totalVoters, 0);
      return {
        district,
        seats,
        voters,
        region: seats[0].region,
        avgMomentum:
          seats.reduce((sum, s) => sum + s.momentumScore, 0) / seats.length,
        leader: majority(seats.map((s) => s.projectedWinner2027))
      };
    });

    const maxVoters = Math.max(...raw.map((d) => d.voters));

    return raw.map((d) => {
      const anchor = REGION_ANCHORS[d.region];
      // Area, not radius, carries the elector count.
      const r = 13 + 44 * Math.sqrt(d.voters / maxVoters);
      return {
        id: `d:${d.district}`,
        kind: 'district' as const,
        label: d.district,
        region: d.region,
        seats: d.seats,
        voters: d.voters,
        avgMomentum: d.avgMomentum,
        leader: d.leader,
        r,
        homeX: anchor[0] * width,
        homeY: anchor[1] * CANVAS_H,
        x: anchor[0] * width + (Math.random() - 0.5) * 40,
        y: anchor[1] * CANVAS_H + (Math.random() - 0.5) * 40
      };
    });
  }, [allConstituencies, width]);

  /** The live node set: districts, with one district optionally split open. */
  const nodes = useMemo<BubbleNode[]>(() => {
    if (!splitId) return districts;
    const parent = districts.find((d) => d.id === splitId);
    if (!parent) return districts;

    const maxSeatVoters = Math.max(
      ...parent.seats.map((s) => s.demographics.totalVoters)
    );
    const satellites: BubbleNode[] = parent.seats.map((s, i) => {
      const angle = (i / parent.seats.length) * Math.PI * 2;
      const spread = parent.r + 46;
      return {
        id: `s:${s.acNumber}`,
        kind: 'seat',
        label: s.name,
        labelHindi: s.nameHindi,
        region: s.region,
        seats: [s],
        voters: s.demographics.totalVoters,
        avgMomentum: s.momentumScore,
        leader: s.projectedWinner2027,
        r: 11 + 20 * Math.sqrt(s.demographics.totalVoters / maxSeatVoters),
        homeX: parent.homeX + Math.cos(angle) * spread,
        homeY: parent.homeY + Math.sin(angle) * spread,
        x: parent.homeX + Math.cos(angle) * 10,
        y: parent.homeY + Math.sin(angle) * 10,
        parentId: parent.id
      };
    });

    return [...districts.filter((d) => d.id !== splitId), ...satellites];
  }, [districts, splitId]);

  /**
   * The magnet: forceX and forceY hold every bubble against its home point,
   * so releasing a dragged bubble springs it back instead of leaving it where
   * it was dropped.
   */
  useEffect(() => {
    const sim = forceSimulation<BubbleNode>(nodes)
      .force('home-x', forceX<BubbleNode>((d) => d.homeX).strength(0.085))
      .force('home-y', forceY<BubbleNode>((d) => d.homeY).strength(0.085))
      .force('repel', forceManyBody<BubbleNode>().strength(-16))
      .force(
        'collide',
        forceCollide<BubbleNode>()
          .radius((d) => d.r + 2.5)
          .strength(0.9)
      )
      .velocityDecay(0.34)
      .alphaDecay(0.028)
      .on('tick', () => setFrame([...sim.nodes()]));

    simRef.current = sim;

    if (reduceMotion.current) {
      sim.stop();
      for (let i = 0; i < 260; i++) sim.tick();
      setFrame([...sim.nodes()]);
    }

    return () => {
      sim.stop();
      simRef.current = null;
    };
  }, [nodes]);

  /** Drag: pin while held, release to let the magnet pull it home. */
  useEffect(() => {
    const svg = svgRef.current;
    const sim = simRef.current;
    if (!svg || !sim) return;

    const behaviour = d3Drag<SVGGElement, unknown>()
      .container(svg)
      // `this` is the <g> the behaviour is bound to; currentTarget is already
      // gone by the time d3 resolves the subject.
      .subject(function (this: SVGGElement) {
        const id = this.dataset.id;
        return sim.nodes().find((n) => n.id === id) as BubbleNode;
      })
      .on('start', (event) => {
        const node = event.subject as BubbleNode;
        setDraggingId(node.id);
        node.fx = node.x;
        node.fy = node.y;
        if (!reduceMotion.current) sim.alphaTarget(0.32).restart();
      })
      .on('drag', (event) => {
        const node = event.subject as BubbleNode;
        node.fx = event.x;
        node.fy = event.y;
        if (reduceMotion.current) setFrame([...sim.nodes()]);
      })
      .on('end', (event) => {
        const node = event.subject as BubbleNode;
        node.fx = null;
        node.fy = null;
        setDraggingId(null);
        if (reduceMotion.current) {
          node.x = node.homeX;
          node.y = node.homeY;
          setFrame([...sim.nodes()]);
        } else {
          // Kick the simulation so the snap back is visible, then settle.
          sim.alphaTarget(0.28).restart();
          window.setTimeout(() => sim.alphaTarget(0), 90);
        }
      });

    select(svg).selectAll<SVGGElement, unknown>('g[data-id]').call(behaviour);
  }, [frame.length, nodes]);

  const selected = frame.find((n) => n.id === selectedId) ?? null;
  const dragging = frame.find((n) => n.id === draggingId) ?? null;

  const totalVoters = useMemo(
    () => districts.reduce((sum, d) => sum + d.voters, 0),
    [districts]
  );

  return (
    <div className="h-full flex flex-col lg:flex-row bg-paper">
      <div className="flex-1 min-w-0 flex flex-col">
        <div className="px-6 pt-6 pb-4 border-b border-rule">
          <p className="font-mono-term text-[11px] uppercase tracking-[0.14em] text-stone-500 mb-3">
            District mass / electors per bubble
          </p>
          <div className="flex flex-wrap items-end justify-between gap-6">
            <div>
              <h1 className="font-display text-3xl text-stone-900 mb-2">
                {districts.length} districts, {allConstituencies.length} seats
              </h1>
              <p className="text-sm text-stone-500 max-w-xl leading-relaxed">
                Seats fold into the district that contains them. Bubble area is
                the elector count, so Lucknow and Kanpur Nagar carry the weight
                their turnout actually has. Drag one and let go.
              </p>
            </div>
            <div className="flex gap-8">
              <div>
                <div className="font-mono-term tnum text-2xl text-stone-900">
                  {compactVoters(totalVoters)}
                </div>
                <div className="text-xs text-stone-500 mt-1">Electors mapped</div>
              </div>
              <div>
                <div className="font-mono-term tnum text-2xl text-stone-900">
                  {REGION_ORDER.length}
                </div>
                <div className="text-xs text-stone-500 mt-1">Region clusters</div>
              </div>
            </div>
          </div>
        </div>

        <div ref={wrapRef} className="flex-1 min-h-0 relative overflow-hidden">
          <svg
            ref={svgRef}
            width={width}
            height={CANVAS_H}
            viewBox={`0 0 ${width} ${CANVAS_H}`}
            role="img"
            aria-label="District bubble map. Bubble area is the elector count, colour is the projected winner."
            className="block touch-none select-none"
          >
            {REGION_ORDER.map((region) => {
              const [fx, fy] = REGION_ANCHORS[region];
              return (
                <text
                  key={region}
                  x={fx * width}
                  y={fy * CANVAS_H - 86}
                  textAnchor="middle"
                  className="font-mono-term"
                  style={{
                    fontSize: 11,
                    letterSpacing: '0.14em',
                    textTransform: 'uppercase',
                    fill: '#748A89'
                  }}
                >
                  {region}
                </text>
              );
            })}

            {/* Tether: shows the magnet pulling a held bubble home. */}
            {dragging && (
              <line
                x1={dragging.homeX}
                y1={dragging.homeY}
                x2={dragging.x ?? 0}
                y2={dragging.y ?? 0}
                stroke="#077D7E"
                strokeWidth={1.5}
                strokeDasharray="4 5"
                opacity={0.8}
              />
            )}

            {frame.map((node) => {
              const party = PARTY_COLORS[node.leader];
              const isSelected = node.id === selectedId;
              const isHeld = node.id === draggingId;
              const showLabel = node.r > 26 || isSelected || node.kind === 'seat';

              return (
                <g
                  key={node.id}
                  data-id={node.id}
                  role="button"
                  tabIndex={0}
                  aria-label={`${node.label}, ${node.seats.length} seat${
                    node.seats.length === 1 ? '' : 's'
                  }, ${compactVoters(node.voters)} electors, projected ${node.leader}`}
                  transform={`translate(${node.x ?? 0}, ${node.y ?? 0})`}
                  style={{ cursor: isHeld ? 'grabbing' : 'grab' }}
                  onClick={() => setSelectedId(node.id)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      setSelectedId(node.id);
                    }
                  }}
                >
                  <circle
                    r={node.r}
                    fill={party.hex}
                    fillOpacity={node.kind === 'seat' ? 0.14 : 0.1}
                    stroke={party.hex}
                    strokeWidth={isSelected ? 2.5 : isHeld ? 2 : 1.25}
                  />
                  {node.avgMomentum < -1 && (
                    <circle
                      r={node.r * 0.42}
                      fill={party.hex}
                      fillOpacity={0.3}
                      aria-hidden="true"
                    />
                  )}
                  {showLabel && (
                    <text
                      textAnchor="middle"
                      y={3}
                      style={{
                        fontSize: node.r > 40 ? 12 : 10,
                        fill: '#1F2E2D',
                        fontWeight: 500,
                        pointerEvents: 'none'
                      }}
                    >
                      {node.label.length > 14
                        ? `${node.label.slice(0, 13)}.`
                        : node.label}
                    </text>
                  )}
                </g>
              );
            })}
          </svg>
        </div>

        <div className="px-6 py-3 border-t border-rule flex flex-wrap items-center gap-x-6 gap-y-2">
          <span className="font-mono-term text-[11px] uppercase tracking-[0.12em] text-stone-500">
            Projected winner
          </span>
          {(['BJP', 'SP', 'BSP', 'INC'] as PoliticalParty[]).map((p) => (
            <span key={p} className="flex items-center gap-2 text-xs text-stone-700">
              <span
                aria-hidden="true"
                className="w-2.5 h-2.5 rounded-full"
                style={{ background: PARTY_COLORS[p].hex }}
              />
              {p}
            </span>
          ))}
          <span className="text-xs text-stone-500 ml-auto">
            Filled centre marks a district losing ground
          </span>
        </div>
      </div>

      <aside className="w-full lg:w-[360px] shrink-0 border-t lg:border-t-0 lg:border-l border-rule bg-panel overflow-y-auto">
        {!selected && (
          <div className="p-6">
            <h2 className="font-mono-term text-[11px] uppercase tracking-[0.14em] text-stone-500 mb-4">
              Inspector
            </h2>
            <p className="text-sm text-stone-600 leading-relaxed mb-6">
              Pick a bubble to see the seats inside it. Bigger bubble, more
              electors, not more area on a map.
            </p>
            <ul className="space-y-3">
              {districts
                .slice()
                .sort((a, b) => b.voters - a.voters)
                .slice(0, 8)
                .map((d) => (
                  <li key={d.id}>
                    <button
                      type="button"
                      onClick={() => setSelectedId(d.id)}
                      className="w-full flex items-center gap-3 text-left py-2 border-b border-rule hover:text-live-800"
                    >
                      <span
                        aria-hidden="true"
                        className="rounded-full shrink-0"
                        style={{
                          width: Math.max(8, d.r / 3),
                          height: Math.max(8, d.r / 3),
                          background: PARTY_COLORS[d.leader].hex
                        }}
                      />
                      <span className="flex-1 text-sm text-stone-800">{d.label}</span>
                      <span className="font-mono-term tnum text-xs text-stone-500">
                        {compactVoters(d.voters)}
                      </span>
                    </button>
                  </li>
                ))}
            </ul>
          </div>
        )}

        {selected && (
          <div className="p-6">
            <div className="flex items-start justify-between gap-4 mb-5">
              <div>
                <p className="font-mono-term text-[11px] uppercase tracking-[0.14em] text-stone-500 mb-2">
                  {selected.kind === 'district' ? 'District' : 'Assembly seat'}
                </p>
                <h2 className="font-display text-2xl text-stone-900">
                  {selected.label}
                </h2>
                {selected.labelHindi && (
                  <p className="font-dv text-base text-stone-500 mt-1">
                    {selected.labelHindi}
                  </p>
                )}
              </div>
              <button
                type="button"
                onClick={() => {
                  setSelectedId(null);
                  setSplitId(null);
                }}
                aria-label="Clear selection"
                className="w-11 h-11 shrink-0 grid place-items-center border border-rule rounded-md text-stone-500 hover:text-stone-800 hover:border-stone-300"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="p-4 bg-paper border border-rule rounded-md">
                <div className="font-mono-term tnum text-xl text-stone-900">
                  {compactVoters(selected.voters)}
                </div>
                <div className="text-xs text-stone-500 mt-1 flex items-center gap-1.5">
                  <Users className="w-3 h-3" aria-hidden="true" />
                  Electors
                </div>
              </div>
              <div className="p-4 bg-paper border border-rule rounded-md">
                <div
                  className="font-mono-term tnum text-xl"
                  style={{
                    color: selected.avgMomentum >= 0 ? '#047857' : '#B91C1C'
                  }}
                >
                  {selected.avgMomentum >= 0 ? '+' : ''}
                  {selected.avgMomentum.toFixed(1)}
                </div>
                <div className="text-xs text-stone-500 mt-1">Mean momentum</div>
              </div>
            </div>

            {selected.kind === 'district' && selected.seats.length > 1 && (
              <button
                type="button"
                onClick={() =>
                  setSplitId(splitId === selected.id ? null : selected.id)
                }
                className="w-full h-11 mb-6 px-4 flex items-center justify-center gap-2 rounded-md bg-live-600 text-white text-sm font-medium hover:bg-live-700"
              >
                <Scissors className="w-4 h-4" aria-hidden="true" />
                {splitId === selected.id
                  ? 'Fold seats back in'
                  : `Split into ${selected.seats.length} seats`}
              </button>
            )}

            <h3 className="font-mono-term text-[11px] uppercase tracking-[0.14em] text-stone-500 mb-2">
              Seats inside
            </h3>
            <ul>
              {selected.seats.map((seat) => (
                <li key={seat.acNumber}>
                  <button
                    type="button"
                    onClick={() => onSelectConstituency(seat)}
                    className="w-full py-3 flex items-center gap-3 text-left border-b border-rule group"
                  >
                    <span className="font-mono-term tnum text-xs text-stone-500 w-8">
                      {seat.acNumber}
                    </span>
                    <span className="flex-1 min-w-0">
                      <span className="block text-sm text-stone-800 group-hover:text-live-800">
                        {seat.name}
                      </span>
                      <span className="block font-dv text-xs text-stone-500">
                        {seat.nameHindi}
                      </span>
                    </span>
                    <span
                      className="font-mono-term text-xs"
                      style={{ color: PARTY_COLORS[seat.mlaParty].hex }}
                    >
                      {seat.mlaParty}
                    </span>
                    <ArrowRight
                      className="w-3.5 h-3.5 text-stone-400 group-hover:text-live-700"
                      aria-hidden="true"
                    />
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}
      </aside>
    </div>
  );
};

export default DistrictBubbles;
