import { render, screen } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router'
import { describe, expect, it, vi } from 'vitest'
import { ToastProvider } from '@/components/ui'
import { BuildsProvider } from '@/features/builds/BuildsProvider'
import { MyBuildsPage } from '../MyBuildsPage'

const { listarBuildsMock } = vi.hoisted(() => ({
  listarBuildsMock: vi.fn(),
}))

vi.mock('@/api', () => ({
  api: {
    listarBuilds: listarBuildsMock,
    eliminarBuild: vi.fn(),
  },
}))

describe('MyBuildsPage sin builds', () => {
  it('muestra el estado vacío', async () => {
    listarBuildsMock.mockResolvedValue([])

    render(
      <MemoryRouter initialEntries={['/builds']}>
        <ToastProvider>
          <BuildsProvider>
            <Routes>
              <Route path="/builds" element={<MyBuildsPage />} />
            </Routes>
          </BuildsProvider>
        </ToastProvider>
      </MemoryRouter>,
    )

    expect(
      await screen.findByText('Aún no tienes builds'),
    ).toBeInTheDocument()
    expect(
      screen.getByRole('button', { name: 'Arma tu primer PC' }),
    ).toBeInTheDocument()
  })
})
