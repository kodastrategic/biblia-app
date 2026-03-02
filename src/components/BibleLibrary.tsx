import { useState } from 'react';
import { X, Book as BibleIcon, Search, ChevronRight } from 'lucide-react';

interface Book {
  name: string;
  chapters: number;
  testament?: string;
}

interface BibleLibraryProps {
  isOpen: boolean;
  onClose: () => void;
  books: Book[];
  onSelectChapter: (bookName: string, chapter: number) => void;
}

export function BibleLibrary({ isOpen, onClose, books, onSelectChapter }: BibleLibraryProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedBook, setSelectedBook] = useState<Book | null>(null);

  // Lógica de busca funcional
  const filteredBooks = books.filter(book =>
    book.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (!isOpen) return null;

  return (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 transition-opacity"
        onClick={() => {
          setSelectedBook(null);
          onClose();
        }}
      />

      {/* Bible Panel */}
      <div className="fixed top-0 right-0 h-full w-full md:w-[480px] bg-gradient-to-br from-[#0b1f2a] to-[#2a0f2f] border-l border-white/20 shadow-2xl z-50 flex flex-col">
        
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-white/10 sticky top-0 bg-[#0b1f2a] z-10">
          <h2 className="text-xl md:text-2xl flex items-center gap-3 font-semibold text-white">
            <BibleIcon className="w-6 h-6 text-[#2FA4FF]" />
            {selectedBook ? selectedBook.name : 'Bíblia Completa'}
          </h2>
          <button
            onClick={() => {
              if (selectedBook) setSelectedBook(null);
              else onClose();
            }}
            className="p-2 hover:bg-white/10 rounded-lg transition-colors"
          >
            {selectedBook ? <ChevronRight className="w-5 h-5 rotate-180 text-white/60" /> : <X className="w-5 h-5 text-white/60" />}
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 scrollbar-hide">
          {!selectedBook ? (
            <div className="space-y-6">
              
              {/* BARRA DE PESQUISA SIMPLES E FUNCIONAL */}
              <div className="group w-full flex items-center gap-3 px-4 py-3.5 bg-white/5 border border-white/10 rounded-xl focus-within:border-[#2FA4FF]/50 focus-within:bg-white/10 transition-all">
  <Search className="w-4 h-4 text-[#2FA4FF] group-focus-within:text-white transition-colors flex-shrink-0" />
  <input
    type="text"
    placeholder="Pesquisar livro..."
    value={searchTerm}
    onChange={(e) => setSearchTerm(e.target.value)}
    className="w-full bg-transparent text-white placeholder:text-white/30 focus:outline-none"
  />
</div>

              {/* Lista de Livros */}
              <div className="grid grid-cols-1 gap-2">
                {filteredBooks.length > 0 ? (
                  filteredBooks.map((book) => (
                    <button
                      key={book.name}
                      onClick={() => setSelectedBook(book)}
                      className="flex items-center justify-between p-4 bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 hover:border-[#2FA4FF]/30 transition-all group"
                    >
                      <span className="text-[#DADADA] group-hover:text-white font-medium">{book.name}</span>
                      <ChevronRight className="w-4 h-4 text-white/20 group-hover:text-[#2FA4FF] group-hover:translate-x-1 transition-all" />
                    </button>
                  ))
                ) : (
                  <p className="text-center text-white/40 py-10 italic">Nenhum livro encontrado...</p>
                )}
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              <p className="text-xs text-[#2FA4FF] uppercase tracking-[0.2em] font-bold">Capítulos de {selectedBook.name}</p>
              
              <div className="grid grid-cols-6 sm:grid-cols-7 gap-2">
                {Array.from({ length: selectedBook.chapters }, (_, i) => i + 1).map((cap) => (
                  <button
                    key={cap}
                    onClick={() => onSelectChapter(selectedBook.name, cap)}
                    className="w-full aspect-square flex items-center justify-center bg-white/5 border border-white/10 rounded-lg text-xs font-bold text-[#DADADA] hover:bg-gradient-to-r hover:from-[#2FA4FF] hover:to-[#8B5CF6] hover:text-white hover:border-transparent transition-all active:scale-90"
                  >
                    {cap}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-white/10 bg-black/20">
           <div className="p-4 bg-[#2FA4FF]/5 rounded-xl border border-[#2FA4FF]/20">
              <p className="text-[11px] text-[#DADADA]/80 leading-relaxed flex gap-2">
                <span className="text-[#2FA4FF]">💡</span>
                <span>Selecione um livro para ver os capítulos. Ao selecionar, a leitura abrirá automaticamente.</span>
              </p>
           </div>
        </div>
      </div>
    </>
  );
}
