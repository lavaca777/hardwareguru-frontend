import { render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router'
import { describe, expect, it } from 'vitest'
import { ToastProvider } from '@/components/ui'
import { BuilderProvider } from '@/features/builder/BuilderProvider'
import { ComponentesProvider } from '@/features/components/ComponentesProvider'
import { PCBuilderPage } from './PCBuilderPage'

function renderPage(path = '/builder') {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <ToastProvider>
        <ComponentesProvider>
          <BuilderProvider>
            <PCBuilderPage />
          </BuilderProvider>
        </ComponentesProvider>
      </ToastProvider>
    </MemoryRouter>,
  )
}

async function selectOption(
  user: ReturnType<typeof userEvent.setup>,
  label: string,
  optionName: RegExp,
) {
  await user.click(screen.getByRole('button', { name: label }))
  const listbox = screen.getByRole('listbox', { name: label })
  await user.click(
    within(listbox).getByRole('option', { name: optionName }),
  )
}

describe('PCBuilderPage', () => {
  it('deshabilita selectores dependientes y simulación hasta completar', async () => {
    const user = userEvent.setup()
    renderPage()

    expect(await screen.findByText('0 de 5 piezas')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Placa madre' })).toBeDisabled()
    expect(screen.getByRole('button', { name: 'Memoria RAM' })).toBeDisabled()
    expect(
      screen.getByRole('button', { name: 'Simular rendimiento' }),
    ).toBeDisabled()

    await selectOption(user, 'Procesador', /Ryzen 5 9600X/)

    expect(screen.getByText('1 de 5 piezas')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Placa madre' })).toBeEnabled()
    expect(screen.getByRole('button', { name: 'Memoria RAM' })).toBeDisabled()
  })

  it('permite completar las cinco piezas', async () => {
    const user = userEvent.setup()
    renderPage()

    await screen.findByText('0 de 5 piezas')

    await selectOption(user, 'Procesador', /Ryzen 5 9600X/)
    await selectOption(user, 'Placa madre', /B650 Gaming/)
    await selectOption(user, 'Memoria RAM', /DDR5 32 GB 6000/)
    await selectOption(user, 'Tarjeta gráfica', /RTX 4060/)
    await selectOption(user, 'Fuente', /650 W 80\+ Gold/)

    expect(screen.getByText('5 de 5 piezas')).toBeInTheDocument()
    expect(
      screen.getByRole('button', { name: 'Simular rendimiento' }),
    ).toBeEnabled()
  })

  it('carga una build desde ?from y avisa al reiniciar piezas incompatibles', async () => {
    const user = userEvent.setup()
    renderPage('/builder?from=b1')

    expect(await screen.findByText('5 de 5 piezas')).toBeInTheDocument()
    expect(
      await screen.findByText(/Build "PC Gamer 1080p" cargada/),
    ).toBeInTheDocument()

    await selectOption(user, 'Procesador', /Core i5-14600K/)

    expect(screen.getByText('3 de 5 piezas')).toBeInTheDocument()
    expect(
      await screen.findByText(/Reiniciamos Placa madre, Memoria RAM/),
    ).toBeInTheDocument()
  })

  it('avisa cuando la build de ?from no existe', async () => {
    renderPage('/builder?from=no-existe')

    expect(
      await screen.findByText('Esa build ya no existe.'),
    ).toBeInTheDocument()
  })

  it('reinicia la selección', async () => {
    const user = userEvent.setup()
    renderPage('/builder?from=b1')

    await screen.findByText('5 de 5 piezas')
    await user.click(screen.getByRole('button', { name: 'Reiniciar' }))

    expect(screen.getByText('0 de 5 piezas')).toBeInTheDocument()
    expect(
      await screen.findByText('Selección reiniciada.'),
    ).toBeInTheDocument()
  })

  it('simula, marca el resultado desactualizado y guarda la build', async () => {
    const user = userEvent.setup()
    renderPage('/builder?from=b1')

    await screen.findByText('5 de 5 piezas')
    await user.click(
      screen.getByRole('button', { name: 'Simular rendimiento' }),
    )

    expect(await screen.findByText('Consumo estimado')).toBeInTheDocument()
    expect(screen.getByText('216 W')).toBeInTheDocument()
    expect(screen.getByText('Balanceado')).toBeInTheDocument()
    expect(
      await screen.findByText(/Tu build está balanceada/),
    ).toBeInTheDocument()
    expect(
      screen.getByRole('button', { name: 'Guardar build' }),
    ).toBeEnabled()

    await user.click(screen.getByRole('tab', { name: '1440p' }))

    expect(
      await screen.findByText(/Resultado desactualizado/),
    ).toBeInTheDocument()
    expect(
      screen.getByRole('button', { name: 'Guardar build' }),
    ).toBeDisabled()

    await user.click(
      screen.getByRole('button', { name: 'Simular rendimiento' }),
    )
    await waitFor(() =>
      expect(
        screen.getByRole('button', { name: 'Guardar build' }),
      ).toBeEnabled(),
    )

    await user.click(
      screen.getByRole('button', { name: 'Guardar build' }),
    )
    const dialog = await screen.findByRole('dialog')
    await user.type(within(dialog).getByLabelText('Nombre'), 'Mi build')
    await user.click(
      within(dialog).getByRole('button', { name: 'Guardar' }),
    )

    expect(
      await screen.findByText(/Build "Mi build" guardada/),
    ).toBeInTheDocument()
    expect(
      screen.getByRole('link', { name: 'Ver mis builds' }),
    ).toHaveAttribute('href', '/builds')
  }, 15_000)
})
