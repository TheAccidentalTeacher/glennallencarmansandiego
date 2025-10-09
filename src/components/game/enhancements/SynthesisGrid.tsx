import React, { useMemo, useState } from 'react';

const ANOMALY_TYPES = [
  { id: 'absence', label: 'Absence', emoji: '🔇' },
  { id: 'conflict', label: 'Conflict', emoji: '⚔️' },
  { id: 'clone', label: 'Clone', emoji: '🪞' },
  { id: 'forgery', label: 'Forgery', emoji: '🧬' },
  { id: 'layer_gap', label: 'Layer Gap', emoji: '🪜' },
  { id: 'administrative', label: 'Admin', emoji: '📜' },
  { id: 'physical', label: 'Physical', emoji: '🌪️' },
  { id: 'paradox', label: 'Paradox', emoji: '♾️' },
  { id: 'info_hazard', label: 'Info Hazard', emoji: '⚠️' },
];

interface SynthesisGridProps {
  rounds: any[];
  solvedRounds: number;
}

interface Placement {
  roundIndex: number;
  anomalyId: string;
}

export const SynthesisGrid: React.FC<SynthesisGridProps> = ({ rounds, solvedRounds }) => {
  const initialPlacements = useMemo<Placement[]>(() => [], []);
  const [placements, setPlacements] = useState<Placement[]>(initialPlacements);

  const handlePlace = (roundIndex: number, anomalyId: string) => {
    setPlacements((prev) => {
      const filtered = prev.filter((p) => p.roundIndex !== roundIndex);
      return [...filtered, { roundIndex, anomalyId }];
    });
  };

  const solvedPlacements = placements.filter((placement) => placement.roundIndex < solvedRounds);

  return (
    <div className="bg-slate-900/80 border border-slate-700 rounded-2xl p-6 text-white">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold uppercase tracking-widest">Synthesis Grid</h3>
        <div className="text-xs text-slate-300">Drag-free tap to classify anomaly types</div>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead>
            <tr className="text-slate-300">
              <th className="text-left py-2 pr-4">Round</th>
              <th className="text-left py-2 pr-4">Clue Focus</th>
              <th className="text-left py-2">Classification</th>
            </tr>
          </thead>
          <tbody>
            {rounds.map((round, index) => {
              const placement = placements.find((p) => p.roundIndex === index);
              const isUnlocked = index < solvedRounds;
              return (
                <tr key={round.id || index} className="border-t border-slate-800">
                  <td className="py-3 pr-4 font-semibold text-slate-200">#{index + 1}</td>
                  <td className="py-3 pr-4 text-slate-300">{round.focus?.join(', ') || '—'}</td>
                  <td className="py-3">
                    <div className="flex gap-2 flex-wrap">
                      {ANOMALY_TYPES.map((type) => {
                        const isActive = placement?.anomalyId === type.id;
                        return (
                          <button
                            key={type.id}
                            onClick={() => isUnlocked && handlePlace(index, type.id)}
                            className={`px-3 py-2 rounded-lg border text-xs transition-all flex items-center gap-2 ${
                              !isUnlocked
                                ? 'opacity-40 cursor-not-allowed'
                                : isActive
                                ? 'border-emerald-400 bg-emerald-500/10 text-emerald-200'
                                : 'border-slate-700 hover:border-emerald-400 text-slate-300'
                            }`}
                          >
                            <span>{type.emoji}</span>
                            <span>{type.label}</span>
                          </button>
                        );
                      })}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <div className="mt-4 text-xs text-slate-400">
        Classifications saved locally for this session. Encourage students to justify each placement aloud.
      </div>
      <div className="mt-2 text-xs text-emerald-300">
        {solvedPlacements.length >= solvedRounds
          ? 'Great! Every solved round is classified.'
          : `Need ${solvedRounds - solvedPlacements.length} more classifications to sync with discoveries.`}
      </div>
    </div>
  );
};

export default SynthesisGrid;
