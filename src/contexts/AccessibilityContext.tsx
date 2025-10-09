import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';

export type AccessibilityPreferences = {
  dyslexiaFont: boolean;
  highContrast: boolean;
  reduceMotion: boolean;
  simplifiedText: boolean;
  playAudio: boolean;
};

const defaultPrefs: AccessibilityPreferences = {
  dyslexiaFont: false,
  highContrast: false,
  reduceMotion: false,
  simplifiedText: false,
  playAudio: true,
};

const STORAGE_KEY = 'atlas-accessibility-prefs-v1';

type AccessibilityContextValue = {
  prefs: AccessibilityPreferences;
  toggle: (key: keyof AccessibilityPreferences) => void;
  setPref: (key: keyof AccessibilityPreferences, value: boolean) => void;
};

const AccessibilityContext = createContext<AccessibilityContextValue | undefined>(undefined);

export const AccessibilityProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [prefs, setPrefs] = useState<AccessibilityPreferences>(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        return { ...defaultPrefs, ...parsed } as AccessibilityPreferences;
      }
    } catch (error) {
      console.warn('Failed to load accessibility prefs', error);
    }
    return defaultPrefs;
  });

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(prefs));
    } catch (error) {
      console.warn('Failed to persist accessibility prefs', error);
    }
  }, [prefs]);

  useEffect(() => {
    document.body.classList.toggle('atlas-dyslexia-font', prefs.dyslexiaFont);
    document.body.classList.toggle('atlas-high-contrast', prefs.highContrast);
    document.body.classList.toggle('atlas-reduce-motion', prefs.reduceMotion);
  }, [prefs.dyslexiaFont, prefs.highContrast, prefs.reduceMotion]);

  const value = useMemo<AccessibilityContextValue>(() => ({
    prefs,
    toggle: (key) => setPrefs((prev) => ({ ...prev, [key]: !prev[key] })),
    setPref: (key, value) => setPrefs((prev) => ({ ...prev, [key]: value })),
  }), [prefs]);

  return (
    <AccessibilityContext.Provider value={value}>
      {children}
    </AccessibilityContext.Provider>
  );
};

export const useAccessibility = (): AccessibilityContextValue => {
  const ctx = useContext(AccessibilityContext);
  if (!ctx) {
    throw new Error('useAccessibility must be used within AccessibilityProvider');
  }
  return ctx;
};
