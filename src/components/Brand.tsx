import { CpuIcon } from './icons'

export function Brand({ compact = false }: { compact?: boolean }) {
  return (
    <div className="flex items-center gap-3">
      <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg border border-copper/50 bg-copper-soft text-copper">
        <CpuIcon className="h-5 w-5" />
      </span>
      {!compact && (
        <span className="min-w-0">
          <span className="block text-sm font-semibold tracking-tight text-ink">
            HardwareGuru
          </span>
          <span className="block font-mono text-[10px] text-muted">
            PC builder
          </span>
        </span>
      )}
    </div>
  )
}
