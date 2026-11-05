import { Navigate, Outlet, useLocation } from 'react-router'
import { safeRedirect } from '@/auth/redirect'
import { useAuth } from '@/auth/useAuth'

export function PublicOnlyRoute() {
  const { isAuthenticated } = useAuth()
  const location = useLocation()
  const from = safeRedirect(
    (location.state as { from?: string } | null)?.from,
  )

  if (isAuthenticated) return <Navigate to={from} replace />

  return <Outlet />
}
