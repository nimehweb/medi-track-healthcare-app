import Link from 'next/link'
import { Button } from '@/components/ui/button'

export default function NotFound() {
  return (
    <main className="flex min-h-screen items-center justify-center px-6">
      <div className="text-center">
        <h1 className="text-5xl font-bold text-foreground mb-4">404</h1>
        <p className="text-xl text-muted-foreground mb-6">
          Page not found
        </p>
        <p className="text-muted-foreground mb-8">
          The page you&apos;re looking for doesn&apos;t exist.
        </p>
        <Link href="/dashboard">
          <Button className="bg-primary hover:bg-primary/90">
            Back to Dashboard
          </Button>
        </Link>
      </div>
    </main>
  )
}
