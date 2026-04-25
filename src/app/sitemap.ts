import { createClient } from '@/lib/supabase/server'
import { SERVICES } from '@/lib/services'

const BASE = 'https://hire2skill.com'

export default async function sitemap() {
  const supabase = await createClient()

  const { data: helpers } = await supabase
    .from('profiles')
    .select('id, updated_at')
    .eq('role', 'helper')
    .not('display_name', 'is', null)

  const staticRoutes = [
    { url: BASE, priority: 1.0, changeFrequency: 'daily' as const },
    { url: `${BASE}/taskers`, priority: 0.9, changeFrequency: 'daily' as const },
    { url: `${BASE}/services`, priority: 0.9, changeFrequency: 'weekly' as const },
    { url: `${BASE}/about`, priority: 0.5, changeFrequency: 'monthly' as const },
    { url: `${BASE}/contact`, priority: 0.5, changeFrequency: 'monthly' as const },
    { url: `${BASE}/personvern`, priority: 0.35, changeFrequency: 'yearly' as const },
    { url: `${BASE}/vilkar`, priority: 0.35, changeFrequency: 'yearly' as const },
    { url: `${BASE}/privacy`, priority: 0.3, changeFrequency: 'yearly' as const },
    { url: `${BASE}/terms`, priority: 0.3, changeFrequency: 'yearly' as const },
    { url: `${BASE}/signup`, priority: 0.6, changeFrequency: 'monthly' as const },
    { url: `${BASE}/login`, priority: 0.4, changeFrequency: 'monthly' as const },
  ]

  const serviceRoutes = SERVICES.map(s => ({
    url: `${BASE}/services/${s.slug}`,
    lastModified: new Date(),
    priority: 0.85,
    changeFrequency: 'monthly' as const,
  }))

  const helperRoutes = (helpers ?? []).map(h => ({
    url: `${BASE}/taskers/${h.id}`,
    lastModified: h.updated_at ? new Date(h.updated_at) : new Date(),
    priority: 0.8,
    changeFrequency: 'weekly' as const,
  }))

  return [
    ...staticRoutes.map(r => ({ ...r, lastModified: new Date() })),
    ...serviceRoutes,
    ...helperRoutes,
  ]
}
