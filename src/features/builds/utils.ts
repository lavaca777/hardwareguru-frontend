import { matchesSearch } from '@/features/components/search'
import type { Build, EstadoSimulacion } from '@/types'

export type BuildFilterState = 'all' | EstadoSimulacion
export type BuildSort = 'recientes' | 'consumo' | 'cuello'

export interface BuildQuery {
  search: string
  estado: BuildFilterState
  orden: BuildSort
}

const DATE_FORMATTER = new Intl.DateTimeFormat('es', {
  day: 'numeric',
  month: 'short',
  year: 'numeric',
})

export function formatBuildDate(value: string): string {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return '—'

  return DATE_FORMATTER.format(date)
}

export function buildUsagePct(build: Build): number | null {
  const potenciaW = build.piezas.fuente.potenciaW ?? 0
  if (potenciaW <= 0) return null

  return Math.round(
    (build.resultado.consumoEstimadoW / potenciaW) * 100,
  )
}

export function filterAndSortBuilds(
  builds: Build[],
  query: BuildQuery,
): Build[] {
  const filtered = builds
    .filter((build) => matchesSearch(build.nombre, query.search))
    .filter(
      (build) =>
        query.estado === 'all' ||
        build.resultado.estado === query.estado,
    )

  return [...filtered].sort((a, b) => {
    if (query.orden === 'consumo') {
      return b.resultado.consumoEstimadoW - a.resultado.consumoEstimadoW
    }

    if (query.orden === 'cuello') {
      return a.resultado.cuelloBotellaPct - b.resultado.cuelloBotellaPct
    }

    return timestamp(b.creadaEn) - timestamp(a.creadaEn)
  })
}

function timestamp(value: string | undefined): number {
  if (!value) return 0
  const time = Date.parse(value)
  return Number.isNaN(time) ? 0 : time
}
