import { useState } from 'react'
import {
  Button,
  Card,
  Modal,
  ProblemNotice,
  TextField,
} from '@/components/ui'

interface DeleteAccountCardProps {
  email: string
  onEliminar: () => Promise<void>
  onEliminada: () => void
}

export function DeleteAccountCard({
  email,
  onEliminar,
  onEliminada,
}: DeleteAccountCardProps) {
  const [open, setOpen] = useState(false)
  const [confirmacion, setConfirmacion] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [deleting, setDeleting] = useState(false)

  const coincide = email.length > 0 && confirmacion.trim() === email

  const abrir = () => {
    setConfirmacion('')
    setError(null)
    setOpen(true)
  }

  const cerrar = () => {
    if (deleting) return
    setOpen(false)
    setConfirmacion('')
    setError(null)
  }

  const handleEliminar = async () => {
    if (deleting || !coincide) return

    setDeleting(true)
    setError(null)

    try {
      await onEliminar()
    } catch {
      setError('No pudimos eliminar tu cuenta. Reintenta.')
      setDeleting(false)
      return
    }

    onEliminada()
  }

  return (
    <>
      <Card className="border-danger/40 bg-danger/[0.04] p-5">
        <h2 className="text-sm font-semibold text-danger">Eliminar cuenta</h2>
        <p className="mt-1 text-xs text-muted">
          Borra tu cuenta y los datos asociados. Esta acción no se puede
          deshacer.
        </p>
        <Button variant="danger" className="mt-4" onClick={abrir}>
          Eliminar cuenta
        </Button>
      </Card>

      <Modal
        open={open}
        onClose={cerrar}
        title="Eliminar cuenta"
        footer={
          <>
            <Button variant="ghost" onClick={cerrar} disabled={deleting}>
              Cancelar
            </Button>
            <Button
              variant="danger"
              onClick={() => void handleEliminar()}
              loading={deleting}
              disabled={!coincide}
            >
              Eliminar cuenta
            </Button>
          </>
        }
      >
        <p className="text-sm text-muted">
          Para confirmar, escribe tu correo{' '}
          <span className="font-mono text-ink">{email}</span>. Esta acción es
          permanente.
        </p>

        <TextField
          className="mt-4"
          label="Escribe tu correo para confirmar"
          name="confirm-account"
          type="email"
          autoComplete="off"
          spellCheck={false}
          value={confirmacion}
          onChange={(event) => {
            setConfirmacion(event.target.value)
            setError(null)
          }}
        />

        {error && (
          <div className="mt-4">
            <ProblemNotice
              tono="danger"
              titulo="No pudimos eliminar tu cuenta"
            >
              {error}
            </ProblemNotice>
          </div>
        )}
      </Modal>
    </>
  )
}
