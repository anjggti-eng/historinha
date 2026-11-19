export function BookMark({ className = "" }) {
  return (
    <svg
      viewBox="0 0 32 32"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <path d="M6.5 9.2c3.1-1.35 6.1-1.15 9.5 1.05 3.4-2.2 6.4-2.4 9.5-1.05v13.6c-3.1-1.35-6.1-1.15-9.5 1.05-3.4-2.2-6.4-2.4-9.5-1.05V9.2Z" />
      <path d="M16 10.15v13.7" />
      <path d="M16 3.4l.78 2.07 2.07.78-2.07.78-.78 2.07-.78-2.07-2.07-.78 2.07-.78.78-2.07Z" fill="currentColor" stroke="none" />
    </svg>
  );
}

export function Brand({ onClick = null, compact = false }) {
  const content = (
    <>
      <span className="relative grid h-10 w-10 shrink-0 place-items-center rounded-full border border-berry/25 bg-white text-berry shadow-[0_2px_8px_-2px_rgba(120,70,30,0.25)] transition-transform duration-300 group-hover:-rotate-3 sm:h-11 sm:w-11">
        <BookMark className="h-[22px] w-[22px] sm:h-6 sm:w-6" />
      </span>
      <span className="min-w-0 leading-none">
        <span className="wonk block font-display text-[19px] font-semibold tracking-[-0.02em] text-ink sm:text-[21px]">
          Historinha
        </span>
        {!compact && (
          <span className="mt-1 block text-[9px] font-medium uppercase tracking-[0.24em] text-ink-faint">
            para meus filhos
          </span>
        )}
      </span>
    </>
  );

  if (!onClick) {
    return <span className="flex items-center gap-2.5 sm:gap-3">{content}</span>;
  }

  return (
    <button
      type="button"
      onClick={onClick}
      className="group flex items-center gap-2.5 rounded-full text-left sm:gap-3"
      aria-label="Historinha para meus filhos — início"
    >
      {content}
    </button>
  );
}
