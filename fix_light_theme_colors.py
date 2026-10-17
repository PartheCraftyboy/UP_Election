import re
import os

def fix_colors(filepath):
    with open(filepath, 'r') as f:
        content = f.read()

    # Colors adjustment for light theme readability
    content = content.replace('text-emerald-400', 'text-emerald-600')
    content = content.replace('text-emerald-300', 'text-emerald-700')
    
    content = content.replace('text-red-400', 'text-red-600')
    content = content.replace('text-red-300', 'text-red-700')
    
    content = content.replace('text-amber-400', 'text-amber-600')
    content = content.replace('text-amber-300', 'text-amber-700')
    
    content = content.replace('text-orange-400', 'text-orange-600')
    content = content.replace('text-orange-300', 'text-orange-700')
    
    content = content.replace('text-blue-400', 'text-blue-600')
    content = content.replace('text-cyan-400', 'text-cyan-600')

    # bg adjustments for badges
    content = content.replace('bg-emerald-500/10', 'bg-emerald-50')
    content = content.replace('bg-amber-500/10', 'bg-amber-50')
    content = content.replace('bg-red-500/10', 'bg-red-50')

    with open(filepath, 'w') as f:
        f.write(content)

fix_colors('/home/kalki/Pro/UP_election/frontend/src/components/ConstituencyMap.tsx')
fix_colors('/home/kalki/Pro/UP_election/frontend/src/components/StatewidePulse.tsx')

