import type { BuildSeleccion, Componente, TipoComponente } from '@/types'

export const EMPTY_SELECTION: BuildSeleccion = {
  cpuId: null,
  placaId: null,
  ramId: null,
  gpuId: null,
  fuenteId: null,
}

export const FIELD_BY_TYPE: Record<TipoComponente, keyof BuildSeleccion> = {
  cpu: 'cpuId',
  placa: 'placaId',
  ram: 'ramId',
  gpu: 'gpuId',
  fuente: 'fuenteId',
}

export function placasParaCpu(
  cpuId: string | null,
  componentes: Componente[],
): Componente[] {
  if (!cpuId) return []

  const cpu = componentes.find(
    (componente) => componente.id === cpuId && componente.tipo === 'cpu',
  )
  if (!cpu?.socket) return []

  return componentes.filter(
    (componente) =>
      componente.tipo === 'placa' && componente.socket === cpu.socket,
  )
}

export function ramParaPlaca(
  placaId: string | null,
  componentes: Componente[],
): Componente[] {
  if (!placaId) return []

  const placa = componentes.find(
    (componente) =>
      componente.id === placaId && componente.tipo === 'placa',
  )
  if (!placa?.tipoRam) return []

  return componentes.filter(
    (componente) =>
      componente.tipo === 'ram' && componente.tipoRam === placa.tipoRam,
  )
}

export interface LimpiezaSeleccion {
  seleccion: BuildSeleccion
  reiniciadas: TipoComponente[]
}

export function limpiarIncompatibles(
  seleccion: BuildSeleccion,
  componentes: Componente[],
): LimpiezaSeleccion {
  const next: BuildSeleccion = { ...seleccion }
  const reiniciadas = new Set<TipoComponente>()

  const clear = (
    field: keyof BuildSeleccion,
    tipo: TipoComponente,
  ) => {
    if (next[field] !== null) {
      next[field] = null
      reiniciadas.add(tipo)
    }
  }

  const buscar = (id: string | null, tipo: TipoComponente) => {
    if (!id) return undefined
    return componentes.find(
      (componente) => componente.id === id && componente.tipo === tipo,
    )
  }

  const cpu = buscar(next.cpuId, 'cpu')
  const placa = buscar(next.placaId, 'placa')
  const ram = buscar(next.ramId, 'ram')
  const gpu = buscar(next.gpuId, 'gpu')
  const fuente = buscar(next.fuenteId, 'fuente')

  if (next.cpuId && !cpu) clear('cpuId', 'cpu')
  if (next.placaId && !placa) clear('placaId', 'placa')
  if (next.ramId && !ram) clear('ramId', 'ram')
  if (next.gpuId && !gpu) clear('gpuId', 'gpu')
  if (next.fuenteId && !fuente) clear('fuenteId', 'fuente')

  if (!next.cpuId) {
    clear('placaId', 'placa')
    clear('ramId', 'ram')
  }

  if (!next.placaId) clear('ramId', 'ram')

  if (cpu && placa && cpu.socket !== placa.socket) {
    clear('placaId', 'placa')
    clear('ramId', 'ram')
  }

  if (placa && ram && placa.tipoRam !== ram.tipoRam) {
    clear('ramId', 'ram')
  }

  return {
    seleccion: next,
    reiniciadas: Array.from(reiniciadas),
  }
}

export function seleccionCompleta(seleccion: BuildSeleccion): boolean {
  return Object.values(seleccion).every(Boolean)
}

export function contarSeleccionados(seleccion: BuildSeleccion): number {
  return Object.values(seleccion).filter(Boolean).length
}
