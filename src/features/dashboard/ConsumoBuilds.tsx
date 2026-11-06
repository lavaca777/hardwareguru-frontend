import { Link } from 'react-router'
import { Card } from '@/components/ui'
import { UMBRAL_USO_PCT } from '@/config'
import { buildUsagePct } from '@/features/builds/utils'
import type { Build } from '@/types'

export function ConsumoBuilds({ builds }: { builds: Build[] }) {
  if (builds.length === 0) return null

  return (
    <Card className="p-5">
      <h2 className="text-sm font-semibold text-ink">Consumo por build</h2>
      <p className="mt-1 text-xs text-muted">
        Consumo estimado contra la potencia de la fuente. La marca indica el{' '}
        {UMBRAL_USO_PCT}%.
      </p>

      <ul className="mt-5 space-y-4">
        {builds.map((build) => {
          const uso = buildUsagePct(build)
          const potencia = build.piezas.fuente.potenciaW
          const tono =
            uso === null
              ? 'text-muted'
              : uso >= 100
                ? 'text-danger'
                : uso >= UMBRAL_USO_PCT
                  ? 'text-warn'
                  : 'text-ok'
          const barra =
            uso === null
              ? ''
              : uso >= 100
                ? 'bg-danger'
                : uso >= UMBRAL_USO_PCT
                  ? 'bg-warn'
                  : 'bg-ok'

          return (
            <li key={build.id}>
              <div className="flex items-baseline justify-between gap-3">
                <Link
                  to={`/builds?open=${encodeURIComponent(build.id)}`}
                  className="min-w-0 truncate text-sm text-ink hover:text-copper"
                >
                  {build.nombre}
                </Link>
                <span className={`shrink-0 font-mono text-sm ${tono}`}>
                  {uso === null ? '—' : `${uso}%`}
                </span>
              </div>

              {uso === null ? (
                <p className="mt-2 text-xs text-muted">
                  Potencia de fuente no disponible.
                </p>
              ) : (
                <>
                  <div
                    role="progressbar"
                    aria-label={`Uso de la fuente en ${build.nombre}`}
                    aria-valuemin={0}
                    aria-valuemax={100}
                    aria-valuenow={Math.min(uso, 100)}
                    aria-valuetext={`${uso}%`}
                    className="relative mt-2 h-2 overflow-hidden rounded-full bg-panel-2"
                  >
                    <span
                      className={`block h-full rounded-full ${barra}`}
                      style={{ width: `${Math.min(uso, 100)}%` }}
                    />
                    <span
                      className="absolute inset-y-0 w-px bg-ink/60"
                      style={{ left: `${UMBRAL_USO_PCT}%` }}
                      aria-hidden="true"
                    />
                  </div>
                  <div className="mt-1 flex items-center justify-between gap-3 font-mono text-[11px] text-muted">
                    <span>
                      {build.resultado.consumoEstimadoW} W de{' '}
                      {potencia ?? '—'} W
                    </span>
                    <span>Ref. {UMBRAL_USO_PCT}%</span>
                  </div>
                </>
              )}
            </li>
          )
        })}
      </ul>
    </Card>
  )
}
