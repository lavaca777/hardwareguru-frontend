import type {
  Componente,
  ComponenteDetalle,
  TipoComponente,
} from '@/types'
import { apiGet } from './client'

type TipoRam = Componente['tipoRam']

type RawComponente = Omit<Componente, 'tipoRam' | 'potenciaW'> & {
  tipoRam?: TipoRam
  potenciaW?: number
  tipo_ram?: TipoRam
  potencia_w?: number
}

type RawComponenteDetalle = RawComponente & {
  especificaciones: ComponenteDetalle['especificaciones']
  benchmarks?: ComponenteDetalle['benchmarks']
}

function normalizarComponente(raw: RawComponente): Componente {
  const socket = raw.socket?.trim() || undefined
  const tipoRamRaw = raw.tipoRam ?? raw.tipo_ram
  const tipoRam =
    tipoRamRaw === 'DDR4' || tipoRamRaw === 'DDR5'
      ? tipoRamRaw
      : undefined
  const potenciaW = raw.potenciaW ?? raw.potencia_w

  return {
    id: raw.id,
    tipo: raw.tipo,
    nombre: raw.nombre,
    fabricante: raw.fabricante,
    ...(raw.tdp === undefined ? {} : { tdp: raw.tdp }),
    ...(socket === undefined ? {} : { socket }),
    ...(tipoRam === undefined ? {} : { tipoRam }),
    ...(potenciaW === undefined ? {} : { potenciaW }),
    origen: raw.origen,
  }
}

function normalizarDetalle(
  raw: RawComponenteDetalle,
): ComponenteDetalle {
  return {
    ...normalizarComponente(raw),
    especificaciones: raw.especificaciones,
    ...(raw.benchmarks === undefined
      ? {}
      : { benchmarks: raw.benchmarks }),
  }
}

export async function listarComponentes(
  tipo?: TipoComponente,
): Promise<Componente[]> {
  const data = await apiGet<RawComponente[]>(
    '/componentes',
    tipo ? { tipo } : undefined,
  )

  return (data ?? []).map(normalizarComponente)
}

export async function obtenerComponente(
  id: string,
): Promise<ComponenteDetalle> {
  const data = await apiGet<RawComponenteDetalle>(
    `/componentes/${encodeURIComponent(id)}`,
  )

  if (!data) return data as unknown as ComponenteDetalle

  return normalizarDetalle(data)
}
