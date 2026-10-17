import React from 'react';
import { 
  Network, 
  MapPin, 
  BarChart3, 
  Radio, 
  Zap
} from 'lucide-react';

interface NavbarProps {
  activeTab: 'graph' | 'map' | 'pulse' | 'news';
  setActiveTab: (tab: 'graph' | 'map' | 'pulse' | 'news') => void;
  liveArticlesCount: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  liveArticlesCount
}) => {
  return (
    <header className="sticky top-0 z-40 bg-[#faf8f5]/90 backdrop-blur-md border-b border-stone-200 px-4 lg:px-6 py-2.5 flex items-center justify-between">
      {/* Brand & Terminal Identifier */}
      <div className="flex items-center gap-3">
        <div className="relative flex items-center justify-center w-9 h-9 rounded-lg bg-amber-100 border border-amber-200">
          <Zap className="w-4 h-4 text-amber-600" />
          <span className="absolute -top-1 -right-1 flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
        </div>
        
        <div>
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold tracking-tight text-stone-800 font-display">
              VIDHAN SABHA 2027
            </span>
            <span className="hidden md:inline-block px-1.5 py-0.5 text-[10px] font-mono uppercase bg-stone-100 text-stone-600 rounded border border-stone-200">
              403 Seats
            </span>
          </div>
        </div>
      </div>

      {/* Main Navigation Tabs */}
      <nav className="flex items-center bg-[#f0ece4] p-1 rounded-xl border border-stone-200 text-xs font-mono">
        <button
          onClick={() => setActiveTab('graph')}
          className={`flex items-center gap-2 px-3 py-1.5 rounded-lg transition-all ${
            activeTab === 'graph'
              ? 'bg-stone-200 text-stone-900 border border-stone-300 shadow-sm'
              : 'text-stone-500 hover:text-stone-800 hover:bg-stone-200'
          }`}
        >
          <Network className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Obsidian Graph</span>
          <span className="sm:hidden">Graph</span>
        </button>

        <button
          onClick={() => setActiveTab('map')}
          className={`flex items-center gap-2 px-3 py-1.5 rounded-lg transition-all ${
            activeTab === 'map'
              ? 'bg-stone-200 text-stone-900 border border-stone-300 shadow-sm'
              : 'text-stone-500 hover:text-stone-800 hover:bg-stone-200'
          }`}
        >
          <MapPin className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">403 Constituencies</span>
          <span className="sm:hidden">403 ACs</span>
        </button>

        <button
          onClick={() => setActiveTab('pulse')}
          className={`flex items-center gap-2 px-3 py-1.5 rounded-lg transition-all ${
            activeTab === 'pulse'
              ? 'bg-stone-200 text-stone-900 border border-stone-300 shadow-sm'
              : 'text-stone-500 hover:text-stone-800 hover:bg-stone-200'
          }`}
        >
          <BarChart3 className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Statewide Pulse</span>
          <span className="sm:hidden">Pulse</span>
        </button>

        <button
          onClick={() => setActiveTab('news')}
          className={`flex items-center gap-2 px-3 py-1.5 rounded-lg transition-all ${
            activeTab === 'news'
              ? 'bg-stone-200 text-stone-900 border border-stone-300 shadow-sm'
              : 'text-stone-500 hover:text-stone-800 hover:bg-stone-200'
          }`}
        >
          <Radio className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Live Radar</span>
          <span className="sm:hidden">News</span>
          <span className="px-1.5 py-0.2 bg-stone-300 text-stone-800 text-[10px] rounded-full">
            {liveArticlesCount}
          </span>
        </button>
      </nav>
    </header>
  );
};
