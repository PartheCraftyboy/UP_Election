import React, { useState, useEffect } from 'react';
import { ComposableMap, Geographies, Geography } from 'react-simple-maps';
import { ALL_CONSTITUENCIES, PARTY_COLORS } from '../data/upConstituencies';
import { PoliticalParty, Constituency } from '../types';

interface ConstituencyMapProps {
  allConstituencies: Constituency[];
  selectedConstituency: Constituency | null;
  onSelectConstituency: (c: Constituency) => void;
}

export default function ConstituencyMap({ allConstituencies, selectedConstituency, onSelectConstituency }: ConstituencyMapProps) {
  const [hoveredConst, setHoveredConst] = useState<any | null>(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [geoData, setGeoData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    fetch('/up-constituencies.geojson')
      .then((res) => {
        if (!res.ok) throw new Error('Not found');
        return res.json();
      })
      .then((data) => {
        setGeoData(data);
        setLoading(false);
      })
      .catch(() => {
        setError(true);
        setLoading(false);
      });
  }, []);

  const handleMouseMove = (e: React.MouseEvent) => {
    setMousePos({ x: e.clientX, y: e.clientY });
  };

  const getConstituencyData = (geo: any): Constituency | undefined => {
    const props = geo.properties || {};
    const acName = props.AC_NAME || props.ac_name || props.name || "";
    const acNo = props.AC_NO || props.ac_no || props.id;
    return ALL_CONSTITUENCIES.find(
      (c) => 
        c.name.toLowerCase() === acName.toLowerCase() || 
        String(c.acNumber) === String(acNo)
    );
  };

  if (loading) {
    return (
      <div className="w-full h-[600px] flex flex-col items-center justify-center bg-[#f0ece4] border border-stone-300 rounded-xl relative overflow-hidden">
        <div className="absolute inset-0 bg-stone-200/50 flex flex-wrap gap-1 p-2">
           {Array.from({ length: 400 }).map((_, i) => (
             <div key={i} className="w-4 h-4 bg-stone-300 rounded-sm opacity-20"></div>
           ))}
        </div>
        <div className="z-10 bg-white/80 backdrop-blur px-4 py-2 rounded-lg border border-stone-200 text-stone-500 font-mono text-sm animate-pulse shadow-sm">
          Loading Geographic Boundaries...
        </div>
      </div>
    );
  }

  if (error || !geoData) {
    return (
      <div className="w-full h-[600px] flex flex-col items-center justify-center bg-[#f0ece4] border border-stone-300 rounded-xl p-8 text-center relative overflow-hidden">
        <div className="absolute inset-0 bg-stone-200/20 flex flex-wrap gap-1 p-2">
           {ALL_CONSTITUENCIES.map((c, i) => (
             <div 
               key={i} 
               className="w-10 h-10 border border-stone-300 rounded-md shadow-sm transition-all hover:scale-110 relative"
               style={{ backgroundColor: PARTY_COLORS[c.mlaParty as PoliticalParty]?.hex || '#d6d3d1' }}
               onMouseEnter={() => setHoveredConst(c)}
               onMouseLeave={() => setHoveredConst(null)}
               onMouseMove={handleMouseMove} 
               onClick={() => onSelectConstituency(c)}
             ></div>
           ))}
        </div>
        
        <div className="z-10 bg-white/90 backdrop-blur px-8 py-6 rounded-xl border border-stone-200 shadow-xl max-w-lg text-left">
          <h3 className="text-stone-800 font-heading font-bold text-xl mb-3 flex items-center gap-2">
             <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-amber-500" viewBox="0 0 20 20" fill="currentColor">
               <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
             </svg>
             Geographic Data Required
          </h3>
          <p className="text-stone-600 font-sans text-sm mb-4 leading-relaxed">
            The interactive map requires accurate UP constituency boundaries. We are currently showing a stylized grid representation of the 403 constituencies.
          </p>
          <div className="bg-stone-100 p-3 rounded-lg border border-stone-200 mb-4">
             <div className="text-xs text-stone-500 font-mono mb-1">To render the true SVG map:</div>
             <code className="text-xs text-emerald-700 font-mono break-all">
               Drop valid GeoJSON at public/up-constituencies.geojson
             </code>
          </div>
          <button className="text-xs font-mono bg-stone-800 text-stone-100 px-4 py-2 rounded shadow hover:bg-stone-700 transition-colors w-full text-center">
            View Grid Fallback Mode
          </button>
        </div>

        {hoveredConst && (
          <div 
            className="fixed pointer-events-none z-50 bg-[#faf8f5] border border-stone-300 shadow-xl rounded-lg p-3 text-stone-800 min-w-[200px]"
            style={{
              left: mousePos.x + 15,
              top: mousePos.y + 15,
            }}
          >
            <div className="font-heading font-bold text-lg border-b border-stone-200 pb-1 mb-2">
              {hoveredConst.name}
            </div>
            <div className="font-sans text-sm space-y-1">
              <div className="flex justify-between items-center mb-1">
                <span className="text-stone-500 text-xs">AC No:</span>
                <span className="font-mono text-xs">{hoveredConst.acNumber}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-stone-500">MLA:</span>
                <span className="font-medium text-right max-w-[120px] truncate">{hoveredConst.currentMla}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-stone-500">Party:</span>
                <span 
                  className="font-bold px-2 py-0.5 rounded text-white text-xs"
                  style={{ backgroundColor: PARTY_COLORS[hoveredConst.mlaParty as PoliticalParty]?.hex || '#78716c' }}
                >
                  {hoveredConst.mlaParty}
                </span>
              </div>
              {hoveredConst.margin2022 && (
                <div className="flex justify-between">
                  <span className="text-stone-500">Margin:</span>
                  <span className="font-mono text-xs text-emerald-600">{hoveredConst.margin2022.toLocaleString()}</span>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div 
      className="relative w-full h-[600px] bg-[#f0ece4] border border-stone-300 rounded-xl overflow-hidden"
      onMouseMove={handleMouseMove}
    >
      <ComposableMap
        projection="geoMercator"
        projectionConfig={{
          scale: 4500,
          center: [80.5, 27.2]
        }}
        width={800}
        height={600}
        className="w-full h-full"
      >
        <Geographies geography={geoData}>
          {({ geographies }) =>
            (geographies || []).map((geo) => {
              const constituencyData = getConstituencyData(geo);
              const party = (constituencyData?.mlaParty as PoliticalParty) || 'IND';
              const fillColor = PARTY_COLORS[party]?.hex || '#d6d3d1'; // stone-300 fallback

              const props = geo.properties || {};

              const isHovered = hoveredConst && hoveredConst.acNumber === constituencyData?.acNumber;

              return (
                <Geography
                  key={geo.rsmKey}
                  geography={geo}
                  onMouseEnter={() => setHoveredConst(constituencyData || { 
                    name: props.AC_NAME || 'Unknown', 
                    acNumber: props.AC_NO || '?',
                    mlaParty: 'IND', 
                    currentMla: 'Unknown' 
                  })}
                  onMouseLeave={() => setHoveredConst(null)} onClick={() => { if (constituencyData) onSelectConstituency(constituencyData); }}
                  style={{
                    fill: fillColor,
                    stroke: isHovered ? "#44403c" : "#e7e5e4", // stone-800 on hover, stone-200 default
                    strokeWidth: isHovered ? 1.5 : 0.5,
                    outline: "none",
                    cursor: isHovered ? "pointer" : "default",
                  }}
                />
              );
            })
          }
        </Geographies>
      </ComposableMap>

      {hoveredConst && (
        <div 
          className="fixed pointer-events-none z-50 bg-[#faf8f5] border border-stone-300 shadow-xl rounded-lg p-3 text-stone-800 min-w-[200px]"
          style={{
            left: mousePos.x + 15,
            top: mousePos.y + 15,
          }}
        >
          <div className="font-heading font-bold text-lg border-b border-stone-200 pb-1 mb-2">
            {hoveredConst.name}
          </div>
          <div className="font-sans text-sm space-y-1">
            <div className="flex justify-between items-center mb-1">
              <span className="text-stone-500 text-xs">AC No:</span>
              <span className="font-mono text-xs">{hoveredConst.acNumber}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-stone-500">MLA:</span>
              <span className="font-medium text-right max-w-[120px] truncate">{hoveredConst.currentMla}</span>
            </div>
            <div className="flex justify-between items-center mt-1">
              <span className="text-stone-500">Party:</span>
              <span 
                className="font-bold px-2 py-0.5 rounded text-white text-xs"
                style={{ backgroundColor: PARTY_COLORS[hoveredConst.mlaParty as PoliticalParty]?.hex || '#78716c' }}
              >
                {hoveredConst.mlaParty}
              </span>
            </div>
            {hoveredConst.margin2022 && (
              <div className="flex justify-between mt-1">
                <span className="text-stone-500">Margin:</span>
                <span className="font-mono text-xs text-emerald-600">{hoveredConst.margin2022.toLocaleString()}</span>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
