declare module 'piper-tts-web' {
  export class FetchProvider {
    fetch(url: string): Promise<unknown>;
    destroy(): void;
  }

  export class HuggingFaceVoiceProvider {
    constructor(opts?: { provider?: FetchProvider; baseUrl?: string; separator?: string });
    list(): Promise<Record<string, unknown>>;
    fetch(voice: string): Promise<unknown>;
    destroy(): void;
  }

  export class OnnxWebRuntime {
    constructor(opts?: { ort?: unknown; basePath?: string; numThreads?: number });
    generate(phonemeData: unknown, voiceData: unknown, speaker?: number): Promise<{ file: Blob; duration: number }>;
    destroy(): void;
  }

  export class OnnxWebWorkerRuntime {
    constructor(opts?: { basePath?: string; numThreads?: number });
    destroy(): void;
  }

  export class OnnxWebGPURuntime {
    constructor(opts?: { basePath?: string; numThreads?: number });
    destroy(): void;
  }

  export class OnnxWebGPUWorkerRuntime {
    constructor(opts?: { basePath?: string; numThreads?: number });
    destroy(): void;
  }

  export class PhonemizeWebRuntime {
    constructor(opts?: { provider?: FetchProvider; basePath?: string });
    destroy(): void;
  }

  export class PhonemizeWebWorkerRuntime {
    constructor(opts?: { provider?: FetchProvider; basePath?: string });
    destroy(): void;
  }

  export class ExpressionWebRuntime {
    constructor();
    destroy(): void;
  }

  export class ExpressionWebWorkerRuntime {
    constructor();
    destroy(): void;
  }

  export class PiperWebEngine {
    constructor(opts?: {
      onnxRuntime?: unknown;
      phonemizeRuntime?: unknown;
      expressionRuntime?: unknown;
      voiceProvider?: HuggingFaceVoiceProvider;
    });
    generate(text: string, voice: string, speaker?: number): Promise<{ file: Blob; duration: number }>;
    destroy(): void;
  }

  export class PiperWebWorkerEngine {
    constructor(opts?: {
      onnxRuntime?: unknown;
      phonemizeRuntime?: unknown;
      expressionRuntime?: unknown;
      voiceProvider?: HuggingFaceVoiceProvider;
    });
    generate(text: string, voice: string, speaker?: number): Promise<{ file: Blob; duration: number }>;
    destroy(): void;
  }
}