import React, { useMemo, useState } from 'react';
import { Constituency, PoliticalParty } from '../types';
import { PARTY_COLORS } from '../data/upConstituencies';
import { MLA_REGISTRY, MlaRecord, Bench, OFFICE_HOLDERS } from '../data/mlaRegistry';
import { lawsBySponsorAc } from '../data/lawTrack';
import { ArrowRight, BadgeCheck, Scale } from 'lucide-react';

interface MlaTrackerProps {
  allConstituencies: Constituency[];
  onSelectConstituency: (c: Constituency) => void;
}

type BenchFilter = 'All' | Bench;

const BENCHES: BenchFilter[] = ['All', 'Treasury', 'Opposition'];

export const MlaTracker: React.FC<MlaTrackerProps> = ({
  allConstituencies,
  onSelectConstituency
}) => {
  const [bench, setBench] = useState<BenchFilter>('All');
  const [party, setParty] = useState<PoliticalParty | 'All'>('All');

  const parties = useMemo(() => {
    const set = new Set<PoliticalParty>(MLA_REGISTRY.map((m) => m.party));
    return ['All' as const, ...[...set].sort()];
  }, []);

  const rows = useMemo(
    () =>
      MLA_REGISTRY.filter(
        (m) => (bench === 'All' || m.bench === bench) && (party === 'All' || m.party === party)
      ),
    [bench, party]
  );

  const openSeat = (record: MlaRecord) => {
    const seat = allConstituencies.find((c) => c.acNumber === record.acNumber);
    if (seat) onSelectConstituency(seat);
  };

  return (
    <div className="h-full overflow-y-auto bg-paper">
      <div className="px-6 pt-6 pb-5 border-b border-rule">
        <p className="font-mono-term text-[11px] uppercase tracking-[0.14em] text-stone-500 mb-3">
          Members and offices / 18th Vidhan Sabha
        </p>
        <div className="flex flex-wrap items-end justify-between gap-6">
          <div>
            <h1 className="font-display text-3xl text-stone-900 mb-2">
              {OFFICE_HOLDERS.length} of {MLA_REGISTRY.length} named members hold office
            </h1>
            <p className="text-sm text-stone-500 max-w-2xl leading-relaxed">
              Every row links the member to the seat they hold and the bills
              they have moved. Portfolios are listed only where the office is
              confirmed, so an empty cell means unconfirmed, not none.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-6 mt-6">
          <div className="flex items-center gap-2">
            <span className="font-mono-term text-[11px] uppercase tracking-[0.12em] text-stone-500">
              Bench
            </span>
            <div className="flex gap-1 p-1 bg-panel border border-rule rounded-lg">
              {BENCHES.map((b) => (
                <button
                  key={b}
                  type="button"
                  onClick={() => setBench(b)}
                  aria-pressed={bench === b}
                  className={`px-3 h-8 rounded-md text-xs font-medium ${
                    bench === b
                      ? 'bg-paper text-stone-900 border border-rule'
                      : 'text-stone-500 hover:text-stone-800'
                  }`}
                >
                  {b}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <label
              htmlFor="party-filter"
              className="font-mono-term text-[11px] uppercase tracking-[0.12em] text-stone-500"
            >
              Party
            </label>
            <select
              id="party-filter"
              value={party}
              onChange={(e) => setParty(e.target.value as PoliticalParty | 'All')}
              className="h-9 px-3 bg-panel border border-rule rounded-md text-sm text-stone-800"
            >
              {parties.map((p) => (
                <option key={p} value={p}>
                  {p}
                </option>
              ))}
            </select>
          </div>

          <span className="font-mono-term tnum text-xs text-stone-500 ml-auto">
            {rows.length} shown
          </span>
        </div>
      </div>

      <table className="w-full">
        <caption className="sr-only">
          Members of the legislative assembly with their seat, bench and office
        </caption>
        <thead>
          <tr className="bg-panel">
            {['Member', 'Seat', 'Party', 'Office', 'Bills moved', 'Momentum', ''].map(
              (h, i) => (
                <th
                  key={h || `col-${i}`}
                  scope="col"
                  className="px-6 py-3 text-left font-mono-term text-[10px] font-medium uppercase tracking-[0.12em] text-stone-500"
                >
                  {h}
                </th>
              )
            )}
          </tr>
        </thead>
        <tbody>
          {rows.map((m) => {
            const bills = lawsBySponsorAc(m.acNumber);
            const colour = PARTY_COLORS[m.party].hex;
            return (
              <tr key={m.acNumber} className="border-b border-rule hover:bg-panel/70">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-stone-900">{m.name}</span>
                    {m.govRole && (
                      <BadgeCheck
                        className="w-4 h-4 text-live-700"
                        aria-label="Holds government office"
                      />
                    )}
                  </div>
                  {m.nameHindi && (
                    <div className="font-dv text-xs text-stone-500">{m.nameHindi}</div>
                  )}
                </td>
                <td className="px-6 py-4">
                  <div className="text-sm text-stone-800">
                    <span className="font-mono-term tnum text-stone-500 mr-2">
                      {m.acNumber}
                    </span>
                    {m.seat}
                  </div>
                  <div className="font-dv text-xs text-stone-500">{m.seatHindi}</div>
                </td>
                <td className="px-6 py-4">
                  <span className="font-mono-term text-xs font-medium" style={{ color: colour }}>
                    {m.party}
                  </span>
                  <div className="text-xs text-stone-500">{m.bench}</div>
                </td>
                <td className="px-6 py-4 max-w-[240px]">
                  {m.govRole ? (
                    <>
                      <div className="text-sm text-stone-800 leading-snug">
                        {m.govRole.role}
                      </div>
                      <div className="font-dv text-xs text-stone-500">
                        {m.govRole.roleHindi}
                      </div>
                    </>
                  ) : (
                    <span className="text-sm text-stone-400">No portfolio on record</span>
                  )}
                </td>
                <td className="px-6 py-4">
                  {bills.length > 0 ? (
                    <span className="flex items-center gap-1.5 font-mono-term tnum text-sm text-stone-800">
                      <Scale className="w-3.5 h-3.5 text-stone-400" aria-hidden="true" />
                      {bills.length}
                    </span>
                  ) : (
                    <span className="font-mono-term text-sm text-stone-400">0</span>
                  )}
                </td>
                <td className="px-6 py-4">
                  <span
                    className="font-mono-term tnum text-sm"
                    style={{ color: m.momentumScore >= 0 ? '#047857' : '#B91C1C' }}
                  >
                    {m.momentumScore >= 0 ? '+' : ''}
                    {m.momentumScore.toFixed(1)}
                  </span>
                  <div className="text-xs text-stone-500">{m.status2027}</div>
                </td>
                <td className="px-6 py-4 text-right">
                  <button
                    type="button"
                    onClick={() => openSeat(m)}
                    className="inline-flex items-center gap-1.5 h-9 px-3 rounded-md border border-rule text-xs font-medium text-stone-700 hover:text-live-800 hover:border-live-300"
                  >
                    Dossier
                    <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
                  </button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>

      {rows.length === 0 && (
        <div className="px-6 py-16 text-center">
          <p className="text-sm text-stone-600 mb-2">No member matches that pair of filters.</p>
          <button
            type="button"
            onClick={() => {
              setBench('All');
              setParty('All');
            }}
            className="font-mono-term text-xs uppercase tracking-[0.12em] text-live-700 hover:text-live-800"
          >
            Clear filters
          </button>
        </div>
      )}
    </div>
  );
};

export default MlaTracker;
