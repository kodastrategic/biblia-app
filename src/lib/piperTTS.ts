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