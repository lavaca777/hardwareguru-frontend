import { Link } from 'react-router'
import {
  Card,
  ErrorState,
  LoadingState,
} from '@/components/ui'

interface ActivitySummaryProps {
  builds: number
  pendientes: number
  cargando: boolean
  error: string | null
  onReintentar: () => void
}

export function ActivitySummary({
  builds,
  pendientes,
  cargando,
  error,
  onReintentar,
}: ActivitySummaryProps) {
  return (
    <Card className="p-5">
      <h2 className="text-sm font-semibold text-ink">
        Resumen de actividad
      </h2>
      <p className="mt-1 text-xs text-muted">
        Lo que tienes guardado y lo que necesita atención.
      </p>

      {error ? (
        <div className="mt-4">
          <ErrorState mensaje={error} onReintentar={onReintentar} />
        </div>
      ) : cargando ? (
        <div className="mt-4">
          <LoadingState label="Cargando tu actividad…" rows={2} />
        </div>
      ) : (
        <dl className="mt-4 grid gap-3 sm:grid-cols-2">
          <div className="rounded-lg border border-line bg-panel-2/60 p-4">
            <dt className="text-xs text-muted">Builds guardadas</dt>
            <dd className="mt-1 font-mono text-2xl text-ink">{builds}</dd>
            <dd className="mt-2">
              <Link
                to="/builds"
                className="text-xs font-medium text-copper hover:underline"
              >
                Ver mis builds
              </Link>
            </dd>
          </div>

          <div className="rounded-lg border border-line bg-panel-2/60 p-4">
            <dt className="text-xs text-muted">Alertas pendientes</dt>
            <dd className="mt-1 font-mono text-2xl text-ink">{pendientes}</dd>
            <dd className="mt-2">
              <Link
                to="/alerts"
                className="text-xs font-medium text-copper hover:underline"
              >
                Ver alertas
              </Link>
            </dd>
          </div>
        </dl>
      )}
    </Card>
  )
}
