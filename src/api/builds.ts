import type { Build, BuildSeleccion, Resolucion } from '@/types'
import { apiDelete, apiGet, apiPost } from './client'

export function guardarBuild(
  nombre: string,
  seleccion: BuildSeleccion,
  resolucion: Resolucion,
): Promise<Build> {
  return apiPost<Build>('/builds', { nombre, ...seleccion, resolucion })
}

export function listarBuilds(): Promise<Build[]> {
  return apiGet<Build[]>('/builds')
}

export function eliminarBuild(id: string): Promise<void> {
  return apiDelete(`/builds/${encodeURIComponent(id)}`)
}
