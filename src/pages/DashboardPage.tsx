import { useState } from 'react'
import { useNavigate } from 'react-router'
import { useAuth } from '@/auth/useAuth'
import { PageHeader } from '@/components/PageHeader'
import {
  Button,
  Card,
  ErrorState,
  LoadingState,
} from '@/components/ui'
import { useAlerts } from '@/features/alerts/alertsContext'
import { solicitarAbrirChat } from '@/features/chat/events'
import { AlertsSummary } from '@/features/dashboard/AlertsSummary'
import { BienvenidaBuilds } from '@/features/dashboard/BienvenidaBuilds'
import { BuildsRecientes } from '@/features/dashboard/BuildsRecientes'
import { ConsejoGuru } from '@/features/dashboard/ConsejoGuru'
import { ConsumoBuilds } from '@/features/dashboard/ConsumoBuilds'
import { EstadoBuilds } from '@/features/dashboard/EstadoBuilds'
import { elegirConsejo } from '@/features/dashboard/guruTips'
import { MejorBuild } from '@/features/dashboard/MejorBuild'
import { PiezasFavoritas } from '@/features/dashboard/PiezasFavoritas'
import { ResumenBuilds } from '@/features/dashboard/ResumenBuilds'
import { useDashboard } from '@/features/dashboard/useDashboard'

export function DashboardPage() {
  const { user } = useAuth()
  const {
    stats,
    recientes,
    consumoRecientes,
    cargando,
    error,
    recargar,
  } = useDashboard()
  const {
    pendientes,
    cargando: alertasCargando,
    error: alertasError,
    recargar: recargarAlertas,
  } = useAlerts()
  const navigate = useNavigate()
  const [consejo] = useState(() => elegirConsejo())

  const local = user?.email?.split('@')[0]?.trim() ?? ''
  const saludo = local ? `Hola, ${local}` : 'Hola'
  const hayBuilds = stats.total > 0

  return (
    <section>
      <PageHeader
        title={saludo}
        description="Este es el pulso de tu taller: builds, consumo y próximos pasos."
        actions={
          <>
            <Button onClick={() => navigate('/builder')}>
              Armar nuevo PC
            </Button>
            <Button variant="secondary" onClick={solicitarAbrirChat}>
              Preguntar a Guru
            </Button>
          </>
        }
      />

      <div className="space-y-5">
        <AlertsSummary
          pendientes={pendientes}
          cargando={alertasCargando}
          error={alertasError}
          onReintentar={recargarAlertas}
        />

        {cargando && !hayBuilds && (
          <Card className="p-6">
            <LoadingState label="Cargando tus builds…" rows={4} />
          </Card>
        )}

        {error && (
          <ErrorState
            mensaje={error}
            onReintentar={recargar}
            className={hayBuilds ? 'mb-1' : ''}
          />
        )}

        {!cargando && !error && !hayBuilds && (
          <BienvenidaBuilds onCreate={() => navigate('/builder')} />
        )}

        {hayBuilds && (
          <>
            <ResumenBuilds stats={stats} />

            <div className="grid gap-4 xl:grid-cols-[1.45fr_1fr]">
              <div className="space-y-4">
                <ConsumoBuilds builds={consumoRecientes} />
                <BuildsRecientes builds={recientes} />
              </div>

              <div className="space-y-4">
                <EstadoBuilds stats={stats} />
                <MejorBuild
                  build={stats.mejorBuild}
                  onVer={(id) =>
                    navigate(`/builds?open=${encodeURIComponent(id)}`)
                  }
                />
                <PiezasFavoritas
                  cpuFavorito={stats.cpuFavorito}
                  gpuFavorita={stats.gpuFavorita}
                />
              </div>
            </div>
          </>
        )}

        <ConsejoGuru texto={consejo} />
      </div>
    </section>
  )
}
