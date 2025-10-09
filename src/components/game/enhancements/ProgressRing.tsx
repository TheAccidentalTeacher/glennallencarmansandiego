import React from 'react';

interface ProgressRingProps {
  total: number;
  solved: number;
  label?: string;
  themeColor?: string;
}

type Gradient = [string, string];

const defaultGradient: Gradient = ['#38bdf8', '#3b82f6'];

const computeGradient = (color?: string): Gradient => {
  if (!color) {
    return defaultGradient;
  }
  try {
    const base = color.replace('#', '');
    if (base.length === 3) {
      const [r, g, b] = base.split('').map((hex) => parseInt(hex.repeat(2), 16));
      return [`rgba(${r}, ${g}, ${b}, 0.3)`, `rgba(${r}, ${g}, ${b}, 0.9)`];
    }
    const r = parseInt(base.slice(0, 2), 16);
    const g = parseInt(base.slice(2, 4), 16);
    const b = parseInt(base.slice(4, 6), 16);
    return [`rgba(${r}, ${g}, ${b}, 0.3)`, `rgba(${r}, ${g}, ${b}, 0.9)`];
  } catch {
    return defaultGradient;
  }
};

export const ProgressRing: React.FC<ProgressRingProps> = ({ total, solved, label, themeColor }) => {
  const pct = total === 0 ? 0 : Math.min(1, solved / total);
  const radius = 64;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - pct * circumference;
  const [start, end] = computeGradient(themeColor);

  return (
    <div className="relative flex flex-col items-center text-white">
      <svg width={180} height={180} className="drop-shadow-lg">
        <defs>
          <linearGradient id="progressGradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor={start} />
            <stop offset="100%" stopColor={end} />
          </linearGradient>
        </defs>
        <circle
          cx={90}
          cy={90}
          r={radius}
          stroke="rgba(255,255,255,0.2)"
          strokeWidth={12}
          fill="none"
        />
        <circle
          cx={90}
          cy={90}
          r={radius}
          stroke="url(#progressGradient)"
          strokeWidth={14}
          fill="none"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          style={{ transition: 'stroke-dashoffset 0.6s ease, stroke 0.6s ease' }}
        />
        <text
          x="50%"
          y="50%"
          dominantBaseline="middle"
          textAnchor="middle"
          className="font-bold"
          fontSize="32"
          fill="#fff"
        >
          {Math.round(pct * 100)}%
        </text>
      </svg>
      {label && (
        <div className="mt-2 text-sm uppercase tracking-widest text-slate-200">
          {label}
        </div>
      )}
      <div className="text-xs text-slate-300 mt-1">
        {solved} / {total} nodes lit
      </div>
    </div>
  );
};

export default ProgressRing;
