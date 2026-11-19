# Historinha — para meus filhos

Estante de livros infantis de domínio público, feita para ler junto. Leitor em PDF com virada de página, música suave ao fundo e marcador que guarda onde você parou.

**Feito com carinho por William John.**

## Rodando

```bash
npm install
npm run dev
```

Build de produção: `npm run build` (saída em `dist/`).

## Como funciona

- `public/livros.json` — catálogo com título, autor, slug, capa e status de download.
- `public/covers/` — capas locais usadas na estante e no leque da home.
- `public/livros/` — PDFs locais. **Não versionados** (2,2 GB); veja abaixo.
- `public/audio/conto-tchaikovsky.mp3` — música de fundo (Tchaikovsky, domínio público).
- `src/components/Library.jsx` — home, busca sem acentos, leque de capas e cards.
- `src/components/reader/Reader.jsx` — leitor, zoom, navegação, progresso e áudio.
- `src/utils/progress.js` — página salva em `localStorage`.

## Acervo de PDFs

Os PDFs somam ~2 GB e ficam fora do git. Eles são publicados como assets da release [`acervo-v1`](https://github.com/anjggti-eng/historinha/releases/tag/acervo-v1).

O leitor tenta primeiro `public/livros/<slug>.pdf` (uso local). Se o arquivo não existir — por exemplo, no GitHub Pages — ele cai automaticamente para a URL da release. Para usar outro host, defina `pdf_remote` em cada livro do `livros.json` ou ajuste `RELEASE_BASE` em `src/components/reader/Reader.jsx`.

Alternativas de hospedagem: Hugging Face Dataset, Cloudflare R2 ou manter tudo local.

## Scripts de acervo

- `baixar_livros.py` — baixa os PDFs do acervo público.
- `baixar_capas.py` — baixa e normaliza as capas.
- `retry_falhas.py` — repete downloads bloqueados por cota (`COOLDOWN`, `DELAY`, `MAX_COOLDOWNS` por env).

Os livros são de domínio público ou distribuídos gratuitamente pelos sites de origem.
