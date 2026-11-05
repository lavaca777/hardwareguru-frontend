import { AlertTriangleIcon, ReloadIcon } from '@/components/icons'
import { Button } from './Button'

interface ErrorStateProps {
  mensaje: string
  onReintentar?: () => void
  reintentarLabel?: string
  className?: string
}

export function ErrorState({
  mensaje,
  onReintentar,
  reintentarLabel = 'Reintentar',
  className = '',
}: ErrorStateProps) {
  return (
    <div
      role="alert"
      className={`rounded-xl border border-danger/40 bg-danger/10 p-4 ${className}`}
    >
      <div className="flex gap-3">
        <AlertTriangleIcon className="mt-0.5 h-5 w-5 shrink-0 text-danger" />
        <div className="min-w-0">
          <p className="text-sm text-ink">{mensaje}</p>
          {onReintentar && (
            <Button
              variant="secondary"
              size="sm"
              className="mt-3"
              onClick={onReintentar}
              leftIcon={<ReloadIcon className="h-3.5 w-3.5" />}
            >
              {reintentarLabel}
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}
