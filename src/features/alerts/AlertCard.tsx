import { Button, ProblemNotice } from '@/components/ui'
import { formatBuildDate } from '@/features/builds/utils'
import type { Alerta } from '@/types'

interface AlertCardProps {
  alerta: Alerta
  buildExists?: boolean
  onVer: () => void
  onMarcar?: () => void
  marcando?: boolean
}

export function AlertCard({
  alerta,
  buildExists,
  onVer,
  onMarcar,
  marcando = false,
}: AlertCardProps) {
  return (
    <ProblemNotice
      tono="warn"
      titulo={alerta.buildName}
      sugerencia={alerta.sugerencia}
      acciones={
        <>
          {buildExists === false ? (
            <span className="text-xs text-muted">
              Esta build ya no existe.
            </span>
          ) : (
            <Button
              size="sm"
              variant="secondary"
              onClick={onVer}
              disabled={buildExists === undefined}
            >
              Ver build
            </Button>
          )}

          {!alerta.leida && onMarcar && (
            <Button
              size="sm"
              variant="ghost"
              onClick={onMarcar}
              loading={marcando}
            >
              Marcar como leída
            </Button>
          )}

          {alerta.leida && (
            <span className="text-xs font-medium text-muted">Leída</span>
          )}
        </>
      }
    >
      <p>{alerta.mensaje}</p>
      <p className="mt-2 font-mono text-xs text-warn">
        Uso de la fuente: {alerta.porcentajeUso}% ·{' '}
        {formatBuildDate(alerta.creadaEn)}
      </p>
    </ProblemNotice>
  )
}
