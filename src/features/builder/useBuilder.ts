import { useCallback, useMemo } from 'react'
import type {
  Build,
  BuildSeleccion,
  Componente,
  Resolucion,
  TipoComponente,
} from '@/types'
import { useComponentes } from '@/features/components/componentesContext'
import { useBuilderContext } from './context'
import {
  EMPTY_SELECTION,
  FIELD_BY_TYPE,
  contarSeleccionados,
  limpiarIncompatibles,
  placasParaCpu,
  ramParaPlaca,
  seleccionCompleta,
} from './rules'

export interface BuilderCatalog {
  todos: Componente[]
  cargando: boolean
  error: string | null
  recargar: () => void
}

export interface UseBuilderResult {
  seleccion: BuildSeleccion
  resolucion: Resolucion
  setResolucion: (resolucion: Resolucion) => void
  opciones: Record<TipoComponente, Componente[]>
  seleccionar: (tipo: TipoComponente, id: string) => TipoComponente[]
  reiniciar: () => void
  completa: boolean
  seleccionados: number
  cargarDesdeBuild: (build: Build) => TipoComponente[]
  catalogo: BuilderCatalog
}

export function useBuilder(): UseBuilderResult {
  const {
    seleccion,
    setSeleccion,
    resolucion,
    setResolucion,
  } = useBuilderContext()
  const { todos, porTipo, cargando, error, recargar } = useComponentes()

  const opciones = useMemo<Record<TipoComponente, Componente[]>>(
    () => ({
      cpu: porTipo.cpu,
      placa: placasParaCpu(seleccion.cpuId, todos),
      ram: ramParaPlaca(seleccion.placaId, todos),
      gpu: porTipo.gpu,
      fuente: porTipo.fuente,
    }),
    [porTipo, seleccion.cpuId, seleccion.placaId, todos],
  )

  const seleccionar = useCallback(
    (tipo: TipoComponente, id: string): TipoComponente[] => {
      const field = FIELD_BY_TYPE[tipo]
      const next = { ...seleccion, [field]: id }
      const { seleccion: cleaned, reiniciadas } = limpiarIncompatibles(
        next,
        todos,
      )
      setSeleccion(cleaned)
      return reiniciadas
    },
    [seleccion, setSeleccion, todos],
  )

  const reiniciar = useCallback(() => {
    setSeleccion({ ...EMPTY_SELECTION })
  }, [setSeleccion])

  const cargarDesdeBuild = useCallback(
    (build: Build): TipoComponente[] => {
      const next: BuildSeleccion = {
        cpuId: build.piezas.cpu.id,
        placaId: build.piezas.placa.id,
        ramId: build.piezas.ram.id,
        gpuId: build.piezas.gpu.id,
        fuenteId: build.piezas.fuente.id,
      }
      const { seleccion: cleaned, reiniciadas } = limpiarIncompatibles(
        next,
        todos,
      )
      setSeleccion(cleaned)
      setResolucion(build.resolucion)
      return reiniciadas
    },
    [setSeleccion, setResolucion, todos],
  )

  const catalogo = useMemo<BuilderCatalog>(
    () => ({ todos, cargando, error, recargar }),
    [todos, cargando, error, recargar],
  )

  return {
    seleccion,
    resolucion,
    setResolucion,
    opciones,
    seleccionar,
    reiniciar,
    completa: seleccionCompleta(seleccion),
    seleccionados: contarSeleccionados(seleccion),
    cargarDesdeBuild,
    catalogo,
  }
}
