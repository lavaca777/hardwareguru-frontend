import { useCallback, useMemo, useState } from 'react'
import { api } from '@/api'
import { useBuilderContext } from '@/features/builder/context'
import { seleccionCompleta } from '@/features/builder/rules'
import { useComponentes } from '@/features/components/componentesContext'
import type {
  BuildSeleccion,
  Resolucion,
  SimulacionResultado,
} from '@/types'
import { simulationErrorMessage } from './errors'

export interface UseSimulationResult {
  resultado: SimulacionResultado | null
  desactualizado: boolean
  simulando: boolean
  error: string | null
  simular: () => Promise<void>
  usoFuentePct: number | null
}

function crearHuella(
  seleccion: BuildSeleccion,
  resolucion: Resolucion,
): string {
  return [
    seleccion.cpuId,
    seleccion.placaId,
    seleccion.ramId,
    seleccion.gpuId,
    seleccion.fuenteId,
    resolucion,
  ]
    .map((value) => value ?? '-')
    .join('|')
}

export function useSimulation(): UseSimulationResult {
  const { seleccion, resolucion } = useBuilderContext()
  const { todos } = useComponentes()
  const [resultado, setResultado] = useState<SimulacionResultado | null>(null)
  const [huellaSimulada, setHuellaSimulada] = useState<string | null>(null)
  const [usoFuentePct, setUsoFuentePct] = useState<number | null>(null)
  const [simulando, setSimulando] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const huellaActual = useMemo(
    () => crearHuella(seleccion, resolucion),
    [seleccion, resolucion],
  )
  const desactualizado =
    resultado !== null && huellaSimulada !== huellaActual

  const simular = useCallback(async () => {
    if (simulando || !seleccionCompleta(seleccion)) return

    setSimulando(true)
    setError(null)
    setResultado(null)
    setHuellaSimulada(null)
    setUsoFuentePct(null)

    try {
      const data = await api.simular(seleccion, resolucion)
      const fuente = todos.find(
        (componente) =>
          componente.id === seleccion.fuenteId &&
          componente.tipo === 'fuente',
      )
      const potencia = fuente?.potenciaW ?? 0

      setResultado(data)
      setHuellaSimulada(huellaActual)
      setUsoFuentePct(
        potencia > 0
          ? Math.round((data.consumoEstimadoW / potencia) * 100)
          : null,
      )
    } catch (simulationError) {
      setError(simulationErrorMessage(simulationError))
    } finally {
      setSimulando(false)
    }
  }, [
    huellaActual,
    resolucion,
    seleccion,
    simulando,
    todos,
  ])

  return {
    resultado,
    desactualizado,
    simulando,
    error,
    simular,
    usoFuentePct,
  }
}
