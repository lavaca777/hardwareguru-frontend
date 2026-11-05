import { MOCK_DELAY_MS } from '@/config'

export function mockDelay(): Promise<void> {
  const ms = import.meta.env.MODE === 'test' ? 0 : MOCK_DELAY_MS
  if (ms <= 0) return Promise.resolve()

  return new Promise((resolve) => setTimeout(resolve, ms))
}
