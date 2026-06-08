const STATE_COLORS = {
  NC: 'bg-blue-950/60 text-blue-300 border-blue-900/60',
  MI: 'bg-purple-950/60 text-purple-300 border-purple-900/60',
  FL: 'bg-pink-950/60 text-pink-300 border-pink-900/60',
  TX: 'bg-amber-950/60 text-amber-300 border-amber-900/60',
  IL: 'bg-teal-950/60 text-teal-300 border-teal-900/60',
};

// Fallback generator for other states
const getDeterministicStyle = (state = '') => {
  const code = state.toUpperCase();
  if (STATE_COLORS[code]) return STATE_COLORS[code];
  
  let hash = 0;
  for (let i = 0; i < code.length; i++) {
    hash = code.charCodeAt(i) + ((hash << 5) - hash);
  }
  const colors = [
    'bg-blue-950/60 text-blue-300 border-blue-900/60',
    'bg-purple-950/60 text-purple-300 border-purple-900/60',
    'bg-pink-950/60 text-pink-300 border-pink-900/60',
    'bg-amber-950/60 text-amber-300 border-amber-900/60',
    'bg-teal-950/60 text-teal-300 border-teal-900/60',
    'bg-emerald-950/60 text-emerald-300 border-emerald-900/60',
    'bg-indigo-950/60 text-indigo-300 border-indigo-900/60'
  ];
  return colors[Math.abs(hash) % colors.length];
};

export default function SiteBadge({ state }) {
  const style = getDeterministicStyle(state);
  return (
    <span className={`inline-block px-2 py-0.5 text-xs font-mono border font-semibold tracking-wider ${style}`}>
      {state}
    </span>
  );
}
