import type { ReactNode } from 'react'
import { AlertTriangleIcon, InfoIcon } from '@/components/icons'

export type ProblemTone = 'neutral' | 'info' | 'warn' | 'danger'

export interface ProblemNoticeProps {
  titulo: string
  children: ReactNode
  sugerencia?: string
  acciones?: ReactNode
  tono?: ProblemTone
}

const toneClasses: Record<ProblemTone, string> = {
  neutral: 'border-line bg-panel-2',
  info: 'border-info/40 bg-info/10',
  warn: 'border-warn/40 bg-warn/10',
  danger: 'border-danger/40 bg-danger/10',
}

const iconClasses: Record<ProblemTone, string> = {
  neutral: 'text-muted',
  info: 'text-info',
  warn: 'text-warn',
  danger: 'text-danger',
}

export function ProblemNotice({
  titulo,
  children,
  sugerencia,
  acciones,
  tono = 'neutral',
}: ProblemNoticeProps) {
  const Icon = tono === 'warn' || tono === 'danger' ? AlertTriangleIcon : InfoIcon

  return (
    <div className={`rounded-xl border p-4 ${toneClasses[tono]}`} role="note">
      <div className="flex gap-3">
        <Icon className={`mt-0.5 h-5 w-5 shrink-0 ${iconClasses[tono]}`} />
        <div className="min-w-0">
          <h3 className="text-sm font-semibold text-ink">{titulo}</h3>
          <div className="mt-1 text-sm text-muted">{children}</div>
          {sugerencia && <p className="mt-2 text-sm text-ink/80">{sugerencia}</p>}
          {acciones && (
            <div className="mt-3 flex flex-wrap gap-2">{acciones}</div>
          )}
        </div>
      </div>
    </div>
  )
}
