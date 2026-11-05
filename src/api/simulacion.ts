import type {
  BuildSeleccion,
  Resolucion,
  SimulacionResultado,
} from '@/types'
import { apiPost } from './client'

export function simular(
  seleccion: BuildSeleccion,
  resolucion: Resolucion,
): Promise<SimulacionResultado> {
  return apiPost<SimulacionResultado>('/simular', {
    ...seleccion,
    resolucion,
  })
}
