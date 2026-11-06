import { useState } from 'react'
import { fireEvent, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'
import {
  ComponentSelect,
  type ComponentSelectOption,
} from '../ComponentSelect'

const opciones: ComponentSelectOption[] = [
  { id: 'cpu-9600x', label: 'Ryzen 5 9600X', meta: 'AM5' },
  { id: 'cpu-14600k', label: 'Core i5-14600K', meta: 'LGA1700' },
  { id: 'cpu-9950x', label: 'Ryzen 9 9950X', meta: 'AM5' },
]

function SelectHarness({
  disabled = false,
  options = opciones,
}: {
  disabled?: boolean
  options?: ComponentSelectOption[]
}) {
  const [value, setValue] = useState<string | null>(null)

  return (
    <ComponentSelect
      label="Procesador"
      options={options}
      value={value}
      onChange={setValue}
      disabled={disabled}
      disabledMessage="Elige primero una placa"
    />
  )
}

describe('ComponentSelect', () => {
  it('abre, busca y selecciona una opción', async () => {
    const user = userEvent.setup()
    render(<SelectHarness />)

    await user.click(screen.getByRole('button', { name: 'Procesador' }))
    expect(screen.getByRole('listbox')).toBeInTheDocument()

    const search = screen.getByRole('searchbox', {
      name: 'Buscar Procesador',
    })
    await user.type(search, 'ryzen')

    expect(screen.getByText('Ryzen 5 9600X')).toBeInTheDocument()
    expect(screen.queryByText('Core i5-14600K')).not.toBeInTheDocument()

    await user.click(screen.getByRole('option', { name: /Ryzen 5 9600X/ }))

    expect(screen.queryByRole('listbox')).not.toBeInTheDocument()
    expect(screen.getByText('Ryzen 5 9600X')).toBeInTheDocument()
    expect(screen.getByText('AM5')).toBeInTheDocument()
  })

  it('selecciona con teclado', () => {
    render(<SelectHarness />)

    fireEvent.click(screen.getByRole('button', { name: 'Procesador' }))
    const search = screen.getByRole('searchbox', {
      name: 'Buscar Procesador',
    })

    fireEvent.keyDown(search, { key: 'ArrowDown' })
    fireEvent.keyDown(search, { key: 'Enter' })

    expect(screen.getByText('Core i5-14600K')).toBeInTheDocument()
  })

  it('cierra con Escape y devuelve el foco', () => {
    render(<SelectHarness />)
    const button = screen.getByRole('button', { name: 'Procesador' })

    fireEvent.click(button)
    fireEvent.keyDown(
      screen.getByRole('searchbox', { name: 'Buscar Procesador' }),
      { key: 'Escape' },
    )

    expect(screen.queryByRole('listbox')).not.toBeInTheDocument()
    expect(button).toHaveFocus()
  })

  it('cierra al hacer clic fuera', () => {
    render(<SelectHarness />)

    fireEvent.click(screen.getByRole('button', { name: 'Procesador' }))
    fireEvent.mouseDown(document.body)

    expect(screen.queryByRole('listbox')).not.toBeInTheDocument()
  })

  it('muestra el mensaje de deshabilitado', () => {
    render(<SelectHarness disabled />)

    expect(screen.getByRole('button', { name: 'Procesador' })).toBeDisabled()
    expect(
      screen.getByText('Elige primero una placa'),
    ).toBeInTheDocument()
  })

  it('muestra el estado vacío', () => {
    render(<SelectHarness options={[]} />)

    fireEvent.click(screen.getByRole('button', { name: 'Procesador' }))

    expect(
      screen.getByText('No hay opciones compatibles.'),
    ).toBeInTheDocument()
  })
})
