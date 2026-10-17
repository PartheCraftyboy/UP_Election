import React from 'react';
import { Constituency, NewsArticle } from '../types';
import { PARTY_COLORS } from '../data/upConstituencies';
import { 
  X, 
  MapPin, 
  User, 
  Award, 
  Vote, 
  TrendingUp, 
  TrendingDown, 
  AlertTriangle, 
  ShieldCheck, 
  Users, 
  Activity, 
  BookOpen, 
  Zap, 
  Radio
} from 'lucide-react';

interface ConstituencyDossierProps {
  constituency: Constituency | null;
  onClose: () => void;
  newsArticles: NewsArticle[];
  onSelectNews: (newsId: string) => void;
}

export const ConstituencyDossier: React.FC<ConstituencyDossierProps> = ({
  constituency,
  onClose,
  newsArticles,
  onSelectNews
}) => {
  if (!constituency) return null;

  const partyStyle = PARTY_COLORS[constituency.mlaParty];
  const projectedStyle = PARTY_COLORS[constituency.projectedWinner2027];

  // Connected news articles that affect this constituency
  const connectedNews = newsArticles.filter(n =>
    n.affectedConstituencies.includes(constituency.acNumber)
  );

  return (
    <div className="fixed inset-y-0 right-0 z-50 w-full sm:w-[460px] md:w-[520px] bg-[#faf8f5] border-l border-stone-200 shadow-xl flex flex-col animate-in slide-in-from-right duration-200">
      {/* Top Header */}
      <div className="p-4 border-b border-stone-200 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-xs font-mono text-amber-700 tracking-wider font-semibold">
            AC #{constituency.acNumber}
          </span>
        </div>
        <button
          onClick={onClose}
          className="p-1 rounded-lg text-stone-500 hover:text-[#44403c] hover:bg-stone-200 transition-colors font-mono text-xs"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto p-5 space-y-5">
        {/* Constituency Identity */}
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-stone-500 mb-1">
            <span>{constituency.district} DISTRICT</span>
            <span>&bull;</span>
            <span>{constituency.region}</span>
            {constituency.isReserved !== 'GEN' && (
              <span className="px-1.5 py-0.2 rounded bg-amber-100 text-amber-800 border border-amber-200 text-[10px]">
                {constituency.isReserved} RESERVED
              </span>
            )}
          </div>
          <h2 className="text-2xl font-black text-[#44403c] font-display tracking-tight">
            {constituency.name}
          </h2>
          <p className="text-sm text-stone-600 font-mono mt-0.5">
            {constituency.nameHindi}
          </p>
        </div>

        {/* 2027 Projected Outlook Banner */}
        <div className="p-3.5 rounded-xl bg-white border border-stone-200 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-mono text-stone-500 uppercase tracking-wider">
              2027 Projected Trend
            </span>
            <span className={`text-xs font-mono font-bold ${
              constituency.momentumScore >= 0 ? 'text-emerald-600' : 'text-red-600'
            }`}>
              {constituency.momentumScore >= 0 ? `+${constituency.momentumScore}% MOMENTUM` : `${constituency.momentumScore}% SWING`}
            </span>
          </div>

          <div className="mt-2 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span 
                className="px-2 py-0.5 rounded text-xs font-bold border"
                style={{ backgroundColor: `${projectedStyle.hex}15`, borderColor: `${projectedStyle.hex}30`, color: projectedStyle.hex }}
              >
                {constituency.projectedWinner2027}
              </span>
              <span className="text-sm font-semibold text-[#44403c]">
                {constituency.status2027}
              </span>
            </div>

            <div className="text-right">
              <span className="text-[10px] text-stone-500 font-mono block">WINNER 2022</span>
              <span 
                className="text-xs font-bold font-mono"
                style={{ color: partyStyle.hex }}
              >
                {constituency.mlaParty} ({constituency.margin2022.toLocaleString()} margin)
              </span>
            </div>
          </div>
        </div>

        {/* Incumbent MLA Profile Card */}
        <div className="p-4 rounded-xl bg-white border border-stone-200 shadow-sm space-y-3">
          <div className="flex items-center gap-2 text-xs font-mono text-stone-500">
            <User className="w-3.5 h-3.5 text-stone-400" />
            <span>INCUMBENT MLA & 2022 RESULTS</span>
          </div>

          <div className="flex items-start justify-between">
            <div>
              <h3 className="text-base font-bold text-[#44403c] font-display">
                {constituency.currentMla}
              </h3>
              <p className="text-xs text-stone-500 mt-0.5">
                Party: <span className="font-semibold text-stone-700">{constituency.mlaParty}</span>
              </p>
            </div>
            <span 
              className="px-2.5 py-1 rounded-lg text-xs font-bold font-mono border"
              style={{ backgroundColor: `${partyStyle.hex}15`, borderColor: `${partyStyle.hex}30`, color: partyStyle.hex }}
            >
              {constituency.mlaParty} MLA
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2 pt-2 border-t border-stone-100 text-xs font-mono">
            <div>
              <span className="text-[10px] text-stone-500 block">2022 Votes</span>
              <span className="text-stone-800 font-semibold">{constituency.winnerVotes2022.toLocaleString()}</span>
            </div>
            <div>
              <span className="text-[10px] text-stone-500 block">Winning Margin</span>
              <span className="text-emerald-600 font-semibold">+{constituency.margin2022.toLocaleString()}</span>
            </div>
            <div>
              <span className="text-[10px] text-stone-500 block">Runner-Up Party</span>
              <span className="text-stone-700 font-semibold">{constituency.runnerUpParty}</span>
            </div>
            <div>
              <span className="text-[10px] text-stone-500 block">Runner-Up Candidate</span>
              <span className="text-stone-700 font-semibold truncate block">{constituency.runnerUpCandidate}</span>
            </div>
          </div>
        </div>

        {/* Emotion & Sentiment Radar Metrics */}
        <div className="p-4 rounded-xl bg-white border border-stone-200 shadow-sm space-y-3">
          <div className="flex items-center justify-between text-xs font-mono">
            <span className="text-stone-500 flex items-center gap-1.5 font-semibold">
              <Activity className="w-3.5 h-3.5 text-stone-400" />
              CONSTITUENCY EMOTION PULSE
            </span>
          </div>

          <div className="space-y-2 text-xs font-mono">
            {/* Anti Incumbency */}
            <div>
              <div className="flex justify-between text-[11px] mb-1">
                <span className="text-stone-600">Anti-Incumbency / Discontent</span>
                <span className={constituency.emotions.antiIncumbency > 50 ? 'text-red-600 font-bold' : 'text-stone-600'}>
                  {constituency.emotions.antiIncumbency}%
                </span>
              </div>
              <div className="w-full h-1.5 bg-stone-200 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-red-400 rounded-full transition-all duration-500" 
                  style={{ width: `${constituency.emotions.antiIncumbency}%` }}
                />
              </div>
            </div>

            {/* Development Satisfaction */}
            <div>
              <div className="flex justify-between text-[11px] mb-1">
                <span className="text-stone-600">Development Satisfaction</span>
                <span className="text-emerald-600 font-bold">{constituency.emotions.developmentSatisfaction}%</span>
              </div>
              <div className="w-full h-1.5 bg-stone-200 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-emerald-400 rounded-full transition-all duration-500" 
                  style={{ width: `${constituency.emotions.developmentSatisfaction}%` }}
                />
              </div>
            </div>

            {/* Law and Order Trust */}
            <div>
              <div className="flex justify-between text-[11px] mb-1">
                <span className="text-stone-600">Law & Order Approval</span>
                <span className="text-cyan-600 font-bold">{constituency.emotions.lawAndOrderTrust}%</span>
              </div>
              <div className="w-full h-1.5 bg-stone-200 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-cyan-400 rounded-full transition-all duration-500" 
                  style={{ width: `${constituency.emotions.lawAndOrderTrust}%` }}
                />
              </div>
            </div>

            {/* Caste Polarization */}
            <div>
              <div className="flex justify-between text-[11px] mb-1">
                <span className="text-stone-600">Caste / Social Polarization</span>
                <span className="text-amber-600 font-bold">{constituency.emotions.castePolarization}%</span>
              </div>
              <div className="w-full h-1.5 bg-stone-200 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-amber-400 rounded-full transition-all duration-500" 
                  style={{ width: `${constituency.emotions.castePolarization}%` }}
                />
              </div>
            </div>

            {/* Youth Discontent */}
            <div>
              <div className="flex justify-between text-[11px] mb-1">
                <span className="text-stone-600">Youth & Employment Distress</span>
                <span className="text-orange-600 font-bold">{constituency.emotions.youthDiscontent}%</span>
              </div>
              <div className="w-full h-1.5 bg-stone-200 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-orange-400 rounded-full transition-all duration-500" 
                  style={{ width: `${constituency.emotions.youthDiscontent}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Demographics & Caste Calculus */}
        <div className="p-4 rounded-xl bg-white border border-stone-200 shadow-sm space-y-3">
          <div className="flex items-center gap-2 text-xs font-mono text-stone-500">
            <Users className="w-3.5 h-3.5 text-stone-400" />
            <span>DEMOGRAPHIC & CASTE CALCULUS</span>
          </div>

          <div className="grid grid-cols-3 gap-2 text-xs font-mono">
            <div className="bg-[#f0ece4] p-2 rounded-lg border border-stone-200 text-center">
              <span className="text-[10px] text-stone-500 block">Total Electorate</span>
              <span className="text-[#44403c] font-bold">{constituency.demographics.totalVoters.toLocaleString()}</span>
            </div>
            <div className="bg-[#f0ece4] p-2 rounded-lg border border-stone-200 text-center">
              <span className="text-[10px] text-stone-500 block">Rural / Urban</span>
              <span className="text-[#44403c] font-bold">{constituency.demographics.ruralPercentage}% / {constituency.demographics.urbanPercentage}%</span>
            </div>
            <div className="bg-[#f0ece4] p-2 rounded-lg border border-stone-200 text-center">
              <span className="text-[10px] text-stone-500 block">Literacy</span>
              <span className="text-[#44403c] font-bold">{constituency.demographics.literacyRate}%</span>
            </div>
          </div>

          {/* Social Groups Bar */}
          <div className="pt-2">
            <span className="text-[11px] font-mono text-stone-500 block mb-1.5">Estimated Social Composition:</span>
            <div className="w-full h-3 bg-stone-200 rounded-full overflow-hidden flex text-[8px] font-bold text-white font-mono">
              <div style={{ width: `${constituency.demographics.scPercentage}%` }} className="bg-blue-400 h-full title='SC/Dalit'" />
              <div style={{ width: `${constituency.demographics.muslimPercentage}%` }} className="bg-emerald-400 h-full title='Muslim'" />
              <div style={{ width: `${constituency.demographics.obcPercentage}%` }} className="bg-amber-400 h-full title='OBC'" />
              <div style={{ width: `${constituency.demographics.upperCastePercentage}%` }} className="bg-purple-400 h-full title='Upper Caste'" />
            </div>

            <div className="mt-2 grid grid-cols-4 gap-1 text-[10px] font-mono text-center">
              <div><span className="text-blue-600 font-bold">SC:</span> {constituency.demographics.scPercentage}%</div>
              <div><span className="text-emerald-600 font-bold">Muslim:</span> {constituency.demographics.muslimPercentage}%</div>
              <div><span className="text-amber-600 font-bold">OBC:</span> {constituency.demographics.obcPercentage}%</div>
              <div><span className="text-purple-600 font-bold">Gen:</span> {constituency.demographics.upperCastePercentage}%</div>
            </div>

            <p className="mt-2 text-xs text-stone-600 italic font-mono bg-[#f0ece4] p-2 rounded-lg border border-stone-200">
              Key Balance: {constituency.demographics.keyCasteFactor}
            </p>
          </div>
        </div>

        {/* Local Issues & Connected News */}
        <div className="p-4 rounded-xl bg-white border border-stone-200 shadow-sm space-y-3">
          <div className="flex items-center gap-2 text-xs font-mono text-stone-500">
            <Radio className="w-3.5 h-3.5 text-stone-400" />
            <span>CONNECTED INTELLIGENCE & NEWS IMPACT</span>
          </div>

          <div className="bg-[#f0ece4] p-2.5 rounded-lg border border-stone-200 text-xs">
            <span className="text-[10px] font-mono text-stone-500 uppercase block">Primary Ground Issue:</span>
            <p className="text-[#44403c] font-medium mt-0.5">{constituency.keyLocalIssue}</p>
          </div>

          {connectedNews.length > 0 ? (
            <div className="space-y-2">
              <span className="text-[10px] font-mono text-stone-500 uppercase block">Active News Signals ({connectedNews.length}):</span>
              {connectedNews.map(n => (
                <div
                  key={n.id}
                  onClick={() => onSelectNews(n.id)}
                  className="p-2.5 rounded-lg bg-white border border-stone-200 hover:border-amber-300 hover:shadow-sm transition-all cursor-pointer group"
                >
                  <div className="flex items-center justify-between text-[10px] font-mono text-stone-500 mb-0.5">
                    <span>{n.source}</span>
                    <span className={n.sentimentScore >= 0 ? 'text-emerald-600' : 'text-red-600'}>
                      {n.sentimentScore >= 0 ? `+${n.sentimentScore}` : n.sentimentScore} sentiment
                    </span>
                  </div>
                  <h5 className="text-xs font-semibold text-[#44403c] group-hover:text-amber-700 leading-snug">
                    {n.title}
                  </h5>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-stone-500 font-mono italic">
              No direct breaking events affecting this seat in the last 24 hours. Monitored in macro regional pool.
            </p>
          )}
        </div>
      </div>
    </div>
  );
};
