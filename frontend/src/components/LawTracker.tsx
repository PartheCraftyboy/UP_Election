import React, { useMemo, useState } from 'react';
import { Constituency } from '../types';
import { PARTY_COLORS } from '../data/upConstituencies';
import { LAW_TRACK, LAW_STAGES, LawStage, LawTrackItem, STAGE_INDEX } from '../data/lawTrack';
import { MLA_REGISTRY } from '../data/mlaRegistry';
import { ArrowRight, FlaskConical } from 'lucide-react';

interface LawTrackerProps {
  allConstituencies: Constituency[];
  onSelectConstituency: (c: Constituency) => void;
}

const stageTone = (stage: LawStage): string =>
  stage === 'In force' || stage === 'Assented'
    ? '#066566'
    : stage === 'Passed'
    ? '#047857'
    : stage === 'Drafting'
    ? '#748A89'
    : '#465756';

export const LawTracker: React.FC<LawTrackerProps> = ({
  allConstituencies,
  onSelectConstituency
}) => {
  const [stageFilter, setStageFilter] = useState<LawStage | 'All'>('All');

  const items = useMemo(
    () =>
      LAW_TRACK.filter((l) => stageFilter === 'All' || l.stage === stageFilter).sort(
        (a, b) => STAGE_INDEX(b.stage) - STAGE_INDEX(a.stage)
      ),
    [stageFilter]
  );

  const inForce = LAW_TRACK.filter((l) => l.stage === 'In force' || l.stage === 'Assented').length;
  const seatsTouched = LAW_TRACK.reduce((sum, l) => sum + l.affectedSeats, 0);

  const sponsorOf = (law: LawTrackItem) =>
    law.sponsorAc ? MLA_REGISTRY.find((m) => m.acNumber === law.sponsorAc) : undefined;

  const openSponsorSeat = (acNumber: number) => {
    const seat = allConstituencies.find((c) => c.acNumber === acNumber);
    if (seat) onSelectConstituency(seat);
  };

  return (
    <div className="h-full overflow-y-auto bg-paper">
      <div className="px-6 pt-6 pb-5 border-b border-rule">
        <p className="font-mono-term text-[11px] uppercase tracking-[0.14em] text-stone-500 mb-3">
          Legislation tracker / विधान ट्रैकर
        </p>
        <div className="flex flex-wrap items-end justify-between gap-6">
          <div>
            <h1 className="font-display text-3xl text-stone-900 mb-2">
              {inForce} in force, {LAW_TRACK.length - inForce} still moving
            </h1>
            <p className="text-sm text-stone-500 max-w-2xl leading-relaxed">
              Each bill carries the seats its outcome reaches, so a tabled
              resolution and a notified act sit on the same scale. Headlines run
              in Hindi and English because the wire does.
            </p>
          </div>
          <div className="flex gap-8">
            <div>
              <div className="font-mono-term tnum text-2xl text-stone-900">{seatsTouched}</div>
              <div className="text-xs text-stone-500 mt-1">Seat exposures</div>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap gap-1 mt-6 p-1 bg-panel border border-rule rounded-lg w-fit">
          {(['All', ...LAW_STAGES] as (LawStage | 'All')[]).map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => setStageFilter(s)}
              aria-pressed={stageFilter === s}
              className={`px-3 h-8 rounded-md text-xs font-medium ${
                stageFilter === s
                  ? 'bg-paper text-stone-900 border border-rule'
                  : 'text-stone-500 hover:text-stone-800'
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      <ul className="divide-y divide-rule">
        {items.map((law) => {
          const sponsor = sponsorOf(law);
          const reached = STAGE_INDEX(law.stage);
          return (
            <li key={law.id} className="px-6 py-6">
              <div className="flex flex-wrap gap-8">
                <div className="flex-1 min-w-[320px]">
                  <div className="flex items-center gap-3 mb-3">
                    <span
                      className="font-mono-term text-[11px] uppercase tracking-[0.12em] px-2 py-1 rounded"
                      style={{ color: stageTone(law.stage), background: '#ECF2F2' }}
                    >
                      {law.stage}
                    </span>
                    <span className="font-mono-term tnum text-xs text-stone-500">
                      {law.stageDate}
                    </span>
                    {law.isSample && (
                      <span className="flex items-center gap-1 text-xs text-stone-400">
                        <FlaskConical className="w-3 h-3" aria-hidden="true" />
                        sample row
                      </span>
                    )}
                  </div>

                  <h2 className="text-lg font-medium text-stone-900 leading-snug mb-1">
                    {law.title}
                  </h2>
                  <p className="font-dv text-base text-stone-600 mb-3">{law.titleHindi}</p>
                  <p className="text-sm text-stone-600 leading-relaxed mb-2 max-w-2xl">
                    {law.summary}
                  </p>
                  <p className="font-dv text-sm text-stone-500 leading-relaxed max-w-2xl">
                    {law.summaryHindi}
                  </p>

                  <div className="flex flex-wrap items-center gap-x-6 gap-y-2 mt-4">
                    <span className="text-xs text-stone-500">
                      {law.ministry}
                      <span className="font-dv text-stone-400"> / {law.ministryHindi}</span>
                    </span>
                    {sponsor && (
                      <button
                        type="button"
                        onClick={() => openSponsorSeat(sponsor.acNumber)}
                        className="inline-flex items-center gap-2 text-xs text-stone-700 hover:text-live-800"
                      >
                        <span
                          aria-hidden="true"
                          className="w-2 h-2 rounded-full"
                          style={{ background: PARTY_COLORS[sponsor.party].hex }}
                        />
                        Moved by {sponsor.name}, AC {sponsor.acNumber}
                        <ArrowRight className="w-3 h-3" aria-hidden="true" />
                      </button>
                    )}
                  </div>
                </div>

                <div className="w-full lg:w-[280px] shrink-0">
                  <div className="p-4 bg-panel rounded-md mb-4">
                    <div className="flex items-baseline justify-between gap-3 mb-3">
                      <span className="font-mono-term text-[11px] uppercase tracking-[0.12em] text-stone-500">
                        Seats reached
                      </span>
                      <span className="font-mono-term tnum text-xl text-stone-900">
                        {law.affectedSeats}
                      </span>
                    </div>
                    <div className="h-2 bg-rule rounded-sm overflow-hidden">
                      <div
                        className="h-2 rounded-sm bg-live-600"
                        style={{ width: `${Math.min(100, (law.affectedSeats / 403) * 100 * 4)}%` }}
                      />
                    </div>
                    <div className="flex items-baseline justify-between gap-3 mt-3">
                      <span className="text-xs text-stone-500">{law.affectedRegion}</span>
                      <span
                        className="font-mono-term tnum text-xs"
                        style={{ color: law.sentimentScore >= 0 ? '#047857' : '#B91C1C' }}
                      >
                        {law.sentimentScore >= 0 ? '+' : ''}
                        {law.sentimentScore.toFixed(2)}
                      </span>
                    </div>
                  </div>

                  <ol className="flex items-center gap-1" aria-label={`Stage: ${law.stage}`}>
                    {LAW_STAGES.map((s, i) => (
                      <li key={s} className="flex-1">
                        <span
                          className="block h-1.5 rounded-sm"
                          style={{
                            background: i <= reached ? stageTone(law.stage) : '#DCE6E5'
                          }}
                        />
                        <span className="sr-only">{s}</span>
                      </li>
                    ))}
                  </ol>
                  <div className="flex justify-between mt-2">
                    <span className="font-mono-term text-[10px] uppercase tracking-[0.1em] text-stone-400">
                      Draft
                    </span>
                    <span className="font-mono-term text-[10px] uppercase tracking-[0.1em] text-stone-400">
                      In force
                    </span>
                  </div>
                </div>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
};

export default LawTracker;
