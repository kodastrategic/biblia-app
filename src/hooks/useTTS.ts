import { useCallback, useEffect, useRef, useState } from 'react';
import { getVoiceList, isTtsSupported, pickPreferredVoice } from '../lib/tts';
import { buildPiperWav, getPiperAudio, getPiperStatus, onPiperStatusChange, PIPER_VOICE_SENTINEL, piperSynthesize, piperSynthesizeBuffer, releasePiperAudio, type PiperPcm } from '../lib/piperTTS';
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
  const [continuous, setContinuous] = useLocalStorage<boolean>('bibleTtsContinuous', false);
  const [continuousProgress, setContinuousProgress] = useState<{ done: number; total: number } | null>(null);
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
  const continuousRef = useRef(continuous);
  continuousRef.current = continuous;

  const tokenRef = useRef(0);
  const sessionRef = useRef<TTSSession | null>(null);
  const verseIndexRef = useRef(-1);
  const gapRef = useRef<number | null>(null);
  const piperBackstopRef = useRef<number | null>(null);

  const clearBackstop = useCallback(() => {
    if (piperBackstopRef.current != null) {
      window.clearTimeout(piperBackstopRef.current);
      piperBackstopRef.current = null;
    }
  }, []);

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
        clearBackstop();
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
      clearBackstop();
      piperBackstopRef.current = window.setTimeout(
        () => finish(index + 1, url),
        Math.max(durationMs * 1.4 + 1500, 5000),
      );
      const onDone = () => {
        clearBackstop();
        finish(index + 1, url);
      };
      audio.onended = onDone;
      audio.onerror = onDone;
      audio.playbackRate = rateRef.current;
      audio.src = url;
      try {
        await audio.play();
      } catch {
        clearBackstop();
        finish(index + 1, url);
      }
    },
    [advanceTo, clearBackstop],
  );

  const speakPiperContinuous = useCallback(
    async (index: number, token: number) => {
      const session = sessionRef.current;
      if (!session) return;

      let finished = false;
      const finish = (next: number, revokeUrl?: string) => {
        if (finished) return;
        finished = true;
        clearBackstop();
        setContinuousProgress(null);
        if (revokeUrl) URL.revokeObjectURL(revokeUrl);
        if (tokenRef.current === token) advanceTo(next, token);
      };
      const sleep = (ms: number) => new Promise<void>((r) => window.setTimeout(r, ms));

      const targets: string[] = [];
      for (let i = index; i < session.verses.length; i++) {
        const text = String(session.verses[i] ?? '').trim();
        if (text) targets.push(text);
      }
      if (!targets.length) {
        finish(session.verses.length);
        return;
      }

      setContinuousProgress({ done: 0, total: targets.length });
      const parts: PiperPcm[] = [];
      for (let k = 0; k < targets.length; k++) {
        if (tokenRef.current !== token) {
          setContinuousProgress(null);
          return;
        }
        let pcm: PiperPcm | null = null;
        for (let attempt = 0; attempt < 2 && !pcm; attempt++) {
          if (attempt > 0) {
            await sleep(350);
            if (tokenRef.current !== token) {
              setContinuousProgress(null);
              return;
            }
          }
          try {
            pcm = await piperSynthesizeBuffer(targets[k]);
            if (pcm.pcm.length === 0) pcm = null;
          } catch {
            /* tenta mais uma vez */
          }
        }
        if (pcm) parts.push(pcm);
        setContinuousProgress({ done: k + 1, total: targets.length });
      }
      if (tokenRef.current !== token) {
        setContinuousProgress(null);
        return;
      }
      if (!parts.length) {
        finish(session.verses.length);
        return;
      }

      const { blob, durationMs } = buildPiperWav(parts, 300);
      void durationMs;
      const url = URL.createObjectURL(blob);
      if (tokenRef.current !== token) {
        URL.revokeObjectURL(url);
        setContinuousProgress(null);
        return;
      }

      const audio = getPiperAudio();
      releasePiperAudio();
      const onDone = () => finish(session.verses.length, url);
      audio.onended = onDone;
      audio.onerror = onDone;
      audio.playbackRate = rateRef.current;
      audio.src = url;
      try {
        await audio.play();
      } catch {
        finish(session.verses.length, url);
      }
    },
    [advanceTo, clearBackstop],
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
        if (continuousRef.current) void speakPiperContinuous(index, token);
        else void speakPiper(index, token);
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
    [advanceTo, speakPiper, speakPiperContinuous],
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
    clearBackstop();
    releasePiperAudio();
    synthRef.current?.cancel();
    setState('paused');
  }, [clearGap, clearBackstop]);

  const resume = useCallback(() => {
    const session = sessionRef.current;
    if (!session) return;
    const index = verseIndexRef.current >= 0 ? verseIndexRef.current : 0;
    speakAt(index, ++tokenRef.current);
  }, [speakAt]);

  const stop = useCallback(() => {
    ++tokenRef.current;
    clearGap();
    clearBackstop();
    releasePiperAudio();
    synthRef.current?.cancel();
    sessionRef.current = null;
    verseIndexRef.current = -1;
    setActiveVerse(-1);
    setState('idle');
  }, [clearGap, clearBackstop]);

  useEffect(() => {
    return () => {
      ++tokenRef.current;
      clearGap();
      clearBackstop();
      releasePiperAudio();
      synthRef.current?.cancel();
    };
  }, [clearGap, clearBackstop]);

  return {
    supported,
    voices,
    state,
    activeVerse,
    voiceURI,
    rate,
    autoAdvance,
    continuous,
    continuousProgress,
    piperStatus,
    setVoiceURI,
    setRate,
    setAutoAdvance,
    setContinuous,
    play,
    pause,
    resume,
    stop,
  };
}