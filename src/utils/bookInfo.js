export function splitTitle(raw = "") {
  const match = raw.match(/^(.*?)\s+[–—-]\s+(.{2,72})$/);
  if (!match) return { title: raw.trim(), author: "" };
  const title = match[1].trim();
  const author = match[2].trim();
  if (!title || /^\d/.test(author) && author.length < 6) return { title: raw.trim(), author: "" };
  return { title, author };
}

export function bookTitle(book) {
  return splitTitle(book?.title || "");
}
