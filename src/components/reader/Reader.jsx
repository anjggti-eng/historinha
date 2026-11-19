import { useEffect, useMemo, useRef, useState } from "react";
import { Document, Page, pdfjs } from "react-pdf";
import "react-pdf/dist/Page/TextLayer.css";
import "react-pdf/dist/Page/AnnotationLayer.css";
import workerSrc from "pdfjs-dist/build/pdf.worker.min.mjs?url";
import { splitTitle } from "../../utils/bookInfo";
import { getSavedPage, savePage } from "../../utils/progress";

pdfjs.GlobalWorkerOptions.workerSrc = workerSrc;

const RELEASE_BASE = "https://raw.githubusercontent.com/anjggti-eng/historinha-acervo/main/livros";
const remotePdf = (book) => `${RELEASE_BASE}/${book.slug}.pdf`;

const computeWidth = () => {
  const vw = typeof window === "undefined" ? 1024 : window.innerWidth;
  const pad = vw < 640 ? 24 : vw < 1024 ? 64 : 96;
  return Math.min(Math.max(vw - pad, 260), 820);
};

export default function Reader({ book, onClose, music }) {
  const { title, author } = useMemo(() => splitTitle(book.title), [book.title]);
  const [numPages, setNumPages] = useState(0);
  const [page, setPage] = useState(() => getSavedPage(book.slug));
  const [width, setWidth] = useState(computeWidth);
  const [zoom, setZoom] = useState(1);
  const [loading, setLoading] = useState(true);
  const [rendering, setRendering] = useState(true);
  const [failed, setFailed] = useState(false);
  const [source, setSource] = useState(book.pdf_local);
  const triedRemote = useRef(false);
  const pageRef = useRef(null);
  const swipe = useRef({ x: 0, y: 0 });
  const { isPlaying, toggle } = music;

  useEffect(() => {
    setNumPages(0);
    setZoom(1);
    setLoading(true);
    setRendering(true);
    setFailed(false);
    setSource(book.pdf_local);
    triedRemote.current = false;
    setPage(getSavedPage(book.slug));
    document.title = `${title} · Historinha`;
    return () => {
      document.title = "Historinha — para meus filhos";
    };
  }, [book.slug, title]);

  useEffect(() => {
    const onResize = () => setWidth(computeWidth());
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  useEffect(() => {
    if (!numPages) return;
    setPage((current) => Math.min(Math.max(current, 1), numPages));
  }, [numPages]);

  useEffect(() => {
    if (!numPages) return;
    savePage(book.slug, page);
  }, [book.slug, page, numPages]);

  const animate = (dir) => {
    const el = pageRef.current;
    if (!el) return;
    el.classList.remove("sheet-next", "sheet-prev");
    void el.offsetWidth;
    el.classList.add(dir === "next" ? "sheet-next" : "sheet-prev");
  };

  const goNext = () => {
    if (numPages && page >= numPages) return;
    animate("next");
    setRendering(true);
    setPage((current) => Math.min(current + 1, numPages || current));
  };

  const goPrev = () => {
    if (page <= 1) return;
    animate("prev");
    setRendering(true);
    setPage((current) => Math.max(current - 1, 1));
  };

  const goTo = (value) => {
    const target = parseInt(value, 10);
    if (!Number.isFinite(target)) return;
    const clamped = Math.min(Math.max(target, 1), numPages || 1);
    if (clamped === page) return;
    animate(clamped > page ? "next" : "prev");
    setRendering(true);
    setPage(clamped);
  };

  const changeZoom = (delta) => {
    setRendering(true);
    setZoom((current) => {
      const next = Math.round((current + delta) * 100) / 100;
      return Math.min(Math.max(next, 0.6), 2);
    });
  };

  useEffect(() => {
    const onKey = (event) => {
      const tag = event.target?.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA") return;
      if (event.key === "ArrowRight") {
        event.preventDefault();
        goNext();
      }
      if (event.key === "ArrowLeft") {
        event.preventDefault();
        goPrev();
      }
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [numPages, page, onClose]);

  const handleLoadError = () => {
    if (!triedRemote.current) {
      triedRemote.current = true;
      setFailed(false);
      setLoading(true);
      setNumPages(0);
      setSource(remotePdf(book));
      return;
    }
    setLoading(false);
    setFailed(true);
  };

  const progress = numPages ? (page / numPages) * 100 : 0;
  const renderWidth = Math.round(width * zoom);

  return (
    <div className="screen-in flex h-dvh flex-col overflow-hidden bg-paper-deep text-ink">
      <header className="relative z-30 shrink-0 border-b border-paper-line/80 bg-paper/85 backdrop-blur-xl">
        <div className="mx-auto flex max-w-6xl items-center gap-2.5 px-3 py-2.5 sm:gap-4 sm:px-6 sm:py-3">
          <button
            type="button"
            onClick={onClose}
            aria-label="Voltar para a biblioteca"
            className="group flex h-10 shrink-0 items-center gap-1.5 rounded-full border border-paper-line bg-white/80 pl-2.5 pr-3 text-sm font-medium text-ink-soft transition-colors hover:bg-white hover:text-ink active:scale-[0.97] sm:pl-3 sm:pr-4"
          >
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
              <path d="M19 12H5M11 18l-6-6 6-6" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <span className="hidden xs:inline">Biblioteca</span>
          </button>

          <div className="min-w-0 flex-1 text-center sm:text-left">
            <h1 className="wonk truncate font-display text-[15px] font-semibold leading-tight tracking-[-0.015em] sm:text-[19px]">
              {title}
            </h1>
            <p className="truncate text-[10.5px] font-medium uppercase tracking-[0.1em] text-ink-faint sm:text-[11px]">
              {author || "Domínio público"}
            </p>
          </div>

          <span className="hidden items-center gap-1.5 text-[11px] text-ink-faint lg:flex" aria-hidden="true">
            <kbd className="rounded-md border border-paper-line bg-white/70 px-1.5 py-0.5 font-sans text-[10px]">←</kbd>
            <kbd className="rounded-md border border-paper-line bg-white/70 px-1.5 py-0.5 font-sans text-[10px]">→</kbd>
            para virar
          </span>

          <button
            type="button"
            onClick={toggle}
            aria-pressed={isPlaying}
            aria-label={isPlaying ? "Pausar música de fundo" : "Tocar música de fundo"}
            className={`flex h-10 shrink-0 items-center gap-2 rounded-full border px-3 text-sm font-medium transition-colors active:scale-[0.97] sm:px-4 ${
              isPlaying
                ? "border-berry/35 bg-white text-berry shadow-[0_4px_14px_-8px_rgba(157,58,38,0.6)]"
                : "border-paper-line bg-white/60 text-ink-soft hover:bg-white hover:text-ink"
            }`}
          >
            <span className="eq" data-playing={isPlaying} aria-hidden="true">
              <i /><i /><i />
            </span>
            <span className="hidden xs:inline">{isPlaying ? "Música" : "Sem música"}</span>
          </button>
        </div>

        <div className="h-[3px] w-full bg-paper-line/60" role="presentation">
          <div
            className="h-full rounded-r-full bg-berry transition-[width] duration-500 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>
      </header>

      <main
        className="relative min-h-0 flex-1 overflow-auto px-2 sm:px-6"
        onTouchStart={(event) => {
          swipe.current = { x: event.touches[0].clientX, y: event.touches[0].clientY };
        }}
        onTouchEnd={(event) => {
          const dx = event.changedTouches[0].clientX - swipe.current.x;
          const dy = event.changedTouches[0].clientY - swipe.current.y;
          if (Math.abs(dx) > 55 && Math.abs(dx) > Math.abs(dy) * 1.2) {
            if (dx < 0) goNext();
            else goPrev();
          }
        }}
      >
        <div className="relative flex min-h-full flex-col py-4 sm:py-7">
          {failed ? (
            <div className="m-auto flex max-w-sm flex-col items-center gap-4 rounded-3xl border border-paper-line bg-white/80 px-6 py-10 text-center">
              <span className="grid h-12 w-12 place-items-center rounded-full bg-paper-deep text-ink-faint">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
                  <path d="M12 8v5M12 16.5v.5" strokeLinecap="round" />
                  <circle cx="12" cy="12" r="9" />
                </svg>
              </span>
              <div>
                <p className="wonk font-display text-xl font-semibold">Não conseguimos abrir este livro</p>
                <p className="mt-1 text-sm text-ink-soft">O arquivo pode estar incompleto no acervo.</p>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="rounded-full bg-berry px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-berry-deep"
              >
                Voltar à biblioteca
              </button>
            </div>
          ) : (
            <div className="m-auto">
              <Document
                file={source}
                onLoadSuccess={({ numPages: total }) => {
                  setNumPages(total);
                  setLoading(false);
                }}
                onLoadError={handleLoadError}
                onSourceError={handleLoadError}
                loading={null}
                error={null}
              >
                <div ref={pageRef} className="sheet relative">
                  <Page
                    pageNumber={page}
                    width={renderWidth}
                    onRenderSuccess={() => {
                      setLoading(false);
                      setRendering(false);
                    }}
                    onRenderError={() => {
                      setLoading(false);
                      setRendering(false);
                    }}
                    renderTextLayer
                    renderAnnotationLayer
                    loading={
                      <div
                        className="skeleton"
                        style={{ width: renderWidth, height: Math.round(renderWidth * 1.36) }}
                      />
                    }
                  />
                  <div
                    aria-hidden="true"
                    className={`skeleton pointer-events-none absolute inset-0 transition-opacity duration-300 ${
                      rendering ? "opacity-100" : "opacity-0"
                    }`}
                  />
                </div>
              </Document>
            </div>
          )}

          {(loading || rendering) && !failed && (
            <div className="pointer-events-none absolute left-1/2 top-6 flex -translate-x-1/2 items-center gap-2 rounded-full border border-paper-line bg-white/85 px-3 py-1.5 text-[11.5px] text-ink-soft shadow-sm backdrop-blur">
              <span className="h-3 w-3 animate-spin rounded-full border-2 border-berry/25 border-t-berry" />
              {loading ? "Abrindo o livro…" : "Virando a página…"}
            </div>
          )}
        </div>
      </main>

      <div className="relative z-30 shrink-0 bg-gradient-to-t from-paper-deep via-paper-deep/95 to-paper-deep/0 px-3 pb-[max(10px,env(safe-area-inset-bottom))] pt-5 sm:px-6">
        <div className="mx-auto max-w-3xl">
          <div className="flex flex-wrap items-center gap-1.5 rounded-[18px] border border-paper-line bg-white/90 px-2 py-2 shadow-[0_14px_36px_-18px_rgba(96,58,22,0.55)] backdrop-blur sm:gap-2.5 sm:px-3">
            <button
              type="button"
              onClick={goPrev}
              disabled={page <= 1}
              aria-label="Página anterior"
              className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-berry text-white transition-all hover:bg-berry-deep active:scale-95 disabled:cursor-not-allowed disabled:bg-paper-line disabled:text-ink-faint disabled:opacity-70"
            >
              <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" aria-hidden="true">
                <path d="M15 18l-6-6 6-6" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>

            <div className="flex h-10 items-center gap-1 rounded-full border border-paper-line bg-paper px-2.5 text-sm tabular-nums">
              <input
                type="number"
                min={1}
                max={numPages || 1}
                value={page}
                onChange={(event) => goTo(event.target.value)}
                aria-label="Ir para a página"
                className="w-8 bg-transparent text-center font-semibold text-ink outline-none [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
              />
              <span className="text-ink-faint">/ {numPages || "…"}</span>
            </div>

            <button
              type="button"
              onClick={goNext}
              disabled={numPages ? page >= numPages : false}
              aria-label="Próxima página"
              className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-berry text-white transition-all hover:bg-berry-deep active:scale-95 disabled:cursor-not-allowed disabled:bg-paper-line disabled:text-ink-faint disabled:opacity-70"
            >
              <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" aria-hidden="true">
                <path d="M9 6l6 6-6 6" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>

            <input
              type="range"
              min={1}
              max={numPages || 1}
              value={page}
              onChange={(event) => goTo(event.target.value)}
              aria-label="Progresso do livro"
              className="reader-range order-last mt-1 w-full sm:order-none sm:mt-0 sm:w-auto sm:flex-1"
              style={{ "--p": `${progress}%` }}
            />

            <span className="ml-auto hidden h-6 w-px bg-paper-line sm:ml-1 sm:block" />

            <div className="ml-auto flex items-center gap-0.5 sm:ml-0">
              <button
                type="button"
                onClick={() => changeZoom(-0.1)}
                disabled={zoom <= 0.6}
                aria-label="Diminuir zoom"
                className="grid h-8 w-8 place-items-center rounded-full text-[13px] font-semibold text-ink-soft transition-colors hover:bg-paper-deep hover:text-ink disabled:opacity-35"
              >
                A−
              </button>
              <button
                type="button"
                onClick={() => {
                  setRendering(true);
                  setZoom(1);
                }}
                aria-label="Restaurar zoom"
                className="min-w-[42px] rounded-full px-1 py-1 text-[11px] font-medium tabular-nums text-ink-faint transition-colors hover:bg-paper-deep hover:text-ink"
              >
                {Math.round(zoom * 100)}%
              </button>
              <button
                type="button"
                onClick={() => changeZoom(0.1)}
                disabled={zoom >= 2}
                aria-label="Aumentar zoom"
                className="grid h-8 w-8 place-items-center rounded-full text-[13px] font-semibold text-ink-soft transition-colors hover:bg-paper-deep hover:text-ink disabled:opacity-35"
              >
                A+
              </button>
            </div>
          </div>
        </div>
      </div>

      <span className="sr-only" aria-live="polite">
        {numPages ? `Página ${page} de ${numPages}` : "Carregando livro"}
      </span>
    </div>
  );
}
