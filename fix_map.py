import re

with open('/home/kalki/Pro/UP_election/frontend/src/components/ConstituencyMap.tsx', 'r') as f:
    content = f.read()

# Fix getTileStyle
new_tile_style = """
  // Helper to get tile style based on color mode
  const getTileStyle = (c: Constituency) => {
    if (colorMode === 'incumbent') {
      const pColor = PARTY_COLORS[c.mlaParty];
      return {
        backgroundColor: pColor?.hex ? `${pColor.hex}15` : '#f5f5f4', // stone-100
        borderColor: pColor?.hex ? `${pColor.hex}50` : '#d6d3d1', // stone-300
        textColor: pColor?.hex || '#44403c' // stone-800
      };
    }

    if (colorMode === 'projected') {
      const pColor = PARTY_COLORS[c.projectedWinner2027];
      return {
        backgroundColor: pColor?.hex ? `${pColor.hex}15` : '#f5f5f4',
        borderColor: pColor?.hex ? `${pColor.hex}50` : '#d6d3d1',
        textColor: pColor?.hex || '#44403c'
      };
    }

    if (colorMode === 'momentum') {
      if (c.momentumScore > 3.0) {
        return { backgroundColor: '#10b98115', borderColor: '#34d399', textColor: '#059669' };
      }
      if (c.momentumScore < -1.5) {
        return { backgroundColor: '#ef444415', borderColor: '#f87171', textColor: '#dc2626' };
      }
      return { backgroundColor: '#f59e0b15', borderColor: '#fbbf24', textColor: '#d97706' };
    }

    // anti-incumbency heatmap
    if (c.emotions.antiIncumbency > 50) {
      return { backgroundColor: '#ef444415', borderColor: '#f87171', textColor: '#dc2626' };
    }
    if (c.emotions.antiIncumbency < 30) {
      return { backgroundColor: '#10b98115', borderColor: '#34d399', textColor: '#059669' };
    }
    return { backgroundColor: '#f59e0b15', borderColor: '#fbbf24', textColor: '#d97706' };
  };
"""

content = re.sub(r'// Helper to get tile style based on color mode.*?(?=return \()', new_tile_style.strip() + '\n\n  ', content, flags=re.DOTALL)

# Fix hover classes
content = content.replace('hover:shadow-lg shadow-black/20', 'hover:shadow-md shadow-sm hover:border-amber-400')
content = content.replace('shadow-black/20', 'shadow-sm hover:border-amber-400')
content = content.replace('group-hover:text-amber-300', 'group-hover:text-amber-600')

# Fix text-slate-* leftovers
content = content.replace('text-slate-200', 'text-stone-700')
content = content.replace('text-slate-600', 'text-stone-400')
content = content.replace('bg-[#d97706] text-stone-800 font-semibold', 'bg-[#d97706] text-white font-semibold')
content = content.replace('text-[#78716c] hover:text-stone-700 hover:bg-stone-200', 'text-stone-600 hover:text-stone-800 hover:bg-stone-200')

# Empty state
content = content.replace('text-slate-500', 'text-stone-500')

with open('/home/kalki/Pro/UP_election/frontend/src/components/ConstituencyMap.tsx', 'w') as f:
    f.write(content)
