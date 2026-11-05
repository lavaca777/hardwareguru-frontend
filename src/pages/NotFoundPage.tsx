import { Link } from 'react-router'
import { PageHeader } from '@/components/PageHeader'
import { Card } from '@/components/ui/Card'

export function NotFoundPage() {
  return (
    <section>
      <PageHeader
        title="404"
        description="La página que buscas no existe."
      />
      <Card className="p-6">
        <Link
          to="/"
          className="inline-flex h-10 items-center rounded-lg border border-copper bg-copper px-4 text-sm font-medium text-[#1a100b] hover:bg-[#e39465]"
        >
          Volver al Dashboard
        </Link>
      </Card>
    </section>
  )
}
