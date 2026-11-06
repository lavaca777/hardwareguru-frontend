import { api } from '@/api'
import { useAuth } from '@/auth/useAuth'
import { markAccountDeleted } from '@/auth/session'
import { PageHeader } from '@/components/PageHeader'
import { Button, Card } from '@/components/ui'
import { FEATURES } from '@/config'
import { ActivitySummary } from '@/features/account/ActivitySummary'
import { ChangePasswordCard } from '@/features/account/ChangePasswordCard'
import { DeleteAccountCard } from '@/features/account/DeleteAccountCard'
import { ProfileCard } from '@/features/account/ProfileCard'
import { useAlerts } from '@/features/alerts/alertsContext'
import { useBuilds } from '@/features/builds/buildsContext'

export interface AccountFeatures {
  cambiarPassword: boolean
  eliminarCuenta: boolean
}

interface AccountPageProps {
  features?: AccountFeatures
}

export function AccountPage({
  features = FEATURES,
}: AccountPageProps = {}) {
  const { user, logout } = useAuth()
  const {
    builds,
    cargando: buildsCargando,
    error: buildsError,
    recargar: recargarBuilds,
  } = useBuilds()
  const {
    pendientes,
    cargando: alertasCargando,
    error: alertasError,
    recargar: recargarAlertas,
  } = useAlerts()

  const cargandoActividad = buildsCargando || alertasCargando
  const errorActividad = buildsError ?? alertasError

  const reintentarActividad = () => {
    if (buildsError) recargarBuilds()
    if (alertasError) recargarAlertas()
  }

  return (
    <section>
      <PageHeader
        title="Mi cuenta"
        description="Perfil, actividad y seguridad de tu sesión."
      />

      <div className="grid gap-4 lg:grid-cols-[1.35fr_1fr]">
        <div className="space-y-4">
          <ProfileCard user={user} />
          <ActivitySummary
            builds={builds.length}
            pendientes={pendientes.length}
            cargando={cargandoActividad}
            error={errorActividad}
            onReintentar={reintentarActividad}
          />
        </div>

        <div className="space-y-4">
          <Card className="p-5">
            <h2 className="text-sm font-semibold text-ink">Sesión</h2>
            <p className="mt-1 text-xs text-muted">
              Cierra sesión en este dispositivo. Se borrarán los datos en
              memoria.
            </p>
            <Button variant="secondary" className="mt-4" onClick={logout}>
              Cerrar sesión
            </Button>
          </Card>

          {features.cambiarPassword && <ChangePasswordCard />}

          {features.eliminarCuenta && user && (
            <DeleteAccountCard
              email={user.email}
              onEliminar={api.eliminarCuenta}
              onEliminada={() => {
                markAccountDeleted()
                logout()
              }}
            />
          )}
        </div>
      </div>
    </section>
  )
}
