import React from 'react';

const STAGES = [
  {
    id: 0,
    label: 'Seed',
    svg: (
      <svg viewBox="0 0 120 120" className="w-24 h-24">
        <circle cx="60" cy="70" r="10" fill="#fbbf24" />
        <rect x="58" y="70" width="4" height="30" fill="#10b981" />
      </svg>
    ),
  },
  {
    id: 1,
    label: 'Sprout',
    svg: (
      <svg viewBox="0 0 120 120" className="w-24 h-24">
        <circle cx="60" cy="65" r="8" fill="#fbbf24" />
        <rect x="58" y="65" width="4" height="30" fill="#10b981" />
        <path d="M62 70 Q90 40 62 35" fill="none" stroke="#34d399" strokeWidth="4" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    id: 2,
    label: 'Bloom',
    svg: (
      <svg viewBox="0 0 120 120" className="w-24 h-24">
        <circle cx="60" cy="50" r="18" fill="#f97316" />
        <rect x="58" y="50" width="4" height="45" fill="#10b981" />
        <path d="M62 70 Q95 45 62 30" fill="none" stroke="#34d399" strokeWidth="5" strokeLinecap="round" />
        <path d="M58 70 Q25 45 58 30" fill="none" stroke="#34d399" strokeWidth="5" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    id: 3,
    label: 'Thriving',
    svg: (
      <svg viewBox="0 0 120 120" className="w-24 h-24">
        <circle cx="60" cy="40" r="22" fill="#facc15" />
        <rect x="58" y="40" width="4" height="60" fill="#10b981" />
        <path d="M62 65 Q108 38 62 20" fill="none" stroke="#34d399" strokeWidth="6" strokeLinecap="round" />
        <path d="M58 65 Q12 38 58 20" fill="none" stroke="#34d399" strokeWidth="6" strokeLinecap="round" />
        <circle cx="90" cy="30" r="10" fill="#f97316" />
        <circle cx="30" cy="30" r="10" fill="#f97316" />
      </svg>
    ),
  },
];

interface KnowledgeBloomProps {
  completed: number;
  total: number;
}

export const KnowledgeBloom: React.FC<KnowledgeBloomProps> = ({ completed, total }) => {
  const pct = total === 0 ? 0 : Math.min(1, completed / total);
  const stageIndex = Math.min(STAGES.length - 1, Math.floor(pct * STAGES.length));
  const stage = STAGES[stageIndex];

  return (
    <div className="flex flex-col items-center text-center text-white">
      <div className="drop-shadow-lg">{stage.svg}</div>
      <div className="mt-2 text-sm text-emerald-200 tracking-wide uppercase">{stage.label}</div>
      <div className="text-xs text-slate-300">Knowledge Boxes logged: {completed} / {total}</div>
    </div>
  );
};

export default KnowledgeBloom;
