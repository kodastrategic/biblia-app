// Plano de leitura da Bíblia em 365 dias
// Distribuindo os 1189 capítulos rigorosamente de Gênesis a Apocalipse

export interface DailyReading {
  day: number;
  readings: {
    book: string;
    chapters: number[];
  }[];
}

// Mantivemos a estrutura original de dados para não bugar o App
export const readingPlan: DailyReading[] = []; 

export function generateFullReadingPlan(): DailyReading[] {
  const plan: DailyReading[] = [];
  const booksData = [
    { name: "Gênesis", chapters: 50 }, { name: "Êxodo", chapters: 40 }, { name: "Levítico", chapters: 27 },
    { name: "Números", chapters: 36 }, { name: "Deuteronômio", chapters: 34 }, { name: "Josué", chapters: 24 },
    { name: "Juízes", chapters: 21 }, { name: "Rute", chapters: 4 }, { name: "1 Samuel", chapters: 31 },
    { name: "2 Samuel", chapters: 24 }, { name: "1 Reis", chapters: 22 }, { name: "2 Reis", chapters: 25 },
    { name: "1 Crônicas", chapters: 29 }, { name: "2 Crônicas", chapters: 36 }, { name: "Esdras", chapters: 10 },
    { name: "Neemias", chapters: 13 }, { name: "Ester", chapters: 10 }, { name: "Jó", chapters: 42 },
    { name: "Salmos", chapters: 150 }, { name: "Provérbios", chapters: 31 }, { name: "Eclesiastes", chapters: 12 },
    { name: "Cântico dos Cânticos", chapters: 8 }, { name: "Isaías", chapters: 66 }, { name: "Jeremias", chapters: 52 },
    { name: "Lamentações", chapters: 5 }, { name: "Ezequiel", chapters: 48 }, { name: "Daniel", chapters: 12 },
    { name: "Oséias", chapters: 14 }, { name: "Joel", chapters: 3 }, { name: "Amós", chapters: 9 },
    { name: "Obadias", chapters: 1 }, { name: "Jonas", chapters: 4 }, { name: "Miquéias", chapters: 7 },
    { name: "Naum", chapters: 3 }, { name: "Habacuque", chapters: 3 }, { name: "Sofonias", chapters: 3 },
    { name: "Ageu", chapters: 2 }, { name: "Zacarias", chapters: 14 }, { name: "Malaquias", chapters: 4 },
    { name: "Mateus", chapters: 28 }, { name: "Marcos", chapters: 16 }, { name: "Lucas", chapters: 24 },
    { name: "João", chapters: 21 }, { name: "Atos", chapters: 28 }, { name: "Romanos", chapters: 16 },
    { name: "1 Coríntios", chapters: 16 }, { name: "2 Coríntios", chapters: 13 }, { name: "Gálatas", chapters: 6 },
    { name: "Efésios", chapters: 6 }, { name: "Filipenses", chapters: 4 }, { name: "Colossenses", chapters: 4 },
    { name: "1 Tessalonicenses", chapters: 5 }, { name: "2 Tessalonicenses", chapters: 3 }, { name: "1 Timóteo", chapters: 6 },
    { name: "2 Timóteo", chapters: 4 }, { name: "Tito", chapters: 3 }, { name: "Filemom", chapters: 1 },
    { name: "Hebreus", chapters: 13 }, { name: "Tiago", chapters: 5 }, { name: "1 Pedro", chapters: 5 },
    { name: "2 Pedro", chapters: 3 }, { name: "1 João", chapters: 5 }, { name: "2 João", chapters: 1 },
    { name: "3 João", chapters: 1 }, { name: "Judas", chapters: 1 }, { name: "Apocalipse", chapters: 22 },
  ];

  const totalChapters = 1189;
  const totalDays = 365;
  const chaptersPerDayBase = totalChapters / totalDays; // ~3.25

  let currentBookIndex = 0;
  let currentChapter = 1;

  for (let day = 1; day <= totalDays; day++) {
    const dailyReading: DailyReading = {
      day: day,
      readings: [],
    };

    // Cálculo matemático para saber exatamente quais capítulos pertencem a este dia
    const startChapterIdx = Math.floor((day - 1) * chaptersPerDayBase);
    const endChapterIdx = Math.floor(day * chaptersPerDayBase);
    const chaptersToReadToday = endChapterIdx - startChapterIdx;

    let chaptersAdded = 0;

    while (chaptersAdded < chaptersToReadToday && currentBookIndex < booksData.length) {
      const book = booksData[currentBookIndex];
      const chaptersAvailableInBook = book.chapters - currentChapter + 1;
      const canReadFromThisBook = Math.min(chaptersToReadToday - chaptersAdded, chaptersAvailableInBook);

      const list: number[] = [];
      for (let i = 0; i < canReadFromThisBook; i++) {
        list.push(currentChapter + i);
      }

      dailyReading.readings.push({
        book: book.name,
        chapters: list
      });

      chaptersAdded += canReadFromThisBook;
      currentChapter += canReadFromThisBook;

      if (currentChapter > book.chapters) {
        currentBookIndex++;
        currentChapter = 1;
      }
    }
    plan.push(dailyReading);
  }

  return plan;
}

export function getReadingForDay(day: number): DailyReading | null {
  const plan = generateFullReadingPlan();
  // Garante que o dia solicitado esteja entre 1 e 365
  const safeDay = Math.min(Math.max(1, day), 365);
  return plan.find(r => r.day === safeDay) || null;
}

export function getDayOfYear(date: Date = new Date()): number {
  const start = new Date(date.getFullYear(), 0, 0);
  const diff = date.getTime() - start.getTime();
  const oneDay = 1000 * 60 * 60 * 24;
  return Math.floor(diff / oneDay);
}
