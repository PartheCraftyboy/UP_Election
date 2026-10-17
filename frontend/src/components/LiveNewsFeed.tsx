import React, { useState } from 'react';
import { NewsArticle, Constituency } from '../types';
import { 
  Radio, 
  Search, 
  Filter, 
  Sparkles, 
  Network, 
  TrendingUp, 
  TrendingDown, 
  AlertTriangle, 
  Clock, 
  ChevronRight,
  Zap,
  ExternalLink
} from 'lucide-react';

interface LiveNewsFeedProps {
  newsArticles: NewsArticle[];
  allConstituencies: Constituency[];
  onInspectInGraph: (newsId: string) => void;
  onSelectConstituency: (constituency: Constituency) => void;
}

export const LiveNewsFeed: React.FC<LiveNewsFeedProps> = ({
  newsArticles,
  allConstituencies,
  onInspectInGraph,
  onSelectConstituency
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedIssue, setSelectedIssue] = useState<string>('ALL');

  const issues = [
    'ALL',
    'Youth & Paper Leaks',
    'Sugarcane & Farm MSP',
    'Caste Census / Reservation',
    'Urban Development & Traders',
    'AIIMS & Infrastructure'
  ];

  const filteredArticles = newsArticles.filter(n => {
    const matchIssue = selectedIssue === 'ALL' || n.primaryIssue === selectedIssue;
    const q = searchQuery.toLowerCase().trim();
    const matchSearch = !q ||
      n.title.toLowerCase().includes(q) ||
      n.titleHindi.includes(q) ||
      n.source.toLowerCase().includes(q) ||
      n.summary.toLowerCase().includes(q);

    return matchIssue && matchSearch;
  });

  return (
    <div className="w-full h-[calc(100vh-65px)] bg-[#faf8f5] overflow-y-auto p-4 lg:p-6 space-y-5">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-stone-200">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold text-[#44403c] font-display">
              Real-Time UP Political News Stream
            </h2>
          </div>
          <p className="text-xs text-stone-500 font-mono mt-0.5">
            Continuous updates from Jagran, Amar Ujala, Live Hindustan, ECI, and regional UP bureaus with automated emotion extraction.
          </p>
        </div>

        {/* Search */}
        <div className="relative flex items-center bg-[#f0ece4] border border-stone-200 rounded-xl px-3 py-1.5 text-xs">
          <Search className="w-3.5 h-3.5 text-stone-500 mr-2" />
          <input
            type="text"
            placeholder="Search news or Hindi text..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="bg-transparent text-[#44403c] placeholder-stone-500 focus:outline-none w-52 sm:w-64 font-mono text-xs"
          />
        </div>
      </div>

      {/* Strategic Issue Filter Bar */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-2 text-xs font-mono">
        <span className="text-[10px] text-stone-500 uppercase mr-1">Issue Focus:</span>
        {issues.map(iss => (
          <button
            key={iss}
            onClick={() => setSelectedIssue(iss)}
            className={`px-2.5 py-1 rounded-lg text-[11px] whitespace-nowrap transition-all ${
              selectedIssue === iss
                ? 'bg-amber-100 text-amber-800 border border-amber-200'
                : 'text-stone-600 hover:text-[#44403c] hover:bg-[#f0ece4]'
            }`}
          >
            {iss}
          </button>
        ))}
      </div>

      {/* Stream of News Cards */}
      <div className="space-y-3">
        {filteredArticles.map(article => (
          <div
            key={article.id}
            className="p-4 rounded-xl bg-white border border-stone-200 hover:border-stone-300 shadow-sm transition-all space-y-3"
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs font-mono">
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded bg-[#f0ece4] text-[#44403c] border border-stone-200 text-[10px]">
                  {article.source}
                </span>
                <span className="text-stone-500 flex items-center gap-1 text-[11px]">
                  <Clock className="w-3 h-3" />
                  {article.timestamp}
                </span>
                <span className="px-2 py-0.5 rounded bg-cyan-50 text-cyan-700 border border-cyan-100 text-[10px]">
                  {article.primaryIssue}
                </span>
              </div>

              {/* Sentiment badge */}
              <div className="flex items-center gap-2">
                <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                  article.sentimentScore >= 0
                    ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                    : 'bg-red-100 text-red-800 border border-red-200'
                }`}>
                  {article.sentimentScore >= 0 ? `+${article.sentimentScore}` : article.sentimentScore} Sentiment
                </span>

                <button
                  onClick={() => onInspectInGraph(article.id)}
                  className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 text-xs transition-colors"
                >
                  <Network className="w-3.5 h-3.5" />
                  <span>Trace in Graph</span>
                </button>
              </div>
            </div>

            <div>
              <h3 className="text-base font-bold text-[#44403c] font-display leading-snug">
                {article.title}
              </h3>
              <p className="text-xs text-stone-600 font-mono mt-1">
                {article.titleHindi}
              </p>
              <p className="text-xs text-stone-700 mt-2 leading-relaxed">
                {article.summary}
              </p>
            </div>

            {/* Propagation & Impact Summary */}
            <div className="p-3 rounded-lg bg-[#f0ece4] border border-stone-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs font-mono">
              <div>
                <span className="text-[10px] text-amber-800 uppercase block font-semibold">
                  Poll Impact Projection:
                </span>
                <p className="text-[#44403c] text-[11px] mt-0.5">
                  {article.pollImpactSummary}
                </p>
              </div>

              {/* Affected Seat tags */}
              {article.affectedConstituencies.length > 0 && (
                <div className="flex items-center gap-1.5 flex-shrink-0">
                  <span className="text-[10px] text-stone-500">Seats:</span>
                  {article.affectedConstituencies.map(acNum => {
                    const ac = allConstituencies.find(c => c.acNumber === acNum);
                    return (
                      <button
                        key={acNum}
                        onClick={() => ac && onSelectConstituency(ac)}
                        className="px-2 py-0.5 rounded bg-white hover:bg-stone-50 text-amber-800 text-[10px] border border-stone-200 shadow-sm"
                      >
                        #{acNum} {ac?.name.split(' ')[0]}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
