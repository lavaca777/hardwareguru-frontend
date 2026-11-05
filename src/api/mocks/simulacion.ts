import { UMBRAL_USO_PCT } from '@/config'
import type {
  BuildSeleccion,
  Componente,
  Resolucion,
  SimulacionResultado,
  TipoComponente,
} from '@/types'
import { ApiError } from '../errors'
import { seedComponentes } from './data'
import { mockDelay } from './delay'

export async function simular(
  seleccion: BuildSeleccion,
  resolucion: Resolucion,
): Promise<SimulacionResultado> {
  await mockDelay()
  return calcularResultado(seleccion, resolucion)
}

export function calcularResultado(
  seleccion: BuildSeleccion,
  resolucion: Resolucion,
): SimulacionResultado {
  const cpu = buscarPieza(seleccion.cpuId, 'cpu', 'procesador')
  const placa = buscarPieza(seleccion.placaId, 'placa', 'placa madre')
  const ram = buscarPieza(seleccion.ramId, 'ram', 'memoria RAM')
  const gpu = buscarPieza(seleccion.gpuId, 'gpu', 'tarjeta gráfica')
  const fuente = buscarPieza(seleccion.fuenteId, 'fuente', 'fuente de poder')

  const consumoEstimadoW = Math.round(
    ((cpu.tdp ?? 0) + (gpu.tdp ?? 0)) * 1.2,
  )

  if (cpu.socket !== placa.socket) {
    return {
      consumoEstimadoW,
      cuelloBotellaPct: 0,
      resolucion,
      estado: 'INCOMPATIBLE',
      motivo: 'El socket del procesador no coincide con la placa.',
    }
  }

  if (placa.tipoRam !== ram.tipoRam) {
    return {
      consumoEstimadoW,
      cuelloBotellaPct: 0,
      resolucion,
      estado: 'INCOMPATIBLE',
      motivo: 'El tipo de memoria no es compatible con la placa.',
    }
  }

  const potenciaFuenteW = fuente.potenciaW ?? 0
  const usoFuentePct =
    potenciaFuenteW > 0 ? (consumoEstimadoW / potenciaFuenteW) * 100 : 0
  const estado = usoFuentePct > UMBRAL_USO_PCT ? 'RIESGO' : 'BALANCEADO'

  const cuelloBase = resolucion === '1080p' ? 18 : 9
  const ajusteGpu = (gpu.tdp ?? 0) > 200 ? -3 : 0
  const ajusteCpu = (cpu.tdp ?? 0) > 150 ? 3 : 0
  const cuelloBotellaPct = Math.max(0, cuelloBase + ajusteGpu + ajusteCpu)

  return {
    consumoEstimadoW,
    cuelloBotellaPct,
    resolucion,
    estado,
    motivo:
      estado === 'RIESGO'
        ? `La fuente de ${potenciaFuenteW} W quedaría al ${Math.round(
            usoFuentePct,
          )}% de su capacidad en picos de carga.`
        : null,
  }
}

function buscarPieza(
  id: string | null,
  tipo: TipoComponente,
  etiqueta: string,
): Componente {
  if (!id) {
    throw new ApiError(400, 'VALIDATION', `Falta seleccionar ${etiqueta}.`)
  }

  const componente = seedComponentes.find(
    (item) => item.id === id && item.tipo === tipo,
  )
  if (!componente) {
    throw new ApiError(404, 'NOT_FOUND', `No encontramos ${etiqueta}.`)
  }

  return componente
}
