import { Link } from 'react-router'
import { BellIcon } from '@/components/icons'
import {
  Card,
  ErrorState,
  LoadingState,
} from '@/components/ui'
import type { Alerta } from '@/types'

interface AlertsSummaryProps {
  pendientes: Alerta[]
  cargando: boolean
  error: string | null
  onReintentar: () => void
}

export function AlertsSummary({
  pendientes,
  cargando,
  error,
  onReintentar,
}: AlertsSummaryProps) {
  if (error) {
    return <ErrorState mensaje={error} onReintentar={onReintentar} />
  }

  if (cargando && pendientes.length === 0) {
    return (
      <Card className="p-5">
        <LoadingState label="Cargando alertas…" rows={2} />
      </Card>
    )
  }

  if (pendientes.length === 0) return null

  const enlace =
    pendientes.length === 1
      ? 'Ver la alerta'
      : `Ver las ${pendientes.length} alertas`

  return (
    <Card className="border-warn/40 bg-warn/[0.06] p-5">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex gap-3">
          <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg border border-warn/40 bg-warn/10 text-warn">
            <BellIcon className="h-4 w-4" />
          </span>
          <div>
            <h2 className="text-sm font-semibold text-ink">
              Alertas pendientes
            </h2>
            <p className="mt-1 text-sm text-muted">
              Revisa el consumo de tus builds y actúa antes de que sea un
              problema.
            </p>
          </div>
        </div>

        <Link
          to="/alerts"
          className="shrink-0 text-sm font-medium text-copper hover:text-[#e39465] hover:underline"
        >
          {enlace}
        </Link>
      </div>

      <ul className="mt-4 grid gap-2 sm:grid-cols-2">
        {pendientes.slice(0, 2).map((alerta) => (
          <li
            key={alerta.id}
            className="rounded-lg border border-line bg-panel-2/70 p-3"
          >
            <div className="flex items-start justify-between gap-2">
              <p className="text-sm font-medium text-ink">
                {alerta.buildName}
              </p>
              <span className="shrink-0 font-mono text-xs text-warn">
                {alerta.porcentajeUso}%
              </span>
            </div>
            <p className="mt-1 line-clamp-2 text-xs text-muted">
              {alerta.mensaje}
            </p>
          </li>
        ))}
      </ul>

      {pendientes.length > 2 && (
        <p className="mt-3 text-xs text-muted">
          +{pendientes.length - 2} alertas más.
        </p>
      )}
    </Card>
  )
}
