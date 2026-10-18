import React, { useState } from 'react';
import {
  UP_EMPLOYMENT,
  EMPLOYMENT_SOURCE,
  SERIES_COLOUR
} from '../data/employment';

/**
 * Two series, one axis, because both are percentages of their own age group.
 * A count of jobs could not share this chart: a different unit needs its own.
 *
 * Drawn as plain SVG so it inherits the page's ink and sits on whatever ground
 * the scroll has reached.
 */
const W = 360;
const H = 176;
const PAD = { top: 10, right: 16, bottom: 26, left: 30 };
const MAX = 60;

const plotW = W - PAD.left - PAD.right;
const plotH = H - PAD.top - PAD.bottom;
const xAt = (i: number) =>
  PAD.left + (UP_EMPLOYMENT.length === 1 ? plotW / 2 : (i / (UP_EMPLOYMENT.length - 1)) * plotW);
const yAt = (v: number) => PAD.top + plotH - (v / MAX) * plotH;

const SERIES = [
  { key: 'youth' as const, label: 'Age 15 to 29', colour: SERIES_COLOUR.youth },
  { key: 'all' as const, label: 'Age 15 and above', colour: SERIES_COLOUR.all }
];

export const EmploymentChart: React.FC = () => {
  const [hover, setHover] = useState<number | null>(null);

  return (
    <figure className="m-0 max-w-[380px]">
      <figcaption className="font-mono-term text-[10px] uppercase tracking-[0.16em] opacity-60 mb-1">
        In work, Uttar Pradesh
      </figcaption>

      <div className="flex gap-4 mb-1">
        {SERIES.map((s) => (
          <span key={s.key} className="flex items-center gap-1.5">
            <span
              aria-hidden="true"
              className="h-[3px] w-4 rounded-full"
              style={{ background: s.colour }}
            />
            <span className="font-mono-term text-[10px] tracking-[0.08em] opacity-75">
              {s.label}
            </span>
          </span>
        ))}
      </div>

      <svg
        viewBox={`0 0 ${W} ${H}`}
        className="w-full h-auto"
        role="img"
        aria-label={`Worker population ratio in Uttar Pradesh. Ages 15 to 29 rose from ${UP_EMPLOYMENT[0].youth} to ${UP_EMPLOYMENT[UP_EMPLOYMENT.length - 1].youth} percent between ${UP_EMPLOYMENT[0].year} and ${UP_EMPLOYMENT[UP_EMPLOYMENT.length - 1].year}. Ages 15 and above rose from ${UP_EMPLOYMENT[0].all} to ${UP_EMPLOYMENT[UP_EMPLOYMENT.length - 1].all} percent.`}
        onMouseLeave={() => setHover(null)}
      >
        {[0, 20, 40, 60].map((v) => (
          <g key={v}>
            <line
              x1={PAD.left}
              y1={yAt(v)}
              x2={W - PAD.right}
              y2={yAt(v)}
              stroke="currentColor"
              strokeOpacity={v === 0 ? 0.3 : 0.12}
              strokeWidth={1}
            />
            <text
              x={PAD.left - 6}
              y={yAt(v) + 3}
              textAnchor="end"
              fontSize={9}
              fill="currentColor"
              fillOpacity={0.5}
              className="font-mono-term"
            >
              {v}
            </text>
          </g>
        ))}

        {UP_EMPLOYMENT.map((d, i) => (
          <text
            key={d.year}
            x={xAt(i)}
            y={H - 8}
            textAnchor="middle"
            fontSize={9}
            fill="currentColor"
            fillOpacity={hover === i ? 0.9 : 0.5}
            className="font-mono-term"
          >
            {d.year}
          </text>
        ))}

        <text
          x={PAD.left - 6}
          y={PAD.top - 2}
          textAnchor="end"
          fontSize={8}
          fill="currentColor"
          fillOpacity={0.45}
          className="font-mono-term"
        >
          %
        </text>

        {hover !== null && (
          <line
            x1={xAt(hover)}
            y1={PAD.top}
            x2={xAt(hover)}
            y2={PAD.top + plotH}
            stroke="currentColor"
            strokeOpacity={0.25}
            strokeWidth={1}
          />
        )}

        {SERIES.map((s) => (
          <g key={s.key}>
            <polyline
              points={UP_EMPLOYMENT.map((d, i) => `${xAt(i)},${yAt(d[s.key])}`).join(' ')}
              fill="none"
              stroke={s.colour}
              strokeWidth={2}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            {UP_EMPLOYMENT.map((d, i) => (
              <circle
                key={d.year}
                cx={xAt(i)}
                cy={yAt(d[s.key])}
                r={hover === i ? 5 : 4}
                fill={s.colour}
                stroke="currentColor"
                strokeWidth={2}
                strokeOpacity={0.001}
              />
            ))}
            <text
              x={xAt(UP_EMPLOYMENT.length - 1) + 6}
              y={yAt(UP_EMPLOYMENT[UP_EMPLOYMENT.length - 1][s.key]) + 3}
              fontSize={10}
              fill="currentColor"
              fillOpacity={0.85}
              className="font-mono-term"
            >
              {UP_EMPLOYMENT[UP_EMPLOYMENT.length - 1][s.key].toFixed(1)}
            </text>
          </g>
        ))}

        {UP_EMPLOYMENT.map((d, i) => (
          <rect
            key={d.year}
            x={xAt(i) - plotW / (UP_EMPLOYMENT.length * 2)}
            y={PAD.top}
            width={plotW / UP_EMPLOYMENT.length}
            height={plotH}
            fill="transparent"
            onMouseEnter={() => setHover(i)}
          />
        ))}
      </svg>

      <p className="mt-1 font-mono-term text-[9px] uppercase tracking-[0.1em] opacity-45">
        {EMPLOYMENT_SOURCE}
      </p>
    </figure>
  );
};
