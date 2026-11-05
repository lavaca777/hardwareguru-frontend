interface ConfigurationErrorPageProps {
  message: string
}

export function ConfigurationErrorPage({
  message,
}: ConfigurationErrorPageProps) {
  return (
    <main className="grid min-h-screen place-items-center bg-bg p-6">
      <div className="w-full max-w-lg rounded-xl border border-danger/40 bg-danger/10 p-6">
        <h1 className="text-lg font-semibold text-ink">
          Configuración incompleta
        </h1>
        <p className="mt-2 text-sm text-muted">{message}</p>
        <p className="mt-2 text-sm text-muted">
          Crea un archivo <code>.env</code> a partir de <code>.env.example</code>.
        </p>
      </div>
    </main>
  )
}
