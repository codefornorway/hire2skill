import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getService, SERVICES } from '@/lib/services'
import ServicePageContent from './ServicePageContent'
import JsonLd from '@/components/JsonLd'

export function generateStaticParams() {
  return SERVICES.map(s => ({ slug: s.slug }))
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params
  const svc = getService(slug)
  if (!svc) return {}
  return {
    title: `${svc.title} in Norway`,
    description: `${svc.headline}. ${svc.subheadline} Book verified helpers from ${svc.priceMin} NOK.`,
    openGraph: {
      title: `${svc.title} | SkillLink Norway`,
      description: svc.subheadline,
      url: `https://skilllink.no/services/${slug}`,
    },
  }
}

export default async function ServicePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const svc = getService(slug)
  if (!svc) notFound()

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: helpers } = await supabase
    .from('profiles')
    .select('id, display_name, bio, hourly_rate, categories, location, verified, tasks_done, avg_rating, rating, review_count, response_hours, avatar_url')
    .eq('role', 'helper')
    .contains('categories', [svc.category])
    .not('display_name', 'is', null)
    .order('tasks_done', { ascending: false })
    .limit(6)

  const serviceSchema = {
    '@context': 'https://schema.org',
    '@type': 'Service',
    name: svc.title,
    description: `${svc.headline}. ${svc.subheadline}`,
    areaServed: { '@type': 'Country', name: 'Norway' },
    serviceType: svc.category,
    provider: { '@type': 'Organization', name: 'SkillLink', url: 'https://skilllink.no' },
    offers: {
      '@type': 'AggregateOffer',
      priceCurrency: 'NOK',
      lowPrice: svc.priceMin,
      highPrice: svc.priceMax,
    },
  }

  return (
    <>
      <JsonLd data={serviceSchema} />
      <ServicePageContent
        svc={svc}
        helpers={(helpers ?? []).map(h => ({ ...h, rating: h.avg_rating ?? h.rating ?? 0 }))}
        isLoggedIn={!!user}
      />
    </>
  )
}
