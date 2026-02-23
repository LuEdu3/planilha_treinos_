/** Retorna nomes que tenham similaridade (contém o texto) — case insensitive */
export function filterBySimilarity(names: string[], query: string): string[] {
  const q = query.trim().toLowerCase()
  if (!q) return names
  return names.filter((n) => n.toLowerCase().includes(q))
}
