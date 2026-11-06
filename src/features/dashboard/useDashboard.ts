import { useMemo } from 'react'
import { useBuilds } from '@/features/builds/buildsContext'
import type { Build } from '@/types'
import {
  calcularEstadisticas,
  ordenarBuildsRecientes,
  type Estadisticas,
} from './stats'

export interface DashboardData {
  stats: Estadisticas
  recientes: Build[]
  consumoRecientes: Build[]
  cargando: boolean
  error: string | null
  recargar: () => void
}

export function useDashboard(): DashboardData {
  const { builds, cargando, error, recargar } = useBuilds()

  const ordenadas = useMemo(
    () => ordenarBuildsRecientes(builds),
    [builds],
  )
  const stats = useMemo(() => calcularEstadisticas(builds), [builds])
  const recientes = useMemo(() => ordenadas.slice(0, 4), [ordenadas])
  const consumoRecientes = useMemo(
    () => ordenadas.slice(0, 6),
    [ordenadas],
  )

  return {
    stats,
    recientes,
    consumoRecientes,
    cargando,
    error,
    recargar,
  }
}
