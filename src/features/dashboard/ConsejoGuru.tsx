import { InfoIcon } from '@/components/icons'
import { Card } from '@/components/ui'

export function ConsejoGuru({ texto }: { texto: string }) {
  return (
    <Card className="border-copper/30 bg-copper-soft/35 p-5">
      <div className="flex gap-3">
        <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg border border-copper/40 bg-copper-soft text-copper">
          <InfoIcon className="h-4 w-4" />
        </span>
        <div>
          <h2 className="text-sm font-semibold text-ink">Consejo de Guru</h2>
          <p className="mt-1 text-sm leading-relaxed text-ink/85">{texto}</p>
        </div>
      </div>
    </Card>
  )
}
