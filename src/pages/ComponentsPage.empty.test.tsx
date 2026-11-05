import { render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { ComponentesProvider } from '@/features/components/ComponentesProvider'
import { ComponentsPage } from './ComponentsPage'

const { listarComponentesMock } = vi.hoisted(() => ({
  listarComponentesMock: vi.fn(),
}))

vi.mock('@/api', () => ({
  api: {
    listarComponentes: listarComponentesMock,
    obtenerComponente: vi.fn(),
  },
}))

describe('ComponentsPage sin catálogo', () => {
  it('muestra el estado vacío del catálogo', async () => {
    listarComponentesMock.mockResolvedValue([])

    render(
      <ComponentesProvider>
        <ComponentsPage />
      </ComponentesProvider>,
    )

    expect(
      await screen.findByText('El catálogo aún no tiene piezas'),
    ).toBeInTheDocument()
  })
})
