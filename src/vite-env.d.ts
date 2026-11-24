/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_URL: string
  readonly VITE_USE_MOCKS?: string
  readonly VITE_REAL_AUTH?: string
  readonly VITE_REAL_CATALOG?: string
  readonly VITE_REAL_SIMULATION?: string
  readonly VITE_REAL_CHAT?: string
  readonly VITE_REAL_ALERTS?: string
  readonly VITE_MOCK_DELAY_MS?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
