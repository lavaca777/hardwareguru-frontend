import { UMBRAL_USO_PCT } from '@/config'
import { ErrorState } from '@/components/ui'
import { LoadingState } from '@/components/ui'
import type { SimulacionResultado } from '@/types'

interface ResultadosSimulacionProps {
  resultado: SimulacionResultado | null
  usoFuentePct: number | null
  desactualizado: boolean
  simulando: boolean
  error: string | null
  onReintentar: () => void
}

const ESTADO_LABELS: Record<SimulacionResultado['estado'], string> = {
  BALANCEADO: 'Balanceado',
  RIESGO: 'En riesgo',
  INCOMPATIBLE: 'Incompatible',
}

const ESTADO_CLASSES: Record<SimulacionResultado['estado'], string> = {
  BALANCEADO: 'border-ok/40 bg-ok/10 text-ok',
  RIESGO: 'border-warn/40 bg-warn/10 text-warn',
  INCOMPATIBLE: 'border-danger/40 bg-danger/10 text-danger',
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-line bg-panel-2 px-3 py-3">
      <p className="text-xs text-muted">{label}</p>
      <p className="mt-1 font-mono text-lg font-medium text-ink">{value}</p>
    </div>
  )
}

function usageBarClass(usoFuentePct: number | null): string {
  if (usoFuentePct === null) return 'bg-line'
  if (usoFuentePct > 100) return 'bg-danger'
  if (usoFuentePct >= UMBRAL_USO_PCT) return 'bg-warn'
  return 'bg-ok'
}

export function ResultadosSimulacion({
  resultado,
  usoFuentePct,
  desactualizado,
  simulando,
  error,
  onReintentar,
}: ResultadosSimulacionProps) {
  if (simulando) {
    return <LoadingState label="Simulando rendimiento…" rows={3} />
  }

  if (error) {
    return <ErrorState mensaje={error} onReintentar={onReintentar} />
  }

  if (!resultado) {
    return (
      <p className="text-sm text-muted">
        Simula la build para ver consumo, cuello de botella y estado.
      </p>
    )
  }

  const anchoUso = Math.min(100, usoFuentePct ?? 0)

  return (
    <div
      aria-live="polite"
      className={desactualizado ? 'opacity-60' : undefined}
    >
      <div className="grid gap-3 sm:grid-cols-2">
        <Metric
          label="Consumo estimado"
          value={`${resultado.consumoEstimadoW} W`}
        />
        <Metric
          label="Cuello de botella"
          value={`${resultado.cuelloBotellaPct}%`}
        />
      </div>

      <div className="mt-4">
        <div className="flex items-center justify-between gap-3 text-xs text-muted">
          <span>Uso de la fuente</span>
          <span className="font-mono">
            {usoFuentePct === null ? '—' : `${usoFuentePct}%`}
          </span>
        </div>
        <div className="mt-1 h-2 overflow-hidden rounded-full bg-panel-2">
          <div
            className={`h-full rounded-full ${usageBarClass(usoFuentePct)}`}
            style={{ width: `${anchoUso}%` }}
          />
        </div>
      </div>

      <div className="mt-4 flex items-center justify-between gap-3">
        <span
          className={`rounded-full border px-2.5 py-1 text-xs font-medium ${ESTADO_CLASSES[resultado.estado]}`}
        >
          {ESTADO_LABELS[resultado.estado]}
        </span>
        <span className="font-mono text-[10px] text-muted">
          {resultado.resolucion}
        </span>
      </div>

      {desactualizado && (
        <p className="mt-3 text-xs text-warn">
          Resultado desactualizado. Vuelve a simular para guardar.
        </p>
      )}
    </div>
  )
}
