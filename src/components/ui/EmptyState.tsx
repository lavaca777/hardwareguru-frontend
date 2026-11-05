import type { ReactNode } from 'react'
import { InfoIcon } from '@/components/icons'

interface EmptyStateProps {
  titulo: string
  descripcion?: string
  accion?: ReactNode
  icono?: ReactNode
  className?: string
}

export function EmptyState({
  titulo,
  descripcion,
  accion,
  icono,
  className = '',
}: EmptyStateProps) {
  return (
    <div
      role="status"
      className={`rounded-xl border border-dashed border-line bg-panel/60 px-6 py-10 text-center ${className}`}
    >
      <div className="mx-auto grid h-10 w-10 place-items-center rounded-lg border border-line bg-panel-2 text-muted">
        {icono ?? <InfoIcon className="h-5 w-5" />}
      </div>
      <h3 className="mt-4 text-sm font-semibold text-ink">{titulo}</h3>
      {descripcion && (
        <p className="mx-auto mt-1 max-w-md text-sm text-muted">{descripcion}</p>
      )}
      {accion && <div className="mt-4 flex justify-center">{accion}</div>}
    </div>
  )
}
