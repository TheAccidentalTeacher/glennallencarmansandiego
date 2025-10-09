import React, { useMemo } from 'react';

const ROLES = [
  {
    id: 'strategist',
    title: 'Systems Strategist',
    description: 'Connects clues, keeps the mission board updated.',
    emoji: '🧠',
  },
  {
    id: 'mapper',
    title: 'Cartographer',
    description: 'Operates the map, checks distances, calls out geography terms.',
    emoji: '🗺️',
  },
  {
    id: 'ethicist',
    title: 'Data Ethicist',
    description: 'Spots fairness issues, triggers the Ethics button when debates are needed.',
    emoji: '⚖️',
  },
  {
    id: 'scout',
    title: 'Field Scout',
    description: 'Leads sensory details, reads clues dramatically, keeps energy high.',
    emoji: '🕵️',
  },
];

interface RoleSelectionProps {
  selectedRoles: Record<string, string>;
  onSelect: (roleId: string, studentName: string) => void;
}

export const RoleSelection: React.FC<RoleSelectionProps> = ({ selectedRoles, onSelect }) => {
  const takenRoles = useMemo(() => new Set(Object.values(selectedRoles)), [selectedRoles]);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {ROLES.map((role) => {
        const selectedStudent = Object.entries(selectedRoles).find(([, roleId]) => roleId === role.id)?.[0];
        const isTaken = takenRoles.has(role.id);

        return (
          <div key={role.id} className="bg-slate-900/60 border border-slate-700 rounded-xl p-4">
            <div className="flex items-center gap-3">
              <div className="text-3xl" aria-hidden>{role.emoji}</div>
              <div>
                <h3 className="text-lg font-semibold text-white">{role.title}</h3>
                <p className="text-sm text-slate-300">{role.description}</p>
              </div>
            </div>
            <div className="mt-4 flex items-center gap-3">
              <input
                type="text"
                className="flex-1 rounded-lg bg-slate-800 border border-slate-600 px-3 py-2 text-white"
                placeholder="Student name"
                defaultValue={selectedStudent || ''}
                onBlur={(event) => {
                  const name = event.target.value.trim();
                  if (!name) return;
                  onSelect(name, role.id);
                }}
              />
              {isTaken && (
                <span className="text-xs text-emerald-300 uppercase tracking-widest">Assigned</span>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default RoleSelection;
