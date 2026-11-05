import { useMemo, useState, type ReactNode } from 'react'
import { PageHeader } from '@/components/PageHeader'
import {
  Button,
  ComponentSelect,
  EmptyState,
  ErrorState,
  LoadingState,
  Modal,
  SearchInput,
  Tabs,
} from '@/components/ui'
import { useComponentes } from '@/features/components/componentesContext'
import { matchesSearch } from '@/features/components/search'
import { TYPE_ITEMS, TYPE_LABELS } from '@/features/components/labels'
import { useComponenteDetalle } from '@/features/components/useComponenteDetalle'
import type { Componente, ComponenteDetalle, TipoComponente } from '@/types'

const FILTER_ALL = 'all'

const SPEC_LABELS: Record<string, string> = {
  fabricante: 'Fabricante',
  tipo: 'Tipo',
  garantia: 'Garantía',
  tdp: 'TDP',
  socket: 'Socket',
  tipoRam: 'Tipo de RAM',
  potenciaW: 'Potencia',
}

const BENCHMARK_LABELS: Record<string, string> = {
  cinebenchR24: 'Cinebench R24',
  geekbenchSingle: 'Geekbench single-core',
  timespy: '3DMark Time Spy',
}

const POWER_RANGES = [
  { id: '0-500', label: 'Hasta 500 W' },
  { id: '501-650', label: '501–650 W' },
  { id: '651-800', label: '651–800 W' },
  { id: '801+', label: 'Más de 800 W' },
]

const ORDER_OPTIONS = [
  { id: 'nombre', label: 'Nombre' },
  { id: 'tdp', label: 'TDP' },
  { id: 'potencia', label: 'Potencia' },
]

function uniqueValues(values: Array<string | undefined>): string[] {
  return Array.from(
    new Set(values.filter((value): value is string => Boolean(value))),
  ).sort((a, b) => a.localeCompare(b, 'es'))
}

function matchesPowerRange(
  power: number | undefined,
  range: string,
): boolean {
  if (range === FILTER_ALL) return true
  if (power === undefined) return false

  if (range === '0-500') return power <= 500
  if (range === '501-650') return power > 500 && power <= 650
  if (range === '651-800') return power > 650 && power <= 800
  return power > 800
}

function formatSpecValue(key: string, value: string | number): string {
  if ((key === 'tdp' || key === 'potenciaW') && typeof value === 'number') {
    return `${value} W`
  }

  return String(value)
}

function Tag({ children }: { children: ReactNode }) {
  return (
    <span className="rounded-md border border-line bg-panel-2 px-2 py-1 text-xs text-muted">
      {children}
    </span>
  )
}

function ComponentDetail({
  id,
  basic,
}: {
  id: string
  basic: Componente
}) {
  const { detalle, cargando, error, reintentar } = useComponenteDetalle(id)

  if (cargando) {
    return <LoadingState label="Cargando detalle…" rows={4} />
  }

  if (error) {
    return (
      <div className="space-y-4">
        <div className="rounded-lg border border-line bg-panel-2 p-3">
          <p className="text-sm font-semibold text-ink">{basic.nombre}</p>
          <p className="mt-0.5 text-xs text-muted">{basic.fabricante}</p>
        </div>
        <ErrorState mensaje={error} onReintentar={reintentar} />
      </div>
    )
  }

  if (!detalle) return null

  return <ComponentDetailContent detalle={detalle} />
}

function ComponentDetailContent({
  detalle,
}: {
  detalle: ComponenteDetalle
}) {
  const benchmarks = detalle.benchmarks
    ? Object.entries(detalle.benchmarks)
    : []

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap gap-2">
        <Tag>{detalle.fabricante}</Tag>
        <Tag>{TYPE_LABELS[detalle.tipo]}</Tag>
        {detalle.socket && <Tag>{detalle.socket}</Tag>}
        {detalle.tipoRam && <Tag>{detalle.tipoRam}</Tag>}
        {detalle.tdp !== undefined && <Tag>{detalle.tdp} W TDP</Tag>}
        {detalle.potenciaW !== undefined && (
          <Tag>{detalle.potenciaW} W</Tag>
        )}
      </div>

      <section>
        <h3 className="text-sm font-semibold text-ink">Especificaciones</h3>
        <dl className="mt-3 grid gap-2 sm:grid-cols-2">
          {Object.entries(detalle.especificaciones).map(([key, value]) => (
            <div
              key={key}
              className="rounded-lg border border-line bg-panel-2 px-3 py-2"
            >
              <dt className="text-xs text-muted">
                {SPEC_LABELS[key] ?? key}
              </dt>
              <dd className="mt-0.5 text-sm text-ink">
                {formatSpecValue(key, value)}
              </dd>
            </div>
          ))}
        </dl>
      </section>

      {benchmarks.length > 0 && (
        <section>
          <h3 className="text-sm font-semibold text-ink">Benchmarks</h3>
          <dl className="mt-3 grid gap-2 sm:grid-cols-2">
            {benchmarks.map(([key, value]) => (
              <div
                key={key}
                className="flex items-center justify-between gap-3 rounded-lg border border-line bg-panel-2 px-3 py-2"
              >
                <dt className="text-xs text-muted">
                  {BENCHMARK_LABELS[key] ?? key}
                </dt>
                <dd className="font-mono text-sm text-ink">{value}</dd>
              </div>
            ))}
          </dl>
        </section>
      )}
    </div>
  )
}

export function ComponentsPage() {
  const { todos, porTipo, cargando, error, recargar } = useComponentes()
  const [tipo, setTipo] = useState<TipoComponente>('cpu')
  const [search, setSearch] = useState('')
  const [socket, setSocket] = useState(FILTER_ALL)
  const [fabricante, setFabricante] = useState(FILTER_ALL)
  const [tipoRam, setTipoRam] = useState(FILTER_ALL)
  const [potenciaRango, setPotenciaRango] = useState(FILTER_ALL)
  const [orden, setOrden] = useState('nombre')
  const [selectedId, setSelectedId] = useState<string | null>(null)

  const items = porTipo[tipo]
  const selected = todos.find((componente) => componente.id === selectedId)

  const socketOptions = useMemo(
    () => uniqueValues(items.map((componente) => componente.socket)),
    [items],
  )
  const fabricanteOptions = useMemo(
    () => uniqueValues(items.map((componente) => componente.fabricante)),
    [items],
  )
  const tipoRamOptions = useMemo(
    () => uniqueValues(items.map((componente) => componente.tipoRam)),
    [items],
  )

  const filtered = useMemo(() => {
    const result = items
      .filter((componente) =>
        matchesSearch(
          `${componente.nombre} ${componente.fabricante}`,
          search,
        ),
      )
      .filter(
        (componente) =>
          socket === FILTER_ALL || componente.socket === socket,
      )
      .filter(
        (componente) =>
          fabricante === FILTER_ALL ||
          componente.fabricante === fabricante,
      )
      .filter(
        (componente) =>
          tipoRam === FILTER_ALL || componente.tipoRam === tipoRam,
      )
      .filter((componente) =>
        matchesPowerRange(componente.potenciaW, potenciaRango),
      )

    return result.sort((a, b) => {
      if (orden === 'tdp') return (a.tdp ?? 0) - (b.tdp ?? 0)
      if (orden === 'potencia') {
        return (a.potenciaW ?? 0) - (b.potenciaW ?? 0)
      }
      return a.nombre.localeCompare(b.nombre, 'es')
    })
  }, [items, search, socket, fabricante, tipoRam, potenciaRango, orden])

  const hasActiveFilters =
    search.trim() !== '' ||
    socket !== FILTER_ALL ||
    fabricante !== FILTER_ALL ||
    tipoRam !== FILTER_ALL ||
    potenciaRango !== FILTER_ALL

  const clearFilters = () => {
    setSearch('')
    setSocket(FILTER_ALL)
    setFabricante(FILTER_ALL)
    setTipoRam(FILTER_ALL)
    setPotenciaRango(FILTER_ALL)
  }

  const handleTipoChange = (nextId: string) => {
    setTipo(nextId as TipoComponente)
    setSocket(FILTER_ALL)
    setFabricante(FILTER_ALL)
    setTipoRam(FILTER_ALL)
    setPotenciaRango(FILTER_ALL)
    setOrden('nombre')
    setSelectedId(null)
  }

  const showSocket = tipo === 'cpu' || tipo === 'placa'
  const showFabricante = tipo === 'cpu' || tipo === 'placa'
  const showTipoRam = tipo === 'placa' || tipo === 'ram'
  const showPotencia = tipo === 'fuente'

  const tabs = TYPE_ITEMS.map((item) => ({
    id: item.id,
    label: item.label,
    badge: porTipo[item.id].length,
  }))

  return (
    <section>
      <PageHeader
        title="Componentes"
        description={
          cargando
            ? 'Cargando catálogo…'
            : `${todos.length} piezas disponibles`
        }
      />

      {cargando && todos.length === 0 && (
        <LoadingState label="Cargando catálogo…" rows={5} />
      )}

      {error && (
        <ErrorState mensaje={error} onReintentar={recargar} />
      )}

      {!cargando && !error && todos.length === 0 && (
        <EmptyState
          titulo="El catálogo aún no tiene piezas"
          descripcion="Cuando el catálogo tenga datos, aparecerán aquí."
        />
      )}

      {!error && todos.length > 0 && (
        <>
          <Tabs
            items={tabs}
            value={tipo}
            onChange={handleTipoChange}
            label="Tipos de componente"
          />

          <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <SearchInput
              className="sm:col-span-2"
              label="Buscar componentes"
              value={search}
              onChange={setSearch}
              placeholder="Buscar por nombre o fabricante…"
            />

            {showSocket && (
              <ComponentSelect
                label="Socket"
                options={[
                  { id: FILTER_ALL, label: 'Todos los sockets' },
                  ...socketOptions.map((option) => ({
                    id: option,
                    label: option,
                  })),
                ]}
                value={socket}
                onChange={setSocket}
                emptyMessage="No hay sockets disponibles."
              />
            )}

            {showTipoRam && (
              <ComponentSelect
                label="Tipo de RAM"
                options={[
                  { id: FILTER_ALL, label: 'Todos los tipos' },
                  ...tipoRamOptions.map((option) => ({
                    id: option,
                    label: option,
                  })),
                ]}
                value={tipoRam}
                onChange={setTipoRam}
                emptyMessage="No hay tipos de RAM disponibles."
              />
            )}

            {showFabricante && (
              <ComponentSelect
                label="Fabricante"
                options={[
                  { id: FILTER_ALL, label: 'Todos los fabricantes' },
                  ...fabricanteOptions.map((option) => ({
                    id: option,
                    label: option,
                  })),
                ]}
                value={fabricante}
                onChange={setFabricante}
                emptyMessage="No hay fabricantes disponibles."
              />
            )}

            {showPotencia && (
              <ComponentSelect
                label="Potencia"
                options={[
                  { id: FILTER_ALL, label: 'Cualquier potencia' },
                  ...POWER_RANGES,
                ]}
                value={potenciaRango}
                onChange={setPotenciaRango}
              />
            )}

            <ComponentSelect
              label="Ordenar por"
              options={ORDER_OPTIONS}
              value={orden}
              onChange={setOrden}
            />
          </div>

          {filtered.length === 0 ? (
            <div className="mt-5">
              <EmptyState
                titulo="No hay componentes con esos filtros"
                descripcion="Prueba con otra búsqueda o limpia los filtros."
                accion={
                  <Button variant="secondary" onClick={clearFilters}>
                    Limpiar filtros
                  </Button>
                }
              />
            </div>
          ) : (
            <ul className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
              {filtered.map((componente) => (
                <li key={componente.id}>
                  <button
                    type="button"
                    aria-haspopup="dialog"
                    onClick={() => setSelectedId(componente.id)}
                    className="group flex h-full w-full flex-col rounded-xl border border-line bg-panel p-4 text-left transition-colors hover:border-copper/50 focus-visible:ring-2 focus-visible:ring-copper/50"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="truncate text-sm font-semibold text-ink">
                          {componente.nombre}
                        </p>
                        <p className="mt-0.5 text-xs text-muted">
                          {componente.fabricante}
                        </p>
                      </div>
                      <span className="shrink-0 font-mono text-[10px] text-muted">
                        {TYPE_LABELS[componente.tipo]}
                      </span>
                    </div>

                    <div className="mt-4 flex flex-wrap gap-2">
                      {componente.socket && (
                        <Tag>{componente.socket}</Tag>
                      )}
                      {componente.tipoRam && (
                        <Tag>{componente.tipoRam}</Tag>
                      )}
                      {componente.tdp !== undefined && (
                        <Tag>{componente.tdp} W TDP</Tag>
                      )}
                      {componente.potenciaW !== undefined && (
                        <Tag>{componente.potenciaW} W</Tag>
                      )}
                    </div>

                    <span className="mt-4 text-xs text-copper opacity-0 transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100">
                      Ver detalle
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          )}

          {hasActiveFilters && filtered.length > 0 && (
            <div className="mt-5 flex justify-end">
              <Button variant="ghost" size="sm" onClick={clearFilters}>
                Limpiar filtros
              </Button>
            </div>
          )}
        </>
      )}

      <Modal
        open={selectedId !== null}
        onClose={() => setSelectedId(null)}
        title={selected?.nombre ?? 'Detalle del componente'}
        size="lg"
      >
        {selected ? (
          <ComponentDetail key={selected.id} id={selected.id} basic={selected} />
        ) : (
          <ErrorState mensaje="Ese componente ya no está disponible." />
        )}
      </Modal>
    </section>
  )
}
