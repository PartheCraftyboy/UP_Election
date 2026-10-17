import React, { useState, useMemo } from 'react';
import { Navbar } from './components/Navbar';
import { ObsidianGraph } from './components/ObsidianGraph';
import ConstituencyMap from './components/ConstituencyMap';
import { ConstituencyDossier } from './components/ConstituencyDossier';
import { StatewidePulse } from './components/StatewidePulse';
import { LiveNewsFeed } from './components/LiveNewsFeed';
import { ALL_CONSTITUENCIES } from './data/upConstituencies';
import { INITIAL_NEWS_ARTICLES, generateObsidianGraphData } from './data/newsFeed';
import { Constituency, NewsArticle } from './types';
import { Radio, ChevronRight, Zap } from 'lucide-react';

export function App() {
  const [activeTab, setActiveTab] = useState<'graph' | 'map' | 'pulse' | 'news'>('map');
  const [selectedConstituency, setSelectedConstituency] = useState<Constituency | null>(null);
  const [selectedNewsId, setSelectedNewsId] = useState<string | null>(null);

  // Initial graph data
  const { nodes: initialNodes, links: initialLinks } = useMemo(() => generateObsidianGraphData(), []);
  const [newsArticles] = useState<NewsArticle[]>(INITIAL_NEWS_ARTICLES);
  const [constituencies] = useState<Constituency[]>(ALL_CONSTITUENCIES);

  const handleSelectConstituency = (constituency: Constituency) => {
    setSelectedConstituency(constituency);
  };

  const handleInspectInGraph = (newsId: string) => {
    setSelectedNewsId(newsId);
    setActiveTab('graph');
  };

  return (
    <div className="min-h-screen bg-[#faf8f5] text-[#44403c] flex flex-col font-sans selection:bg-amber-100 selection:text-amber-900">
      {/* Terminal Navbar */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        liveArticlesCount={newsArticles.length}
      />

      {/* Main Tab Content */}
      <main className="flex-1 relative overflow-hidden">
        {activeTab === 'graph' && (
          <ObsidianGraph
            initialNodes={initialNodes}
            initialLinks={initialLinks}
            newsArticles={newsArticles}
            allConstituencies={constituencies}
            onSelectConstituency={handleSelectConstituency}
            selectedNewsId={selectedNewsId}
            onSelectNews={(id) => setSelectedNewsId(id)}
          />
        )}

        {activeTab === 'map' && (
          <ConstituencyMap
            allConstituencies={constituencies}
            selectedConstituency={selectedConstituency}
            onSelectConstituency={handleSelectConstituency}
          />
        )}

        {activeTab === 'pulse' && (
          <StatewidePulse
            allConstituencies={constituencies}
            onSelectConstituency={handleSelectConstituency}
          />
        )}

        {activeTab === 'news' && (
          <LiveNewsFeed
            newsArticles={newsArticles}
            allConstituencies={constituencies}
            onInspectInGraph={handleInspectInGraph}
            onSelectConstituency={handleSelectConstituency}
          />
        )}
      </main>

      {/* Bottom Ticker Tape */}
      <div className="h-7 bg-[#f0ece4] border-t border-stone-200 px-4 flex items-center justify-between text-[11px] font-mono text-stone-600 select-none z-30">
        <div className="flex items-center gap-2 overflow-hidden">
          <span className="flex items-center gap-1 text-amber-600 font-bold uppercase tracking-wider text-[10px]">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
            LIVE TICKER:
          </span>
          <div className="truncate text-stone-800">
            {newsArticles[0]?.title} &bull; <span className="text-amber-700">{newsArticles[0]?.pollImpactSummary}</span>
          </div>
        </div>

        <div className="hidden md:flex items-center gap-4 text-stone-500 flex-shrink-0 text-[10px]">
          <span>UP POPULATION: ~24.1 CR</span>
          <span>&bull;</span>
          <span>403 ASSEMBLY SEGMENTS</span>
        </div>
      </div>

      {/* Constituency Detailed Dossier Flyout */}
      <ConstituencyDossier
        constituency={selectedConstituency}
        onClose={() => setSelectedConstituency(null)}
        newsArticles={newsArticles}
        onSelectNews={handleInspectInGraph}
      />
    </div>
  );
}

export default App;
