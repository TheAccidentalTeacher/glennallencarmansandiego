import React from 'react';
import { useAccessibility } from '../../../contexts/AccessibilityContext';

export const AccessibilityPanel: React.FC = () => {
  const { prefs, toggle } = useAccessibility();

  return (
    <div className="bg-slate-900/70 border border-slate-700 rounded-2xl p-4 text-white space-y-3">
      <h3 className="text-sm font-semibold uppercase tracking-widest text-slate-200">Accessibility</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={prefs.dyslexiaFont}
            onChange={() => toggle('dyslexiaFont')}
          />
          Dyslexia-friendly font
        </label>
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={prefs.highContrast}
            onChange={() => toggle('highContrast')}
          />
          High contrast mode
        </label>
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={prefs.reduceMotion}
            onChange={() => toggle('reduceMotion')}
          />
          Reduce motion
        </label>
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={prefs.simplifiedText}
            onChange={() => toggle('simplifiedText')}
          />
          Simplify text by default
        </label>
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={prefs.playAudio}
            onChange={() => toggle('playAudio')}
          />
          Ambient audio & reactions
        </label>
      </div>
    </div>
  );
};

export default AccessibilityPanel;
