# Historinha — para meus filhos

**Site publicado:** https://historinha-omega.vercel.app (deploy automático via Vercel)  
Espelho no GitHub Pages: https://anjggti-eng.github.io/historinha/

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

Os PDFs somam ~2 GB e ficam fora deste repositório. Eles estão no repositório público [historinha-acervo](https://github.com/anjggti-eng/historinha-acervo), servidos por `raw.githubusercontent.com` (com CORS e Range).

O leitor tenta primeiro `public/livros/<slug>.pdf` (uso local). Se o arquivo não existir — por exemplo, no GitHub Pages — ele cai automaticamente para:

```
https://raw.githubusercontent.com/anjggti-eng/historinha-acervo/main/livros/<slug>.pdf
```

Para usar outro host, ajuste `RELEASE_BASE` em `src/components/reader/Reader.jsx`. Também existe uma release com os arquivos em [acervo-v1](https://github.com/anjggti-eng/historinha/releases/tag/acervo-v1) para download manual (assets do GitHub não enviam CORS, por isso não são usados pelo leitor).

## Publicação

O site é servido pelo GitHub Pages a partir do branch `gh-pages` (sem Actions). Para atualizar:

```bash
npm run build
rm -rf dist/livros
# copie o conteúdo de dist/ para um clone do branch gh-pages, commite e faça push
```

## Scripts de acervo

- `baixar_livros.py` — baixa os PDFs do acervo público.
- `baixar_capas.py` — baixa e normaliza as capas.
- `retry_falhas.py` — repete downloads bloqueados por cota (`COOLDOWN`, `DELAY`, `MAX_COOLDOWNS` por env).

Os livros são de domínio público ou distribuídos gratuitamente pelos sites de origem.
