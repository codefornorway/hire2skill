'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import { Search, X } from 'lucide-react'
import { SERVICES } from '@/lib/services'
import type { ElementType } from 'react'
import {
  AppWindow,
  Baby,
  Barbell,
  Bell,
  Broom,
  Camera,
  Car,
  ChalkboardTeacher,
  Confetti,
  CookingPot,
  Couch,
  Dog,
  Fan,
  FlowerTulip,
  HairDryer,
  Hammer,
  HandHeart,
  House,
  Ladder,
  Lamp,
  Lightning,
  MusicNotes,
  Needle,
  PaintBrushBroad,
  PaintRoller,
  Package,
  PawPrint,
  PersonSimpleRun,
  Pipe,
  ShoppingBag,
  Snowflake,
  Sparkle,
  SteeringWheel,
  Toolbox,
  Trash,
  Truck,
  TShirt,
  Wall,
  Wrench,
  Yarn,
} from '@phosphor-icons/react'
import { categoryIconProps } from '@/lib/category-icon'

const FILTERS: { label: string; categories: string[] }[] = [
  { label: 'All', categories: [] },
  {
    label: 'Home & Cleaning',
    categories: ['Cleaning', 'Window Cleaning', 'Snow Removal', 'Gardening'],
  },
  {
    label: 'Handyman',
    categories: ['Handyman', 'Furniture Assembly', 'Painting'],
  },
  {
    label: 'Moving',
    categories: ['Moving'],
  },
  {
    label: 'Tech',
    categories: ['IT & Tech'],
  },
  {
    label: 'Kids & Pets',
    categories: ['Tutoring', 'Driving Lessons', 'Kids Care', 'Elder Care', 'Pet Care', 'Dog Walking', 'Personal Training', 'Music Lessons'],
  },
  {
    label: 'Events & More',
    categories: ['Events', 'Photography', 'Cooking', 'Baking', 'Makeup Artist', 'Hair Dresser', 'Shopping', 'Delivery', 'Car Wash', 'Knitting', 'Sewing'],
  },
]

const SERVICE_ICON_BY_SLUG: Record<string, ElementType> = {
  cleaning: Broom,
  moving: Truck,
  tutoring: ChalkboardTeacher,
  handyman: Hammer,
  'furniture-assembly': Couch,
  gardening: FlowerTulip,
  'it-tech': AppWindow,
  events: Confetti,
  'pet-care': PawPrint,
  'dog-walking': Dog,
  'snow-removal': Snowflake,
  cooking: CookingPot,
  photography: Camera,
  'personal-training': PersonSimpleRun,
  'window-cleaning': AppWindow,
  painting: PaintRoller,
  'elder-care': HandHeart,
  'kids-care': Baby,
  'music-lessons': MusicNotes,
  shopping: ShoppingBag,
  delivery: Package,
  'makeup-artist': PaintBrushBroad,
  'hair-dresser': HairDryer,
  'car-wash': Car,
  knitting: Yarn,
  sewing: Needle,
  'tv-mounting': AppWindow,
  plumbing: Pipe,
  'electrical-help': Lightning,
  'drywall-repair': Wall,
  'flooring-tiling': House,
  'appliance-repair': Wrench,
  'ceiling-fan': Fan,
  'air-conditioning': Fan,
  'shelf-installation': Ladder,
  'blinds-installation': Lamp,
  'baby-proofing': Baby,
  'light-installation': Sparkle,
  carpentry: Toolbox,
  'cabinet-installation': Toolbox,
  'fence-repair': Wrench,
  'deck-restoration': House,
  'home-theater': AppWindow,
  'home-repairs': Wrench,
  'closet-organization': TShirt,
  'doorbell-installation': Bell,
  'home-maintenance': Wrench,
  'yard-work': FlowerTulip,
  packing: Package,
  'junk-removal': Trash,
  'furniture-rearranging': Couch,
  'heavy-lifting': Barbell,
  'single-item-moving': Truck,
  'spring-cleaning': Broom,
  'picture-hanging': PaintBrushBroad,
  'driving-lessons': SteeringWheel,
  baking: CookingPot,
  'wait-in-line': PersonSimpleRun,
}

export default function ServicesContent() {
  const [query, setQuery] = useState('')
  const [activeFilter, setActiveFilter] = useState('All')

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    const filter = FILTERS.find(f => f.label === activeFilter)!
    return SERVICES.filter(s => {
      const matchesCategory =
        filter.categories.length === 0 || filter.categories.includes(s.category)
      const matchesQuery =
        !q ||
        s.title.toLowerCase().includes(q) ||
        s.headline.toLowerCase().includes(q) ||
        s.subheadline.toLowerCase().includes(q) ||
        s.category.toLowerCase().includes(q) ||
        s.included.some(i => i.toLowerCase().includes(q))
      return matchesCategory && matchesQuery
    })
  }, [query, activeFilter])

  return (
    <div className="mx-auto max-w-6xl px-6 py-10">

      {/* Search bar */}
      <div className="relative max-w-xl mx-auto mb-8">
        <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
        <input
          type="text"
          value={query}
          onChange={e => setQuery(e.target.value)}
          placeholder="Search services — cleaning, plumbing, tutoring…"
          className="w-full rounded-2xl border border-gray-200 bg-white pl-11 pr-10 py-3.5 text-sm text-gray-900
                     focus:outline-none focus:border-blue-400 shadow-sm placeholder:text-gray-400"
        />
        {query && (
          <button onClick={() => setQuery('')}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
            <X size={16} />
          </button>
        )}
      </div>

      {/* Filter chips */}
      <div className="flex flex-wrap gap-2 justify-center mb-8">
        {FILTERS.map(f => (
          <button key={f.label}
            onClick={() => setActiveFilter(f.label)}
            className={`rounded-full px-4 py-2 text-sm font-semibold transition-colors ${
              activeFilter === f.label
                ? 'text-white shadow-sm'
                : 'bg-white border border-gray-200 text-gray-600 hover:border-blue-300 hover:text-blue-600'
            }`}
            style={activeFilter === f.label
              ? { background: 'linear-gradient(135deg,#1E3A8A,#38BDF8)' }
              : undefined}>
            {f.label}
          </button>
        ))}
      </div>

      {/* Result count */}
      {(query || activeFilter !== 'All') && (
        <p className="text-sm text-gray-400 text-center mb-6">
          {filtered.length === 0
            ? 'No services match your search'
            : `${filtered.length} service${filtered.length !== 1 ? 's' : ''} found`}
        </p>
      )}

      {/* Grid */}
      {filtered.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {filtered.map(s => (
            <Link key={s.slug} href={`/services/${s.slug}`}
              className="group bg-white rounded-2xl border border-gray-200 p-5 hover:border-blue-300 hover:shadow-lg
                         transition-all duration-200 flex flex-col items-start gap-3">
              {(() => {
                const Icon = SERVICE_ICON_BY_SLUG[s.slug]
                return (
                  <div className="h-12 w-12 rounded-xl flex items-center justify-center"
                    style={{ background: s.accentBg }}>
                    {Icon
                      ? <Icon {...categoryIconProps(22, s.accentColor)} />
                      : <span className="text-2xl">{s.emoji}</span>}
                  </div>
                )
              })()}
              <div className="flex-1">
                <p className="font-bold text-gray-900 text-sm group-hover:text-blue-600 transition-colors">{s.title}</p>
                <p className="text-xs text-gray-400 mt-0.5 line-clamp-2">
                  {s.subheadline.split('—')[0].trim()}
                </p>
              </div>
              <span className="mt-auto text-xs font-semibold text-blue-700">
                From {s.priceMin} NOK →
              </span>
            </Link>
          ))}
        </div>
      ) : (
        <div className="text-center py-16">
          <p className="text-4xl mb-4">🔍</p>
          <p className="font-bold text-gray-700 mb-2">No results for &quot;{query}&quot;</p>
          <p className="text-sm text-gray-400 mb-6">Try a different word, or browse all services.</p>
          <button onClick={() => { setQuery(''); setActiveFilter('All') }}
            className="rounded-xl px-6 py-2.5 text-sm font-bold text-white"
            style={{ background: 'linear-gradient(135deg,#1E3A8A,#38BDF8)' }}>
            Show all services
          </button>
        </div>
      )}
    </div>
  )
}
