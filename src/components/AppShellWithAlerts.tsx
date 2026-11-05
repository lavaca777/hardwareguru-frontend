import { useAlerts } from '@/features/alerts/alertsContext'
import { AppShell } from './AppShell'

export function AppShellWithAlerts() {
  const { pendientes } = useAlerts()

  return <AppShell alertCount={pendientes.length} />
}
