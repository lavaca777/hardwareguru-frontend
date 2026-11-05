import { PageHeader } from './PageHeader'
import { Card } from './ui/Card'

interface PlaceholderPageProps {
  title: string
  description: string
}

export function PlaceholderPage({ title, description }: PlaceholderPageProps) {
  return (
    <section>
      <PageHeader title={title} description={description} />
      <Card className="p-6">
        <p className="font-mono text-xs text-copper">En construcción</p>
        <p className="mt-2 text-sm text-muted">
          Esta vista se implementa en la siguiente fase del roadmap.
        </p>
      </Card>
    </section>
  )
}
