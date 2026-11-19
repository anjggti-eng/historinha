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

Os PDFs somam ~2,2 GB e ficam fora do git. Para publicar o app com os livros, escolha um destes caminhos:

1. **GitHub Releases** — compacte `public/livros` em partes de até 2 GB e anexe a uma release; o app pode apontar para as URLs dos assets.
2. **Hugging Face Dataset** — upload gratuito com LFS e URL direta por arquivo; o catálogo pode usar uma base URL externa.
3. **Cloudflare R2** — 10 GB gratuitos, sem cobrança de egress; bom para servir os PDFs via CDN.
4. **Somente local** — mantenha os PDFs na máquina e rode o app localmente.

## Scripts de acervo

- `baixar_livros.py` — baixa os PDFs do acervo público.
- `baixar_capas.py` — baixa e normaliza as capas.
- `retry_falhas.py` — repete downloads bloqueados por cota (`COOLDOWN`, `DELAY`, `MAX_COOLDOWNS` por env).

Os livros são de domínio público ou distribuídos gratuitamente pelos sites de origem.
