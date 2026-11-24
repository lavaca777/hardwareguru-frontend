import type {
  Build,
  BuildSeleccion,
  Resolucion,
  SimulacionResultado,
} from '@/types'
import { apiDelete, apiGet, apiPost } from './client'

export function guardarBuild(
  nombre: string,
  seleccion: BuildSeleccion,
  resolucion: Resolucion,
  resultado?: SimulacionResultado,
): Promise<Build> {
  return apiPost<Build>('/builds', {
    nombre,
    ...seleccion,
    resolucion,
    ...(resultado
      ? {
          estadoRiesgo: resultado.estado,
          consumoTotalWatts: resultado.consumoEstimadoW,
          cuelloBotellaPorcentaje: resultado.cuelloBotellaPct,
        }
      : {}),
  })
}

export function listarBuilds(): Promise<Build[]> {
  return apiGet<Build[]>('/builds')
}

export function eliminarBuild(id: string): Promise<void> {
  return apiDelete(`/builds/${encodeURIComponent(id)}`)
}
