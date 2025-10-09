import React from 'react';

const ICONS = ['🛰️', '🧭', '🌋', '🌊', '🌿', '🏔️', '🏜️', '🏙️', '🎯'];
const COLORS = ['#0ea5e9', '#f97316', '#22c55e', '#a855f7', '#facc15', '#14b8a6', '#f43f5e'];

interface AvatarBuilderProps {
  name: string;
  icon: string;
  color: string;
  onChange: (update: { name?: string; icon?: string; color?: string }) => void;
}

export const AvatarBuilder: React.FC<AvatarBuilderProps> = ({ name, icon, color, onChange }) => {
  return (
    <div className="bg-slate-900/70 border border-slate-700 rounded-2xl p-6 text-white">
      <h3 className="text-lg font-semibold mb-4">Team Identity</h3>
      <div className="flex gap-4 items-center">
        <div
          className="w-20 h-20 rounded-2xl flex items-center justify-center text-4xl"
          style={{ background: `${color}22`, border: `2px solid ${color}` }}
        >
          {icon}
        </div>
        <div className="flex-1 space-y-3">
          <div>
            <label className="block text-xs uppercase tracking-widest text-slate-300 mb-1">Callsign</label>
            <input
              value={name}
              onChange={(e) => onChange({ name: e.target.value })}
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white"
              placeholder="Team codename"
            />
          </div>
          <div className="flex gap-3 flex-wrap">
            {ICONS.map((option) => (
              <button
                key={option}
                onClick={() => onChange({ icon: option })}
                className={`text-2xl w-10 h-10 rounded-lg border transition-all ${
                  icon === option ? 'border-emerald-300 bg-emerald-400/10' : 'border-slate-700 hover:border-emerald-300'
                }`}
              >
                {option}
              </button>
            ))}
          </div>
          <div className="flex gap-2 flex-wrap">
            {COLORS.map((option) => (
              <button
                key={option}
                onClick={() => onChange({ color: option })}
                className={`w-8 h-8 rounded-full border-2 ${
                  color === option ? 'border-white scale-110' : 'border-transparent'
                }`}
                style={{ background: option }}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AvatarBuilder;
