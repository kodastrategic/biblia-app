import { useCallback, useEffect, useRef, useState } from 'react';
import { getVoiceList, isTtsSupported, pickPreferredVoice } from '../lib/tts';
import { getPiperAudio, getPiperStatus, onPiperStatusChange, PIPER_VOICE_SENTINEL, piperSynthesize, releasePiperAudio } from '../lib/piperTTS';
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

      let finished = false;
      const finish = (next: number, revokeUrl?: string) => {
        if (finished) return;
        finished = true;
        if (revokeUrl) URL.revokeObjectURL(revokeUrl);
        if (tokenRef.current === token) advanceTo(next, token);
      };

      let result: { url: string; durationMs: number } | null = null;
      for (let attempt = 0; attempt < 2 && !result; attempt++) {
        if (attempt > 0) {
          await new Promise((r) => window.setTimeout(r, 350));
          if (tokenRef.current !== token) return;
        }
        try {
          const synth = await piperSynthesize(text);
          if (synth.durationMs > 0) result = synth;
        } catch {
          /* tenta uma vez mais antes de pular */
        }
      }
      if (tokenRef.current !== token) {
        if (result) URL.revokeObjectURL(result.url);
        return;
      }
      if (!result) {
        finish(index + 1);
        return;
      }

      const audio = getPiperAudio();
      releasePiperAudio();
      const { url, durationMs } = result;
      const backstop = window.setTimeout(() => finish(index + 1, url), durationMs + 1200);
      const onDone = () => {
        window.clearTimeout(backstop);
        finish(index + 1, url);
      };
      audio.onended = onDone;
      audio.onerror = onDone;
      audio.playbackRate = rateRef.current;
      audio.src = url;
      try {
        await audio.play();
      } catch {
        window.clearTimeout(backstop);
        finish(index + 1, url);
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

      if (synth && (synth.speaking || synth.pending)) synth.cancel();
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
    releasePiperAudio();
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
    releasePiperAudio();
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
      releasePiperAudio();
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