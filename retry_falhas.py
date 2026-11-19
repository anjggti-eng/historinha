#!/usr/bin/env python3
"""Re-tenta baixar os livros que falharam, respeitando a cota do servidor.

Uso: python3 retry_falhas.py
- 1 worker, pausa entre livros
- se detectar "Limite de downloads", espera COOLDOWN e continua
- pode ser rodado varias vezes; so baixa o que falta
"""
import json, os, re, time, importlib.util
from urllib.parse import unquote

HERE = os.path.dirname(os.path.abspath(__file__))
spec = importlib.util.spec_from_file_location("bl", os.path.join(HERE, "baixar_livros.py"))
bl = importlib.util.module_from_spec(spec)
spec.loader.exec_module(bl)

META = os.path.join(HERE, "public", "livros.json")
OUT = os.path.join(HERE, "public", "livros")
books_raw = {b["slug"]: b for b in json.load(open("/tmp/livros_raw.json", encoding="utf-8"))}

DELAY = int(os.environ.get("DELAY", "8"))            # segundos entre livros
COOLDOWN = int(os.environ.get("COOLDOWN", "180"))    # segundos de espera ao bater na cota
MAX_COOLDOWNS = int(os.environ.get("MAX_COOLDOWNS", "5"))  # desiste apos N cooldowns seguidos

def baixar(book):
    slug = book["slug"]
    raw = books_raw.get(slug)
    if not raw:
        return False, "sem-raw"
    html = bl.curl(raw["link"])
    m = re.search(r'data-target="(https?://[^"]+\.pdf[^"]*)"', html)
    if m:
        url = m.group(1).replace("&amp;", "&")
    else:
        m2 = re.search(r'pdf=(https?%3A[^&"\']+\.pdf)', html)
        url = unquote(m2.group(1)) if m2 else None
    if not url:
        return False, "sem-url"
    blob = bl.curl(url, binary=True)
    if blob[:4] == b"%PDF":
        fname = re.sub(r'[^a-z0-9\-]+', '-', slug.lower()).strip('-') + ".pdf"
        with open(os.path.join(OUT, fname), "wb") as f:
            f.write(blob)
        book.update({"pdf": url, "pdf_local": f"/livros/{fname}", "cover": book.get("cover"), "downloaded": True})
        return True, "ok"
    if b"Limite" in blob[:200]:
        return False, "limite"
    return False, "nao-pdf"

def main():
    data = json.load(open(META, encoding="utf-8"))
    failed = [x for x in data if not x.get("downloaded")]
    print(f"Faltam {len(failed)} livros.")
    cooldowns = 0
    for i, book in enumerate(failed, 1):
        ok, status = baixar(book)
        print(f"[{i}/{len(failed)}] {book['title'][:38]:38} -> {status}")
        if status == "limite":
            cooldowns += 1
            if cooldowns > MAX_COOLDOWNS:
                print("Cota persistente. Tente novamente mais tarde.")
                break
            print(f"  cota atingida, aguardando {COOLDOWN}s...")
            # salva progresso antes de esperar
            data.sort(key=lambda x: x["title"].lower())
            json.dump(data, open(META, "w", encoding="utf-8"), ensure_ascii=False, indent=1)
            time.sleep(COOLDOWN)
        else:
            cooldowns = 0
            time.sleep(DELAY)
    data.sort(key=lambda x: x["title"].lower())
    json.dump(data, open(META, "w", encoding="utf-8"), ensure_ascii=False, indent=1)
    ok = sum(1 for x in data if x.get("downloaded"))
    print(f"Total baixados agora: {ok}/{len(data)}")

if __name__ == "__main__":
    main()
