import type { Componente, ComponenteDetalle, TipoComponente } from '@/types'
import { apiGet } from './client'

export function listarComponentes(
  tipo?: TipoComponente,
): Promise<Componente[]> {
  return apiGet<Componente[]>('/componentes', tipo ? { tipo } : undefined)
}

export function obtenerComponente(id: string): Promise<ComponenteDetalle> {
  return apiGet<ComponenteDetalle>(`/componentes/${encodeURIComponent(id)}`)
}
