import type { ComponenteDetalle } from '@/types'

const cache = new Map<string, ComponenteDetalle>()

export function getCachedComponentDetail(
  id: string,
): ComponenteDetalle | undefined {
  return cache.get(id)
}

export function cacheComponentDetail(
  id: string,
  detail: ComponenteDetalle,
): void {
  cache.set(id, detail)
}

export function clearComponentDetailCache(): void {
  cache.clear()
}
