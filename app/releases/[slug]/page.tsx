import { notFound } from 'next/navigation'
import { getReleaseBySlug } from '@/lib/data'
import { ReleasePageClient } from './release-client'

interface ReleasePageProps {
  params: Promise<{ slug: string }>
}

export default async function ReleasePage({ params }: ReleasePageProps) {
  const { slug } = await params
  const release = getReleaseBySlug(slug)

  if (!release) {
    notFound()
  }

  return <ReleasePageClient release={release} />
}
