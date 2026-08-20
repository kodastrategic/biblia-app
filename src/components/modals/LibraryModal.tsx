import { useState } from 'react';
import { Book as BibleIcon, Search, ChevronRight } from 'lucide-react';
import type { Book } from '../../types';
import { cn } from '../../lib/cn';
import { Modal, ModalHeader } from '../ui/Modal';

interface LibraryModalProps {
  open: boolean;
  onClose: () => void;
  books: Book[];
  readChapters: Record<string, Set<number>>;
  onSelectChapter: (bookName: string, chapter: number) => void;
}

export function LibraryModal({ open, onClose, books, readChapters, onSelectChapter }: LibraryModalProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedBook, setSelectedBook] = useState<Book | null>(null);

  const normalized = searchTerm.trim().toLowerCase();
  const filteredBooks = normalized
    ? books.filter((b) => b.name.toLowerCase().includes(normalized))
    : books;

  const handleClose = () => {
    setSelectedBook(null);
    setSearchTerm('');
    onClose();
  };

  return (
    <Modal open={open} onClose={handleClose} position="right">
      <div className="relative w-full max-w-md h-full bg-ink-2 border-l border-line flex flex-col animate-slide-up md:animate-scale-in">
        <ModalHeader
          title={selectedBook ? selectedBook.name : 'Bíblia Completa'}
          subtitle={selectedBook ? undefined : `${books.length} livros`}
          onClose={() => (selectedBook ? setSelectedBook(null) : handleClose())}
        />

        <div className="flex-1 overflow-y-auto scrollbar-thin p-5">
          {!selectedBook ? (
            <div className="space-y-4">
              <label className="flex items-center gap-3 px-4 py-3 rounded-xl bg-white/5 border border-line focus-within:border-brand/50 focus-within:bg-white/[0.06] transition-all">
                <Search className="w-4 h-4 text-brand shrink-0" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Pesquisar livro..."
                  className="w-full bg-transparent text-fg placeholder:text-dim focus:outline-none text-sm"
                />
              </label>

              <div className="grid grid-cols-1 gap-2">
                {filteredBooks.length > 0 ? (
                  filteredBooks.map((book) => (
                    <button
                      key={book.name}
                      onClick={() => setSelectedBook(book)}
                      className="flex items-center justify-between p-3.5 rounded-xl bg-white/5 border border-line hover:bg-white/10 hover:border-brand/30 transition-all group"
                    >
                      <span className="text-sm font-medium text-muted group-hover:text-fg">
                        {book.name}
                      </span>
                      <ChevronRight className="w-4 h-4 text-dim group-hover:text-brand group-hover:translate-x-0.5 transition-all" />
                    </button>
                  ))
                ) : (
                  <p className="text-center text-dim italic py-10">Nenhum livro encontrado...</p>
                )}
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <p className="text-xs uppercase tracking-[0.2em] text-brand font-bold">
                Capítulos de {selectedBook.name}
              </p>
              <div className="grid grid-cols-6 gap-2">
                {Array.from({ length: selectedBook.chapters }, (_, i) => i + 1).map((cap) => {
                  const isRead = readChapters[selectedBook.name]?.has(cap);
                  return (
                    <button
                      key={cap}
                      onClick={() => onSelectChapter(selectedBook.name, cap)}
                      className={cn(
                        'w-full aspect-square flex items-center justify-center rounded-lg text-xs font-bold border transition-all active:scale-90',
                        isRead
                          ? 'bg-gradient-to-r from-brand to-accent text-white border-transparent shadow-[0_4px_14px_-4px_rgba(47,164,255,0.5)]'
                          : 'bg-white/5 border-line text-muted hover:border-brand/50 hover:text-fg',
                      )}
                    >
                      {cap}
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        <div className="p-5 border-t border-line bg-black/20">
          <div className="p-4 rounded-xl border border-brand/20 bg-brand-soft">
            <p className="text-[11px] text-muted leading-relaxed flex gap-2">
              <span className="text-brand">💡</span>
              <span>
                Selecione um livro para ver os capítulos. Ao escolher, a leitura abre
                automaticamente.
              </span>
            </p>
          </div>
        </div>
      </div>
    </Modal>
  );
}