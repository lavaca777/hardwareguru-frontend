import { Route, Routes } from 'react-router'
import { AppShellWithAlerts } from '@/components/AppShellWithAlerts'
import { AuthLayout } from '@/components/AuthLayout'
import { AlertsProvider } from '@/features/alerts/AlertsProvider'
import { AccountPage } from '@/pages/AccountPage'
import { AlertsPage } from '@/pages/AlertsPage'
import { ComponentsPage } from '@/pages/ComponentsPage'
import { DashboardPage } from '@/pages/DashboardPage'
import { LoginPage } from '@/pages/LoginPage'
import { MyBuildsPage } from '@/pages/MyBuildsPage'
import { NotFoundPage } from '@/pages/NotFoundPage'
import { PCBuilderPage } from '@/pages/PCBuilderPage'
import { RegisterPage } from '@/pages/RegisterPage'
import { ProtectedRoute } from './ProtectedRoute'
import { PublicOnlyRoute } from './PublicOnlyRoute'

export function AppRouter() {
  return (
    <Routes>
      <Route element={<PublicOnlyRoute />}>
        <Route element={<AuthLayout />}>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
        </Route>
      </Route>

      <Route element={<ProtectedRoute />}>
        <Route
          element={
            <AlertsProvider>
              <AppShellWithAlerts />
            </AlertsProvider>
          }
        >
          <Route path="/" element={<DashboardPage />} />
          <Route path="/builder" element={<PCBuilderPage />} />
          <Route path="/builds" element={<MyBuildsPage />} />
          <Route path="/components" element={<ComponentsPage />} />
          <Route path="/alerts" element={<AlertsPage />} />
          <Route path="/account" element={<AccountPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Route>
      </Route>
    </Routes>
  )
}
