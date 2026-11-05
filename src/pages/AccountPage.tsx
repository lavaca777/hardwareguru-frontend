import { useAuth } from '@/auth/useAuth'
import { PageHeader } from '@/components/PageHeader'
import { Button, Card } from '@/components/ui'

export function AccountPage() {
  const { user, logout } = useAuth()

  return (
    <section>
      <PageHeader
        title="Mi cuenta"
        description="Perfil, sesión y seguridad."
      />

      <Card className="max-w-xl p-6">
        <p className="text-xs text-muted">Sesión iniciada como</p>
        <p className="mt-1 text-sm font-medium text-ink">
          {user?.email ?? '—'}
        </p>

        <div className="mt-5 flex flex-wrap gap-2">
          <Button variant="secondary" onClick={logout}>
            Cerrar sesión
          </Button>
        </div>

        <p className="mt-4 text-xs text-muted">
          La gestión completa de la cuenta se implementa en la feature
          011-account.
        </p>
      </Card>
    </section>
  )
}
