import { Button, Card } from '@/components/ui'
import type { Build } from '@/types'

interface MejorBuildProps {
  build: Build | null
  onVer: (id: string) => void
}

export function MejorBuild({ build, onVer }: MejorBuildProps) {
  return (
    <Card className="p-5">
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-sm font-semibold text-ink">Tu mejor build</h2>
        {build && (
          <span className="rounded-full border border-ok/40 bg-ok/10 px-2 py-0.5 text-xs font-medium text-ok">
            Balanceada
          </span>
        )}
      </div>

      {build ? (
        <>
          <p className="mt-3 truncate text-lg font-semibold text-ink">
            {build.nombre}
          </p>
          <dl className="mt-3 grid grid-cols-2 gap-2">
            <div className="rounded-lg border border-line bg-panel-2 px-3 py-2">
              <dt className="text-[11px] text-muted">Cuello</dt>
              <dd className="mt-0.5 font-mono text-sm text-ink">
                {build.resultado.cuelloBotellaPct}%
              </dd>
            </div>
            <div className="rounded-lg border border-line bg-panel-2 px-3 py-2">
              <dt className="text-[11px] text-muted">Consumo</dt>
              <dd className="mt-0.5 font-mono text-sm text-ink">
                {build.resultado.consumoEstimadoW} W
              </dd>
            </div>
          </dl>
          <Button
            size="sm"
            variant="secondary"
            className="mt-4"
            onClick={() => onVer(build.id)}
          >
            Ver build
          </Button>
        </>
      ) : (
        <p className="mt-3 text-sm text-muted">
          Aún no tienes una build balanceada. Cuando tengas una, aparecerá
          aquí.
        </p>
      )}
    </Card>
  )
}
