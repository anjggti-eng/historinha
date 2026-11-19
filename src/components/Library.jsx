import { useMemo, useRef, useState } from "react";
import { Brand } from "./Brand";
import { splitTitle } from "../utils/bookInfo";
import { getSavedPage } from "../utils/progress";

const normalise = (value = "") =>
  value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");

function CoverImage({ src, title, className = "" }) {
  const [state, setState] = useState(src ? "loading" : "empty");
  const initial = (title || "?").trim().charAt(0).toUpperCase();

  return (
    <div className={`relative h-full w-full overflow-hidden ${className}`}>
      {state !== "ready" && (
        <div className="absolute inset-0 flex items-center justify-center bg-paper-deep">
          {state === "loading" ? (
            <div className="skeleton absolute inset-0" />
          ) : (
            <span className="wonk font-display text-5xl text-ink-faint/45">{initial}</span>
          )}
        </div>
      )}
      {state === "loading" && (
        <img
          src={src}
          alt={title}
          loading="lazy"
          decoding="async"
          onLoad={() => setState("ready")}
          onError={() => setState("empty")}
          className="absolute inset-0 h-full w-full object-cover opacity-0"
        />
      )}
      {state === "ready" && (
        <img
          src={src}
          alt={title}
          loading="lazy"
          decoding="async"
          className="h-full w-full object-cover transition-transform duration-500 ease-out group-hover:scale-[1.045] group-focus-visible:scale-[1.045]"
        />
      )}
    </div>
  );
}

function BookCard({ book, onOpen, index }) {
  const { title, author } = splitTitle(book.title);
  const src = book.cover_local || book.cover;
  const delay = Math.min(index, 18) * 22;
  const saved = getSavedPage(book.slug);

  return (
    <button
      type="button"
      onClick={() => onOpen(book)}
      style={{ animationDelay: `${delay}ms` }}
      className="card-in group relative flex flex-col rounded-[18px] bg-white p-2 text-left ring-1 ring-paper-line/90 transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_18px_40px_-22px_rgba(96,58,22,0.55)] hover:ring-paper-line focus:outline-none focus-visible:-translate-y-1 focus-visible:ring-2 focus-visible:ring-berry active:translate-y-0 active:scale-[0.985] sm:p-2.5"
      aria-label={`Ler ${title}`}
    >
      <div className="relative aspect-[3/4] overflow-hidden rounded-[13px] bg-paper-deep">
        <CoverImage src={src} title={title} />

        <span className="pointer-events-none absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black/55 via-black/10 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

        {saved > 1 && (
          <span
            className="pointer-events-none absolute right-2 top-2 inline-flex items-center gap-1 rounded-full bg-white/92 px-2 py-1 text-[10px] font-semibold text-berry shadow-sm backdrop-blur"
            title={`Você parou na página ${saved}`}
          >
            <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
              <path d="M7 3h10a2 2 0 0 1 2 2v16l-7-4.2L5 21V5a2 2 0 0 1 2-2Z" />
            </svg>
            p. {saved}
          </span>
        )}

        <span className="pointer-events-none absolute bottom-2 left-2 inline-flex translate-y-2 items-center gap-1 rounded-full bg-berry px-2.5 py-1 text-[11px] font-semibold text-white opacity-0 shadow-lg transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100 group-focus-visible:translate-y-0 group-focus-visible:opacity-100">
          Ler agora
          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6" aria-hidden="true">
            <path d="M5 12h14M13 6l6 6-6 6" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </span>
      </div>

      <div className="flex min-h-[52px] flex-col justify-center px-0.5 pt-2.5 pb-1 sm:min-h-[58px]">
        <p className="wonk line-clamp-2 font-display text-[13.5px] font-semibold leading-[1.25] tracking-[-0.01em] text-ink sm:text-[14.5px]">
          {title}
        </p>
        <p className="mt-0.5 line-clamp-1 text-[10.5px] font-medium uppercase tracking-[0.09em] text-ink-faint sm:text-[11px]">
          {author || "Domínio público"}
        </p>
      </div>
    </button>
  );
}

function SearchField({ value, onChange, inputRef }) {
  return (
    <div className="relative">
      <svg
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-faint"
        aria-hidden="true"
      >
        <circle cx="11" cy="11" r="7" />
        <path d="m20 20-3.5-3.5" strokeLinecap="round" />
      </svg>
      <input
        ref={inputRef}
        type="search"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder="Buscar por título ou autor…"
        aria-label="Buscar por título ou autor"
        className="h-11 w-full rounded-full border border-paper-line bg-white/70 pl-10 pr-10 text-sm text-ink outline-none transition-all placeholder:text-ink-faint/80 hover:bg-white focus:border-berry/45 focus:bg-white focus:ring-4 focus:ring-berry/10 [&::-webkit-search-cancel-button]:hidden"
      />
      {value && (
        <button
          type="button"
          onClick={() => onChange("")}
          aria-label="Limpar busca"
          className="absolute right-2.5 top-1/2 grid h-7 w-7 -translate-y-1/2 place-items-center rounded-full text-ink-faint transition-colors hover:bg-paper-deep hover:text-ink"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" aria-hidden="true">
            <path d="M6 6l12 12M18 6 6 18" strokeLinecap="round" />
          </svg>
        </button>
      )}
    </div>
  );
}

function HeroFan({ books, onOpen }) {
  const fan = useMemo(() => {
    const withCover = books.filter((book) => book.cover_local || book.cover);
    if (withCover.length < 3) return [];
    const centre = withCover.find((book) => book.slug === "100-historias-infantis") || withCover[0];
    const rest = withCover.filter((book) => book !== centre);
    return [rest[Math.floor(rest.length * 0.28)], centre, rest[Math.floor(rest.length * 0.62)]];
  }, [books]);

  if (fan.length < 3) return null;

  const layout = [
    { transform: "rotate(-8.5deg) translateX(-46%)", x: "-16px", delay: "110ms", z: "z-[6]" },
    { transform: "rotate(-1.2deg) translateX(0)", x: "0px", delay: "0ms", z: "z-10" },
    { transform: "rotate(7.5deg) translateX(46%)", x: "16px", delay: "180ms", z: "z-[7]" },
  ];

  return (
    <div className="fan-stage mx-auto max-w-[400px]" aria-label="Algumas capas da coleção">
      <div className="fan-shelf" />
      {fan.map((book, i) => (
        <button
          key={book.slug}
          type="button"
          onClick={() => onOpen(book)}
          aria-label={`Ler ${splitTitle(book.title).title}`}
          className={`fan-card group ${layout[i].z} focus:outline-none`}
          style={{
            "--fan-transform": layout[i].transform,
            "--fan-x": layout[i].x,
            "--fan-delay": layout[i].delay,
          }}
        >
          <img
            src={book.cover_local || book.cover}
            alt={splitTitle(book.title).title}
            loading={i === 1 ? "eager" : "lazy"}
            decoding="async"
            className="h-full w-full object-cover"
          />
        </button>
      ))}
    </div>
  );
}

export default function Library({ books, onOpen }) {
  const [query, setQuery] = useState("");
  const searchRef = useRef(null);

  const key = normalise(query.trim());

  const filtered = useMemo(() => {
    if (!key) return books;
    return books.filter((book) => normalise(book.title).includes(key));
  }, [books, key]);

  const surprise = () => {
    if (!books.length) return;
    onOpen(books[Math.floor(Math.random() * books.length)]);
  };

  return (
    <div className="screen-in min-h-screen">
      <header className="sticky top-0 z-40 border-b border-paper-line/70 bg-paper/85 backdrop-blur-xl">
        <div className="mx-auto flex max-w-[1280px] items-center gap-3 px-4 py-2.5 sm:px-6 sm:py-3 lg:px-8">
          <Brand onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })} />
          <div className="ml-auto hidden w-full max-w-[310px] sm:block">
            <SearchField value={query} onChange={setQuery} inputRef={searchRef} />
          </div>
        </div>
        <div className="px-4 pb-2.5 sm:hidden">
          <SearchField value={query} onChange={setQuery} inputRef={searchRef} />
        </div>
      </header>

      <main>
        <section className="mx-auto max-w-[1280px] px-4 pb-10 pt-6 sm:px-6 sm:pt-14 lg:px-8 lg:pb-16 lg:pt-16">
          <div className="grid items-center gap-7 sm:gap-10 lg:grid-cols-[1.08fr_0.92fr] lg:gap-6">
            <div className="max-w-[600px]">
              <p className="enter-rise flex items-center gap-2 text-[10.5px] font-semibold uppercase tracking-[0.26em] text-berry">
                <span className="inline-block h-[6px] w-[6px] rounded-full bg-honey" />
                A estante de casa
              </p>

              <h1
                className="wonk enter-rise mt-4 font-display text-[clamp(2.55rem,5vw,4.6rem)] font-semibold leading-[0.98] tracking-[-0.035em] text-ink"
                style={{ animationDelay: "60ms" }}
              >
                Historinha
                <br />
                para <em className="italic text-berry">meus filhos</em>.
              </h1>

              <p
                className="enter-rise mt-4 max-w-[46ch] text-[14.5px] leading-relaxed text-ink-soft sm:mt-5 sm:text-[16.5px]"
                style={{ animationDelay: "120ms" }}
              >
                {books.length} livros infantis de domínio público para ler juntos — com música suave ao
                fundo, virada de página de verdade e o marcador guardando onde você parou.
              </p>

              <div className="enter-rise mt-6 flex flex-col gap-2.5 sm:mt-7 sm:flex-row sm:items-center" style={{ animationDelay: "180ms" }}>
                <button
                  type="button"
                  onClick={surprise}
                  className="group inline-flex h-12 items-center justify-center gap-2.5 rounded-full bg-berry px-6 text-[15px] font-semibold text-white shadow-[0_10px_24px_-10px_rgba(157,58,38,0.7)] transition-all duration-200 hover:-translate-y-0.5 hover:bg-berry-deep hover:shadow-[0_14px_30px_-10px_rgba(157,58,38,0.75)] active:translate-y-0 active:scale-[0.98]"
                >
                  <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" aria-hidden="true">
                    <path d="M12 3l1.7 4.6L18 9.3l-4.3 1.7L12 15.6l-1.7-4.6L6 9.3l4.3-1.7L12 3Z" strokeLinejoin="round" />
                    <path d="M18.5 15l.8 2.1 2.2.9-2.2.9-.8 2.1-.8-2.1-2.2-.9 2.2-.9.8-2.1Z" strokeLinejoin="round" />
                  </svg>
                  Sortear uma história
                </button>
                <a
                  href="#estante"
                  className="inline-flex h-12 items-center justify-center gap-2 rounded-full px-5 text-[15px] font-medium text-ink-soft transition-colors hover:bg-white/70 hover:text-ink"
                >
                  Ver a estante
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                    <path d="M12 5v14M6 13l6 6 6-6" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </a>
              </div>

              <p
                className="enter-fade mt-8 hidden flex-wrap items-center gap-x-3 gap-y-1.5 text-[12px] text-ink-faint sm:flex"
                style={{ animationDelay: "260ms" }}
              >
                <span>{books.length} histórias prontas</span>
                <span className="h-1 w-1 rounded-full bg-paper-line" />
                <span>Música de fundo</span>
                <span className="h-1 w-1 rounded-full bg-paper-line" />
                <span>Continua de onde parou</span>
              </p>
            </div>

            <div className="enter-fade relative" style={{ animationDelay: "120ms" }}>
              <HeroFan books={books} onOpen={onOpen} />
            </div>
          </div>
        </section>

        <section id="estante" className="mx-auto max-w-[1280px] scroll-mt-32 px-4 pb-20 sm:px-6 lg:px-8">
          <div className="mb-6 flex flex-wrap items-end justify-between gap-3 border-t border-paper-line pt-7 sm:mb-8 sm:pt-9">
            <div>
              <h2 className="wonk font-display text-[26px] font-semibold tracking-[-0.025em] text-ink sm:text-[32px]">
                Na estante
              </h2>
              <p className="mt-1 text-[13px] text-ink-soft sm:text-sm">
                {key
                  ? `${filtered.length} resultado${filtered.length === 1 ? "" : "s"} para “${query.trim()}”`
                  : `${books.length} histórias esperando por você`}
              </p>
            </div>
            <span className="inline-flex items-center gap-1.5 rounded-full border border-paper-line bg-white/60 px-3 py-1.5 text-[11px] font-medium uppercase tracking-[0.12em] text-ink-faint">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                <path d="M4 7h10M4 12h16M4 17h7" strokeLinecap="round" />
              </svg>
              A–Z
            </span>
          </div>

          {filtered.length === 0 ? (
            <div className="enter-fade flex flex-col items-center justify-center gap-4 rounded-3xl border border-dashed border-paper-line py-20 text-center">
              <span className="grid h-14 w-14 place-items-center rounded-full bg-paper-deep text-ink-faint">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" aria-hidden="true">
                  <circle cx="11" cy="11" r="7" />
                  <path d="m20 20-3.5-3.5" strokeLinecap="round" />
                </svg>
              </span>
              <div>
                <p className="wonk font-display text-xl font-semibold text-ink">Nenhuma história com esse nome</p>
                <p className="mt-1 text-sm text-ink-soft">Tente outro título ou autor.</p>
              </div>
              <button
                type="button"
                onClick={() => setQuery("")}
                className="rounded-full bg-white px-4 py-2 text-sm font-medium text-berry ring-1 ring-paper-line transition-colors hover:bg-paper-deep"
              >
                Ver todas as histórias
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-5 lg:grid-cols-4 xl:grid-cols-5">
              {filtered.map((book, index) => (
                <BookCard key={book.slug} book={book} onOpen={onOpen} index={index} />
              ))}
            </div>
          )}
        </section>
      </main>

      <footer className="border-t border-paper-line bg-paper-deep/60">
        <div className="mx-auto flex max-w-[1280px] flex-col gap-6 px-4 py-9 sm:px-6 lg:flex-row lg:items-start lg:justify-between lg:px-8">
          <div className="flex items-start gap-3">
            <Brand />
            <div className="hidden h-10 w-px bg-paper-line sm:block" />
            <p className="max-w-[280px] pt-1 text-[12.5px] leading-relaxed text-ink-soft">
              Feita com carinho por <span className="font-semibold text-ink">William John</span> para os
              filhos dele.
            </p>
          </div>

          <div className="max-w-[520px] text-[11.5px] leading-relaxed text-ink-faint">
            <p>
              Livros de domínio público da literatura infantil, servidos a partir do acervo do Baixe
              Livros.
            </p>
            <p className="mt-1.5">
              Música: “Dance of the Sugar Plum Fairy” — P. I. Tchaikovsky · gravação de Free Classical
              Music on YouTube ·{" "}
              <a
                href="https://commons.wikimedia.org/wiki/File:Tchaikovsky_-_Dance_of_the_Sugar_Plum_Fairy_-_The_Nutcracker.ogg"
                target="_blank"
                rel="noreferrer"
                className="font-medium text-berry underline decoration-berry/30 underline-offset-2 transition-colors hover:decoration-berry"
              >
                CC BY 3.0
              </a>
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
