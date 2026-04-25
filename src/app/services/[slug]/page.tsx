import { headers } from 'next/headers'
import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getService, SERVICES } from '@/lib/services'
import ServicePageContent from './ServicePageContent'
import JsonLd from '@/components/JsonLd'
import { resolveSeoLocale } from '@/lib/seo'

function getServiceLocaleCopy(locale: 'no' | 'da' | 'sv' | 'en') {
  switch (locale) {
    case 'no':
      return { countryName: 'Norge' }
    case 'da':
      return { countryName: 'Norge' }
    case 'sv':
      return { countryName: 'Norge' }
    default:
      return { countryName: 'Norway' }
  }
}

export function generateStaticParams() {
  return SERVICES.map(s => ({ slug: s.slug }))
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const svc = getService(slug)
  if (!svc) return {}
  const headerStore = await headers()
  const locale = resolveSeoLocale(headerStore.get('accept-language'))
  const localeOg = locale === 'no' ? 'nb_NO' : locale === 'da' ? 'da_DK' : locale === 'sv' ? 'sv_SE' : 'en_GB'

  const title =
    locale === 'no'
      ? `${svc.title} i Norge`
      : locale === 'da'
        ? `${svc.title} i Norge`
        : locale === 'sv'
          ? `${svc.title} i Norge`
          : `${svc.title} in Norway`
  const description =
    locale === 'en'
      ? `${svc.headline}. ${svc.subheadline} Book verified helpers from ${svc.priceMin} NOK.`
      : `${svc.headline}. ${svc.subheadline} Book verifiserte hjelpere fra ${svc.priceMin} NOK.`

  return {
    title,
    description,
    openGraph: {
      title: `${title} | Hire2Skill`,
      description,
      url: `https://hire2skill.com/services/${slug}`,
      locale: localeOg,
    },
  }
}

export default async function ServicePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const svc = getService(slug)
  if (!svc) notFound()
  const headerStore = await headers()
  const locale = resolveSeoLocale(headerStore.get('accept-language'))
  const copy = getServiceLocaleCopy(locale)

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
    areaServed: { '@type': 'Country', name: copy.countryName },
    serviceType: svc.category,
    provider: { '@type': 'Organization', name: 'Hire2Skill', url: 'https://hire2skill.com' },
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
