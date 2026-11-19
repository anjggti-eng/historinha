const pageKey = (slug) => `historinha:page:${slug}`;

export function getSavedPage(slug) {
  try {
    const value = parseInt(localStorage.getItem(pageKey(slug)), 10);
    return Number.isFinite(value) && value > 0 ? value : 1;
  } catch {
    return 1;
  }
}

export function savePage(slug, page) {
  try {
    localStorage.setItem(pageKey(slug), String(page));
  } catch {
    /* modo privado */
  }
}
