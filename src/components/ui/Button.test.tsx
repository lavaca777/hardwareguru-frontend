import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { Button } from './Button'

describe('Button', () => {
  it('ejecuta la acción al hacer clic', async () => {
    const user = userEvent.setup()
    const onClick = vi.fn()

    render(<Button onClick={onClick}>Guardar</Button>)
    await user.click(screen.getByRole('button', { name: 'Guardar' }))

    expect(onClick).toHaveBeenCalledOnce()
  })

  it('se deshabilita y muestra estado de carga', () => {
    render(<Button loading>Guardando</Button>)

    const button = screen.getByRole('button', { name: 'Guardando' })
    expect(button).toBeDisabled()
    expect(button).toHaveAttribute('aria-busy', 'true')
  })

  it('aplica las variantes y tamaños', () => {
    render(
      <Button variant="danger" size="sm">
        Eliminar
      </Button>,
    )

    const button = screen.getByRole('button', { name: 'Eliminar' })
    expect(button.className).toContain('border-danger')
    expect(button.className).toContain('h-8')
  })

  it('renderiza el icono inicial', () => {
    render(
      <Button leftIcon={<span data-testid="icono" />}>Con icono</Button>,
    )

    expect(screen.getByTestId('icono')).toBeInTheDocument()
  })
})
