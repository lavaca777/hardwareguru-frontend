import { Outlet } from 'react-router'
import { Brand } from '@/components/Brand'
import { CheckIcon, CpuIcon } from '@/components/icons'

const features = [
  'Filtra piezas incompatibles antes de comprar.',
  'Simula consumo, cuello de botella y rendimiento.',
  'Consulta a Guru cuando tengas dudas.',
]

export function AuthLayout() {
  return (
    <div className="min-h-screen bg-bg text-ink lg:grid lg:grid-cols-[1.05fr_.95fr]">
      <aside className="relative hidden overflow-hidden border-r border-line bg-panel/60 p-10 lg:flex lg:flex-col lg:justify-between">
        <div className="bg-blueprint absolute inset-0 opacity-60" aria-hidden="true" />
        <CpuIcon
          className="absolute -bottom-24 -right-24 h-[26rem] w-[26rem] text-copper/10"
          aria-hidden="true"
        />

        <div className="relative">
          <Brand />
        </div>

        <div className="relative max-w-lg">
          <p className="text-4xl font-semibold leading-[1.05] tracking-tight text-ink">
            Arma una PC que no falle.
          </p>
          <p className="mt-4 max-w-md text-sm leading-6 text-muted">
            Compatibilidad, consumo y rendimiento en un solo lugar. Sin hojas
            de cálculo ni sorpresas al encender.
          </p>
          <ul className="mt-8 space-y-3">
            {features.map((feature) => (
              <li key={feature} className="flex gap-3 text-sm text-muted">
                <CheckIcon className="mt-0.5 h-4 w-4 shrink-0 text-copper" />
                <span>{feature}</span>
              </li>
            ))}
          </ul>
        </div>

        <p className="relative font-mono text-[10px] text-muted">
          HardwareGuru · PC builder
        </p>
      </aside>

      <main className="flex min-h-screen items-center justify-center px-4 py-10 sm:px-6 lg:px-10">
        <div className="w-full max-w-md">
          <div className="mb-8 lg:hidden">
            <Brand />
          </div>
          <Outlet />
        </div>
      </main>
    </div>
  )
}
