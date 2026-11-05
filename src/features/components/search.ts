export function normalizeText(value: string): string {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim()
}

export function matchesSearch(value: string, query: string): boolean {
  const normalizedQuery = normalizeText(query)
  if (!normalizedQuery) return true

  return normalizeText(value).includes(normalizedQuery)
}
