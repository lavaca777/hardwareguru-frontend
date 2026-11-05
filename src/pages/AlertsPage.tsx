import { useState } from 'react'
import { useNavigate } from 'react-router'
import { PageHeader } from '@/components/PageHeader'
import {
  Button,
  EmptyState,
  ErrorState,
  LoadingState,
  ProblemNotice,
  Tabs,
  useToast,
} from '@/components/ui'
import { useAlerts } from '@/features/alerts/alertsContext'
import { AlertCard } from '@/features/alerts/AlertCard'
import { useBuilds } from '@/features/builds/buildsContext'
import type { Alerta } from '@/types'

type AlertsFilter = 'pendientes' | 'leidas'

export function AlertsPage() {
  const {
    pendientes,
    leidas,
    cargando,
    error,
    marcarLeida,
    recargar,
  } = useAlerts()
  const {
    builds,
    cargando: buildsCargando,
    error: buildsError,
  } = useBuilds()
  const { mostrar } = useToast()
  const navigate = useNavigate()
  const [filtro, setFiltro] = useState<AlertsFilter>('pendientes')
  const [marcandoId, setMarcandoId] = useState<string | null>(null)

  const total = pendientes.length + leidas.length
  const lista = filtro === 'pendientes' ? pendientes : leidas
  const pendientesLabel =
    pendientes.length === 1
      ? '1 pendiente'
      : `${pendientes.length} pendientes`

  const buildExists = (buildId: string): boolean | undefined => {
    if (buildsCargando || buildsError) return undefined
    return builds.some((build) => build.id === buildId)
  }

  const handleVer = (alerta: Alerta) => {
    navigate(`/builds?open=${encodeURIComponent(alerta.buildId)}`)
  }

  const handleMarcar = async (alerta: Alerta) => {
    setMarcandoId(alerta.id)
    try {
      await marcarLeida(alerta.id)
      mostrar({ tipo: 'ok', texto: 'Alerta marcada como leída.' })
    } catch {
      mostrar({
        tipo: 'error',
        texto: 'No pudimos marcar la alerta. Reintenta.',
      })
    } finally {
      setMarcandoId(null)
    }
  }

  return (
    <section>
      <PageHeader
        title="Alertas"
        description={
          cargando && total === 0
            ? 'Cargando alertas…'
            : pendientesLabel
        }
      />

      {cargando && total === 0 && (
        <LoadingState label="Cargando alertas…" rows={3} />
      )}

      {error && total === 0 && (
        <ErrorState mensaje={error} onReintentar={recargar} />
      )}

      {error && total > 0 && (
        <div className="mb-4">
          <ProblemNotice
            tono="warn"
            titulo="No pudimos actualizar las alertas"
            acciones={
              <Button size="sm" variant="secondary" onClick={recargar}>
                Reintentar
              </Button>
            }
          >
            {error}
          </ProblemNotice>
        </div>
      )}

      {!error && !cargando && total === 0 && (
        <EmptyState
          titulo="Todo en orden. No tienes alertas"
          descripcion="Cuando una build supere el 85% de uso de su fuente, la verás aquí."
        />
      )}

      {total > 0 && (
        <>
          <Tabs
            label="Filtrar alertas"
            items={[
              {
                id: 'pendientes',
                label: 'Pendientes',
                badge: pendientes.length,
              },
              { id: 'leidas', label: 'Leídas', badge: leidas.length },
            ]}
            value={filtro}
            onChange={(id) => setFiltro(id as AlertsFilter)}
          />

          {lista.length === 0 ? (
            <div
              role="tabpanel"
              id={`panel-${filtro}`}
              aria-labelledby={`tab-${filtro}`}
              className="mt-5"
            >
              <EmptyState
                titulo={
                  filtro === 'pendientes'
                    ? 'Todo en orden. No tienes alertas'
                    : 'Aún no hay alertas leídas'
                }
                descripcion={
                  filtro === 'pendientes'
                    ? 'Puedes revisar las alertas que ya marcaste como leídas.'
                    : 'Las alertas que marques como leídas aparecerán aquí.'
                }
              />
            </div>
          ) : (
            <div
              role="tabpanel"
              id={`panel-${filtro}`}
              aria-labelledby={`tab-${filtro}`}
              className="mt-5 space-y-3"
            >
              {lista.map((alerta) => (
                <AlertCard
                  key={alerta.id}
                  alerta={alerta}
                  buildExists={buildExists(alerta.buildId)}
                  onVer={() => handleVer(alerta)}
                  onMarcar={
                    alerta.leida
                      ? undefined
                      : () => void handleMarcar(alerta)
                  }
                  marcando={marcandoId === alerta.id}
                />
              ))}
            </div>
          )}
        </>
      )}
    </section>
  )
}
