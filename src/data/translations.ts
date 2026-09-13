export interface Translation {
  id: string;
  name: string;
  publisher?: string;
  year?: string;
  publicDomain?: boolean;
}

export const TRANSLATIONS: Translation[] = [
  { id: 'nvi', name: 'Nova Versão Internacional', publisher: 'Biblica' },
  { id: 'acf', name: 'Almeida Corrigida e Fiel', publisher: 'SBTB', year: '1994' },
  { id: 'ara', name: 'Almeida Revista e Atualizada', publisher: 'SBB', year: '1993' },
  { id: 'arc', name: 'Almeida Revista e Corrigida', publisher: 'SBB', year: '1995' },
  { id: 'naa', name: 'Nova Almeida Atualizada', publisher: 'SBB', year: '2017' },
  { id: 'ntlh', name: 'Nova Tradução na Linguagem de Hoje', publisher: 'SBB', year: '1988' },
  { id: 'kja', name: 'King James Atualizada', publisher: 'Abba Press', year: '1999' },
];

export const DEFAULT_TRANSLATION = 'nvi';

export function getTranslation(id: string): Translation {
  return TRANSLATIONS.find((t) => t.id === id) ?? TRANSLATIONS[0];
}