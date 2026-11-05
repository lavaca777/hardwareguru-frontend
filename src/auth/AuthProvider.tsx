import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react'
import { useLocation, useNavigate } from 'react-router'
import { api } from '@/api'
import { setUnauthorizedHandler } from '@/api/client'
import type { Session } from '@/types'
import { AuthContext, type AuthContextValue } from './context'
import { resetAppState } from './reset'
import {
  clearSession,
  markSessionExpired,
  readSession,
  saveSession,
} from './session'

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(() => readSession())
  const navigate = useNavigate()
  const location = useLocation()
  const locationRef = useRef(`${location.pathname}${location.search}`)

  useEffect(() => {
    locationRef.current = `${location.pathname}${location.search}`
  }, [location.pathname, location.search])

  useEffect(() => {
    setUnauthorizedHandler(() => {
      clearSession()
      markSessionExpired()
      resetAppState()
      setSession(null)
      navigate('/login', {
        replace: true,
        state: { from: locationRef.current },
      })
    })

    return () => setUnauthorizedHandler(null)
  }, [navigate])

  const login = useCallback(async (email: string, password: string) => {
    const nextSession = await api.login(email.trim().toLowerCase(), password)
    resetAppState()
    saveSession(nextSession)
    setSession(nextSession)
  }, [])

  const register = useCallback(async (email: string, password: string) => {
    const nextSession = await api.register(email.trim().toLowerCase(), password)
    resetAppState()
    saveSession(nextSession)
    setSession(nextSession)
  }, [])

  const logout = useCallback(() => {
    clearSession()
    resetAppState()
    setSession(null)
    navigate('/login', { replace: true })
  }, [navigate])

  const value = useMemo<AuthContextValue>(
    () => ({
      user: session?.user ?? null,
      token: session?.token ?? null,
      isAuthenticated: session !== null,
      login,
      register,
      logout,
    }),
    [session, login, register, logout],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
