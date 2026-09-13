import { useCallback, useEffect, useRef, useState } from 'react';
import { getVoiceList, isTtsSupported, pickPreferredVoice } from '../lib/tts';
import { getPiperStatus, onPiperStatusChange, PIPER_VOICE_SENTINEL, piperSynthesize } from '../lib/piperTTS';
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
  const [piperStatus, setPiperStatus] = useState(getPiperStatus());

  useEffect(() => onPiperStatusChange(setPiperStatus), []);

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

  const advanceTo = useCallback(
    (next: number, token: number) => {
      clearGap();
      gapRef.current = window.setTimeout(() => speakAt(next, token), 300);
    },
    [clearGap],
  );

  const speakPiper = useCallback(
    async (index: number, token: number) => {
      const session = sessionRef.current;
      if (!session) return;
      const text = String(session.verses[index] ?? '').trim();
      if (!text) {
        advanceTo(index + 1, token);
        return;
      }
      const finish = (next: number, revokeUrl?: string) => {
        if (revokeUrl) URL.revokeObjectURL(revokeUrl);
        if (tokenRef.current === token) advanceTo(next, token);
      };
      try {
        const { url, durationMs } = await piperSynthesize(text);
        void durationMs;
        if (tokenRef.current === token) {
          const audio = new Audio(url);
          audio.playbackRate = rateRef.current;
          audio.onended = () => finish(index + 1, url);
          audio.onerror = () => finish(index + 1, url);
          try {
            await audio.play();
          } catch (err) {
            finish(index + 1, url);
          }
        } else {
          URL.revokeObjectURL(url);
        }
      } catch {
        finish(index + 1);
      }
    },
    [advanceTo],
  );

  const speakAt = useCallback(
    (index: number, token: number) => {
      const synth = synthRef.current;
      const session = sessionRef.current;
      if (tokenRef.current !== token || !session) return;
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

      synth?.cancel();
      verseIndexRef.current = index;
      setActiveVerse(index);
      setState('playing');

      if (voiceURIRef.current === PIPER_VOICE_SENTINEL) {
        void speakPiper(index, token);
        return;
      }

      const utterance = new SpeechSynthesisUtterance(text);
      const voice = pickPreferredVoice(voicesRef.current, voiceURIRef.current);
      if (voice) {
        utterance.voice = voice;
        utterance.lang = voice.lang;
      } else {
        utterance.lang = 'pt-BR';
      }
      utterance.rate = rateRef.current;

      utterance.onend = () => advanceTo(index + 1, token);
      utterance.onerror = (event) => {
        if (event.error === 'canceled' || event.error === 'interrupted') return;
        advanceTo(index + 1, token);
      };

      synth?.speak(utterance);
    },
    [advanceTo, speakPiper],
  );

  const play = useCallback(
    (verses: string[], fromIndex = 0, onEnd?: () => void) => {
      if (!synthRef.current && voiceURIRef.current !== PIPER_VOICE_SENTINEL) return;
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
    if (!session) return;
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
    piperStatus,
    setVoiceURI,
    setRate,
    setAutoAdvance,
    play,
    pause,
    resume,
    stop,
  };
}