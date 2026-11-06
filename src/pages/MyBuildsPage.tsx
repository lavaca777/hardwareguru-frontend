import { useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router'
import { PageHeader } from '@/components/PageHeader'
import {
  Button,
  Card,
  ComponentSelect,
  ConfirmDialog,
  EmptyState,
  ErrorState,
  LoadingState,
  Modal,
  ProblemNotice,
  SearchInput,
  useToast,
} from '@/components/ui'
import { TYPE_LABELS } from '@/features/components/labels'
import { useBuilds } from '@/features/builds/buildsContext'
import {
  buildUsagePct,
  filterAndSortBuilds,
  formatBuildDate,
  type BuildFilterState,
  type BuildSort,
} from '@/features/builds/utils'
import { getProblemMessage } from '@/features/simulation/mensajes'
import type { Build, EstadoSimulacion } from '@/types'

const STATE_LABELS: Record<EstadoSimulacion, string> = {
  BALANCEADO: 'Balanceado',
  RIESGO: 'En riesgo',
  INCOMPATIBLE: 'Incompatible',
}

const STATE_CLASSES: Record<EstadoSimulacion, string> = {
  BALANCEADO: 'border-ok/40 bg-ok/10 text-ok',
  RIESGO: 'border-warn/40 bg-warn/10 text-warn',
  INCOMPATIBLE: 'border-danger/40 bg-danger/10 text-danger',
}

const STATE_OPTIONS = [
  { id: 'all', label: 'Todas' },
  { id: 'BALANCEADO', label: 'Balanceadas' },
  { id: 'RIESGO', label: 'En riesgo' },
  { id: 'INCOMPATIBLE', label: 'Incompatibles' },
]

const SORT_OPTIONS = [
  { id: 'recientes', label: 'Más recientes' },
  { id: 'consumo', label: 'Mayor consumo' },
  { id: 'cuello', label: 'Menor cuello de botella' },
]

const BUILD_TYPES = ['cpu', 'placa', 'ram', 'gpu', 'fuente'] as const

export function MyBuildsPage() {
  const { builds, cargando, error, recargar, eliminar } = useBuilds()
  const { mostrar } = useToast()
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()
  const openId = searchParams.get('open')

  const [search, setSearch] = useState('')
  const [estado, setEstado] = useState<BuildFilterState>('all')
  const [orden, setOrden] = useState<BuildSort>('recientes')
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [deleting, setDeleting] = useState(false)
  const handledOpenRef = useRef<string | null>(null)

  const filtered = useMemo(
    () => filterAndSortBuilds(builds, { search, estado, orden }),
    [builds, search, estado, orden],
  )

  const detailId = selectedId ?? openId
  const detailBuild =
    builds.find((build) => build.id === detailId) ?? null
  const deleteBuild =
    builds.find((build) => build.id === deleteId) ?? null
  const detailUsage = detailBuild ? buildUsagePct(detailBuild) : null
  const detailProblem =
    detailBuild && detailBuild.resultado.estado !== 'BALANCEADO'
      ? getProblemMessage(detailBuild.resultado)
      : null

  const hasFilters = search.trim() !== '' || estado !== 'all'

  useEffect(() => {
    if (!openId || handledOpenRef.current === openId) return
    if (cargando || error) return

    handledOpenRef.current = openId
    const build = builds.find((item) => item.id === openId)

    if (!build) {
      mostrar({ tipo: 'warn', texto: 'Esa build ya no existe.' })
      setSearchParams({}, { replace: true })
    }
  }, [openId, cargando, error, builds, mostrar, setSearchParams])

  const closeDetail = () => {
    setSelectedId(null)
    if (openId) setSearchParams({}, { replace: true })
  }

  const clearFilters = () => {
    setSearch('')
    setEstado('all')
  }

  const openBuilder = (build: Build) => {
    navigate(`/builder?from=${encodeURIComponent(build.id)}`)
  }

  const openDelete = (build: Build) => {
    closeDetail()
    setDeleteId(build.id)
  }

  const handleDelete = async () => {
    if (!deleteBuild) return

    setDeleting(true)
    try {
      await eliminar(deleteBuild.id)
      setDeleteId(null)
      setSelectedId(null)
      mostrar({ tipo: 'ok', texto: 'Build eliminada.' })
    } catch {
      mostrar({
        tipo: 'error',
        texto: 'No pudimos eliminar la build. Reintenta.',
      })
    } finally {
      setDeleting(false)
    }
  }

  return (
    <section>
      <PageHeader
        title="Mis builds"
        description={
          cargando
            ? 'Cargando tus builds…'
            : `${builds.length} builds guardadas`
        }
        actions={
          <Button onClick={() => navigate('/builder')}>
            Armar nuevo PC
          </Button>
        }
      />

      {cargando && builds.length === 0 && (
        <LoadingState label="Cargando tus builds…" rows={4} />
      )}

      {error && (
        <ErrorState mensaje={error} onReintentar={recargar} />
      )}

      {!cargando && !error && builds.length === 0 && (
        <EmptyState
          titulo="Aún no tienes builds"
          descripcion="Arma tu primer PC y guárdalo para verlo aquí."
          accion={
            <Button onClick={() => navigate('/builder')}>
              Arma tu primer PC
            </Button>
          }
        />
      )}

      {!error && builds.length > 0 && (
        <>
          <div className="grid items-end gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <SearchInput
              className="sm:col-span-2"
              label="Buscar builds"
              value={search}
              onChange={setSearch}
              placeholder="Buscar por nombre…"
            />

            <ComponentSelect
              label="Estado"
              options={STATE_OPTIONS}
              value={estado}
              onChange={(value) => setEstado(value as BuildFilterState)}
            />

            <ComponentSelect
              label="Ordenar por"
              options={SORT_OPTIONS}
              value={orden}
              onChange={(value) => setOrden(value as BuildSort)}
            />
          </div>

          {filtered.length === 0 ? (
            <div className="mt-5">
              <EmptyState
                titulo="Ninguna build coincide"
                descripcion="Prueba con otro nombre o limpia los filtros."
                accion={
                  <Button variant="secondary" onClick={clearFilters}>
                    Limpiar filtros
                  </Button>
                }
              />
            </div>
          ) : (
            <div className="mt-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {filtered.map((build) => (
                <Card key={build.id} className="p-5">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <h2
                        className="truncate text-sm font-semibold text-ink"
                        title={build.nombre}
                      >
                        {build.nombre}
                      </h2>
                      <p className="mt-0.5 text-xs text-muted">
                        {formatBuildDate(build.creadaEn)}
                      </p>
                    </div>
                    <span
                      className={`shrink-0 rounded-full border px-2.5 py-1 text-xs font-medium ${STATE_CLASSES[build.resultado.estado]}`}
                    >
                      {STATE_LABELS[build.resultado.estado]}
                    </span>
                  </div>

                  <dl className="mt-4 grid grid-cols-2 gap-3">
                    <div>
                      <dt className="text-xs text-muted">Consumo</dt>
                      <dd className="font-mono text-sm text-ink">
                        {build.resultado.consumoEstimadoW} W
                      </dd>
                    </div>
                    <div>
                      <dt className="text-xs text-muted">
                        Cuello de botella
                      </dt>
                      <dd className="font-mono text-sm text-ink">
                        {build.resultado.cuelloBotellaPct}%
                      </dd>
                    </div>
                    <div className="col-span-2 min-w-0">
                      <dt className="text-xs text-muted">CPU / GPU</dt>
                      <dd className="truncate text-sm text-ink">
                        {build.piezas.cpu.nombre} / {build.piezas.gpu.nombre}
                      </dd>
                    </div>
                  </dl>

                  <div className="mt-4 flex flex-wrap gap-2">
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={() => setSelectedId(build.id)}
                    >
                      Ver detalle
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => openBuilder(build)}
                    >
                      Abrir en el armador
                    </Button>
                    <Button
                      size="sm"
                      variant="danger"
                      onClick={() => openDelete(build)}
                    >
                      Eliminar
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          )}

          {hasFilters && filtered.length > 0 && (
            <div className="mt-5 flex justify-end">
              <Button variant="ghost" size="sm" onClick={clearFilters}>
                Limpiar filtros
              </Button>
            </div>
          )}
        </>
      )}

      <Modal
        open={detailBuild !== null}
        onClose={closeDetail}
        title={detailBuild?.nombre ?? 'Detalle de la build'}
        size="lg"
        footer={
          detailBuild ? (
            <>
              <Button
                variant="secondary"
                onClick={() => openBuilder(detailBuild)}
              >
                Abrir en el armador
              </Button>
              <Button
                variant="danger"
                onClick={() => openDelete(detailBuild)}
              >
                Eliminar
              </Button>
            </>
          ) : undefined
        }
      >
        {detailBuild && (
          <div className="space-y-5">
            <div className="flex flex-wrap items-center gap-2 text-xs text-muted">
              <span>{formatBuildDate(detailBuild.creadaEn)}</span>
              <span aria-hidden="true">·</span>
              <span>{detailBuild.resolucion}</span>
              <span aria-hidden="true">·</span>
              <span
                className={`rounded-full border px-2 py-0.5 ${STATE_CLASSES[detailBuild.resultado.estado]}`}
              >
                {STATE_LABELS[detailBuild.resultado.estado]}
              </span>
            </div>

            <dl className="grid grid-cols-2 gap-3">
              <div className="rounded-lg border border-line bg-panel-2 px-3 py-2">
                <dt className="text-xs text-muted">Consumo</dt>
                <dd className="mt-0.5 font-mono text-sm text-ink">
                  {detailBuild.resultado.consumoEstimadoW} W
                </dd>
              </div>
              <div className="rounded-lg border border-line bg-panel-2 px-3 py-2">
                <dt className="text-xs text-muted">Uso de la fuente</dt>
                <dd className="mt-0.5 font-mono text-sm text-ink">
                  {detailUsage === null ? '—' : `${detailUsage}%`}
                </dd>
              </div>
              <div className="rounded-lg border border-line bg-panel-2 px-3 py-2">
                <dt className="text-xs text-muted">Cuello de botella</dt>
                <dd className="mt-0.5 font-mono text-sm text-ink">
                  {detailBuild.resultado.cuelloBotellaPct}%
                </dd>
              </div>
              <div className="rounded-lg border border-line bg-panel-2 px-3 py-2">
                <dt className="text-xs text-muted">Estado</dt>
                <dd className="mt-0.5 text-sm text-ink">
                  {STATE_LABELS[detailBuild.resultado.estado]}
                </dd>
              </div>
            </dl>

            <section>
              <h3 className="text-sm font-semibold text-ink">Piezas</h3>
              <dl className="mt-2 space-y-2">
                {BUILD_TYPES.map((tipo) => (
                  <div
                    key={tipo}
                    className="flex items-baseline justify-between gap-3 border-b border-line pb-2 last:border-0 last:pb-0"
                  >
                    <dt className="text-xs text-muted">
                      {TYPE_LABELS[tipo]}
                    </dt>
                    <dd className="min-w-0 truncate text-right text-sm text-ink">
                      {detailBuild.piezas[tipo].nombre}
                    </dd>
                  </div>
                ))}
              </dl>
            </section>

            {detailProblem && (
              <ProblemNotice
                tono={detailProblem.tono}
                titulo={detailProblem.titulo}
                sugerencia={detailProblem.sugerencia}
              >
                {detailProblem.texto}
              </ProblemNotice>
            )}
          </div>
        )}
      </Modal>

      <ConfirmDialog
        open={deleteBuild !== null}
        onClose={() => setDeleteId(null)}
        onConfirm={() => void handleDelete()}
        title="Eliminar build"
        description={
          deleteBuild
            ? `¿Eliminar "${deleteBuild.nombre}"? Esta acción no se puede deshacer.`
            : ''
        }
        confirmLabel="Eliminar"
        cancelLabel="Cancelar"
        tone="danger"
        loading={deleting}
      />
    </section>
  )
}
