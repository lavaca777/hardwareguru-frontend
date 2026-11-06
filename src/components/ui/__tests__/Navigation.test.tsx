import { useState } from 'react'
import { fireEvent, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { SearchInput } from '../SearchInput'
import { Tabs, type TabItem } from '../Tabs'

const items: TabItem[] = [
  { id: 'pendientes', label: 'Pendientes', badge: 3 },
  { id: 'leidas', label: 'Leídas' },
  { id: 'todas', label: 'Todas' },
]

function TabsHarness() {
  const [value, setValue] = useState('pendientes')
  return <Tabs items={items} value={value} onChange={setValue} label="Alertas" />
}

function SearchHarness() {
  const [value, setValue] = useState('')
  const onClear = vi.fn()
  return (
    <>
      <SearchInput
        label="Buscar equipos"
        value={value}
        onChange={setValue}
        onClear={onClear}
      />
      <output>{value}</output>
    </>
  )
}

describe('Tabs', () => {
  it('cambia de pestaña con clic', async () => {
    const user = userEvent.setup()
    render(<TabsHarness />)

    await user.click(screen.getByRole('tab', { name: /Leídas/ }))

    expect(screen.getByRole('tab', { name: /Leídas/ })).toHaveAttribute(
      'aria-selected',
      'true',
    )
  })

  it('navega con flechas, Home y End', () => {
    render(<TabsHarness />)
    const selected = screen.getByRole('tab', { name: /Pendientes/ })

    fireEvent.keyDown(selected, { key: 'ArrowRight' })
    expect(screen.getByRole('tab', { name: /Leídas/ })).toHaveAttribute(
      'aria-selected',
      'true',
    )

    fireEvent.keyDown(screen.getByRole('tab', { name: /Leídas/ }), {
      key: 'End',
    })
    expect(screen.getByRole('tab', { name: /Todas/ })).toHaveAttribute(
      'aria-selected',
      'true',
    )

    fireEvent.keyDown(screen.getByRole('tab', { name: /Todas/ }), {
      key: 'Home',
    })
    expect(screen.getByRole('tab', { name: /Pendientes/ })).toHaveAttribute(
      'aria-selected',
      'true',
    )
  })

  it('muestra el badge', () => {
    render(<TabsHarness />)
    expect(screen.getByRole('tab', { name: /Pendientes/ })).toHaveTextContent('3')
  })
})

describe('SearchInput', () => {
  it('escribe, limpia y enfoca el campo', async () => {
    const user = userEvent.setup()
    render(<SearchHarness />)

    const input = screen.getByRole('searchbox', { name: 'Buscar equipos' })
    await user.type(input, 'ryzen')
    expect(input).toHaveValue('ryzen')

    await user.click(screen.getByRole('button', { name: 'Limpiar búsqueda' }))
    expect(input).toHaveValue('')
    expect(input).toHaveFocus()
  })
})
