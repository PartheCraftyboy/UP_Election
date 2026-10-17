import React, { useMemo } from 'react';
import { Constituency, UPRegion, PoliticalParty } from '../types';
import { PARTY_COLORS } from '../data/upConstituencies';
import { 
  BarChart3, 
  TrendingUp, 
  TrendingDown, 
  PieChart, 
  ShieldAlert, 
  Award, 
  Flame, 
  CheckCircle2, 
  Zap,
  Layers
} from 'lucide-react';

interface StatewidePulseProps {
  allConstituencies: Constituency[];
  onSelectConstituency: (constituency: Constituency) => void;
}

export const StatewidePulse: React.FC<StatewidePulseProps> = ({
  allConstituencies,
  onSelectConstituency
}) => {
  // Aggregate projected vs 2022 tallies
  const partyTallies = useMemo(() => {
    const actual2022: Record<string, number> = {
      BJP: 0, SP: 0, RLD: 0, 'AD(S)': 0, NISHAD: 0, SBSP: 0, INC: 0, BSP: 0, 'Jansatta Dal': 0, OTH: 0
    };
    const projected2027: Record<string, number> = {
      BJP: 0, SP: 0, RLD: 0, 'AD(S)': 0, NISHAD: 0, SBSP: 0, INC: 0, BSP: 0, 'Jansatta Dal': 0, OTH: 0
    };

    allConstituencies.forEach(c => {
      actual2022[c.mlaParty] = (actual2022[c.mlaParty] || 0) + 1;
      projected2027[c.projectedWinner2027] = (projected2027[c.projectedWinner2027] || 0) + 1;
    });

    return { actual2022, projected2027 };
  }, [allConstituencies]);

  // Regional breakdown
  const regionalBreakdown = useMemo(() => {
    const regions: UPRegion[] = ['Western UP', 'Rohilkhand', 'Braj', 'Awadh', 'Purvanchal', 'Bundelkhand'];
    return regions.map(reg => {
      const seats = allConstituencies.filter(c => c.region === reg);
      let bjpIncumbent = 0;
      let spIncumbent = 0;
      let otherIncumbent = 0;
      let bjpProjected = 0;
      let spProjected = 0;

      seats.forEach(s => {
        if (s.mlaParty === 'BJP' || s.mlaParty === 'RLD' || s.mlaParty === 'AD(S)' || s.mlaParty === 'NISHAD' || s.mlaParty === 'SBSP') bjpIncumbent++;
        else if (s.mlaParty === 'SP' || s.mlaParty === 'INC') spIncumbent++;
        else otherIncumbent++;

        if (s.projectedWinner2027 === 'BJP' || s.projectedWinner2027 === 'RLD' || s.projectedWinner2027 === 'AD(S)' || s.projectedWinner2027 === 'NISHAD' || s.projectedWinner2027 === 'SBSP') bjpProjected++;
        else spProjected++;
      });

      return {
        region: reg,
        totalSeats: seats.length,
        bjpIncumbent,
        spIncumbent,
        bjpProjected,
        spProjected,
        swing: bjpProjected - bjpIncumbent
      };
    });
  }, [allConstituencies]);

  // Macro voter mood
  const macroMood = useMemo(() => {
    let totalAntiInc = 0;
    let totalDev = 0;
    let totalLaw = 0;
    let totalYouth = 0;
    allConstituencies.forEach(c => {
      totalAntiInc += c.emotions.antiIncumbency;
      totalDev += c.emotions.developmentSatisfaction;
      totalLaw += c.emotions.lawAndOrderTrust;
      totalYouth += c.emotions.youthDiscontent;
    });
    const len = allConstituencies.length || 1;
    return {
      antiIncumbency: Math.round(totalAntiInc / len),
      development: Math.round(totalDev / len),
      lawAndOrder: Math.round(totalLaw / len),
      youthDistress: Math.round(totalYouth / len)
    };
  }, [allConstituencies]);

  // Most volatile toss-up seats
  const tossUpSeats = useMemo(() => {
    return allConstituencies
      .filter(c => c.status2027 === 'Toss-up / Battleground' || c.status2027 === 'Probable Flip')
      .slice(0, 8);
  }, [allConstituencies]);

  return (
    <div className="w-full h-[calc(100vh-65px)] bg-[#faf8f5] overflow-y-auto p-4 lg:p-6 space-y-6">
      {/* Title */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-4 border-b border-stone-300">
        <div>
          <div className="flex items-center gap-2">
            
            <h2 className="text-xl font-bold text-stone-800 font-display">
              Uttar Pradesh Assembly 2027 &bull; Macro Poll Projection
            </h2>
          </div>
          <p className="text-xs text-[#78716c] font-mono mt-0.5">
            Aggregated projection across all 403 Vidhan Sabha segments (Majority Mark: 202 Seats).
          </p>
        </div>

        <div className="flex items-center gap-2 bg-[#f0ece4] px-3 py-1.5 rounded-xl border border-stone-300 text-xs font-mono">
          <Zap className="w-3.5 h-3.5 text-amber-600" />
          <span>MAJORITY BENCHMARK: <strong className="text-stone-800">202 / 403</strong></span>
        </div>
      </div>

      {/* Assembly Seat Bar Projection */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* NDA Coalition */}
        <div className="p-4 rounded-xl bg-[#f0ece4] border border-orange-500/30 relative overflow-hidden">
          <div className="flex items-center justify-between text-xs font-mono text-[#78716c]">
            <span>NDA COALITION</span>
            <span className="text-orange-600 font-bold">BJP + RLD + AD(S) + NISHAD</span>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-3xl font-black text-stone-800 font-display">
              {partyTallies.projected2027.BJP + partyTallies.projected2027.RLD + partyTallies.projected2027['AD(S)'] + partyTallies.projected2027.NISHAD + partyTallies.projected2027.SBSP}
            </span>
            <span className="text-xs font-mono text-[#78716c]">Projected 2027 Seats</span>
          </div>
          <div className="mt-1 flex items-center justify-between text-[11px] font-mono text-[#78716c]">
            <span>2022 Won: 273</span>
            <span className="text-red-600">-18 to -24 Net Delta</span>
          </div>
          <div className="mt-2 w-full h-1.5 bg-stone-200 rounded-full overflow-hidden">
            <div className="h-full bg-orange-500 rounded-full" style={{ width: '63%' }} />
          </div>
        </div>

        {/* INDIA / SP Coalition */}
        <div className="p-4 rounded-xl bg-[#f0ece4] border border-red-500/30 relative overflow-hidden">
          <div className="flex items-center justify-between text-xs font-mono text-[#78716c]">
            <span>PDA / INDIA COALITION</span>
            <span className="text-red-600 font-bold">SP + CONGRESS</span>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-3xl font-black text-stone-800 font-display">
              {partyTallies.projected2027.SP + partyTallies.projected2027.INC}
            </span>
            <span className="text-xs font-mono text-[#78716c]">Projected 2027 Seats</span>
          </div>
          <div className="mt-1 flex items-center justify-between text-[11px] font-mono text-[#78716c]">
            <span>2022 Won: 125</span>
            <span className="text-emerald-600">+22 to +28 Net Delta</span>
          </div>
          <div className="mt-2 w-full h-1.5 bg-stone-200 rounded-full overflow-hidden">
            <div className="h-full bg-red-500 rounded-full" style={{ width: '37%' }} />
          </div>
        </div>

        {/* BSP */}
        <div className="p-4 rounded-xl bg-[#f0ece4] border border-blue-500/30 relative overflow-hidden">
          <div className="flex items-center justify-between text-xs font-mono text-[#78716c]">
            <span>BAHUJAN SAMAJ PARTY</span>
            <span className="text-blue-600 font-bold">BSP (SOLO CONTEST)</span>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-3xl font-black text-stone-800 font-display">
              {partyTallies.projected2027.BSP}
            </span>
            <span className="text-xs font-mono text-[#78716c]">Projected Seats</span>
          </div>
          <div className="mt-1 flex items-center justify-between text-[11px] font-mono text-[#78716c]">
            <span>2022 Won: 1</span>
            <span className="text-[#78716c]">Vote-splitter in 110 ACs</span>
          </div>
          <div className="mt-2 w-full h-1.5 bg-stone-200 rounded-full overflow-hidden">
            <div className="h-full bg-blue-500 rounded-full" style={{ width: '3%' }} />
          </div>
        </div>

        {/* Others */}
        <div className="p-4 rounded-xl bg-[#f0ece4] border border-stone-300 relative overflow-hidden">
          <div className="flex items-center justify-between text-xs font-mono text-[#78716c]">
            <span>OTHERS & IND</span>
            <span className="text-stone-600 font-bold">JANSATTA DAL / IND</span>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-3xl font-black text-stone-800 font-display">
              {partyTallies.projected2027['Jansatta Dal'] + partyTallies.projected2027.OTH}
            </span>
            <span className="text-xs font-mono text-[#78716c]">Projected Seats</span>
          </div>
          <div className="mt-1 flex items-center justify-between text-[11px] font-mono text-[#78716c]">
            <span>2022 Won: 4</span>
            <span className="text-[#78716c]">Local Strongholds</span>
          </div>
          <div className="mt-2 w-full h-1.5 bg-stone-200 rounded-full overflow-hidden">
            <div className="h-full bg-stone-400 rounded-full" style={{ width: '2%' }} />
          </div>
        </div>
      </div>

      {/* Regional Matrix & Macro Sentiment */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Regional Breakdown Table */}
        <div className="lg:col-span-2 p-4 rounded-xl bg-[#f0ece4] border border-stone-300 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-stone-800 font-display flex items-center gap-2">
              <Layers className="w-4 h-4 text-amber-600" />
              Regional Battleground Breakdown (6 Political Zones)
            </h3>
            <span className="text-xs font-mono text-[#78716c]">403 SEATS</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs font-mono text-left">
              <thead>
                <tr className="border-b border-stone-300 text-[#78716c] text-[10px] uppercase">
                  <th className="py-2">Zone / Region</th>
                  <th className="py-2 text-center">Total Seats</th>
                  <th className="py-2 text-center">NDA 2022</th>
                  <th className="py-2 text-center">SP+ 2022</th>
                  <th className="py-2 text-center">NDA 2027 Proj</th>
                  <th className="py-2 text-center">SP+ 2027 Proj</th>
                  <th className="py-2 text-right">Momentum Delta</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-300">
                {regionalBreakdown.map(reg => (
                  <tr key={reg.region} className="hover:bg-stone-200/30">
                    <td className="py-2.5 font-bold text-stone-800">{reg.region}</td>
                    <td className="py-2.5 text-center text-stone-600">{reg.totalSeats}</td>
                    <td className="py-2.5 text-center text-orange-600">{reg.bjpIncumbent}</td>
                    <td className="py-2.5 text-center text-red-600">{reg.spIncumbent}</td>
                    <td className="py-2.5 text-center font-bold text-orange-700">{reg.bjpProjected}</td>
                    <td className="py-2.5 text-center font-bold text-red-700">{reg.spProjected}</td>
                    <td className={`py-2.5 text-right font-bold ${reg.swing >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                      {reg.swing >= 0 ? `+${reg.swing}` : reg.swing} Seats
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Macro Sentiment Pulse Indices */}
        <div className="p-4 rounded-xl bg-[#f0ece4] border border-stone-300 space-y-4">
          <h3 className="text-sm font-bold text-stone-800 font-display flex items-center gap-2">
            <Flame className="w-4 h-4 text-orange-600" />
            Macro UP Voter Mood Indices
          </h3>

          <div className="space-y-3 font-mono text-xs">
            <div>
              <div className="flex justify-between text-[11px] mb-1">
                <span className="text-[#78716c]">State Anti-Incumbency Index</span>
                <span className="text-amber-600 font-bold">{macroMood.antiIncumbency}%</span>
              </div>
              <div className="w-full h-1.5 bg-stone-200 rounded-full overflow-hidden">
                <div className="h-full bg-amber-500 rounded-full" style={{ width: `${macroMood.antiIncumbency}%` }} />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-[11px] mb-1">
                <span className="text-[#78716c]">Development & Infrastructure Approval</span>
                <span className="text-emerald-600 font-bold">{macroMood.development}%</span>
              </div>
              <div className="w-full h-1.5 bg-stone-200 rounded-full overflow-hidden">
                <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${macroMood.development}%` }} />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-[11px] mb-1">
                <span className="text-[#78716c]">Law & Order Trust Rating</span>
                <span className="text-cyan-600 font-bold">{macroMood.lawAndOrder}%</span>
              </div>
              <div className="w-full h-1.5 bg-stone-200 rounded-full overflow-hidden">
                <div className="h-full bg-cyan-500 rounded-full" style={{ width: `${macroMood.lawAndOrder}%` }} />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-[11px] mb-1">
                <span className="text-[#78716c]">Youth & Employment Distress</span>
                <span className="text-red-600 font-bold">{macroMood.youthDistress}%</span>
              </div>
              <div className="w-full h-1.5 bg-stone-200 rounded-full overflow-hidden">
                <div className="h-full bg-red-500 rounded-full" style={{ width: `${macroMood.youthDistress}%` }} />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Toss-up / High Sensitivity Battleground Watchlist */}
      <div className="p-4 rounded-xl bg-[#f0ece4] border border-stone-300 space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-stone-800 font-display flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 text-red-600" />
            Top High-Sensitivity Battlegrounds & Toss-up Constituencies
          </h3>
          <span className="text-xs font-mono text-[#78716c]">Margin &lt; 5,000 votes in 2022</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {tossUpSeats.map(c => (
            <div
              key={c.acNumber}
              onClick={() => onSelectConstituency(c)}
              className="p-3 rounded-lg bg-[#f0ece4] border border-stone-300 hover:border-amber-500/60 transition-all cursor-pointer group"
            >
              <div className="flex items-center justify-between text-[10px] font-mono text-[#78716c] mb-1">
                <span>#{c.acNumber} {c.district}</span>
                <span className="text-amber-600 font-semibold">{c.status2027}</span>
              </div>
              <h4 className="text-xs font-bold text-stone-800 group-hover:text-amber-700">
                {c.name}
              </h4>
              <div className="mt-1 flex items-center justify-between text-[10px] font-mono text-[#78716c]">
                <span>Incumbent: <strong className="text-stone-700">{c.mlaParty}</strong></span>
                <span className="text-red-600 font-semibold">Margin: {c.margin2022.toLocaleString()}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
