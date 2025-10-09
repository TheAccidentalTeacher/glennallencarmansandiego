import { useEffect, useRef } from 'react';

const THEMES: Record<string, { freq: number; type: OscillatorType }> = {
  marine: { freq: 220, type: 'sine' },
  desert: { freq: 180, type: 'triangle' },
  rainforest: { freq: 240, type: 'sawtooth' },
  alpine: { freq: 260, type: 'square' },
  urban: { freq: 200, type: 'triangle' },
};

interface AmbientAudioProps {
  theme: string | undefined;
  enabled: boolean;
  volume?: number;
}

export const AmbientAudio: React.FC<AmbientAudioProps> = ({ theme, enabled, volume = 0.03 }) => {
  const audioRef = useRef<{ ctx: AudioContext; oscillator: OscillatorNode; gain: GainNode } | null>(null);

  useEffect(() => {
    if (!enabled) {
      if (audioRef.current) {
        audioRef.current.gain.gain.linearRampToValueAtTime(0, audioRef.current.ctx.currentTime + 0.4);
      }
      return;
    }

    if (!theme) return;

    const profile = THEMES[theme] || THEMES.marine;
    const ctx = new AudioContext();
    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0, ctx.currentTime);
    const oscillator = ctx.createOscillator();
    oscillator.type = profile.type;
    oscillator.frequency.setValueAtTime(profile.freq, ctx.currentTime);
    oscillator.connect(gain).connect(ctx.destination);
    oscillator.start();
    gain.gain.linearRampToValueAtTime(volume, ctx.currentTime + 2);
    audioRef.current = { ctx, oscillator, gain };

    return () => {
      gain.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.3);
      setTimeout(() => {
        oscillator.stop();
        oscillator.disconnect();
        gain.disconnect();
        ctx.close();
        audioRef.current = null;
      }, 400);
    };
  }, [theme, enabled, volume]);

  return null;
};

export default AmbientAudio;
