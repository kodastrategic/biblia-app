const STORAGE_KEY = 'bibleRecentSearches';
const MAX = 5;

export function loadRecentSearches(): string[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.filter((s): s is string => typeof s === 'string') : [];
  } catch {
    return [];
  }
}

function persist(list: string[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
  } catch {
    /* quota ou modo privado: ignora silenciosamente */
  }
}

export function pushRecentSearch(list: string[], name: string): string[] {
  const next = [name, ...list.filter((n) => n !== name)].slice(0, MAX);
  persist(next);
  return next;
}

export function normalize(value: string): string {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase();
}