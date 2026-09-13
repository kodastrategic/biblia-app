export interface BibleBook {
  name: string;
  abbrev: string;
  chapters: string[][];
}

const caches: Record<string, BibleBook[] | null> = {};

function normalize(str: string): string {
  return str
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]/g, '');
}

const NAME_TO_ABBREV: Record<string, string> = {
  genesis: 'gn', exodo: 'ex', levitico: 'lv', numeros: 'nm', deuteronomio: 'dt',
  josue: 'js', juizes: 'jz', rute: 'rt', '1samuel': '1sm', '2samuel': '2sm',
  '1reis': '1re', '2reis': '2re', '1cronicas': '1cr', '2cronicas': '2cr',
  esdras: 'ez', neemias: 'ne', ester: 'et', jo: 'jo', salmos: 'sl',
  proverbios: 'pv', eclesiastes: 'ec', canticodoscanticos: 'ct', isaias: 'is',
  jeremias: 'jr', lamentacoes: 'lm', ezequiel: 'ez', daniel: 'dn',
  oseias: 'os', joel: 'jl', amos: 'am', obadias: 'ob', jonas: 'jn',
  miqueias: 'mq', naum: 'na', habacuque: 'hc', sofonias: 'sf',
  ageu: 'ag', zacarias: 'zc', malaquias: 'ml', mateus: 'mt',
  marcos: 'mc', lucas: 'lc', joao: 'jo', atos: 'at', romanos: 'rm',
  '1corintios': '1co', '2corintios': '2co', galatas: 'gl', efesios: 'ef',
  filipenses: 'fp', colossenses: 'cl', '1tessalonicenses': '1ts', '2tessalonicenses': '2ts',
  '1timoteo': '1tm', '2timoteo': '2tm', tito: 'tt', filemom: 'fm', hebreus: 'hb',
  tiago: 'tg', '1pedro': '1pe', '2pedro': '2pe', '1joao': '1jo', '2joao': '2jo',
  '3joao': '3jo', judas: 'jd', apocalipse: 'ap',
};

export function translationUrl(id: string): string {
  const filtered = id.replace(/[^a-z0-9]/gi, '').toLowerCase();
  return `/${filtered}.json`;
}

export async function loadBible(translationId: string): Promise<BibleBook[]> {
  if (caches[translationId]) return caches[translationId]!;
  const url = translationUrl(translationId);
  const res = await fetch(url, { cache: 'force-cache' });
  if (!res.ok) {
    throw new Error(`Não foi possível carregar ${url} (status ${res.status}).`);
  }
  const data = (await res.json()) as BibleBook[];
  if (!Array.isArray(data) || data.length === 0) {
    throw new Error(`O arquivo ${url} não está no formato esperado.`);
  }
  caches[translationId] = data;
  return data;
}

export async function fetchChapter(
  bookName: string,
  chapter: number,
  translationId: string,
): Promise<string[]> {
  const bible = await loadBible(translationId);
  const target = normalize(bookName);
  const abbrev = NAME_TO_ABBREV[target];

  const book =
    bible.find((b) => normalize(b.name) === target) ??
    bible.find((b) => normalize(b.abbrev) === target) ??
    (abbrev ? bible.find((b) => normalize(b.abbrev) === abbrev) : undefined);

  if (!book) {
    throw new Error(`Livro não encontrado: "${bookName}".`);
  }

  const verses = book.chapters[chapter - 1];
  if (!verses || verses.length === 0) {
    throw new Error(`Capítulo ${chapter} não existe em "${book.name}".`);
  }

  return verses;
}

export function formatChapter(verses: string[]): string {
  return verses
    .map((v, i) => `${i + 1}. ${String(v ?? '').trim()}`)
    .filter(Boolean)
    .join('\n');
}