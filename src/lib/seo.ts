const BASE = 'https://hire2skill.com'

type SeoLocale = 'no' | 'da' | 'sv' | 'en'

const OG_LOCALE_BY_SEO_LOCALE: Record<SeoLocale, string> = {
  no: 'nb_NO',
  da: 'da_DK',
  sv: 'sv_SE',
  en: 'en_GB',
}

export function resolveSeoLocale(acceptLanguage: string | null): SeoLocale {
  if (!acceptLanguage) return 'no'
  const lower = acceptLanguage.toLowerCase()
  if (lower.includes('nb') || lower.includes('nn') || lower.includes('no')) return 'no'
  if (lower.includes('da')) return 'da'
  if (lower.includes('sv')) return 'sv'
  return 'en'
}

export function buildTaskerProfileMetadata(input: {
  id: string
  name: string
  category: string
  location: string
  bio: string
  avatarUrl?: string | null
  locale?: SeoLocale
}) {
  const locale = input.locale ?? 'no'
  const title =
    locale === 'en'
      ? `${input.name} - ${input.category} in ${input.location}`
      : `${input.name} - ${input.category} i ${input.location}`
  const fallbackDescription =
    locale === 'en'
      ? `Book ${input.name} for ${input.category.toLowerCase()} in ${input.location} on Hire2Skill.`
      : `Book ${input.name} for ${input.category.toLowerCase()} i ${input.location} pa Hire2Skill.`
  const description = (input.bio || fallbackDescription).slice(0, 155)

  const city = input.location.toLowerCase()
  const keywords = [
    `${input.name} ${input.location}`,
    `${input.category} ${input.location}`,
    `${input.category} Norge`,
    `Hire2Skill ${city}`,
    'lokal hjelp Norge',
  ]

  return {
    title,
    description,
    keywords,
    openGraph: {
      title: `${title} | Hire2Skill`,
      description,
      url: `${BASE}/taskers/${input.id}`,
      type: 'profile',
      locale: OG_LOCALE_BY_SEO_LOCALE[locale],
      images: input.avatarUrl
        ? [{ url: input.avatarUrl, width: 400, height: 400, alt: input.name }]
        : [{ url: '/og-default.png', width: 1200, height: 630, alt: `${input.name} — Hire2Skill` }],
    },
  }
}
