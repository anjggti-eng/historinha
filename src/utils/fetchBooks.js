export async function fetchInfantilLiteratura() {
  try {
    const res = await fetch(`${import.meta.env.BASE_URL}livros.json`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    return data.filter((b) => b.downloaded && b.pdf_local);
  } catch (error) {
    console.warn("Falha ao carregar acervo local:", error.message);
    return [];
  }
}
