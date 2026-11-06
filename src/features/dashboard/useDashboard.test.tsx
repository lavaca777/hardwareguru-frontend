import { render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { seedBuilds } from '@/api/mocks/data'
import { BuildsContext } from '@/features/builds/buildsContext'
import type { Build } from '@/types'
import { useDashboard } from './useDashboard'

function Probe() {
  const { stats, recientes, consumoRecientes } = useDashboard()

  return (
    <>
      <span data-testid="total">{stats.total}</span>
      <span data-testid="recientes">
        {recientes.map((build) => build.id).join(',')}
      </span>
      <span data-testid="consumo">
        {consumoRecientes.map((build) => build.id).join(',')}
      </span>
    </>
  )
}

describe('useDashboard', () => {
  it('limita recientes a 4 y consumo a 6', () => {
    const extra: Build[] = [1, 2, 3].map((dia) => ({
      ...seedBuilds[0],
      id: `e${dia}`,
      creadaEn: `2026-12-0${dia}T10:00:00Z`,
    }))
    const builds = [...seedBuilds, ...extra]

    render(
      <BuildsContext.Provider
        value={{
          builds,
          cargando: false,
          error: null,
          recargar: vi.fn(),
          reset: vi.fn(),
          ensureLoaded: vi.fn().mockResolvedValue(undefined),
          eliminar: vi.fn().mockResolvedValue(undefined),
        }}
      >
        <Probe />
      </BuildsContext.Provider>,
    )

    expect(screen.getByTestId('total')).toHaveTextContent('7')
    expect(screen.getByTestId('recientes')).toHaveTextContent(
      'e3,e2,e1,b4',
    )
    expect(screen.getByTestId('consumo')).toHaveTextContent(
      'e3,e2,e1,b4,b3,b2',
    )
  })
})
