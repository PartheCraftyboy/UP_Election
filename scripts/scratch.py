import re

def process_statewide():
    with open('/home/kalki/Pro/UP_election/frontend/src/components/StatewidePulse.tsx', 'r') as f:
        content = f.read()

    # Apply changes
    content = content.replace('bg-[#050608]', 'bg-[#faf8f5]')
    
    # Remove jargon
    content = re.sub(r'<span className="text-xs font-mono text-amber-400">\[STATEWIDE_PULSE\]</span>', '', content)
    content = content.replace('Aggregated neural simulation across', 'Aggregated projection across')
    
    # Text colors
    content = content.replace('text-white', 'text-stone-800')
    content = content.replace('text-slate-400', 'text-[#78716c]')
    content = content.replace('text-slate-500', 'text-[#78716c]')
    content = content.replace('text-slate-300', 'text-stone-600')
    content = content.replace('text-slate-200', 'text-stone-700')
    
    # Borders
    content = re.sub(r'border-slate-[0-9]+(/[0-9]+)?', 'border-stone-300', content)
    
    # Backgrounds
    content = re.sub(r'bg-slate-900(/[0-9]+)?', 'bg-[#f0ece4]', content)
    content = re.sub(r'bg-slate-950', 'bg-[#f0ece4]', content)
    
    # Progress bars bg
    content = content.replace('bg-slate-800', 'bg-stone-200')
    content = content.replace('bg-slate-500', 'bg-stone-400')
    
    # Hover states
    content = content.replace('hover:bg-slate-800/30', 'hover:bg-stone-200/50')
    
    with open('/home/kalki/Pro/UP_election/frontend/src/components/StatewidePulse.tsx', 'w') as f:
        f.write(content)

def process_map():
    with open('/home/kalki/Pro/UP_election/frontend/src/components/ConstituencyMap.tsx', 'r') as f:
        content = f.read()

    # Apply changes
    content = content.replace('bg-[#050608]', 'bg-[#faf8f5]')
    
    # Remove jargon
    content = re.sub(r'<span className="text-xs font-mono text-amber-400">\[AC_MAP_403\]</span>', '', content)
    
    # Text colors
    content = content.replace('text-white', 'text-stone-800')
    content = content.replace('text-slate-400', 'text-[#78716c]')
    content = content.replace('text-slate-500', 'text-[#78716c]')
    content = content.replace('text-slate-300', 'text-stone-600')
    content = content.replace('text-slate-100', 'text-stone-800')
    
    # Borders
    content = re.sub(r'border-slate-[0-9]+(/[0-9]+)?', 'border-stone-300', content)
    
    # Backgrounds
    content = re.sub(r'bg-slate-900(/[0-9]+)?', 'bg-[#f0ece4]', content)
    content = re.sub(r'bg-slate-800(/[0-9]+)?', 'bg-stone-200', content)
    content = re.sub(r'bg-slate-700', 'bg-[#d97706]', content) # Active region filter
    content = content.replace('text-white font-semibold', 'text-white font-semibold')
    
    # Grid tile styles in JS
    # "Convert the grid tiles to light theme. Adjust hover states to avoid neon colors, using soft shadows and amber borders instead."
    # Modify getTileStyle
    # Replace the JS objects directly using regex or replace
    
    with open('/home/kalki/Pro/UP_election/frontend/src/components/ConstituencyMap.tsx', 'w') as f:
        f.write(content)

process_statewide()
process_map()
