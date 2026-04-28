'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import { Search, X } from 'lucide-react'
import { useSearchParams } from 'next/navigation'
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
import { UI_TOKENS } from '@/lib/ui/tokens'

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

const GROUP_TO_FILTER_LABEL: Record<string, string> = {
  home: 'Home & Cleaning',
  outdoor: 'Home & Cleaning',
  care: 'Kids & Pets',
  learning: 'Kids & Pets',
  creative: 'Events & More',
  more: 'Events & More',
  handyman: 'Handyman',
  moving: 'Moving',
  tech: 'Tech',
}

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
  const searchParams = useSearchParams()
  const initialGroup = searchParams.get('group')?.toLowerCase() ?? ''
  const initialQuery = searchParams.get('q') ?? ''
  const initialFilter = GROUP_TO_FILTER_LABEL[initialGroup] ?? 'All'
  const [query, setQuery] = useState(initialQuery)
  const [activeFilter, setActiveFilter] = useState(initialFilter)

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

  const activeFilterChips = useMemo(() => {
    const chips: Array<{ key: 'query' | 'group'; label: string }> = []
    if (query.trim()) chips.push({ key: 'query', label: `Search: ${query.trim()}` })
    if (activeFilter !== 'All') chips.push({ key: 'group', label: `Group: ${activeFilter}` })
    return chips
  }, [query, activeFilter])

  function removeFilterChip(key: 'query' | 'group') {
    if (key === 'query') {
      setQuery('')
      return
    }
    setActiveFilter('All')
  }

  function clearAllFilters() {
    setQuery('')
    setActiveFilter('All')
  }

  return (
    <div className="mx-auto max-w-6xl px-4 sm:px-6 py-4 sm:py-6">

      {/* Search + categories — highlighted panel */}
      <div className={`mb-4 p-3 sm:p-4 ${UI_TOKENS.panel}`}>
        <div className="relative max-w-2xl mx-auto mb-3">
          <Search size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-blue-500 pointer-events-none" strokeWidth={2.25} />
          <input
            type="text"
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Search services — cleaning, plumbing, tutoring…"
            className={`w-full pl-12 pr-11 text-base text-gray-900 placeholder:text-gray-400 ${UI_TOKENS.input}`}
          />
          {query && (
            <button type="button" onClick={() => setQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 rounded-lg p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600">
              <X size={18} />
            </button>
          )}
        </div>

        <div className="flex flex-wrap gap-2 justify-center">
          {FILTERS.map(f => (
            <button key={f.label} type="button"
              onClick={() => setActiveFilter(f.label)}
              className={`rounded-full px-3.5 py-2 sm:px-4 sm:py-2 text-xs sm:text-sm font-bold transition-all ${
                activeFilter === f.label
                  ? 'text-white shadow-md scale-[1.02] ring-2 ring-blue-300/60 ring-offset-1 ring-offset-white'
                  : 'bg-white border-2 border-gray-200/90 text-gray-700 shadow-sm hover:border-blue-400 hover:text-blue-700 hover:shadow'
              }`}
              style={activeFilter === f.label
                ? { background: 'linear-gradient(135deg,#1E3A8A,#38BDF8)' }
                : undefined}>
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {activeFilterChips.length > 0 && (
        <div className={`${UI_TOKENS.panel} mb-5 flex flex-wrap items-center gap-2 rounded-xl p-2.5`}>
          {activeFilterChips.map(chip => (
            <button key={chip.key} type="button" onClick={() => removeFilterChip(chip.key)} className={UI_TOKENS.chipButton}>
              <span>{chip.label}</span>
              <span>×</span>
            </button>
          ))}
          <button type="button" onClick={clearAllFilters} className={`ml-auto ${UI_TOKENS.clearAllLink}`}>
            Clear all
          </button>
        </div>
      )}

      {/* Result count */}
      {(query || activeFilter !== 'All') && (
        <p className="text-sm text-gray-400 text-center mb-6">
          {filtered.length === 0
            ? 'No services match your search'
            : `${filtered.length} service${filtered.length !== 1 ? 's' : ''} found`}
        </p>
      )}

      {/* Grid — compact tiles */}
      {filtered.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2 sm:gap-3">
          {filtered.map(s => (
            <Link key={s.slug} href={`/services/${s.slug}`}
              className="group bg-white rounded-xl border border-gray-200 p-3 sm:p-3.5 hover:border-blue-300 hover:shadow-md
                         transition-all duration-200 flex flex-col items-start gap-2 min-h-0">
              {(() => {
                const Icon = SERVICE_ICON_BY_SLUG[s.slug]
                return (
                  <div className="h-9 w-9 sm:h-10 sm:w-10 rounded-lg flex items-center justify-center shrink-0"
                    style={{ background: s.accentBg }}>
                    {Icon
                      ? <Icon {...categoryIconProps(18, s.accentColor)} />
                      : <span className="text-lg sm:text-xl leading-none">{s.emoji}</span>}
                  </div>
                )
              })()}
              <div className="flex-1 min-w-0 w-full">
                <p className="font-bold text-gray-900 text-xs sm:text-sm leading-snug group-hover:text-blue-600 transition-colors line-clamp-2">
                  {s.title}
                </p>
                <p className="text-[10px] sm:text-[11px] text-gray-400 mt-0.5 line-clamp-2 leading-snug">
                  {s.subheadline.split('—')[0].trim()}
                </p>
              </div>
              <span className="mt-auto text-[10px] sm:text-xs font-semibold text-blue-700">
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
