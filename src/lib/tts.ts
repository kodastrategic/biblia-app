export function getSpeechSynthesis(): SpeechSynthesis | null {
  if (typeof window === 'undefined') return null;
  return 'speechSynthesis' in window ? window.speechSynthesis : null;
}

export function isTtsSupported(): boolean {
  return getSpeechSynthesis() != null && typeof SpeechSynthesisUtterance !== 'undefined';
}

export function getVoiceList(): SpeechSynthesisVoice[] {
  return getSpeechSynthesis()?.getVoices() ?? [];
}

export function isPortugueseVoice(voice: SpeechSynthesisVoice): boolean {
  return /^pt([-_][a-z]{2,4})?$/i.test(voice.lang.trim());
}

export function voiceLabel(voice: SpeechSynthesisVoice): string {
  const lang = voice.lang.toLowerCase();
  let locale = lang;
  if (lang === 'pt') locale = 'Português';
  else if (lang.startsWith('pt-br')) locale = 'Português (Brasil)';
  else if (lang.startsWith('pt-pt')) locale = 'Português (Portugal)';
  return `${voice.name} · ${locale}`;
}

function voiceScore(voice: SpeechSynthesisVoice): number {
  const lang = voice.lang.toLowerCase();
  const name = voice.name.toLowerCase();
  let score = 0;
  if (lang.startsWith('pt-br')) score += 40;
  if (lang === 'pt') score += 20;
  if (/neural/i.test(name)) score += 10;
  if (/local/i.test(name)) score += 2;
  return score;
}

export function rankVoices(voices: SpeechSynthesisVoice[]): SpeechSynthesisVoice[] {
  return [...voices].sort((a, b) => voiceScore(b) - voiceScore(a));
}

export function pickPreferredVoice(
  voices: SpeechSynthesisVoice[],
  preferredUri: string | null,
): SpeechSynthesisVoice | undefined {
  if (preferredUri) {
    const exact = voices.find((v) => v.voiceURI === preferredUri);
    if (exact) return exact;
  }
  const ptVoices = voices.filter(isPortugueseVoice);
  const ranked = rankVoices(ptVoices);
  return ranked[0] ?? voices[0];
}