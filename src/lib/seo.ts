import type { Metadata } from 'next'

const BASE = 'https://skilllink.no'

export function buildTaskerProfileMetadata(input: {
  id: string
  name: string
  category: string
  location: string
  bio: string
  avatarUrl?: string | null
}): Metadata {
  const title = `${input.name} — ${input.category} i ${input.location}`
  const description = (input.bio || `Book ${input.name} for ${input.category.toLowerCase()} i ${input.location} på SkillLink.`).slice(0, 155)

  const city = input.location.toLowerCase()
  const keywords = [
    `${input.name} ${input.location}`,
    `${input.category} ${input.location}`,
    `${input.category} Norge`,
    `SkillLink ${city}`,
    'lokal hjelp Norge',
  ]

  return {
    title,
    description,
    keywords,
    openGraph: {
      title: `${title} | SkillLink`,
      description,
      url: `${BASE}/taskers/${input.id}`,
      type: 'profile',
      locale: 'nb_NO',
      images: input.avatarUrl
        ? [{ url: input.avatarUrl, width: 400, height: 400, alt: input.name }]
        : [{ url: '/og-default.png', width: 1200, height: 630, alt: `${input.name} — SkillLink` }],
    },
  }
}
