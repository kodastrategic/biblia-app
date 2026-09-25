import { useMemo, useState } from 'react';
import { Search, X, Clock3, BookMarked } from 'lucide-react';
import { BOOKS } from '../../data/books';
import { loadRecentSearches, pushRecentSearch, normalize } from '../../lib/recentSearches';
import { cn } from '../../lib/cn';

interface SearchBooksProps {
  onSelectBook: (name: string) => void;
}

const MAX_AUTO = 8;

export function SearchBooks({ onSelectBook }: SearchBooksProps) {
  const [query, setQuery] = useState('');
  const [open, setOpen] = useState(false);
  const [recents, setRecents] = useState<string[]>(loadRecentSearches);

  const matches = useMemo(() => {
    const q = normalize(query.trim());
    if (!q) return [];
    const hit = BOOKS.filter((b) => normalize(b.name).includes(q));
    hit.sort((a, b) => {
      const aStart = normalize(a.name).startsWith(q) ? 0 : 1;
      const bStart = normalize(b.name).startsWith(q) ? 0 : 1;
      return aStart - bStart;
    });
    return hit.slice(0, MAX_AUTO);
  }, [query]);

  const select = (name: string) => {
    setRecents((prev) => pushRecentSearch(prev, name));
    setQuery('');
    setOpen(false);
    onSelectBook(name);
  };

  const close = () => {
    setOpen(false);
    setQuery('');
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      const name = query.trim() ? matches[0]?.name : recents[0];
      if (name) select(name);
    } else if (e.key === 'Escape') {
      setOpen(false);
      e.currentTarget.blur();
    }
  };

  const showRecents = query.trim() === '';

  return (
    <div className="relative">
      <label
        className={cn(
          'flex items-center gap-3 px-4 py-3 rounded-2xl border bg-white/5 transition-all',
          open ? 'border-brand/50 bg-white/[0.07]' : 'border-line hover:border-brand/30',
        )}
      >
        <Search className="w-4 h-4 text-brand shrink-0" />
        <input
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          onKeyDown={handleKeyDown}
          placeholder="Buscar livro (ex.: João, Salmos, 1 Timóteo...)"
          className="w-full bg-transparent text-fg placeholder:text-dim focus:outline-none text-base"
        />
        {query ? (
          <button
            onClick={close}
            aria-label="Limpar busca"
            className="shrink-0 p-1 rounded-lg text-dim hover:text-fg hover:bg-white/5 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        ) : null}
      </label>

      {open && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
          <div className="absolute left-0 right-0 top-full mt-2 z-20 rounded-2xl border border-line bg-panel-2 shadow-2xl shadow-black/50 overflow-hidden animate-scale-in">
            {showRecents ? (
              <div className="p-2">
                <p className="px-3 pt-2 pb-1 text-[10px] uppercase tracking-widest text-dim/80">
                  Pesquisas recentes
                </p>
                {recents.length === 0 ? (
                  <p className="px-3 py-6 text-center text-xs text-dim italic">
                    Suas buscas por livros vão aparecer aqui.
                  </p>
                ) : (
                  <ul className="space-y-0.5">
                    {recents.map((name) => (
                      <li key={name}>
                        <button
                          onClick={() => select(name)}
                          className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-left text-sm text-fg hover:bg-white/5 transition-colors"
                        >
                          <Clock3 className="w-3.5 h-3.5 text-dim shrink-0" />
                          {name}
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            ) : matches.length === 0 ? (
              <p className="px-4 py-8 text-center text-xs text-dim italic">
                Nenhum livro encontrado para &ldquo;{query.trim()}&rdquo;...
              </p>
            ) : (
              <ul className="p-1.5 max-h-[60vh] overflow-y-auto scrollbar-thin">
                {matches.map((book) => (
                  <li key={book.name}>
                    <button
                      onClick={() => select(book.name)}
                      className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left hover:bg-white/5 transition-colors"
                    >
                      <BookMarked className="w-4 h-4 text-brand shrink-0" />
                      <span className="flex-1 min-w-0">
                        <span className="block text-sm font-semibold text-fg truncate">{book.name}</span>
                        <span className="block text-[10px] text-dim">
                          {book.chapters} {book.chapters === 1 ? 'capítulo' : 'capítulos'}
                        </span>
                      </span>
                      <span
                        className={cn(
                          'shrink-0 px-1.5 py-0.5 rounded-md text-[9px] font-bold',
                          book.testament === 'old'
                            ? 'bg-amber-400/15 text-amber-300'
                            : 'bg-brand-soft text-brand',
                        )}
                      >
                        {book.testament === 'old' ? 'AT' : 'NT'}
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </>
      )}
    </div>
  );
}