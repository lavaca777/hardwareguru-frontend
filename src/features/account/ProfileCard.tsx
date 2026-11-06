import { Card } from '@/components/ui'
import type { User } from '@/types'
import { formatMemberSince } from './format'

export function ProfileCard({ user }: { user: User | null }) {
  const email = user?.email ?? '—'
  const inicial = user?.email.trim().charAt(0).toUpperCase() || '?'
  const miembroDesde = formatMemberSince(user?.creadoEn)

  return (
    <Card className="p-5">
      <h2 className="text-sm font-semibold text-ink">Perfil</h2>

      <div className="mt-4 flex items-center gap-3">
        <span
          className="grid h-11 w-11 shrink-0 place-items-center rounded-lg border border-copper/40 bg-copper-soft font-mono text-lg text-copper"
          aria-hidden="true"
        >
          {inicial}
        </span>
        <div className="min-w-0">
          <p className="text-xs text-muted">Sesión iniciada como</p>
          <p className="mt-0.5 truncate text-sm font-medium text-ink">
            {email}
          </p>
          {miembroDesde && (
            <p className="mt-1 text-xs text-muted">
              Miembro desde {miembroDesde}
            </p>
          )}
        </div>
      </div>
    </Card>
  )
}
