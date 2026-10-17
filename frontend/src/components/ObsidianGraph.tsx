import React, { useEffect, useRef, useState, useMemo } from 'react';
import * as d3 from 'd3-force';
import { 
  GraphNode, 
  GraphLink, 
  NewsArticle, 
  Constituency,
  NodeCategory,
  PoliticalParty 
} from '../types';
import { PARTY_COLORS } from '../data/upConstituencies';
import { 
  Network, 
  Search, 
  Filter, 
  Zap, 
  Maximize2, 
  RotateCcw, 
  Layers, 
  TrendingUp, 
  TrendingDown, 
  AlertTriangle,
  ArrowRight,
  Info,
  ChevronRight
} from 'lucide-react';

interface ObsidianGraphProps {
  initialNodes: GraphNode[];
  initialLinks: GraphLink[];
  newsArticles: NewsArticle[];
  allConstituencies: Constituency[];
  onSelectConstituency: (constituency: Constituency) => void;
  selectedNewsId?: string | null;
  onSelectNews?: (newsId: string | null) => void;
}

export const ObsidianGraph: React.FC<ObsidianGraphProps> = ({
  initialNodes,
  initialLinks,
  newsArticles,
  allConstituencies,
  onSelectConstituency,
  selectedNewsId,
  onSelectNews
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  // Filter states
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategoryFilter, setActiveCategoryFilter] = useState<Record<NodeCategory, boolean>>({
    news: true,
    constituency: true,
    party: true,
    leader: true,
    issue: true
  });

  const [activeHoveredNode, setActiveHoveredNode] = useState<GraphNode | null>(null);
  const [activeSelectedNode, setActiveSelectedNode] = useState<GraphNode | null>(null);
  const [simulationSpeed, setSimulationSpeed] = useState(1);
  const [isPulseActive, setIsPulseActive] = useState(true);

  // Pan and zoom states
  const transformRef = useRef({ x: 0, y: 0, k: 1 });
  const isDraggingRef = useRef(false);
  const dragStartRef = useRef({ x: 0, y: 0 });
  const draggedNodeRef = useRef<GraphNode | null>(null);

  // Particles for shockwave animation
  const animationFrameRef = useRef<number | null>(null);
  const pulseOffsetRef = useRef(0);

  // Nodes and Links clone for D3 simulation
  const graphData = useMemo(() => {
    // Filter nodes by active category
    const filteredNodes: GraphNode[] = initialNodes
      .filter(n => activeCategoryFilter[n.category])
      .map(n => ({ ...n }));

    const nodeIds = new Set(filteredNodes.map(n => n.id));

    // Filter links where both source and target exist
    const filteredLinks: GraphLink[] = initialLinks
      .filter(l => {
        const sourceId = typeof l.source === 'object' ? (l.source as GraphNode).id : l.source;
        const targetId = typeof l.target === 'object' ? (l.target as GraphNode).id : l.target;
        return nodeIds.has(sourceId) && nodeIds.has(targetId);
      })
      .map(l => ({ ...l }));

    return { nodes: filteredNodes, links: filteredLinks };
  }, [initialNodes, initialLinks, activeCategoryFilter]);

  // Sync external selectedNewsId
  useEffect(() => {
    if (selectedNewsId) {
      const found = graphData.nodes.find(n => n.id === selectedNewsId);
      if (found) {
        setActiveSelectedNode(found);
      }
    }
  }, [selectedNewsId, graphData.nodes]);

  // Calculate connected nodes for highlights
  const connectedNodeIds = useMemo(() => {
    const focusNode = activeHoveredNode || activeSelectedNode;
    if (!focusNode) return null;

    const set = new Set<string>();
    set.add(focusNode.id);

    graphData.links.forEach(link => {
      const sourceId = typeof link.source === 'object' ? (link.source as GraphNode).id : (link.source as string);
      const targetId = typeof link.target === 'object' ? (link.target as GraphNode).id : (link.target as string);

      if (sourceId === focusNode.id) {
        set.add(targetId);
      } else if (targetId === focusNode.id) {
        set.add(sourceId);
      }
    });

    return set;
  }, [activeHoveredNode, activeSelectedNode, graphData.links]);

  // D3 force simulation setup
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const width = canvas.width;
    const height = canvas.height;

    // Center transform initially
    if (transformRef.current.x === 0 && transformRef.current.y === 0) {
      transformRef.current.x = width / 2;
      transformRef.current.y = height / 2;
    }

    const simulation = d3.forceSimulation<GraphNode>(graphData.nodes)
      .force('link', d3.forceLink<GraphNode, GraphLink>(graphData.links)
        .id(d => d.id)
        .distance(link => {
          if (link.impactType === 'favorable' || link.impactType === 'unfavorable') return 90;
          return 120;
        })
        .strength(0.35)
      )
      .force('charge', d3.forceManyBody().strength(-240))
      .force('center', d3.forceCenter(0, 0).strength(0.05))
      .force('collision', d3.forceCollide().radius(d => (d as GraphNode).val * 1.6 + 6))
      .alphaDecay(0.02);

    // Animation render loop
    const render = () => {
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      pulseOffsetRef.current = (pulseOffsetRef.current + 0.04) % 1;

      ctx.save();
      ctx.clearRect(0, 0, width, height);

      // Background ambient space grid
      const { x: tx, y: ty, k } = transformRef.current;
      ctx.translate(tx, ty);
      ctx.scale(k, k);

      // Draw Grid dots
      const gridSize = 60;
      const leftBound = -tx / k - 100;
      const rightBound = (width - tx) / k + 100;
      const topBound = -ty / k - 100;
      const bottomBound = (height - ty) / k + 100;

      ctx.fillStyle = 'rgba(68, 64, 60, 0.1)';
      for (let x = Math.floor(leftBound / gridSize) * gridSize; x < rightBound; x += gridSize) {
        for (let y = Math.floor(topBound / gridSize) * gridSize; y < bottomBound; y += gridSize) {
          ctx.beginPath();
          ctx.arc(x, y, 1, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      // Draw links
      graphData.links.forEach(link => {
        const source = link.source as GraphNode;
        const target = link.target as GraphNode;
        if (!source || !target || source.x === undefined || source.y === undefined || target.x === undefined || target.y === undefined) return;

        const isHighlighted = connectedNodeIds
          ? connectedNodeIds.has(source.id) && connectedNodeIds.has(target.id)
          : false;

        const isDimmed = connectedNodeIds && !isHighlighted;

        ctx.beginPath();
        ctx.moveTo(source.x, source.y);
        ctx.lineTo(target.x, target.y);

        if (isHighlighted) {
          ctx.strokeStyle = link.impactType === 'favorable'
            ? 'rgba(5, 150, 105, 0.9)'
            : link.impactType === 'unfavorable'
            ? 'rgba(220, 38, 38, 0.9)'
            : 'rgba(217, 119, 6, 0.9)';
          ctx.lineWidth = 2.5;
          ctx.shadowBlur = 0;
        } else if (isDimmed) {
          ctx.strokeStyle = 'rgba(68, 64, 60, 0.15)';
          ctx.lineWidth = 0.8;
          ctx.shadowBlur = 0;
        } else {
          ctx.strokeStyle = 'rgba(68, 64, 60, 0.3)';
          ctx.lineWidth = 1.2;
          ctx.shadowBlur = 0;
        }
        ctx.stroke();

        // Draw animated pulse particles along highlighted or active links
        if ((isHighlighted || isPulseActive) && !isDimmed) {
          const t = (pulseOffsetRef.current + (source.id.charCodeAt(0) % 5) * 0.2) % 1;
          const px = source.x + (target.x - source.x) * t;
          const py = source.y + (target.y - source.y) * t;

          ctx.beginPath();
          ctx.arc(px, py, isHighlighted ? 3 : 1.8, 0, Math.PI * 2);
          ctx.fillStyle = isHighlighted
            ? (link.impactType === 'favorable' ? '#059669' : '#dc2626')
            : 'rgba(217, 119, 6, 0.8)';
          ctx.shadowBlur = 0;
          ctx.fill();
        }
      });

      // Draw nodes
      graphData.nodes.forEach(node => {
        if (node.x === undefined || node.y === undefined) return;

        const isHovered = activeHoveredNode?.id === node.id;
        const isSelected = activeSelectedNode?.id === node.id;
        const isHighlighted = connectedNodeIds ? connectedNodeIds.has(node.id) : false;
        const isDimmed = connectedNodeIds && !isHighlighted;

        let nodeColor = '#a8a29e';

        // Color coding by category & party
        if (node.category === 'party' && node.party) {
          nodeColor = PARTY_COLORS[node.party]?.hex || '#d97706';
        } else if (node.category === 'leader') {
          nodeColor = node.party ? PARTY_COLORS[node.party]?.hex || '#d6d3d1' : '#d6d3d1';
        } else if (node.category === 'issue') {
          nodeColor = '#0891b2';
        } else if (node.category === 'news') {
          if ((node.sentiment ?? 0) > 0.2) {
            nodeColor = '#059669';
          } else if ((node.sentiment ?? 0) < -0.2) {
            nodeColor = '#dc2626';
          } else {
            nodeColor = '#d97706';
          }
        } else if (node.category === 'constituency') {
          nodeColor = node.party ? PARTY_COLORS[node.party]?.hex || '#9333ea' : '#9333ea';
        }

        const radius = (node.val / 2) + (isHovered || isSelected ? 4 : 0);

        ctx.save();
        if (isDimmed) {
          ctx.globalAlpha = 0.2;
        }

        // Node circle
        ctx.beginPath();
        ctx.arc(node.x, node.y, radius, 0, Math.PI * 2);
        ctx.fillStyle = nodeColor;
        ctx.shadowBlur = 0;
        ctx.fill();

        // White center dot for precision aesthetic
        ctx.beginPath();
        ctx.arc(node.x, node.y, Math.max(2, radius * 0.35), 0, Math.PI * 2);
        ctx.fillStyle = '#ffffff';
        ctx.fill();

        // Node Label
        if (isHovered || isSelected || isHighlighted || k > 1.2 || node.category === 'party' || node.category === 'leader') {
          ctx.font = `${isHovered || isSelected ? '600 12px' : '500 10px'} 'JetBrains Mono', monospace`;
          ctx.fillStyle = isDimmed ? 'rgba(68, 64, 60, 0.3)' : '#44403c';
          ctx.textAlign = 'center';
          ctx.shadowBlur = 4;
          ctx.shadowColor = 'rgba(255, 255, 255, 0.7)';
          ctx.fillText(node.label, node.x, node.y + radius + 14);
        }

        ctx.restore();
      });

      ctx.restore();
      animationFrameRef.current = requestAnimationFrame(render);
    };

    render();

    return () => {
      simulation.stop();
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [graphData, connectedNodeIds, activeHoveredNode, activeSelectedNode, isPulseActive]);

  // Handle canvas resize
  useEffect(() => {
    const handleResize = () => {
      if (!canvasRef.current || !containerRef.current) return;
      canvasRef.current.width = containerRef.current.clientWidth;
      canvasRef.current.height = containerRef.current.clientHeight;
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Mouse interaction: find node under cursor
  const getNodeAtPos = (clientX: number, clientY: number): GraphNode | null => {
    const canvas = canvasRef.current;
    if (!canvas) return null;

    const rect = canvas.getBoundingClientRect();
    const mouseX = clientX - rect.left;
    const mouseY = clientY - rect.top;

    const { x: tx, y: ty, k } = transformRef.current;
    const simX = (mouseX - tx) / k;
    const simY = (mouseY - ty) / k;

    // Search from top to bottom
    for (let i = graphData.nodes.length - 1; i >= 0; i--) {
      const node = graphData.nodes[i];
      if (node.x === undefined || node.y === undefined) continue;
      const dx = simX - node.x;
      const dy = simY - node.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist <= node.val * 1.5 + 4) {
        return node;
      }
    }
    return null;
  };

  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const node = getNodeAtPos(e.clientX, e.clientY);
    if (node) {
      draggedNodeRef.current = node;
      node.fx = node.x;
      node.fy = node.y;
    } else {
      isDraggingRef.current = true;
      dragStartRef.current = { x: e.clientX, y: e.clientY };
    }
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (draggedNodeRef.current) {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const rect = canvas.getBoundingClientRect();
      const mouseX = e.clientX - rect.left;
      const mouseY = e.clientY - rect.top;
      const { x: tx, y: ty, k } = transformRef.current;

      draggedNodeRef.current.fx = (mouseX - tx) / k;
      draggedNodeRef.current.fy = (mouseY - ty) / k;
    } else if (isDraggingRef.current) {
      const dx = e.clientX - dragStartRef.current.x;
      const dy = e.clientY - dragStartRef.current.y;
      transformRef.current.x += dx;
      transformRef.current.y += dy;
      dragStartRef.current = { x: e.clientX, y: e.clientY };
    } else {
      const hoverNode = getNodeAtPos(e.clientX, e.clientY);
      setActiveHoveredNode(hoverNode);
    }
  };

  const handleMouseUp = () => {
    if (draggedNodeRef.current) {
      draggedNodeRef.current.fx = null;
      draggedNodeRef.current.fy = null;
      draggedNodeRef.current = null;
    }
    isDraggingRef.current = false;
  };

  const handleClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const node = getNodeAtPos(e.clientX, e.clientY);
    setActiveSelectedNode(node);
    if (node && node.category === 'news' && onSelectNews) {
      onSelectNews(node.id);
    } else if (node && node.category === 'constituency' && node.acNumber) {
      const ac = allConstituencies.find(c => c.acNumber === node.acNumber);
      if (ac) onSelectConstituency(ac);
    }
  };

  const handleWheel = (e: React.WheelEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    const zoomFactor = e.deltaY < 0 ? 1.1 : 0.9;
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    const { x: tx, y: ty, k } = transformRef.current;
    const newK = Math.min(Math.max(k * zoomFactor, 0.3), 3.5);

    transformRef.current = {
      x: mouseX - (mouseX - tx) * (newK / k),
      y: mouseY - (mouseY - ty) * (newK / k),
      k: newK
    };
  };

  const handleResetZoom = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    transformRef.current = {
      x: canvas.width / 2,
      y: canvas.height / 2,
      k: 1
    };
  };

  // Find corresponding detailed news if selected
  const activeNewsArticle = useMemo(() => {
    const focus = activeSelectedNode || activeHoveredNode;
    if (!focus || focus.category !== 'news') return null;
    return newsArticles.find(n => n.id === focus.id) || null;
  }, [activeSelectedNode, activeHoveredNode, newsArticles]);

  return (
    <div className="relative w-full h-[calc(100vh-65px)] bg-[#faf8f5] overflow-hidden flex flex-col select-none">
      {/* Top Floating Control Bar */}
      <div className="absolute top-4 left-4 z-20 flex flex-wrap items-center gap-2 max-w-xl">
        {/* Search */}
        <div className="relative flex items-center bg-[#f0ece4]/90 border border-stone-200 rounded-xl px-3 py-1.5 backdrop-blur-md shadow-lg shadow-black/5 text-xs">
          <Search className="w-3.5 h-3.5 text-stone-500 mr-2" />
          <input
            type="text"
            placeholder="Search news, leader, seat, issue..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="bg-transparent text-stone-800 placeholder-stone-400 focus:outline-none w-48 sm:w-60 font-mono text-xs"
          />
        </div>

        {/* Category Toggles matching filter tags */}
        <div className="flex items-center gap-1 bg-[#f0ece4]/90 border border-stone-200 rounded-xl p-1 backdrop-blur-md text-[11px] font-mono">
          {(['news', 'party', 'leader', 'issue', 'constituency'] as NodeCategory[]).map(cat => (
            <button
              key={cat}
              onClick={() => setActiveCategoryFilter(prev => ({ ...prev, [cat]: !prev[cat] }))}
              className={`px-2 py-1 rounded-md transition-all uppercase tracking-wider ${
                activeCategoryFilter[cat]
                  ? cat === 'news'
                    ? 'bg-emerald-500/10 text-emerald-700 border border-emerald-500/30'
                    : cat === 'party'
                    ? 'bg-orange-500/10 text-orange-700 border border-orange-500/30'
                    : cat === 'leader'
                    ? 'bg-amber-500/10 text-amber-700 border border-amber-500/30'
                    : cat === 'issue'
                    ? 'bg-cyan-500/10 text-cyan-700 border border-cyan-500/30'
                    : 'bg-purple-500/10 text-purple-700 border border-purple-500/30'
                  : 'text-stone-400 line-through'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Floating Canvas Controls (Right) */}
      <div className="absolute top-4 right-4 z-20 flex flex-col gap-2">
        <button
          onClick={handleResetZoom}
          className="p-2 bg-[#f0ece4]/90 border border-stone-200 text-stone-600 hover:text-stone-900 hover:bg-stone-200 rounded-xl backdrop-blur-md transition-all shadow-sm"
          title="Reset Viewport"
        >
          <RotateCcw className="w-4 h-4" />
        </button>

        <button
          onClick={() => setIsPulseActive(!isPulseActive)}
          className={`p-2 border rounded-xl backdrop-blur-md transition-all shadow-sm ${
            isPulseActive
              ? 'bg-amber-100 border-amber-300 text-amber-700'
              : 'bg-[#f0ece4]/90 border-stone-200 text-stone-400'
          }`}
          title="Toggle Impact Analysis"
        >
          <Zap className="w-4 h-4" />
        </button>
      </div>

      {/* Main Canvas Viewport */}
      <div ref={containerRef} className="w-full h-full relative cursor-crosshair">
        <canvas
          ref={canvasRef}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onClick={handleClick}
          onWheel={handleWheel}
          className="w-full h-full block"
        />
      </div>

      {/* Impact Inspector Drawer (Bottom / Overlay) */}
      {(activeNewsArticle || activeSelectedNode) && (
        <div className="absolute bottom-4 left-4 right-4 md:right-auto md:w-[480px] z-30 bg-[#f0ece4]/95 border border-stone-200 rounded-2xl p-4 shadow-2xl shadow-black/10 backdrop-blur-xl animate-in fade-in slide-in-from-bottom-4 duration-200">
          <div className="flex items-center justify-between pb-2 border-b border-stone-200">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-stone-500 animate-ping" />
              <span className="text-[11px] font-mono text-stone-700 uppercase tracking-wider">
                [IMPACT_ANALYSIS]
              </span>
            </div>
            <button
              onClick={() => { setActiveSelectedNode(null); setActiveHoveredNode(null); }}
              className="text-stone-500 hover:text-stone-700 text-xs font-mono"
            >
              [CLOSE]
            </button>
          </div>

          {activeNewsArticle ? (
            <div className="mt-3 space-y-3">
              <div>
                <div className="flex items-center justify-between text-[11px] text-stone-500 font-mono mb-1">
                  <span>{activeNewsArticle.source}</span>
                  <span>{activeNewsArticle.timestamp}</span>
                </div>
                <h4 className="text-sm font-semibold text-stone-800 leading-snug font-display">
                  {activeNewsArticle.title}
                </h4>
                <p className="text-xs text-stone-500 font-mono mt-1">
                  {activeNewsArticle.titleHindi}
                </p>
              </div>

              {/* Emotion Vector & Sentiment Metrics */}
              <div className="grid grid-cols-4 gap-2 pt-2 border-t border-stone-200 text-center font-mono">
                <div className="bg-white/60 p-1.5 rounded-lg border border-stone-200">
                  <span className="block text-[10px] text-stone-500">DISCONTENT</span>
                  <span className="text-xs font-bold text-red-600">{activeNewsArticle.emotionVector.discontent}%</span>
                </div>
                <div className="bg-white/60 p-1.5 rounded-lg border border-stone-200">
                  <span className="block text-[10px] text-stone-500">HOPE / TRUST</span>
                  <span className="text-xs font-bold text-emerald-600">{activeNewsArticle.emotionVector.hope}%</span>
                </div>
                <div className="bg-white/60 p-1.5 rounded-lg border border-stone-200">
                  <span className="block text-[10px] text-stone-500">ANGER</span>
                  <span className="text-xs font-bold text-orange-600">{activeNewsArticle.emotionVector.anger}%</span>
                </div>
                <div className="bg-white/60 p-1.5 rounded-lg border border-stone-200">
                  <span className="block text-[10px] text-stone-500">PRIDE</span>
                  <span className="text-xs font-bold text-cyan-600">{activeNewsArticle.emotionVector.pride}%</span>
                </div>
              </div>

              {/* Cascading Poll Swing Impact */}
              <div className="bg-stone-100 border border-stone-200 p-2.5 rounded-xl">
                <div className="flex items-center gap-1.5 text-xs text-stone-700 font-semibold mb-1">
                  <TrendingUp className="w-3.5 h-3.5 text-stone-600" />
                  <span>PROJECTED ASSEMBLY SEAT IMPACT:</span>
                </div>
                <p className="text-xs text-stone-600 leading-relaxed">
                  {activeNewsArticle.pollImpactSummary}
                </p>

                {activeNewsArticle.affectedConstituencies.length > 0 && (
                  <div className="mt-2 flex flex-wrap items-center gap-1.5">
                    <span className="text-[10px] font-mono text-stone-500">AFFECTED SEATS:</span>
                    {activeNewsArticle.affectedConstituencies.map(acNum => {
                      const ac = allConstituencies.find(c => c.acNumber === acNum);
                      return (
                        <button
                          key={acNum}
                          onClick={() => ac && onSelectConstituency(ac)}
                          className="px-2 py-0.5 rounded bg-white hover:bg-stone-100 text-stone-700 text-[10px] font-mono border border-stone-200 flex items-center gap-1"
                        >
                          <span>#{acNum} {ac?.name}</span>
                          <ChevronRight className="w-2.5 h-2.5" />
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="mt-3 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono uppercase text-stone-500">
                  TYPE: {activeSelectedNode?.category}
                </span>
                {activeSelectedNode?.party && (
                  <span className="text-xs font-bold text-amber-700">
                    {activeSelectedNode.party}
                  </span>
                )}
              </div>
              <h4 className="text-base font-bold text-stone-800 font-display">
                {activeSelectedNode?.label}
              </h4>
              {activeSelectedNode?.desc && (
                <p className="text-xs text-stone-600">
                  {activeSelectedNode.desc}
                </p>
              )}
            </div>
          )}
        </div>
      )}

      {/* Intelligence Map Legend */}
      <div className="absolute bottom-4 right-4 z-20 hidden lg:flex items-center gap-4 bg-[#f0ece4]/80 border border-stone-200 px-3 py-1.5 rounded-xl backdrop-blur-md text-[10px] font-mono text-stone-600">
        <span className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-emerald-500" /> Positive News
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-red-500" /> Negative News
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-orange-500" /> Parties / Leaders
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-purple-500" /> 403 Constituencies
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-cyan-500" /> Strategic Issues
        </span>
      </div>
    </div>
  );
};
