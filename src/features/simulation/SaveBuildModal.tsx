import { useEffect, useState, type FormEvent } from 'react'
import { api } from '@/api'
import { MAX_NOMBRE_BUILD } from '@/config'
import {
  Button,
  Modal,
  ProblemNotice,
  TextField,
} from '@/components/ui'
import type { Build, BuildSeleccion, Resolucion } from '@/types'
import { saveBuildErrorMessage } from './errors'

interface SaveBuildModalProps {
  seleccion: BuildSeleccion
  resolucion: Resolucion
  onClose: () => void
  onSaved: (build: Build) => void
}

export function SaveBuildModal({
  seleccion,
  resolucion,
  onClose,
  onSaved,
}: SaveBuildModalProps) {
  const [nombre, setNombre] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [existingNames, setExistingNames] = useState<string[]>([])

  useEffect(() => {
    let cancelled = false

    void api
      .listarBuilds()
      .then((builds) => {
        if (cancelled) return
        setExistingNames(
          builds.map((build) => build.nombre.trim().toLowerCase()),
        )
      })
      .catch(() => {
        // Si falla, solo se omite el aviso de nombre duplicado.
      })

    return () => {
      cancelled = true
    }
  }, [])

  const nombreLimpio = nombre.trim()
  const duplicado =
    nombreLimpio.length > 0 &&
    existingNames.includes(nombreLimpio.toLowerCase())

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (saving) return

    if (!nombreLimpio) {
      setError('Escribe un nombre para la build.')
      return
    }

    if (nombreLimpio.length > MAX_NOMBRE_BUILD) {
      setError(
        `El nombre no puede superar ${MAX_NOMBRE_BUILD} caracteres.`,
      )
      return
    }

    setSaving(true)
    setError(null)

    try {
      const build = await api.guardarBuild(
        nombreLimpio,
        seleccion,
        resolucion,
      )
      setSaving(false)
      onSaved(build)
    } catch (saveError) {
      setError(saveBuildErrorMessage(saveError))
      setSaving(false)
    }
  }

  return (
    <Modal
      open
      onClose={onClose}
      title="Guardar build"
      footer={
        <>
          <Button variant="ghost" onClick={onClose} disabled={saving}>
            Cancelar
          </Button>
          <Button
            type="submit"
            form="save-build-form"
            loading={saving}
          >
            Guardar
          </Button>
        </>
      }
    >
      <form
        id="save-build-form"
        className="space-y-4"
        onSubmit={handleSubmit}
        noValidate
      >
        <TextField
          label="Nombre"
          name="build-name"
          value={nombre}
          onChange={(event) => {
            setNombre(event.target.value)
            setError(null)
          }}
          error={error ?? undefined}
          hint={`${nombre.length}/${MAX_NOMBRE_BUILD}`}
          maxLength={MAX_NOMBRE_BUILD}
          autoComplete="off"
          spellCheck={false}
          placeholder="Mi PC soñado"
        />

        {duplicado && (
          <ProblemNotice tono="info" titulo="Nombre repetido">
            Ya tienes una build con este nombre. Puedes guardarla igualmente.
          </ProblemNotice>
        )}
      </form>
    </Modal>
  )
}
