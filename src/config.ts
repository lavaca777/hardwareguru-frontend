export const UMBRAL_USO_PCT = 85
export const MAX_NOMBRE_BUILD = 60
export const MIN_PASSWORD = 8
export const MAX_MENSAJE_CHAT = 1000
export const ALERTS_POLL_MS = 60_000

export const FEATURES = {
  cambiarPassword: false,
  eliminarCuenta: false,
} as const

export const USE_MOCKS = import.meta.env.VITE_USE_MOCKS === 'true'

const parsedMockDelay = Number(import.meta.env.VITE_MOCK_DELAY_MS ?? 400)
export const MOCK_DELAY_MS = Number.isFinite(parsedMockDelay)
  ? Math.max(0, parsedMockDelay)
  : 400

export function getApiConfigError(): string | null {
  if (import.meta.env.VITE_USE_MOCKS === 'true') return null
  if (import.meta.env.VITE_API_URL?.trim()) return null

  return 'Falta configurar la URL de la API.'
}
