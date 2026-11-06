import { Button, Card } from '@/components/ui'

const PASOS = [
  'Elige CPU, placa, RAM, GPU y fuente.',
  'Simula el consumo y el cuello de botella.',
  'Guarda la build para verla en tu Dashboard.',
]

export function BienvenidaBuilds({ onCreate }: { onCreate: () => void }) {
  return (
    <Card className="overflow-hidden">
      <div className="border-l-2 border-copper p-6 sm:p-8">
        <p className="font-mono text-xs uppercase tracking-[0.16em] text-copper">
          Tu taller está vacío
        </p>
        <h2 className="mt-2 text-xl font-semibold tracking-tight text-ink sm:text-2xl">
          Arma tu primer PC
        </h2>
        <p className="mt-2 max-w-2xl text-sm text-muted">
          Cuando guardes tu primera build verás aquí tus estadísticas,
          alertas y recomendaciones. El proceso toma tres pasos.
        </p>

        <ol className="mt-6 grid gap-4 sm:grid-cols-3">
          {PASOS.map((paso, index) => (
            <li
              key={paso}
              className="rounded-lg border border-line bg-panel-2/60 p-4"
            >
              <span className="font-mono text-xs text-copper">
                0{index + 1}
              </span>
              <p className="mt-2 text-sm text-ink/85">{paso}</p>
            </li>
          ))}
        </ol>

        <Button className="mt-6" onClick={onCreate}>
          Armar nuevo PC
        </Button>
      </div>
    </Card>
  )
}
