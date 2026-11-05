import type { Alerta } from '@/types'
import { apiGet, apiPatch } from './client'

export function listarAlertas(): Promise<Alerta[]> {
  return apiGet<Alerta[]>('/alerts')
}

export function marcarLeida(id: string): Promise<Alerta> {
  return apiPatch<Alerta>(`/alerts/${encodeURIComponent(id)}/read`)
}
