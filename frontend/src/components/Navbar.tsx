import React from 'react';
import { Network, MapPin, BarChart3, Radio, CircleDot, Users, Scale } from 'lucide-react';

export type TabKey = 'graph' | 'map' | 'pulse' | 'news' | 'bubbles' | 'mla' | 'laws';

interface NavbarProps {
  activeTab: TabKey;
  setActiveTab: (tab: TabKey) => void;
  liveArticlesCount: number;
  /** Back to the landing page, from any screen. */
  onHome: () => void;
}

const TABS: { key: TabKey; label: string; short: string; Icon: typeof MapPin }[] = [
  { key: 'map', label: '403 Seats', short: 'Seats', Icon: MapPin },
  { key: 'bubbles', label: 'District mass', short: 'Districts', Icon: CircleDot },
  { key: 'pulse', label: 'Statewide pulse', short: 'Pulse', Icon: BarChart3 },
  { key: 'graph', label: 'Signal graph', short: 'Graph', Icon: Network },
  { key: 'mla', label: 'Members', short: 'MLAs', Icon: Users },
  { key: 'laws', label: 'Legislation', short: 'Laws', Icon: Scale },
  { key: 'news', label: 'Live radar', short: 'Radar', Icon: Radio }
];

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  liveArticlesCount,
  onHome
}) => (
  <header className="sticky top-0 z-40 bg-paper/95 backdrop-blur-sm border-b border-rule">
    <div className="flex items-center gap-8 flex-wrap px-6 min-h-16 py-2">
      <div className="flex items-baseline gap-3 shrink-0">
        <button
          type="button"
          onClick={onHome}
          aria-label="UP27, back to the landing page"
          className="font-display text-base tracking-[0.1em] text-stone-900 hover:text-live-700"
        >
          UP27
        </button>
        <span className="hidden md:inline font-mono-term text-[10px] uppercase tracking-[0.16em] text-stone-500">
          Vidhan Sabha Intelligence
        </span>
      </div>

      <nav aria-label="Primary" className="flex items-center gap-1 flex-wrap flex-1">
        {TABS.map(({ key, label, short, Icon }) => {
          const active = activeTab === key;
          return (
            <button
              key={key}
              type="button"
              onClick={() => setActiveTab(key)}
              aria-current={active ? 'page' : undefined}
              className={`flex items-center gap-2 h-11 px-3 text-sm border-b-2 ${
                active
                  ? 'border-live-600 text-stone-900 font-medium'
                  : 'border-transparent text-stone-500 hover:text-stone-800'
              }`}
            >
              <Icon className="w-4 h-4" aria-hidden="true" />
              <span className="hidden lg:inline">{label}</span>
              <span className="lg:hidden">{short}</span>
              {key === 'news' && (
                <span className="font-mono-term tnum text-[10px] px-1.5 py-0.5 rounded bg-panel border border-rule text-stone-600">
                  {liveArticlesCount}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      <div className="flex items-center gap-5 shrink-0">
        <span className="font-mono-term flex items-center gap-2 text-[11px] text-stone-500">
          <span aria-hidden="true" className="w-1.5 h-1.5 rounded-full bg-live-600" />
          Live
        </span>
        <span className="font-mono-term text-[11px] text-stone-500">Model v0.4</span>
      </div>
    </div>
  </header>
);
