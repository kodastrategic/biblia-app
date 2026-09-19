export const PIPER_VOICE_SENTINEL = 'piper:faber';
export const PIPER_VOICE_ID = 'pt_BR-faber-medium';
export const PIPER_VOICE_NAME = 'Piper (Faber)';

export interface PiperStatus {
  phase: 'idle' | 'loading' | 'ready' | 'error';
  message: string | null;
}

type StatusListener = (status: PiperStatus) => void;

let status: PiperStatus = { phase: 'idle', message: null };
const listeners = new Set<StatusListener>();

function setStatus(next: PiperStatus) {
  status = next;
  listeners.forEach((listener) => listener(next));
}

export function getPiperStatus(): PiperStatus {
  return status;
}

export function onPiperStatusChange(listener: StatusListener): () => void {
  listeners.add(listener);
  listener(status);
  return () => {
    listeners.delete(listener);
  };
}

/** Busca/game os arquivos do modelo no Cache API para não baixar a cada sessão. */
class CachedPiperFetchProvider {
  #cache = new Map<string, unknown>();

  async fetch(url: string): Promise<unknown> {
    const cached = this.#cache.get(url);
    if (cached !== undefined) return cached;

    const store = await caches.open('biblia-piper-v1');
    let response = await store.match(url);
    if (!response) {
      response = await fetch(url);
      if (!response.ok) {
        throw new Error(`Não foi possível baixar a voz Piper (${response.status}).`);
      }
      await store.put(url, response.clone());
    }

    const payload = url.endsWith('.json')
      ? await response.json()
      : URL.createObjectURL(await response.blob());
    this.#cache.set(url, payload);
    return payload;
  }

  destroy() {
    this.#cache.forEach((value) => {
      if (typeof value === 'string' && value.startsWith('blob:')) URL.revokeObjectURL(value);
    });
    this.#cache.clear();
  }
}

type EngineType = import('piper-tts-web').PiperWebWorkerEngine;

let engine: EngineType | null = null;
let enginePromise: Promise<EngineType> | null = null;

async function loadEngine(): Promise<EngineType> {
  setStatus({ phase: 'loading', message: 'Baixando a voz Piper (1ª vez)...' });
  const mod = await import('piper-tts-web');
  const provider = new mod.HuggingFaceVoiceProvider({ provider: new CachedPiperFetchProvider() });
  const piper = new mod.PiperWebWorkerEngine({
    onnxRuntime: new mod.OnnxWebWorkerRuntime({ basePath: '/onnx/', numThreads: 1 }),
    phonemizeRuntime: new mod.PhonemizeWebWorkerRuntime({ basePath: '/piper/' }),
    expressionRuntime: new mod.ExpressionWebWorkerRuntime(),
    voiceProvider: provider,
  });
  engine = piper;
  return piper;
}

export function warmUpPiper(): void {
  if (engine || enginePromise) return;
  enginePromise = loadEngine()
    .then((piper) => {
      setStatus({ phase: 'ready', message: null });
      return piper;
    })
    .catch((err) => {
      enginePromise = null;
      engine = null;
      setStatus({ phase: 'error', message: err instanceof Error ? err.message : 'Falha ao carregar a voz Piper.' });
      throw err;
    });
}

export async function piperSynthesize(text: string): Promise<{ url: string; durationMs: number }> {
  if (!engine) {
    warmUpPiper();
    await enginePromise;
  }
  if (!engine) throw new Error('Voz Piper indisponível.');
  const { file, duration } = await engine.generate(text, PIPER_VOICE_ID, 0);
  return { url: URL.createObjectURL(file), durationMs: duration };
}

let piperAudio: HTMLAudioElement | null = null;

/** Elemento único reutilizado entre versículos — mantém a sessão de áudio desbloqueada no iOS. */
export function getPiperAudio(): HTMLAudioElement {
  if (!piperAudio) piperAudio = new Audio();
  return piperAudio;
}

/** Libera os buffers do áudio anterior; no-op se o Piper nunca foi usado. */
export function releasePiperAudio(): void {
  if (!piperAudio) return;
  piperAudio.pause();
  piperAudio.removeAttribute('src');
  piperAudio.load();
}

export interface PiperPcm {
  pcm: Int16Array;
  sampleRate: number;
  channels: number;
}

function parseWav(buffer: ArrayBuffer): PiperPcm {
  const dv = new DataView(buffer);
  let offset = 12;
  let sampleRate = 22050;
  let channels = 1;
  let pcm: Int16Array = new Int16Array(0);
  while (offset + 8 <= buffer.byteLength) {
    const id = String.fromCharCode(
      dv.getUint8(offset),
      dv.getUint8(offset + 1),
      dv.getUint8(offset + 2),
      dv.getUint8(offset + 3),
    );
    const size = dv.getUint32(offset + 4, true);
    const body = offset + 8;
    if (id === 'fmt ' && body + 6 <= buffer.byteLength) {
      channels = dv.getUint16(body + 2, true);
      sampleRate = dv.getUint32(body + 4, true);
    } else if (id === 'data') {
      pcm = new Int16Array(buffer, body, size / 2);
      break;
    }
    offset = body + size + (size % 2);
  }
  return { pcm, sampleRate, channels };
}

function toMono(pcm: Int16Array, channels: number): Int16Array {
  if (channels <= 1) return pcm;
  const mono = new Int16Array(pcm.length / channels);
  for (let i = 0; i < mono.length; i++) mono[i] = pcm[i * channels];
  return mono;
}

/** Sintetiza um versículo e devolve o PCM (sem criar blob URL). */
export async function piperSynthesizeBuffer(text: string): Promise<PiperPcm> {
  if (!engine) {
    warmUpPiper();
    await enginePromise;
  }
  if (!engine) throw new Error('Voz Piper indisponível.');
  const { file } = await engine.generate(text, PIPER_VOICE_ID, 0);
  const buffer = await file.arrayBuffer();
  const parsed = parseWav(buffer);
  return { pcm: toMono(parsed.pcm, parsed.channels), sampleRate: parsed.sampleRate, channels: 1 };
}

/** Junta vários PCMs em um único WAV com silêncio de gapMs entre eles. */
export function buildPiperWav(
  parts: PiperPcm[],
  gapMs: number,
): { blob: Blob; durationMs: number; sampleRate: number } {
  const sampleRate = parts[0]?.sampleRate ?? 22050;
  const gap = Math.round((sampleRate * gapMs) / 1000);
  let total = 0;
  for (const part of parts) total += part.pcm.length + gap;
  const merged = new Int16Array(total);
  let offset = 0;
  for (const part of parts) {
    merged.set(part.pcm, offset);
    offset += part.pcm.length + gap;
  }

  const header = new ArrayBuffer(44);
  const dv = new DataView(header);
  const writeStr = (o: number, s: string) => {
    for (let i = 0; i < s.length; i++) dv.setUint8(o + i, s.charCodeAt(i));
  };
  writeStr(0, 'RIFF');
  dv.setUint32(4, 36 + merged.length * 2, true);
  writeStr(8, 'WAVE');
  writeStr(12, 'fmt ');
  dv.setUint32(16, 16, true);
  dv.setUint16(20, 1, true);
  dv.setUint16(22, 1, true);
  dv.setUint32(24, sampleRate, true);
  dv.setUint32(28, sampleRate * 2, true);
  dv.setUint16(32, 2, true);
  dv.setUint16(34, 16, true);
  writeStr(36, 'data');
  dv.setUint32(40, merged.length * 2, true);

  const out = new Uint8Array(header.byteLength + merged.length * 2);
  out.set(new Uint8Array(header), 0);
  out.set(new Uint8Array(merged.buffer, merged.byteOffset, merged.byteLength), 44);
  return {
    blob: new Blob([out], { type: 'audio/wav' }),
    durationMs: Math.round((merged.length / sampleRate) * 1000),
    sampleRate,
  };
}