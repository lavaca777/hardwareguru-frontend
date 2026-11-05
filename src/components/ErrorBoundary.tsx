import { Component, type ErrorInfo, type ReactNode } from 'react'
import { Button } from './ui/Button'

interface ErrorBoundaryProps {
  children: ReactNode
  fallback?: ReactNode
}

interface ErrorBoundaryState {
  hasError: boolean
}

export class ErrorBoundary extends Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  state: ErrorBoundaryState = { hasError: false }

  static getDerivedStateFromError(): ErrorBoundaryState {
    return { hasError: true }
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    if (import.meta.env.DEV) console.error(error, info)
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback ?? <ErrorBoundaryFallback />
    }

    return this.props.children
  }
}

function ErrorBoundaryFallback() {
  return (
    <div className="grid min-h-screen place-items-center bg-bg p-6">
      <div className="w-full max-w-md rounded-xl border border-danger/40 bg-danger/10 p-6">
        <h1 className="text-lg font-semibold text-ink">Algo salió mal</h1>
        <p className="mt-2 text-sm text-muted">
          Recarga la página para volver a intentarlo.
        </p>
        <Button className="mt-4" onClick={() => window.location.reload()}>
          Recargar
        </Button>
      </div>
    </div>
  )
}
