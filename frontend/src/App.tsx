import React, { useState, useMemo } from 'react';
import { Navbar, TabKey } from './components/Navbar';
import { ObsidianGraph } from './components/ObsidianGraph';
import ConstituencyMap from './components/ConstituencyMap';
import { ConstituencyDossier } from './components/ConstituencyDossier';
import { StatewidePulse } from './components/StatewidePulse';
import { LiveNewsFeed } from './components/LiveNewsFeed';
import { DistrictBubbles } from './components/DistrictBubbles';
import { MlaTracker } from './components/MlaTracker';
import { LawTracker } from './components/LawTracker';
import { Landing } from './components/Landing';
import { ALL_CONSTITUENCIES } from './data/upConstituencies';
import { INITIAL_NEWS_ARTICLES, generateObsidianGraphData } from './data/newsFeed';
import { Constituency, NewsArticle } from './types';
import { Radio, ChevronRight, Zap } from 'lucide-react';

export function App() {
  const [view, setView] = useState<'landing' | 'app'>('landing');
  const [activeTab, setActiveTab] = useState<TabKey>('bubbles');
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

  const enterTerminal = (tab: TabKey) => {
    setActiveTab(tab);
    setView('app');
    window.scrollTo({ top: 0 });
  };

  if (view === 'landing') {
    return <Landing allConstituencies={constituencies} onEnter={enterTerminal} />;
  }

  return (
    <div className="min-h-dvh bg-paper text-stone-800 flex flex-col font-sans">
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

        {activeTab === 'bubbles' && (
          <DistrictBubbles
            allConstituencies={constituencies}
            onSelectConstituency={handleSelectConstituency}
          />
        )}

        {activeTab === 'mla' && (
          <MlaTracker
            allConstituencies={constituencies}
            onSelectConstituency={handleSelectConstituency}
          />
        )}

        {activeTab === 'laws' && (
          <LawTracker
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
      <div className="h-8 bg-panel border-t border-rule px-6 flex items-center justify-between text-[11px] font-mono-term text-stone-600 select-none z-30">
        <div className="flex items-center gap-2 overflow-hidden">
          <span className="flex items-center gap-2 text-live-700 font-medium uppercase tracking-[0.12em] text-[10px]">
            <span className="w-1.5 h-1.5 rounded-full bg-live-600" />
            LIVE TICKER:
          </span>
          <div className="truncate text-stone-800">
            {newsArticles[0]?.title} &bull; <span className="text-live-800">{newsArticles[0]?.pollImpactSummary}</span>
          </div>
        </div>

        <div className="hidden md:flex items-center gap-4 text-stone-500 flex-shrink-0 text-[10px] tnum">
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
