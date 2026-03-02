// src/utils/geminiApi.ts
// Versão LOCAL (sem API): lê a Bíblia da pasta /public (arquivo /nvi.json)

export interface ValidationResult {
  isValid: boolean;
  warning?: string;
  error?: string;
}

type BibleBook = {
  name: string;
  abbrev?: string;
  chapters: string[][];
};

let cachedBible: BibleBook[] | null = null;

function normalizeName(str: string) {
  return str
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // remove acentos
    .replace(/[^a-z0-9 ]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

async function loadBible(): Promise<BibleBook[]> {
  if (cachedBible) return cachedBible;

  const res = await fetch("/nvi.json", { cache: "force-cache" });
  if (!res.ok) {
    throw new Error(
      `Não consegui abrir /nvi.json (status ${res.status}). Confirme se o arquivo está em /public/nvi.json e foi commitado.`
    );
  }

  const data = (await res.json()) as BibleBook[];
  if (!Array.isArray(data) || !data.length) {
    throw new Error("O arquivo /nvi.json não está no formato esperado (lista de livros).");
  }

  cachedBible = data;
  return data;
}

function formatChapterText(verses: string[]) {
  // Gera texto com numeração de versículos
  return verses
    .map((v, i) => `${i + 1} ${String(v ?? "").trim()}`.trim())
    .filter(Boolean)
    .join("\n");
}

export function validateBibleText(text: string): ValidationResult {
  if (!text || text.trim().length < 10) {
    return { isValid: false, error: "Texto vazio ou muito curto." };
  }
  // validação leve só pra evitar tela em branco
  const hasSomeVerse = /^\s*1\s+/m.test(text);
  if (!hasSomeVerse) {
    return { isValid: true, warning: "Texto carregou, mas parece sem numeração de versículos." };
  }
  return { isValid: true };
}

export async function fetchBibleChapter(book: string, chapter: number): Promise<string> {
  const bible = await loadBible();

  // 1) tenta match exato
  let found = bible.find((b) => b.name === book);

  // 2) fallback: match “normalizado” (pra casos de acento/variação)
  if (!found) {
    const target = normalizeName(book);
    found = bible.find((b) => normalizeName(b.name) === target);
  }

  if (!found) {
    throw new Error(`Livro não encontrado no nvi.json: "${book}"`);
  }

  if (!Number.isFinite(chapter) || chapter <= 0) {
    throw new Error(`Capítulo inválido: ${chapter}`);
  }

  const chapterIndex = chapter - 1;
  const verses = found.chapters?.[chapterIndex];

  if (!verses || !Array.isArray(verses) || verses.length === 0) {
    throw new Error(`Capítulo ${chapter} não existe em "${found.name}".`);
  }

  const text = formatChapterText(verses);
  const validation = validateBibleText(text);
  if (!validation.isValid) {
    throw new Error(validation.error || "Texto inválido.");
  }

  return text;
}
