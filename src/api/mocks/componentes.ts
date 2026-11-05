import type { Componente, ComponenteDetalle, TipoComponente } from '@/types'
import { ApiError } from '../errors'
import { benchmarksPorId, seedComponentes } from './data'
import { mockDelay } from './delay'

export async function listarComponentes(
  tipo?: TipoComponente,
): Promise<Componente[]> {
  await mockDelay()

  const componentes = tipo
    ? seedComponentes.filter((componente) => componente.tipo === tipo)
    : seedComponentes

  return componentes.map((componente) => ({ ...componente }))
}

export async function obtenerComponente(
  id: string,
): Promise<ComponenteDetalle> {
  await mockDelay()

  const componente = seedComponentes.find((item) => item.id === id)
  if (!componente) {
    throw new ApiError(404, 'NOT_FOUND', 'No encontramos ese componente.')
  }

  return {
    ...componente,
    especificaciones: especificacionesDe(componente),
    ...(benchmarksPorId[id]
      ? { benchmarks: { ...benchmarksPorId[id] } }
      : {}),
  }
}

function especificacionesDe(
  componente: Componente,
): Record<string, string | number> {
  const especificaciones: Record<string, string | number> = {
    fabricante: componente.fabricante,
    tipo: componente.tipo,
    garantia: '3 años',
  }

  if (componente.tdp !== undefined) especificaciones.tdp = componente.tdp
  if (componente.socket) especificaciones.socket = componente.socket
  if (componente.tipoRam) especificaciones.tipoRam = componente.tipoRam
  if (componente.potenciaW !== undefined) {
    especificaciones.potenciaW = componente.potenciaW
  }

  return especificaciones
}
