import { useEffect, useRef, useState } from "react";
import { fetchInfantilLiteratura } from "./utils/fetchBooks";
import { useBackgroundMusic } from "./utils/musicHook";
import Library from "./components/Library";
import Reader from "./components/reader/Reader";
import { Brand, BookMark } from "./components/Brand";

function App() {
  const [books, setBooks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [current, setCurrent] = useState(null);
  const music = useBackgroundMusic();
  const savedScroll = useRef<number | null>(null);

  useEffect(() => {
    fetchInfantilLiteratura()
      .then((data) => setBooks(data))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (!current) {
      document.title = "Historinha — para meus filhos";
      if (savedScroll.current != null) {
        window.scrollTo({ top: savedScroll.current, behavior: "instant" });
      }
    }
  }, [current]);

  const openBook = (book) => {
    savedScroll.current = window.scrollY;
    setCurrent(book);
    // inicia a música dentro do gesto do clique (evita bloqueio de autoplay)
    if (!music.isPlaying) music.start();
  };

  if (loading) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-5 bg-paper text-ink-soft">
        <span className="mark-float grid h-16 w-16 place-items-center rounded-full border border-berry/25 bg-white text-berry shadow-[0_10px_30px_-16px_rgba(120,70,30,0.5)]">
          <BookMark className="h-8 w-8" />
        </span>
        <p className="wonk font-display text-lg italic text-ink-soft">Abrindo a estante…</p>
      </div>
    );
  }

  if (current) {
    return <Reader book={current} onClose={() => setCurrent(null)} music={music} />;
  }

  return (
    <div>
      {books.length === 0 ? (
        <div className="flex min-h-screen flex-col items-center justify-center gap-6 px-6 text-center">
          <Brand />
          <div className="max-w-md">
            <h1 className="wonk font-display text-2xl font-semibold text-ink">A estante ainda está vazia</h1>
            <p className="mt-2 text-sm leading-relaxed text-ink-soft">
              Rode o downloader para trazer os livros infantis para dentro do app.
            </p>
            <code className="mt-4 inline-block rounded-xl border border-paper-line bg-white px-3 py-2 text-[13px] text-ink">
              python3 baixar_livros.py
            </code>
          </div>
        </div>
      ) : (
        <Library books={books} onOpen={openBook} />
      )}
    </div>
  );
}

export default App;
