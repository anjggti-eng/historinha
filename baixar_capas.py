#!/usr/bin/env python3
"""Baixa as capas dos livros para public/covers e atualiza livros.json."""
import json, os, subprocess, time, threading
from concurrent.futures import ThreadPoolExecutor, as_completed

HERE = os.path.dirname(os.path.abspath(__file__))
META = os.path.join(HERE, "public", "livros.json")
OUT = os.path.join(HERE, "public", "covers")
os.makedirs(OUT, exist_ok=True)

UA = "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36"

def download(book):
    cover = book.get("cover")
    if not cover:
        return book
    ext = os.path.splitext(cover.split("?")[0])[1] or ".webp"
    fname = book["slug"] + ext
    path = os.path.join(OUT, fname)
    if os.path.exists(path) and os.path.getsize(path) > 500:
        book["cover_local"] = f"/covers/{fname}"
        return book
    r = subprocess.run(["curl", "-sL", "--compressed", "-H", f"User-Agent: {UA}",
                        "-H", "Referer: https://www.baixelivros.com.br/",
                        "--max-time", "40", "-o", path, cover], capture_output=True)
    if os.path.exists(path) and os.path.getsize(path) > 500:
        book["cover_local"] = f"/covers/{fname}"
    else:
        if os.path.exists(path):
            os.remove(path)
    return book

def main():
    data = json.load(open(META, encoding="utf-8"))
    with ThreadPoolExecutor(max_workers=6) as ex:
        futs = [ex.submit(download, b) for b in data]
        for i, f in enumerate(as_completed(futs), 1):
            f.result()
            if i % 50 == 0:
                print(f"{i}/{len(data)}")
    json.dump(data, open(META, "w", encoding="utf-8"), ensure_ascii=False, indent=1)
    n = sum(1 for b in data if b.get("cover_local"))
    print(f"Capas locais: {n}/{len(data)}")

if __name__ == "__main__":
    main()
