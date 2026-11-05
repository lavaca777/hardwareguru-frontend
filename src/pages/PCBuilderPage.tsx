import { useEffect, useRef, useState } from 'react'
import { useSearchParams } from 'react-router'
import { api } from '@/api'
import { PageHeader } from '@/components/PageHeader'
import {
  Button,
  ComponentSelect,
  EmptyState,
  ErrorState,
  LoadingState,
  ProblemNotice,
  Tabs,
  useToast,
} from '@/components/ui'
import { TYPE_LABELS } from '@/features/components/labels'
import { FIELD_BY_TYPE } from '@/features/builder/rules'
import { useBuilder } from '@/features/builder/useBuilder'
import { notifyBuildsChanged } from '@/features/builds/events'
import { SaveBuildModal } from '@/features/simulation/SaveBuildModal'
import { ResultadosSimulacion } from '@/features/simulation/ResultadosSimulacion'
import { getProblemMessage } from '@/features/simulation/mensajes'
import { useSimulation } from '@/features/simulation/useSimulation'
import type { Componente, Resolucion, TipoComponente } from '@/types'

const TYPE_ORDER: TipoComponente[] = [
  'cpu',
  'placa',
  'ram',
  'gpu',
  'fuente',
]

const SELECTOR_LABELS: Record<TipoComponente, string> = {
  cpu: 'Procesador',
  placa: 'Placa madre',
  ram: 'Memoria RAM',
  gpu: 'Tarjeta gráfica',
  fuente: 'Fuente',
}

const RESOLUTION_ITEMS = [
  { id: '1080p', label: '1080p' },
  { id: '1440p', label: '1440p' },
]

function metaFor(
  tipo: TipoComponente,
  componente: Componente,
): string | undefined {
  const parts: string[] = []

  if (tipo === 'cpu') {
    if (componente.socket) parts.push(componente.socket)
    if (componente.tdp !== undefined) parts.push(`${componente.tdp} W`)
  } else if (tipo === 'placa') {
    if (componente.socket) parts.push(componente.socket)
    if (componente.tipoRam) parts.push(componente.tipoRam)
  } else if (tipo === 'ram') {
    if (componente.tipoRam) parts.push(componente.tipoRam)
  } else if (tipo === 'gpu') {
    if (componente.tdp !== undefined) parts.push(`${componente.tdp} W`)
  } else if (tipo === 'fuente') {
    if (componente.potenciaW !== undefined) {
      parts.push(`${componente.potenciaW} W`)
    }
  }

  return parts.length > 0 ? parts.join(', ') : undefined
}

export function PCBuilderPage() {
  const {
    seleccion,
    resolucion,
    setResolucion,
    opciones,
    seleccionar,
    reiniciar,
    completa,
    seleccionados,
    cargarDesdeBuild,
    catalogo,
  } = useBuilder()
  const { mostrar } = useToast()
  const simulation = useSimulation()
  const [saveOpen, setSaveOpen] = useState(false)
  const [searchParams, setSearchParams] = useSearchParams()
  const fromId = searchParams.get('from')
  const loadedFromRef = useRef<string | null>(null)

  useEffect(() => {
    if (!fromId || loadedFromRef.current === fromId) return
    if (catalogo.cargando || catalogo.error || catalogo.todos.length === 0) {
      return
    }

    loadedFromRef.current = fromId
    let cancelled = false

    void api
      .listarBuilds()
      .then((builds) => {
        if (cancelled) return

        const build = builds.find((item) => item.id === fromId)
        if (!build) {
          reiniciar()
          mostrar({ tipo: 'warn', texto: 'Esa build ya no existe.' })
          setSearchParams({}, { replace: true })
          return
        }

        const reiniciadas = cargarDesdeBuild(build)
        if (reiniciadas.length > 0) {
          mostrar({
            tipo: 'warn',
            texto: `No encontramos ${reiniciadas
              .map((tipo) => TYPE_LABELS[tipo])
              .join(', ')} en el catálogo.`,
          })
        } else {
          mostrar({
            tipo: 'ok',
            texto: `Build "${build.nombre}" cargada.`,
          })
        }
      })
      .catch(() => {
        if (!cancelled) {
          mostrar({
            tipo: 'error',
            texto: 'No pudimos cargar la build.',
          })
        }
      })

    return () => {
      cancelled = true
    }
  }, [
    fromId,
    catalogo.cargando,
    catalogo.error,
    catalogo.todos.length,
    cargarDesdeBuild,
    mostrar,
    reiniciar,
    setSearchParams,
  ])

  const optionsFor = (tipo: TipoComponente) =>
    opciones[tipo].map((componente) => ({
      id: componente.id,
      label: componente.nombre,
      meta: metaFor(tipo, componente),
    }))

  const handleSelect = (tipo: TipoComponente, id: string) => {
    const reiniciadas = seleccionar(tipo, id)
    if (reiniciadas.length > 0) {
      mostrar({
        tipo: 'warn',
        texto: `Reiniciamos ${reiniciadas
          .map((item) => TYPE_LABELS[item])
          .join(', ')} porque la nueva selección no es compatible.`,
      })
    }
  }

  const handleReiniciar = () => {
    reiniciar()
    mostrar({ tipo: 'ok', texto: 'Selección reiniciada.' })
  }

  const resumen = TYPE_ORDER.map((tipo) => {
    const id = seleccion[FIELD_BY_TYPE[tipo]]
    const componente = catalogo.todos.find((item) => item.id === id)

    return {
      tipo,
      nombre: componente?.nombre ?? null,
    }
  })

  const problem = simulation.resultado
    ? getProblemMessage(simulation.resultado)
    : null
  const canSave =
    simulation.resultado !== null &&
    !simulation.desactualizado &&
    !simulation.simulando &&
    simulation.resultado.estado !== 'INCOMPATIBLE'

  let saveDisabledReason: string | undefined
  if (!completa) {
    saveDisabledReason = 'Elige las 5 piezas para simular.'
  } else if (simulation.simulando) {
    saveDisabledReason = 'Espera a que termine la simulación.'
  } else if (!simulation.resultado) {
    saveDisabledReason = 'Simula la build antes de guardar.'
  } else if (simulation.desactualizado) {
    saveDisabledReason =
      'Vuelve a simular porque la selección cambió.'
  } else if (simulation.resultado.estado === 'INCOMPATIBLE') {
    saveDisabledReason =
      'No puedes guardar una build incompatible.'
  }

  return (
    <section>
      <PageHeader
        title="Armar PC"
        description="Elige las cinco piezas. Solo verás opciones compatibles con lo que ya seleccionaste."
        actions={
          <Button variant="secondary" onClick={handleReiniciar}>
            Reiniciar
          </Button>
        }
      />

      {catalogo.cargando && (
        <LoadingState label="Cargando catálogo…" rows={5} />
      )}

      {catalogo.error && (
        <ErrorState
          mensaje={catalogo.error}
          onReintentar={catalogo.recargar}
        />
      )}

      {!catalogo.cargando &&
        !catalogo.error &&
        catalogo.todos.length === 0 && (
          <EmptyState
            titulo="El catálogo aún no tiene piezas"
            descripcion="El armador necesita componentes para funcionar."
          />
        )}

      {!catalogo.cargando &&
        !catalogo.error &&
        catalogo.todos.length > 0 && (
          <div className="grid gap-5 lg:grid-cols-[1.15fr_.85fr]">
            <div className="rounded-xl border border-line bg-panel p-5">
              <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
                <h2 className="text-sm font-semibold text-ink">Piezas</h2>
                <div className="flex items-center gap-3">
                  <span className="font-mono text-xs text-muted">
                    {seleccionados} de 5 piezas
                  </span>
                  <div className="h-1.5 w-32 overflow-hidden rounded-full bg-panel-2">
                    <div
                      className="h-full rounded-full bg-copper transition-[width]"
                      style={{ width: `${seleccionados * 20}%` }}
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <ComponentSelect
                  label={SELECTOR_LABELS.cpu}
                  options={optionsFor('cpu')}
                  value={seleccion.cpuId}
                  onChange={(id) => handleSelect('cpu', id)}
                  emptyMessage="No hay procesadores disponibles."
                />

                <ComponentSelect
                  label={SELECTOR_LABELS.placa}
                  options={optionsFor('placa')}
                  value={seleccion.placaId}
                  onChange={(id) => handleSelect('placa', id)}
                  disabled={!seleccion.cpuId}
                  disabledMessage="Elige primero un procesador"
                  emptyMessage="No hay placas compatibles con este procesador en el catálogo."
                />

                <ComponentSelect
                  label={SELECTOR_LABELS.ram}
                  options={optionsFor('ram')}
                  value={seleccion.ramId}
                  onChange={(id) => handleSelect('ram', id)}
                  disabled={!seleccion.placaId}
                  disabledMessage="Elige primero una placa"
                  emptyMessage="No hay memorias compatibles con esta placa en el catálogo."
                />

                <ComponentSelect
                  label={SELECTOR_LABELS.gpu}
                  options={optionsFor('gpu')}
                  value={seleccion.gpuId}
                  onChange={(id) => handleSelect('gpu', id)}
                  emptyMessage="No hay tarjetas gráficas disponibles."
                />

                <ComponentSelect
                  label={SELECTOR_LABELS.fuente}
                  options={optionsFor('fuente')}
                  value={seleccion.fuenteId}
                  onChange={(id) => handleSelect('fuente', id)}
                  emptyMessage="No hay fuentes disponibles."
                />
              </div>
            </div>

            <div className="space-y-5">
              <div className="rounded-xl border border-line bg-panel p-5">
                <h2 className="text-sm font-semibold text-ink">
                  Resumen de la build
                </h2>

                <div className="mt-4">
                  <Tabs
                    items={RESOLUTION_ITEMS}
                    value={resolucion}
                    onChange={(value) =>
                      setResolucion(value as Resolucion)
                    }
                    label="Resolución objetivo"
                  />
                </div>

                <dl className="mt-4 space-y-2">
                  {resumen.map(({ tipo, nombre }) => (
                    <div
                      key={tipo}
                      className="flex items-baseline justify-between gap-3 border-b border-line pb-2 last:border-0 last:pb-0"
                    >
                      <dt className="text-xs text-muted">
                        {TYPE_LABELS[tipo]}
                      </dt>
                      <dd
                        className={`min-w-0 truncate text-right text-sm ${
                          nombre ? 'text-ink' : 'text-muted'
                        }`}
                      >
                        {nombre ?? 'Sin elegir'}
                      </dd>
                    </div>
                  ))}
                </dl>

                <Button
                  className="mt-5 w-full"
                  disabled={!completa || simulation.simulando}
                  loading={simulation.simulando}
                  title={
                    !completa
                      ? 'Elige las 5 piezas para simular'
                      : undefined
                  }
                  onClick={() => void simulation.simular()}
                >
                  Simular rendimiento
                </Button>

                <Button
                  className="mt-2 w-full"
                  variant="secondary"
                  disabled={!canSave}
                  title={saveDisabledReason}
                  onClick={() => setSaveOpen(true)}
                >
                  Guardar build
                </Button>
              </div>

              <div className="rounded-xl border border-line bg-panel p-5">
                <h2 className="text-sm font-semibold text-ink">
                  Resultado
                </h2>
                <div className="mt-4">
                  <ResultadosSimulacion
                    resultado={simulation.resultado}
                    usoFuentePct={simulation.usoFuentePct}
                    desactualizado={simulation.desactualizado}
                    simulando={simulation.simulando}
                    error={simulation.error}
                    onReintentar={() => void simulation.simular()}
                  />
                </div>
              </div>
            </div>
          </div>
        )}

      {problem && (
        <div className="mt-5">
          <ProblemNotice
            tono={problem.tono}
            titulo={problem.titulo}
            sugerencia={problem.sugerencia}
          >
            {problem.texto}
          </ProblemNotice>
        </div>
      )}

      {saveOpen &&
        simulation.resultado &&
        !simulation.desactualizado &&
        simulation.resultado.estado !== 'INCOMPATIBLE' && (
          <SaveBuildModal
            seleccion={seleccion}
            resolucion={resolucion}
            onClose={() => setSaveOpen(false)}
            onSaved={(build) => {
              setSaveOpen(false)
              notifyBuildsChanged()
              mostrar({
                tipo: 'ok',
                texto: `Build "${build.nombre}" guardada.`,
                accion: {
                  etiqueta: 'Ver mis builds',
                  href: '/builds',
                },
              })
            }}
          />
        )}
    </section>
  )
}
