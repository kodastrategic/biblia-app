const STORAGE_KEY = 'bibleCrashLog';
const MAX_ENTRIES = 8;

export interface CrashEntry {
  at: string;
  context: string;
  message: string;
  stack?: string;
}

export function getCrashLog(): CrashEntry[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as CrashEntry[]) : [];
  } catch {
    return [];
  }
}

export function clearCrashLog(): void {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    /* privado */
  }
}

export function reportCrash(context: string, error: unknown): void {
  const entry: CrashEntry = {
    at: new Date().toISOString(),
    context,
    message: error instanceof Error ? error.message : String(error),
    stack: error instanceof Error ? error.stack : undefined,
  };
  try {
    const list = getCrashLog().concat(entry);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(list.slice(-MAX_ENTRIES)));
  } catch {
    /* quota ou modo privado */
  }
  console.error(`[${context}]`, error);
}