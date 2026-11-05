import { ErrorBoundary } from '@/components/ErrorBoundary'
import { ToastProvider } from '@/components/ui/Toast'
import { getApiConfigError } from '@/config'
import { ConfigurationErrorPage } from '@/pages/ConfigurationErrorPage'
import { AppRouter } from '@/routes/AppRouter'

export default function App() {
  const configError = getApiConfigError()

  return (
    <ErrorBoundary>
      <ToastProvider>
        {configError ? (
          <ConfigurationErrorPage message={configError} />
        ) : (
          <AppRouter />
        )}
      </ToastProvider>
    </ErrorBoundary>
  )
}
