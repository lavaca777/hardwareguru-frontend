export const UMBRAL_USO_PCT = 85
export const MAX_NOMBRE_BUILD = 60
export const MIN_PASSWORD = 8
export const MAX_MENSAJE_CHAT = 1000
export const ALERTS_POLL_MS = 60_000

export const GURU_TIPS = [
  'Deja al menos un 20% de margen entre el consumo estimado y la potencia de tu fuente.',
  'El cuello de botella importa más cuando subes la resolución: compara 1080p y 1440p.',
  'Una fuente eficiente no solo ahorra energía: también trabaja más fría y silenciosa.',
  'Antes de cambiar la GPU, revisa que tu CPU no la esté frenando.',
  'La RAM de 32 GB es un buen punto medio para gaming y multitarea.',
  'Simula siempre después de cambiar una pieza: el consumo y el cuello pueden variar.',
  'Si una build queda al límite, prueba undervolt antes de cambiar la fuente.',
  'Guarda varias versiones de tu build para comparar consumo y rendimiento.',
  'Un SSD rápido mejora la sensación general más que unos pocos FPS extra.',
  'Las alertas de energía aparecen cuando superas el 85% de uso de la fuente.',
] as const

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
