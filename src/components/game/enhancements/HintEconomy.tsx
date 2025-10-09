import React from 'react';

interface HintEconomyProps {
  tokens: number;
  onSpend: () => void;
  disabled?: boolean;
}

export const HintEconomy: React.FC<HintEconomyProps> = ({ tokens, onSpend, disabled }) => {
  const canSpend = tokens > 0 && !disabled;

  return (
    <div className="bg-slate-900/60 border border-amber-400/60 rounded-xl px-4 py-3 text-white flex items-center gap-4">
      <div className="text-2xl">🪙</div>
      <div className="flex-1">
        <div className="text-sm uppercase tracking-widest text-amber-200">Focus Tokens</div>
        <div className="text-lg font-semibold">{tokens} remaining</div>
        <p className="text-xs text-slate-300 mt-1">Spend a token to reveal the next hint.</p>
      </div>
      <button
        onClick={() => canSpend && onSpend()}
        disabled={!canSpend}
        className={`px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${
          canSpend ? 'bg-amber-400 hover:bg-amber-300 text-slate-900' : 'bg-slate-700 text-slate-400 cursor-not-allowed'
        }`}
      >
        {canSpend ? 'Reveal Hint' : 'Need Tokens'}
      </button>
    </div>
  );
};

export default HintEconomy;
