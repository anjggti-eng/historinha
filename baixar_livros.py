#!/usr/bin/env python3
"""Baixa todos os livros da categoria Literatura Infantil do baixelivros.com.br"""
import json, os, re, subprocess, sys, time, threading
from urllib.parse import unquote
from concurrent.futures import ThreadPoolExecutor, as_completed

UA = "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36"
BASE = "https://www.baixelivros.com.br"
OUT = os.path.join(os.path.dirname(os.path.abspath(__file__)), "public", "livros")
META = os.path.join(os.path.dirname(os.path.abspath(__file__)), "public", "livros.json")
os.makedirs(OUT, exist_ok=True)

lock = threading.Lock()

def curl(url, binary=False):
    args = ["curl", "-sL", "--compressed", "-H", f"User-Agent: {UA}",
            "-H", "Accept-Language: pt-BR,pt;q=0.9,en;q=0.8",
            "-H", "Referer: https://www.baixelivros.com.br/",
            "-H", "Accept: text/html,application/xhtml+xml,application/pdf,*/*;q=0.8",
            "--max-time", "120", url]
    r = subprocess.run(args, capture_output=True, timeout=180)
    if binary:
        return r.stdout
    return r.stdout.decode("utf-8", errors="ignore")

def sanitize(slug):
    return re.sub(r'[^a-z0-9\-]+', '-', slug.lower()).strip('-')

def process(book):
    slug = book["slug"]
    link = book["link"]
    title = book["title"]["rendered"]
    title = re.sub(r'<[^>]+>', '', title)
    try:
        html = curl(link)
        # URL assinada real (data-target com ?k=token)
        m = re.search(r'data-target="(https://archivepublicdomain\.com/[^"]+\.pdf\?k=[^"]+)"', html)
        if m:
            pdf_url = m.group(1).replace("&amp;", "&")
        else:
            # fallback: parametro pdf= (sem token, pode falhar)
            m2 = re.search(r'pdf=(https?%3A[^&"\']+\.pdf)', html)
            pdf_url = unquote(m2.group(1)) if m2 else None
        # capa
        og = re.search(r'property="og:image"\s+content="([^"]+)"', html)
        cover = og.group(1) if og else None
        fname = sanitize(slug) + ".pdf"
        result = {"title": title, "slug": slug, "link": link,
                  "pdf": pdf_url, "pdf_local": f"/livros/{fname}",
                  "cover": cover, "downloaded": False}
        if pdf_url:
            blob = curl(pdf_url, binary=True)
            if blob[:4] == b"%PDF":
                with open(os.path.join(OUT, fname), "wb") as f:
                    f.write(blob)
                result["downloaded"] = True
        return result
    except Exception as e:
        return {"title": title, "slug": slug, "link": link,
                "pdf": None, "pdf_local": None, "cover": None,
                "downloaded": False, "error": str(e)}

def main():
    books = json.load(open("/tmp/livros_raw.json", encoding="utf-8"))
    print(f"Total de livros: {len(books)}")
    results = []
    with ThreadPoolExecutor(max_workers=6) as ex:
        futs = {ex.submit(process, b): b for b in books}
        done = 0
        for fut in as_completed(futs):
            r = fut.result()
            results.append(r)
            done += 1
            with lock:
                if done % 10 == 0 or done == len(books):
                    ok = sum(1 for x in results if x.get("downloaded"))
                    print(f"[{done}/{len(books)}] baixados: {ok}")
    results.sort(key=lambda x: x["title"].lower())
    json.dump(results, open(META, "w", encoding="utf-8"), ensure_ascii=False, indent=1)
    ok = sum(1 for x in results if x.get("downloaded"))
    print(f"\nCONCLUIDO: {ok}/{len(results)} PDFs salvos em {OUT}")
    print(f"Metadados: {META}")

if __name__ == "__main__":
    main()
