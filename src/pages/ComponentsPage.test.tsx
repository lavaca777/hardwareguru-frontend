import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'
import { ComponentesProvider } from '@/features/components/ComponentesProvider'
import { ComponentsPage } from './ComponentsPage'

function renderPage() {
  return render(
    <ComponentesProvider>
      <ComponentsPage />
    </ComponentesProvider>,
  )
}

describe('ComponentsPage', () => {
  it('muestra el catálogo y filtra por búsqueda', async () => {
    const user = userEvent.setup()
    renderPage()

    expect(
      await screen.findByText('28 piezas disponibles'),
    ).toBeInTheDocument()

    const search = screen.getByRole('searchbox', {
      name: 'Buscar componentes',
    })
    await user.type(search, 'ryzen')

    expect(screen.getByText('Ryzen 5 9600X')).toBeInTheDocument()
    expect(screen.queryByText('Core i5-14600K')).not.toBeInTheDocument()
  })

  it('cambia de tipo, conserva la búsqueda y limpia filtros', async () => {
    const user = userEvent.setup()
    renderPage()

    await screen.findByText('28 piezas disponibles')
    const search = screen.getByRole('searchbox', {
      name: 'Buscar componentes',
    })
    await user.type(search, 'ryzen')
    await user.click(screen.getByRole('tab', { name: /Placas madre/ }))

    expect(search).toHaveValue('ryzen')
    expect(
      screen.getByText('No hay componentes con esos filtros'),
    ).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'Limpiar filtros' }))

    expect(screen.getByText('B650 Gaming')).toBeInTheDocument()
  })

  it('filtra por socket', async () => {
    const user = userEvent.setup()
    renderPage()

    await screen.findByText('28 piezas disponibles')
    await user.click(screen.getByRole('button', { name: 'Socket' }))

    const listbox = screen.getByRole('listbox', { name: 'Socket' })
    await user.click(within(listbox).getByRole('option', { name: 'AM5' }))

    expect(screen.getByText('Ryzen 5 9600X')).toBeInTheDocument()
    expect(screen.queryByText('Core i5-14600K')).not.toBeInTheDocument()
  })

  it('abre el detalle con especificaciones y benchmarks', async () => {
    const user = userEvent.setup()
    renderPage()

    await screen.findByText('28 piezas disponibles')
    await user.click(
      screen.getByRole('button', { name: /Ryzen 5 9600X/ }),
    )

    expect(await screen.findByRole('dialog')).toBeInTheDocument()
    expect(
      await screen.findByRole('heading', { name: 'Especificaciones' }),
    ).toBeInTheDocument()
    expect(
      await screen.findByRole('heading', { name: 'Benchmarks' }),
    ).toBeInTheDocument()
    expect(screen.getByText('Cinebench R24')).toBeInTheDocument()
  })

  it('muestra el estado vacío al no encontrar resultados', async () => {
    const user = userEvent.setup()
    renderPage()

    await screen.findByText('28 piezas disponibles')
    await user.type(
      screen.getByRole('searchbox', { name: 'Buscar componentes' }),
      'zzz',
    )

    expect(
      screen.getByText('No hay componentes con esos filtros'),
    ).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'Limpiar filtros' }))

    expect(screen.getByText('Ryzen 5 9600X')).toBeInTheDocument()
  })
})
