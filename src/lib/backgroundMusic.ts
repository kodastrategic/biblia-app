import { useCallback, useRef } from 'react';
import musicFiles from 'virtual:music-list';

const FADE_IN_MS = 2200;
const FADE_OUT_MS = 1800;
const TARGET_VOLUME = 0.4;

function randomIndex(avoid?: number) {
  if (musicFiles.length <= 1) return 0;
  let next = Math.floor(Math.random() * musicFiles.length);
  while (next === avoid) next = Math.floor(Math.random() * musicFiles.length);
  return next;
}

export function useBackgroundMusic() {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const lastIndexRef = useRef(-1);
  const fadeTimerRef = useRef<number | null>(null);
  const stopTimerRef = useRef<number | null>(null);

  const cancelFade = () => {
    if (fadeTimerRef.current != null) {
      window.clearTimeout(fadeTimerRef.current);
      fadeTimerRef.current = null;
    }
    if (stopTimerRef.current != null) {
      window.clearTimeout(stopTimerRef.current);
      stopTimerRef.current = null;
    }
  };

  const getAudio = () => {
    if (!audioRef.current) {
      const audio = new Audio();
      audio.loop = true;
      audio.preload = 'auto';
      audioRef.current = audio;
    }
    return audioRef.current;
  };

  const fadeTo = (target: number, durationMs: number) => {
    cancelFade();
    const audio = getAudio();
    const from = audio.volume;
    const steps = 24;
    const stepMs = durationMs / steps;
    let i = 0;
    const tick = () => {
      i++;
      audio.volume = from + ((target - from) * i) / steps;
      if (i >= steps) {
        audio.volume = target;
        fadeTimerRef.current = null;
        return;
      }
      fadeTimerRef.current = window.setTimeout(tick, stepMs);
    };
    fadeTimerRef.current = window.setTimeout(tick, stepMs);
  };

  const start = useCallback(() => {
    if (!musicFiles.length) return;
    const audio = getAudio();
    if (audio.paused) {
      const index = randomIndex(lastIndexRef.current);
      lastIndexRef.current = index;
      audio.src = musicFiles[index];
      audio.volume = 0;
      audio.play().catch(() => {
        /* autoplay bloqueado */
      });
      fadeTo(TARGET_VOLUME, FADE_IN_MS);
    } else {
      fadeTo(TARGET_VOLUME, FADE_IN_MS);
    }
  }, []);

  const stop = useCallback(() => {
    if (!audioRef.current) return;
    const audio = audioRef.current;
    if (audio.paused) return;
    fadeTo(0, FADE_OUT_MS);
    stopTimerRef.current = window.setTimeout(() => {
      audio.pause();
      audio.volume = 0;
    }, FADE_OUT_MS + 60);
  }, []);

  return { start, stop };
}