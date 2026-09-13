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

export function isBrazilianVoice(voice: SpeechSynthesisVoice): boolean {
  return /^pt[-_]br$/i.test(voice.lang.trim());
}

export type VoiceGender = 'male' | 'female' | 'unknown';

const MALE_TOKENS = [
  'male', 'masculine', 'masculin', 'masculino',
  'antonio', 'daniel', 'fabricio', 'felipe', 'fernando', 'humberto',
  'joaquim', 'julio', 'lucas', 'murilo', 'thiago', 'tulio', 'yuri',
  'bruno', 'hugo', 'jorge', 'leo', 'vitor', 'eduardo', 'rafael',
];
const FEMALE_TOKENS = [
  'female', 'feminine', 'feminin', 'feminino',
  'francisca', 'camila', 'elza', 'helena', 'dalva', 'gal', 'nereta',
  'raquel', 'yara', 'thalita', 'jana', 'leticia', 'paula', 'bella',
  'luna', 'rosie', 'kiki', 'maria', 'ana', 'sara', 'vitoria', 'manuela',
];

function normalizeVoiceName(voice: SpeechSynthesisVoice): string {
  return voice.name
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');
}

export function voiceGender(voice: SpeechSynthesisVoice): VoiceGender {
  const name = normalizeVoiceName(voice);
  if (MALE_TOKENS.some((t) => name.includes(t))) return 'male';
  if (FEMALE_TOKENS.some((t) => name.includes(t))) return 'female';
  return 'unknown';
}

export function genderMark(gender: VoiceGender): string {
  if (gender === 'male') return '♂';
  if (gender === 'female') return '♀';
  return '';
}

export const GENDER_ORDER: Record<VoiceGender, number> = { male: 0, female: 1, unknown: 2 };

export function voiceLabel(voice: SpeechSynthesisVoice): string {
  const lang = voice.lang.toLowerCase();
  let locale = lang;
  if (lang === 'pt') locale = 'Português';
  else if (lang.startsWith('pt-br')) locale = 'Português (Brasil)';
  else if (lang.startsWith('pt-pt')) locale = 'Português (Portugal)';
  const gender = voiceGender(voice);
  const genderText =
    gender === 'male' ? ' · voz masculina' : gender === 'female' ? ' · voz feminina' : '';
  return `${voice.name} · ${locale}${genderText}`;
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
  const brVoices = voices.filter(isBrazilianVoice);
  const ptVoices = voices.filter(isPortugueseVoice);
  const ranked = rankVoices(brVoices.length ? brVoices : ptVoices);
  return ranked[0] ?? voices[0];
}