import { useCallback, useEffect, useRef, useState } from 'react';
import { getVoiceList, isTtsSupported, pickPreferredVoice } from '../lib/tts';
import { useLocalStorage } from './useLocalStorage';

export type TTSState = 'idle' | 'playing' | 'paused';

interface TTSSession {
  verses: string[];
  onEnd?: () => void;
}

export function useTTS() {
  const [supported] = useState(isTtsSupported);
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [state, setState] = useState<TTSState>('idle');
  const [activeVerse, setActiveVerse] = useState(-1);
  const [voiceURI, setVoiceURI] = useLocalStorage<string | null>('bibleTtsVoice', null);
  const [rate, setRate] = useLocalStorage<number>('bibleTtsRate', 0.95);
  const [autoAdvance, setAutoAdvance] = useLocalStorage<boolean>('bibleTtsAutoAdvance', true);

  const synth = typeof window !== 'undefined' && 'speechSynthesis' in window ? window.speechSynthesis : null;
  const synthRef = useRef<SpeechSynthesis | null>(synth);

  const voicesRef = useRef(voices);
  voicesRef.current = voices;
  const voiceURIRef = useRef(voiceURI);
  voiceURIRef.current = voiceURI;
  const rateRef = useRef(rate);
  rateRef.current = rate;

  const tokenRef = useRef(0);
  const sessionRef = useRef<TTSSession | null>(null);
  const verseIndexRef = useRef(-1);
  const gapRef = useRef<number | null>(null);

  const clearGap = useCallback(() => {
    if (gapRef.current != null) {
      window.clearTimeout(gapRef.current);
      gapRef.current = null;
    }
  }, []);

  useEffect(() => {
    if (!supported) return;
    const synth = synthRef.current;
    const refresh = () => setVoices(getVoiceList());
    refresh();
    const late = window.setTimeout(refresh, 900);
    synth?.addEventListener('voiceschanged', refresh);
    return () => {
      window.clearTimeout(late);
      synth?.removeEventListener('voiceschanged', refresh);
    };
  }, [supported]);

  const speakAt = useCallback(
    (index: number, token: number) => {
      const synth = synthRef.current;
      const session = sessionRef.current;
      if (tokenRef.current !== token || !synth || !session) return;
      clearGap();

      if (index >= session.verses.length) {
        sessionRef.current = null;
        verseIndexRef.current = -1;
        setActiveVerse(-1);
        setState('idle');
        session.onEnd?.();
        return;
      }

      const text = String(session.verses[index] ?? '').trim();
      if (!text) {
        speakAt(index + 1, token);
        return;
      }

      synth.cancel();
      verseIndexRef.current = index;
      setActiveVerse(index);
      setState('playing');

      const utterance = new SpeechSynthesisUtterance(text);
      const voice = pickPreferredVoice(voicesRef.current, voiceURIRef.current);
      if (voice) {
        utterance.voice = voice;
        utterance.lang = voice.lang;
      } else {
        utterance.lang = 'pt-BR';
      }
      utterance.rate = rateRef.current;

      const advance = (next: number) => {
        clearGap();
        gapRef.current = window.setTimeout(() => speakAt(next, token), 300);
      };
      utterance.onend = () => advance(index + 1);
      utterance.onerror = (event) => {
        if (event.error === 'canceled' || event.error === 'interrupted') return;
        advance(index + 1);
      };

      synth.speak(utterance);
    },
    [clearGap],
  );

  const play = useCallback(
    (verses: string[], fromIndex = 0, onEnd?: () => void) => {
      if (!synthRef.current) return;
      sessionRef.current = { verses, onEnd };
      verseIndexRef.current = fromIndex;
      speakAt(fromIndex, ++tokenRef.current);
    },
    [speakAt],
  );

  const pause = useCallback(() => {
    ++tokenRef.current;
    clearGap();
    synthRef.current?.cancel();
    setState('paused');
  }, [clearGap]);

  const resume = useCallback(() => {
    const session = sessionRef.current;
    if (!session || !synthRef.current) return;
    const index = verseIndexRef.current >= 0 ? verseIndexRef.current : 0;
    speakAt(index, ++tokenRef.current);
  }, [speakAt]);

  const stop = useCallback(() => {
    ++tokenRef.current;
    clearGap();
    synthRef.current?.cancel();
    sessionRef.current = null;
    verseIndexRef.current = -1;
    setActiveVerse(-1);
    setState('idle');
  }, [clearGap]);

  useEffect(() => {
    return () => {
      ++tokenRef.current;
      clearGap();
      synthRef.current?.cancel();
    };
  }, [clearGap]);

  return {
    supported,
    voices,
    state,
    activeVerse,
    voiceURI,
    rate,
    autoAdvance,
    setVoiceURI,
    setRate,
    setAutoAdvance,
    play,
    pause,
    resume,
    stop,
  };
}