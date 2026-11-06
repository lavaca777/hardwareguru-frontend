import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { useState } from 'react'
import { describe, expect, it, vi } from 'vitest'
import { Button } from '../Button'
import { ConfirmDialog } from '../ConfirmDialog'
import { Modal } from '../Modal'

function ModalHarness() {
  const [open, setOpen] = useState(false)

  return (
    <>
      <button type="button" onClick={() => setOpen(true)}>
        Abrir
      </button>
      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title="Detalle"
        footer={
          <>
            <Button variant="ghost" onClick={() => setOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={() => setOpen(false)}>Guardar</Button>
          </>
        }
      >
        <p>Contenido del modal</p>
      </Modal>
    </>
  )
}

describe('Modal', () => {
  it('abre, enfoca, bloquea el scroll y cierra con Escape', async () => {
    const user = userEvent.setup()
    render(<ModalHarness />)

    await user.click(screen.getByRole('button', { name: 'Abrir' }))

    expect(screen.getByRole('dialog')).toHaveTextContent('Detalle')
    expect(within(screen.getByRole('dialog')).getByRole('button', { name: 'Cerrar' })).toHaveFocus()
    expect(document.body.style.overflow).toBe('hidden')

    await user.keyboard('{Escape}')

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Abrir' })).toHaveFocus()
    expect(document.body.style.overflow).toBe('')
  })

  it('atrapa el foco en los extremos', async () => {
    const user = userEvent.setup()
    render(<ModalHarness />)

    await user.click(screen.getByRole('button', { name: 'Abrir' }))
    const dialog = screen.getByRole('dialog')
    const close = within(dialog).getByRole('button', { name: 'Cerrar' })
    const save = within(dialog).getByRole('button', { name: 'Guardar' })

    save.focus()
    await user.tab()
    expect(close).toHaveFocus()
  })
})

describe('ConfirmDialog', () => {
  it('llama a confirmar y cancelar', async () => {
    const user = userEvent.setup()
    const onConfirm = vi.fn()
    const onClose = vi.fn()

    render(
      <ConfirmDialog
        open
        onClose={onClose}
        onConfirm={onConfirm}
        title="Eliminar build"
        description="Esta acción no se puede deshacer."
        confirmLabel="Eliminar"
        cancelLabel="Cancelar"
        tone="danger"
      />,
    )

    await user.click(screen.getByRole('button', { name: 'Eliminar' }))
    await user.click(screen.getByRole('button', { name: 'Cancelar' }))

    expect(onConfirm).toHaveBeenCalledOnce()
    expect(onClose).toHaveBeenCalledOnce()
  })

  it('deshabilita las acciones mientras carga', () => {
    render(
      <ConfirmDialog
        open
        onClose={vi.fn()}
        onConfirm={vi.fn()}
        title="Eliminar"
        description="..."
        loading
      />,
    )

    expect(screen.getByRole('button', { name: 'Confirmar' })).toBeDisabled()
    expect(screen.getByRole('button', { name: 'Cancelar' })).toBeDisabled()
  })
})
