import React, { useEffect, useMemo, useState } from 'react';

export interface RoundTimerProps {
  minutes: number;
  isActive: boolean;
  onExpire?: () => void;
  reduceMotion?: boolean;
}

const TOTAL_STEPS = 360;

export const RoundTimer: React.FC<RoundTimerProps> = ({ minutes, isActive, onExpire, reduceMotion }) => {
  const totalMs = useMemo(() => Math.max(1, minutes) * 60_000, [minutes]);
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    if (!isActive) {
      setElapsed(0);
      return;
    }

    const start = performance.now();
    let animationFrame: number;

    const tick = (now: number) => {
      const delta = now - start;
      setElapsed(Math.min(delta, totalMs));

      if (delta < totalMs) {
        animationFrame = requestAnimationFrame(tick);
      } else {
        onExpire?.();
      }
    };

    animationFrame = requestAnimationFrame(tick);

    return () => cancelAnimationFrame(animationFrame);
  }, [isActive, totalMs, onExpire]);

  const pct = Math.min(1, elapsed / totalMs);
  const degrees = (1 - pct) * 360;
  const remainSeconds = Math.max(0, Math.ceil((totalMs - elapsed) / 1000));
  const color = useMemo(() => {
    if (pct < 0.6) return 'text-emerald-300';
    if (pct < 0.85) return 'text-amber-300';
    return 'text-rose-300';
  }, [pct]);

  const radialStyle: React.CSSProperties = reduceMotion
    ? { background: 'rgba(15, 23, 42, 0.45)', border: '3px solid rgba(255,255,255,0.2)' }
    : {
        background: `conic-gradient(#22d3ee ${degrees}deg, rgba(15,23,42,0.35) ${degrees}deg)`
      };

  return (
    <div className="flex flex-col items-center text-white">
      <div className="relative w-32 h-32 rounded-full p-2" style={radialStyle}>
        <div className="absolute inset-2 rounded-full bg-slate-900/80 backdrop-blur" />
        <div className="relative w-full h-full flex items-center justify-center">
          <div className={`text-3xl font-bold ${color}`}>{remainSeconds}</div>
        </div>
      </div>
      <div className="text-xs text-slate-300 mt-2 uppercase tracking-widest">Seconds left</div>
    </div>
  );
};

export default RoundTimer;
