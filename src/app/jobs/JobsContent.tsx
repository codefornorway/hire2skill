'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useRouter, useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { CATEGORY_BY_KEY, toCategoryKey } from '@/lib/categories'
import { useLanguage } from '@/context/LanguageContext'
import { UI_TOKENS } from '@/lib/ui/tokens'
import { postNotify } from '@/lib/client-notify'

export type PublicJob = {
  id: string
  posterId: string
  posterName: string
  title: string
  description: string
  category: string
  location: string
  budget: number | null
  createdAt: string
  proposalCount: number
}

const JOB_IMAGE_BY_CATEGORY: Record<string, string> = {
  cleaning: '/home/cleaning-apartment-modern-1.png',
  windowcleaning: '/home/window-cleaning-real-life-1.png',
  glasscleaning: '/home/window-cleaning-real-life-3.png',
  storefrontcleaning: '/home/window-cleaning-real-life-5.png',
  exteriorwindowcleaning: '/home/window-cleaning-real-life-7.png',
  springcleaning: '/home/cleaning-apartment-modern-4.png',
  homecleaning: '/home/cleaning-apartment-modern-5.png',
  moving: '/home/moving-furniture-apartment-1.png',
  handyman: '/home/handyman-real-life-1.png',
  furnitureassembly: '/home/furniture-assembly-real-life-1.png',
  ikeaassembly: '/home/furniture-assembly-real-life-3.png',
  shelfassembly: '/home/furniture-assembly-real-life-4.png',
  bedassembly: '/home/furniture-assembly-real-life-2.png',
  deskassembly: '/home/furniture-assembly-real-life-5.png',
  painting: '/home/painting-real-life-1.png',
  wallpainting: '/home/painting-real-life-3.png',
  interiorpainting: '/home/painting-real-life-6.png',
  plumbing: '/home/handyman-real-life-4.png',
  electricalhelp: '/home/handyman-real-life-5.png',
  homerepairs: '/home/handyman-real-life-6.png',
  heavylifting: '/home/moving-furniture-apartment-5.png',
  singleitemmoving: '/home/moving-furniture-apartment-6.png',
  packing: '/home/moving-furniture-apartment-3.png',
  tutoring: '/home/tutoring-home-1.png',
  drivinglessons: '/home/driving-lessons-real-life-1.png',
  drivinginstructor: '/home/driving-lessons-real-life-2.png',
  licenseprep: '/home/driving-lessons-real-life-5.png',
  musiclessons: '/home/music-lessons-real-life-1.png',
  guitarlessons: '/home/music-lessons-real-life-4.png',
  pianolessons: '/home/music-lessons-real-life-2.png',
  violinlessons: '/home/music-lessons-real-life-3.png',
  flutelessons: '/home/music-lessons-real-life-7.png',
  kidscare: '/home/child-care-real-life-1.png',
  childcare: '/home/child-care-real-life-2.png',
  babysitting: '/home/child-care-real-life-3.png',
  nanny: '/home/child-care-real-life-4.png',
  daycare: '/home/child-care-real-life-5.png',
  ittech: '/home/it-tech-real-life-1.png',
  techsupport: '/home/it-tech-real-life-2.png',
  computersetup: '/home/it-tech-real-life-3.png',
  computerrepair: '/home/it-tech-real-life-1.png',
  laptoprepair: '/home/it-tech-real-life-2.png',
  pcrepair: '/home/it-tech-real-life-3.png',
  devicerepair: '/home/it-tech-real-life-4.png',
  datarecovery: '/home/it-tech-real-life-5.png',
  networksetup: '/home/it-tech-real-life-4.png',
  wifisetup: '/home/it-tech-real-life-5.png',
  eldercare: '/home/elder-care-real-life-1.png',
  seniorcare: '/home/elder-care-real-life-2.png',
  homecare: '/home/elder-care-real-life-5.png',
  companionship: '/home/elder-care-real-life-8.png',
  petcare: '/home/petcare-real-life-1.png',
  dogwalking: '/home/dog-walking-real-life-1.png',
  dogwalker: '/home/dog-walking-real-life-2.png',
  petwalking: '/home/dog-walking-real-life-4.png',
  eldersittingpets: '/home/petcare-real-life-2.png',
  events: '/home/events-real-life-1.png',
  eventplanning: '/home/events-real-life-2.png',
  eventdecor: '/home/events-real-life-3.png',
  partydecor: '/home/events-real-life-4.png',
  balloondecor: '/home/events-real-life-6.png',
  weddingsetup: '/home/events-real-life-5.png',
  birthdaysetup: '/home/events-real-life-6.png',
  cooking: '/home/cooking-real-life-1.png',
  baking: '/home/baking-real-life-1.png',
  cakedecorating: '/home/baking-real-life-4.png',
  pastry: '/home/baking-real-life-5.png',
  cupcakedecorating: '/home/baking-real-life-6.png',
  mealprep: '/home/cooking-real-life-5.png',
  gardening: '/home/gardening-real-life-1.png',
  yardwork: '/home/gardening-real-life-3.png',
  lawnmowing: '/home/gardening-real-life-4.png',
  planting: '/home/gardening-real-life-2.png',
  weeding: '/home/gardening-real-life-8.png',
  delivery: '/home/delivery-real-life-1.png',
  shopping: '/home/shopping-real-life-1.png',
  groceryshopping: '/home/shopping-real-life-2.png',
  grocerydelivery: '/home/shopping-real-life-4.png',
  waitinline: '/home/delivery-real-life-5.png',
  errands: '/home/shopping-real-life-3.png',
  photography: '/home/photography-real-life-1.png',
  eventphotography: '/home/photography-real-life-2.png',
  portraitphotography: '/home/photography-real-life-3.png',
  videography: '/home/photography-real-life-5.png',
  personaltraining: '/home/personal-training-real-life-1.png',
  personaltrainer: '/home/personal-training-real-life-3.png',
  fitnesscoaching: '/home/personal-training-real-life-5.png',
  workoutcoach: '/home/personal-training-real-life-7.png',
  sewing: '/home/sewing-real-life-1.png',
  tailoring: '/home/sewing-real-life-2.png',
  alterations: '/home/sewing-real-life-4.png',
  dressmaking: '/home/sewing-real-life-5.png',
  knitting: '/home/knitting-real-life-2.png',
  crochet: '/home/knitting-real-life-3.png',
  yarncraft: '/home/knitting-real-life-5.png',
  carwash: '/home/carwash-real-life-1.png',
  cardetailing: '/home/carwash-real-life-3.png',
  carcleaning: '/home/carwash-real-life-6.png',
  makeup: '/home/makeup-real-life-1.png',
  makeupartist: '/home/makeup-real-life-2.png',
  bridalmakeup: '/home/makeup-real-life-3.png',
  hairstyling: '/home/hairdresser-real-life-2.png',
  hairdresser: '/home/hairdresser-real-life-1.png',
  haircut: '/home/hairdresser-real-life-7.png',
  snowremoval: '/home/snow-removal-real-life-1.png',
  snowplowing: '/home/snow-removal-real-life-2.png',
  snowshoveling: '/home/snow-removal-real-life-4.png',
  deicing: '/home/snow-removal-real-life-6.png',
}

function getJobImageForCategory(category: string) {
  const key = toCategoryKey(category)
  if (JOB_IMAGE_BY_CATEGORY[key]) return JOB_IMAGE_BY_CATEGORY[key]
  if (key.includes('child') || key.includes('kid') || key.includes('baby') || key.includes('babysit') || key.includes('nanny') || key.includes('daycare') || key.includes('toddler')) return JOB_IMAGE_BY_CATEGORY.childcare
  if (key.includes('it') || key.includes('tech') || key.includes('computer') || key.includes('laptop') || key.includes('desktop') || key.includes('pc') || key.includes('software') || key.includes('hardware') || key.includes('wifi') || key.includes('network') || key.includes('router') || key.includes('printer') || key.includes('server') || key.includes('cyber') || key.includes('datarecovery')) return JOB_IMAGE_BY_CATEGORY.ittech
  if (key.includes('elder') || key.includes('senior') || key.includes('aged') || key.includes('homecare') || key.includes('caregiver') || key.includes('companionship')) return JOB_IMAGE_BY_CATEGORY.eldercare
  if (key.includes('dog') || key.includes('walk')) return JOB_IMAGE_BY_CATEGORY.dogwalking
  if (key.includes('pet') || key.includes('cat')) return JOB_IMAGE_BY_CATEGORY.petcare
  if (key.includes('window') || key.includes('glass') || key.includes('storefront') || key.includes('squeegee')) return JOB_IMAGE_BY_CATEGORY.windowcleaning
  if (key.includes('photo') || key.includes('camera') || key.includes('videography') || key.includes('videographer') || key.includes('portrait')) return JOB_IMAGE_BY_CATEGORY.photography
  if (key.includes('trainer') || key.includes('training') || key.includes('fitness') || key.includes('workout') || key.includes('gym') || key.includes('coach')) return JOB_IMAGE_BY_CATEGORY.personaltraining
  if (key.includes('driv') || key.includes('license') || key.includes('roadtest') || key.includes('road test') || key.includes('instructor')) return JOB_IMAGE_BY_CATEGORY.drivinglessons
  if (key.includes('event') || key.includes('party') || key.includes('wedding') || key.includes('birthday') || key.includes('decor') || key.includes('decoration') || key.includes('balloon') || key.includes('venue')) return JOB_IMAGE_BY_CATEGORY.events
  if (key.includes('baking') || key.includes('cake') || key.includes('pastry') || key.includes('cupcake') || key.includes('dessert')) return JOB_IMAGE_BY_CATEGORY.baking
  if (key.includes('cook') || key.includes('meal') || key.includes('chef')) return JOB_IMAGE_BY_CATEGORY.cooking
  if (key.includes('sew') || key.includes('tailor') || key.includes('alteration') || key.includes('dressmaking') || key.includes('stitch')) return JOB_IMAGE_BY_CATEGORY.sewing
  if (key.includes('knit') || key.includes('crochet') || key.includes('yarn') || key.includes('needlework')) return JOB_IMAGE_BY_CATEGORY.knitting
  if (key.includes('music') || key.includes('guitar') || key.includes('piano') || key.includes('violin') || key.includes('flute') || key.includes('instrument')) return JOB_IMAGE_BY_CATEGORY.musiclessons
  if (key.includes('tutor') || key.includes('lesson') || key.includes('study')) return JOB_IMAGE_BY_CATEGORY.tutoring
  if (key.includes('garden') || key.includes('yard') || key.includes('lawn') || key.includes('plant') || key.includes('weed')) return JOB_IMAGE_BY_CATEGORY.gardening
  if (key.includes('paint') || key.includes('wallpaint') || key.includes('interiorpaint')) return JOB_IMAGE_BY_CATEGORY.painting
  if (key.includes('furniture') || key.includes('assemble') || key.includes('assembly') || key.includes('ikea') || key.includes('flatpack')) return JOB_IMAGE_BY_CATEGORY.furnitureassembly
  if (key.includes('handyman') || key.includes('repair') || key.includes('plumb') || key.includes('electric')) return JOB_IMAGE_BY_CATEGORY.handyman
  if (key.includes('move')) return JOB_IMAGE_BY_CATEGORY.moving
  if (key.includes('delivery') || key.includes('ship') || key.includes('parcel') || key.includes('package')) return JOB_IMAGE_BY_CATEGORY.delivery
  if (key.includes('shop') || key.includes('grocery') || key.includes('errand') || key.includes('market')) return JOB_IMAGE_BY_CATEGORY.shopping
  if (key.includes('carwash') || key.includes('car-wash') || key.includes('detail') || key.includes('vehiclewash') || key.includes('autowash')) return JOB_IMAGE_BY_CATEGORY.carwash
  if (key.includes('makeup') || key.includes('beauty') || key.includes('bridal')) return JOB_IMAGE_BY_CATEGORY.makeupartist
  if (key.includes('hairdresser') || key.includes('hairstyle') || key.includes('haircut') || key.includes('salon') || key.includes('barber')) return JOB_IMAGE_BY_CATEGORY.hairdresser
  if (key.includes('snow') || key.includes('ice') || key.includes('deice') || key.includes('plow') || key.includes('shovel') || key.includes('winter')) return JOB_IMAGE_BY_CATEGORY.snowremoval
  return '/home/cleaning-apartment-modern-2.png'
}

function getJobsUi(locale: 'no' | 'en' | 'da' | 'sv') {
  if (locale === 'no') {
    return {
      pageTitle: 'Finn jobber',
      pageSubtitle: 'Bla gjennom kundeannonser og send forslag med pris.',
      searchPlaceholder: 'Søk på tittel, kategori, sted',
      modalTitle: 'Send forslag',
      proposalPlaceholder: 'Skriv kort hvorfor du passer og når du kan starte…',
      offerPlaceholder: 'Din foreslåtte pris (NOK)',
      cancel: 'Avbryt',
      sendProposal: 'Send forslag',
      sending: 'Sender…',
      emptySearch: 'Ingen åpne jobber matcher søket ditt.',
      postNew: 'Legg ut ny jobb',
      noDetails: 'Ingen flere detaljer oppgitt.',
      detailsInChat: 'Detaljer avklares i chat.',
      helpNeeded: 'hjelp ønskes',
      by: 'av',
      budgetLabel: (v: number) => `${v} NOK budsjett`,
      budgetNegotiable: 'Budsjett kan forhandles',
      errProposalRequired: 'Skriv en kort forslagstekst.',
      errAlreadyPending: 'Du har allerede sendt et ventende forslag på denne jobben.',
      errOwnPost: 'Du kan ikke sende forslag på din egen jobb.',
      errSendFailed: 'Kunne ikke sende forslag.',
      proposalsLabel: (n: number) => (n === 1 ? '1 forslag' : `${n} forslag`),
      allCategoryLabel: 'Alle kategorier',
      allQuick: 'Alle',
      filtersTitle: 'Filtre',
      clearAll: 'Nullstill',
      categories: 'Kategorier',
      budgetNok: 'Budsjett (NOK)',
      min: 'Min',
      max: 'Maks',
      jobType: 'Jobbtype',
      all: 'Alle',
      oneTime: 'Engangsjobb',
      recurring: 'Gjentakende',
      longTerm: 'Langsiktig',
      sortBy: 'Sorter etter',
      newestFirst: 'Nyeste først',
      budgetHighLow: 'Budsjett høy-lav',
      budgetLowHigh: 'Budsjett lav-høy',
      mostProposals: 'Flest forslag',
      applyFilters: 'Bruk filtre',
      searchButton: 'Søk',
      saveSearch: 'Lagre søk',
      grid: 'Rutenett',
      list: 'Liste',
      map: 'Kart',
      jobsFound: (n: number) => `${n} jobber funnet`,
      newTag: 'Ny',
      urgentTag: 'Haster',
      viewJob: 'Se jobb',
      searchChip: 'Søk',
      locationChip: 'Sted',
      categoryChip: 'Kategori',
      minChip: 'Min budsjett',
      maxChip: 'Maks budsjett',
      typeChip: 'Type',
      sortChip: 'Sortering',
    }
  }
  if (locale === 'da') {
    return {
      pageTitle: 'Find job',
      pageSubtitle: 'Gennemse kundeopslag og send dit forslag med pris.',
      searchPlaceholder: 'Søg efter titel, kategori, sted',
      modalTitle: 'Send forslag',
      proposalPlaceholder: 'Skriv kort hvorfor du passer, og hvornår du kan starte…',
      offerPlaceholder: 'Din tilbudspris (NOK)',
      cancel: 'Annuller',
      sendProposal: 'Send forslag',
      sending: 'Sender…',
      emptySearch: 'Ingen åbne job matcher din søgning.',
      postNew: 'Opret nyt job',
      noDetails: 'Ingen ekstra detaljer angivet.',
      detailsInChat: 'Detaljer aftales i chatten.',
      helpNeeded: 'hjælp søges',
      by: 'af',
      budgetLabel: (v: number) => `${v} NOK budget`,
      budgetNegotiable: 'Budget kan forhandles',
      errProposalRequired: 'Skriv en kort forslagstekst.',
      errAlreadyPending: 'Du har allerede sendt et afventende forslag til dette job.',
      errOwnPost: 'Du kan ikke sende forslag til dit eget job.',
      errSendFailed: 'Kunne ikke sende forslag.',
      proposalsLabel: (n: number) => (n === 1 ? '1 forslag' : `${n} forslag`),
      allCategoryLabel: 'Alle kategorier',
      allQuick: 'Alle',
      filtersTitle: 'Filtre',
      clearAll: 'Ryd alle',
      categories: 'Kategorier',
      budgetNok: 'Budget (NOK)',
      min: 'Min',
      max: 'Maks',
      jobType: 'Jobtype',
      all: 'Alle',
      oneTime: 'Engangsjob',
      recurring: 'Tilbagevendende',
      longTerm: 'Langsigtet',
      sortBy: 'Sortér efter',
      newestFirst: 'Nyeste først',
      budgetHighLow: 'Budget høj-lav',
      budgetLowHigh: 'Budget lav-høj',
      mostProposals: 'Flest forslag',
      applyFilters: 'Anvend filtre',
      searchButton: 'Søg',
      saveSearch: 'Gem søgning',
      grid: 'Gitter',
      list: 'Liste',
      map: 'Kort',
      jobsFound: (n: number) => `${n} job fundet`,
      newTag: 'Ny',
      urgentTag: 'Haster',
      viewJob: 'Se job',
      searchChip: 'Søg',
      locationChip: 'Lokation',
      categoryChip: 'Kategori',
      minChip: 'Min budget',
      maxChip: 'Maks budget',
      typeChip: 'Type',
      sortChip: 'Sortering',
    }
  }
  if (locale === 'sv') {
    return {
      pageTitle: 'Hitta jobb',
      pageSubtitle: 'Bläddra bland kundannonser och skicka ditt förslag med pris.',
      searchPlaceholder: 'Sök på titel, kategori, plats',
      modalTitle: 'Skicka förslag',
      proposalPlaceholder: 'Skriv kort varför du passar och när du kan börja…',
      offerPlaceholder: 'Ditt prisförslag (NOK)',
      cancel: 'Avbryt',
      sendProposal: 'Skicka förslag',
      sending: 'Skickar…',
      emptySearch: 'Inga öppna jobb matchar din sökning.',
      postNew: 'Lägg upp nytt jobb',
      noDetails: 'Inga fler detaljer angivna.',
      detailsInChat: 'Detaljer bekräftas i chatten.',
      helpNeeded: 'hjälp sökes',
      by: 'av',
      budgetLabel: (v: number) => `${v} NOK budget`,
      budgetNegotiable: 'Budget kan förhandlas',
      errProposalRequired: 'Skriv en kort förslagstext.',
      errAlreadyPending: 'Du har redan skickat ett väntande förslag för detta jobb.',
      errOwnPost: 'Du kan inte skicka förslag på ditt eget jobb.',
      errSendFailed: 'Kunde inte skicka förslag.',
      proposalsLabel: (n: number) => (n === 1 ? '1 förslag' : `${n} förslag`),
      allCategoryLabel: 'Alla kategorier',
      allQuick: 'Alla',
      filtersTitle: 'Filter',
      clearAll: 'Rensa alla',
      categories: 'Kategorier',
      budgetNok: 'Budget (NOK)',
      min: 'Min',
      max: 'Max',
      jobType: 'Jobbtyp',
      all: 'Alla',
      oneTime: 'Engångsjobb',
      recurring: 'Återkommande',
      longTerm: 'Långsiktigt',
      sortBy: 'Sortera efter',
      newestFirst: 'Nyaste först',
      budgetHighLow: 'Budget hög-låg',
      budgetLowHigh: 'Budget låg-hög',
      mostProposals: 'Flest förslag',
      applyFilters: 'Använd filter',
      searchButton: 'Sök',
      saveSearch: 'Spara sökning',
      grid: 'Rutnät',
      list: 'Lista',
      map: 'Karta',
      jobsFound: (n: number) => `${n} jobb hittade`,
      newTag: 'Ny',
      urgentTag: 'Brådskande',
      viewJob: 'Visa jobb',
      searchChip: 'Sök',
      locationChip: 'Plats',
      categoryChip: 'Kategori',
      minChip: 'Min budget',
      maxChip: 'Max budget',
      typeChip: 'Typ',
      sortChip: 'Sortering',
    }
  }
  return {
    pageTitle: 'Find Jobs',
    pageSubtitle: 'Browse customer posts and send your proposal with price.',
    searchPlaceholder: 'Search by title, category, location',
    modalTitle: 'Send proposal',
    proposalPlaceholder: 'Write why you are a good fit and when you can start…',
    offerPlaceholder: 'Your offered price (NOK)',
    cancel: 'Cancel',
    sendProposal: 'Send proposal',
    sending: 'Sending…',
    emptySearch: 'No open jobs match your search.',
    postNew: 'Post a new job',
    noDetails: 'No additional details provided.',
    detailsInChat: 'Task details will be confirmed in chat.',
    helpNeeded: 'help needed',
    by: 'by',
    budgetLabel: (v: number) => `${v} NOK budget`,
    budgetNegotiable: 'Budget negotiable',
    errProposalRequired: 'Please write a short proposal message.',
    errAlreadyPending: 'You already sent a pending proposal for this job.',
    errOwnPost: 'You cannot send a proposal to your own job.',
    errSendFailed: 'Could not send proposal.',
    proposalsLabel: (n: number) => (n === 1 ? '1 proposal' : `${n} proposals`),
    allCategoryLabel: 'All Categories',
    allQuick: 'All',
    filtersTitle: 'Filters',
    clearAll: 'Clear all',
    categories: 'Categories',
    budgetNok: 'Budget (NOK)',
    min: 'Min',
    max: 'Max',
    jobType: 'Job Type',
    all: 'All',
    oneTime: 'One-time job',
    recurring: 'Recurring',
    longTerm: 'Long-term',
    sortBy: 'Sort by',
    newestFirst: 'Newest first',
    budgetHighLow: 'Budget high-low',
    budgetLowHigh: 'Budget low-high',
    mostProposals: 'Most proposals',
    applyFilters: 'Apply Filters',
    searchButton: 'Search',
    saveSearch: 'Save search',
    grid: 'Grid',
    list: 'List',
    map: 'Map',
    jobsFound: (n: number) => `${n} jobs found`,
    newTag: 'New',
    urgentTag: 'Urgent',
    viewJob: 'View job',
    searchChip: 'Search',
    locationChip: 'Location',
    categoryChip: 'Category',
    minChip: 'Min budget',
    maxChip: 'Max budget',
    typeChip: 'Type',
    sortChip: 'Sort',
  }
}

export default function JobsContent({
  jobs,
  currentUserId,
}: {
  jobs: PublicJob[]
  currentUserId: string | null
}) {
  const { locale } = useLanguage()
  const ui = useMemo(() => getJobsUi(locale), [locale])
  const router = useRouter()
  const params = useSearchParams()
  const jobIdParam = params.get('jobId')
  const proposalJobIdParam = params.get('proposalJobId')
  const [query, setQuery] = useState(params.get('q') ?? '')
  const [locationFilter, setLocationFilter] = useState(params.get('location') ?? '')
  const [categoryFilter, setCategoryFilter] = useState(params.get('category') ?? ui.allCategoryLabel)
  const [minBudget, setMinBudget] = useState(params.get('min') ?? '')
  const [maxBudget, setMaxBudget] = useState(params.get('max') ?? '')
  const [jobType, setJobType] = useState<'all' | 'one-time' | 'recurring' | 'long-term'>('all')
  const [sortBy, setSortBy] = useState<'newest' | 'budget_desc' | 'budget_asc' | 'proposals_desc'>(
    (params.get('sort') as 'newest' | 'budget_desc' | 'budget_asc' | 'proposals_desc') ?? 'newest',
  )
  const [viewMode, setViewMode] = useState<'grid' | 'list' | 'map'>((params.get('view') as 'grid' | 'list' | 'map') ?? 'grid')
  const [page, setPage] = useState(1)
  const [quickCategory, setQuickCategory] = useState(ui.allQuick)
  const [showMoreCategories, setShowMoreCategories] = useState(false)
  const [showMobileFilters, setShowMobileFilters] = useState(false)
  const [saveSearchDone, setSaveSearchDone] = useState(false)
  const [selectedMapJobId, setSelectedMapJobId] = useState<string | null>(null)
  const [mapEmbedFailed, setMapEmbedFailed] = useState(false)
  const [isMobileViewport, setIsMobileViewport] = useState(false)
  const [proposalJobId, setProposalJobId] = useState<string | null>(null)
  const [detailJobId, setDetailJobId] = useState<string | null>(null)
  const [detailPhotoIndex, setDetailPhotoIndex] = useState(0)
  const [message, setMessage] = useState('')
  const [offer, setOffer] = useState('')
  const [sending, setSending] = useState(false)
  const [error, setError] = useState('')

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    const min = Number(minBudget || 0)
    const max = Number(maxBudget || 0)
    let list = jobs.filter(j => {
      const matchesQuery =
        !q ||
        j.title.toLowerCase().includes(q) ||
        j.category.toLowerCase().includes(q) ||
        j.location.toLowerCase().includes(q) ||
        j.description.toLowerCase().includes(q)
      const matchesLocation = !locationFilter.trim() || j.location.toLowerCase().includes(locationFilter.toLowerCase())
      const matchesCategory = categoryFilter === ui.allCategoryLabel || toCategoryKey(j.category) === toCategoryKey(categoryFilter)
      const matchesBudget = !min || (j.budget ?? 0) >= min
      const matchesMax = !max || (j.budget ?? 0) <= max
      const normalizedText = `${j.title} ${j.description}`.toLowerCase()
      const matchesJobType =
        jobType === 'all' ||
        (jobType === 'recurring' && /(daily|weekly|monthly|regular|recurring|hver uke|ukentlig)/i.test(normalizedText)) ||
        (jobType === 'long-term' && /(long-term|long term|ongoing|permanent|months|langsiktig)/i.test(normalizedText)) ||
        (jobType === 'one-time' && !/(daily|weekly|monthly|regular|recurring|long-term|long term|ongoing|permanent)/i.test(normalizedText))
      return matchesQuery && matchesLocation && matchesCategory && matchesBudget && matchesMax && matchesJobType
    })
    list = list.sort((a, b) => {
      if (sortBy === 'budget_desc') return (b.budget ?? 0) - (a.budget ?? 0)
      if (sortBy === 'budget_asc') return (a.budget ?? 0) - (b.budget ?? 0)
      if (sortBy === 'proposals_desc') return b.proposalCount - a.proposalCount
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    })
    return list
  }, [jobs, query, locationFilter, categoryFilter, minBudget, maxBudget, sortBy, jobType, ui.allCategoryLabel])

  const pageSize = 8
  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize))
  const currentPage = Math.min(page, totalPages)
  const pagedJobs = filtered.slice((currentPage - 1) * pageSize, currentPage * pageSize)
  const quickTopCategories = [ui.allQuick, 'Cleaning', 'Moving', 'Tutoring', 'Handyman', 'Delivery', 'IT & Tech', 'Gardening']
  const extraCategories = Object.values(CATEGORY_BY_KEY)
    .map((c) => c.label)
    .filter((label) => !quickTopCategories.includes(label))

  const activeFilterChips = useMemo(() => {
    const chips: Array<{ key: string; label: string }> = []
    if (query.trim()) chips.push({ key: 'q', label: `${ui.searchChip}: ${query.trim()}` })
    if (locationFilter.trim()) chips.push({ key: 'location', label: `${ui.locationChip}: ${locationFilter.trim()}` })
    if (categoryFilter !== ui.allCategoryLabel) chips.push({ key: 'category', label: `${ui.categoryChip}: ${categoryFilter}` })
    if (minBudget.trim()) chips.push({ key: 'min', label: `${ui.minChip}: ${minBudget} NOK` })
    if (maxBudget.trim()) chips.push({ key: 'max', label: `${ui.maxChip}: ${maxBudget} NOK` })
    if (jobType !== 'all') chips.push({ key: 'type', label: `${ui.typeChip}: ${jobType}` })
    if (sortBy !== 'newest') chips.push({ key: 'sort', label: `${ui.sortChip}: ${sortBy}` })
    return chips
  }, [query, locationFilter, categoryFilter, minBudget, maxBudget, sortBy, jobType, ui])

  useEffect(() => {
    const id = setTimeout(() => {
      const next = new URLSearchParams()
      if (query.trim()) next.set('q', query.trim())
      if (locationFilter.trim()) next.set('location', locationFilter.trim())
      if (categoryFilter !== ui.allCategoryLabel) next.set('category', categoryFilter)
      if (minBudget.trim()) next.set('min', minBudget.trim())
      if (maxBudget.trim()) next.set('max', maxBudget.trim())
      if (sortBy !== 'newest') next.set('sort', sortBy)
      if (viewMode !== 'grid') next.set('view', viewMode)
      const qs = next.toString()
      router.replace(qs ? `/jobs?${qs}` : '/jobs')
    }, 260)
    return () => clearTimeout(id)
  }, [query, locationFilter, categoryFilter, minBudget, maxBudget, sortBy, router, viewMode, ui])

  useEffect(() => {
    if (typeof window === 'undefined') return
    const media = window.matchMedia('(max-width: 1023px)')
    const sync = () => setIsMobileViewport(media.matches)
    sync()
    media.addEventListener('change', sync)
    return () => media.removeEventListener('change', sync)
  }, [])

  const activeMapJob =
    (selectedMapJobId ? pagedJobs.find((j) => j.id === selectedMapJobId) : null) ?? pagedJobs[0] ?? null

  const detailJob = useMemo(() => {
    const id = detailJobId ?? jobIdParam
    if (!id) return null
    return jobs.find((j) => j.id === id) ?? null
  }, [detailJobId, jobIdParam, jobs])

  const proposalJob = useMemo(() => {
    const id = proposalJobId ?? (currentUserId ? proposalJobIdParam : null)
    if (!id) return null
    return jobs.find((j) => j.id === id) ?? null
  }, [proposalJobId, proposalJobIdParam, currentUserId, jobs])

  function clearAllFilters() {
    setQuery('')
    setLocationFilter('')
    setCategoryFilter(ui.allCategoryLabel)
    setMinBudget('')
    setMaxBudget('')
    setJobType('all')
    setSortBy('newest')
    setViewMode('grid')
    setQuickCategory(ui.allQuick)
    setShowMoreCategories(false)
    setMapEmbedFailed(false)
  }

  const filtersPanel = (
    <div className="space-y-4">
      <div>
        <label className="mb-1 block text-xs font-semibold text-gray-600">{ui.categories}</label>
        <select
          value={categoryFilter}
          onChange={(e) => {
            setCategoryFilter(e.target.value)
            setQuickCategory(e.target.value === ui.allCategoryLabel ? ui.allQuick : e.target.value)
            setPage(1)
            setMapEmbedFailed(false)
          }}
          className={`w-full px-3 ${UI_TOKENS.input}`}
        >
          <option>{ui.allCategoryLabel}</option>
          {Object.values(CATEGORY_BY_KEY).map((cat) => (
            <option key={cat.key} value={cat.label}>{cat.label}</option>
          ))}
        </select>
      </div>
      <div>
        <label className="mb-1 block text-xs font-semibold text-gray-600">{ui.budgetNok}</label>
        <div className="grid grid-cols-2 gap-2">
          <input value={minBudget} onChange={(e) => { setMinBudget(e.target.value); setPage(1) }} placeholder={ui.min} type="number" className={`px-3 ${UI_TOKENS.input}`} />
          <input value={maxBudget} onChange={(e) => { setMaxBudget(e.target.value); setPage(1) }} placeholder={ui.max} type="number" className={`px-3 ${UI_TOKENS.input}`} />
        </div>
      </div>
      <div>
        <p className="mb-1 text-xs font-semibold text-gray-600">{ui.jobType}</p>
        <div className="space-y-1 text-sm text-gray-700">
          {[
            { key: 'all', label: ui.all },
            { key: 'one-time', label: ui.oneTime },
            { key: 'recurring', label: ui.recurring },
            { key: 'long-term', label: ui.longTerm },
          ].map((t) => (
            <label key={t.key} className="flex items-center gap-2">
              <input type="radio" checked={jobType === t.key} onChange={() => { setJobType(t.key as typeof jobType); setPage(1) }} />
              {t.label}
            </label>
          ))}
        </div>
      </div>
      <div>
        <label className="mb-1 block text-xs font-semibold text-gray-600">{ui.sortBy}</label>
        <select value={sortBy} onChange={(e) => { setSortBy(e.target.value as 'newest' | 'budget_desc' | 'budget_asc' | 'proposals_desc'); setPage(1) }} className={`w-full px-3 ${UI_TOKENS.input}`}>
          <option value="newest">{ui.newestFirst}</option>
          <option value="budget_desc">{ui.budgetHighLow}</option>
          <option value="budget_asc">{ui.budgetLowHigh}</option>
          <option value="proposals_desc">{ui.mostProposals}</option>
        </select>
      </div>
    </div>
  )

  function applyFiltersNow() {
    setPage(1)
    const next = new URLSearchParams()
    if (query.trim()) next.set('q', query.trim())
    if (locationFilter.trim()) next.set('location', locationFilter.trim())
    if (categoryFilter !== ui.allCategoryLabel) next.set('category', categoryFilter)
    if (minBudget.trim()) next.set('min', minBudget.trim())
    if (maxBudget.trim()) next.set('max', maxBudget.trim())
    if (sortBy !== 'newest') next.set('sort', sortBy)
    if (viewMode !== 'grid') next.set('view', viewMode)
    const qs = next.toString()
    router.replace(qs ? `/jobs?${qs}` : '/jobs')
  }

  function closeDetailModal() {
    setDetailJobId(null)
    const next = new URLSearchParams(params.toString())
    next.delete('jobId')
    const qs = next.toString()
    router.replace(qs ? `/jobs?${qs}` : '/jobs')
  }

  function closeProposalModal() {
    setProposalJobId(null)
    const next = new URLSearchParams(params.toString())
    next.delete('proposalJobId')
    const qs = next.toString()
    router.replace(qs ? `/jobs?${qs}` : '/jobs')
  }

  function openProposalFlow(job: PublicJob) {
    if (!currentUserId) {
      const next = new URLSearchParams(params.toString())
      next.set('proposalJobId', job.id)
      const nextPath = `/jobs?${next.toString()}`
      router.push(`/login?next=${encodeURIComponent(nextPath)}`)
      return
    }
    setProposalJobId(job.id)
    setError('')
    setMessage('')
    setOffer('')
  }

  function handleSaveSearch() {
    const payload = {
      q: query.trim(),
      location: locationFilter.trim(),
      category: categoryFilter,
      min: minBudget.trim(),
      max: maxBudget.trim(),
      type: jobType,
      sort: sortBy,
      savedAt: new Date().toISOString(),
    }
    const key = 'hire2skill_saved_job_searches'
    const current = JSON.parse(localStorage.getItem(key) ?? '[]') as typeof payload[]
    localStorage.setItem(key, JSON.stringify([payload, ...current].slice(0, 10)))
    setSaveSearchDone(true)
    window.setTimeout(() => setSaveSearchDone(false), 1400)
  }

  function isMissingPostIdColumnError(message?: string) {
    if (!message) return false
    const lower = message.toLowerCase()
    return (
      lower.includes('post_id') &&
      (lower.includes('column') || lower.includes('schema cache') || lower.includes('could not find'))
    )
  }

  function normalizeTitle(job: PublicJob) {
    const raw = job.title.trim()
    if (!raw || raw.length < 8 || /^[a-z]{2,8}$/i.test(raw)) return `${job.category} ${ui.helpNeeded}`
    return raw
  }

  function splitDetails(job: PublicJob) {
    const text = cleanJobDescription(job.description)
    if (!text) return { summary: '', details: ui.noDetails }
    const [first, ...rest] = text.split('\n\n')
    if (first.includes(':') && first.includes(' · ')) {
      return {
        summary: first,
        details: rest.join('\n\n').trim() || ui.detailsInChat,
      }
    }
    return { summary: '', details: text }
  }

  function getJobPhotoUrls(job: PublicJob) {
    const matches = job.description.match(/https?:\/\/\S+/g) ?? []
    return matches.filter((url) => /\.(png|jpe?g|webp|gif|avif)(\?.*)?$/i.test(url))
  }

  function cleanJobDescription(rawDescription: string) {
    return rawDescription
      .replace(/Task photos:\s*([\s\S]*)$/i, '')
      .replace(/https?:\/\/\S+/g, '')
      .trim()
  }

  async function sendProposal() {
    if (!proposalJob) return
    if (!currentUserId) {
      router.push(`/login?next=/jobs`)
      return
    }
    if (proposalJob.posterId === currentUserId) {
      setError(ui.errOwnPost)
      return
    }
    if (!message.trim()) {
      setError(ui.errProposalRequired)
      return
    }
    setSending(true)
    setError('')
    const supabase = createClient()
    const jobRef = `[JOB:${proposalJob.id}]`
    const preview = message.trim()
    const fullMessage = `${jobRef} ${preview}`

    let existingPending: { id: string }[] | null = null
    let duplicateCheckedByPostId = true
    {
      const checkByPostId = await supabase
        .from('bookings')
        .select('id')
        .eq('post_id', proposalJob.id)
        .eq('poster_id', proposalJob.posterId)
        .eq('helper_id', currentUserId)
        .eq('status', 'pending')
        .limit(1)

      if (isMissingPostIdColumnError(checkByPostId.error?.message)) {
        duplicateCheckedByPostId = false
        const checkByMessageRef = await supabase
          .from('bookings')
          .select('id')
          .eq('poster_id', proposalJob.posterId)
          .eq('helper_id', currentUserId)
          .eq('status', 'pending')
          .ilike('message', `${jobRef}%`)
          .limit(1)
        existingPending = checkByMessageRef.data
      } else {
        existingPending = checkByPostId.data
      }
    }

    if ((existingPending ?? []).length > 0) {
      setSending(false)
      setError(ui.errAlreadyPending)
      return
    }

    let booking: { id: string } | null = null
    let bookingError: { message?: string } | null = null
    if (duplicateCheckedByPostId) {
      const inserted = await supabase
        .from('bookings')
        .insert({
          post_id: proposalJob.id,
          poster_id: proposalJob.posterId,
          helper_id: currentUserId,
          status: 'pending',
          budget: offer ? Number(offer) : null,
          message: fullMessage,
        })
        .select('id')
        .single()
      booking = inserted.data
      bookingError = inserted.error
    } else {
      const inserted = await supabase
        .from('bookings')
        .insert({
          poster_id: proposalJob.posterId,
          helper_id: currentUserId,
          status: 'pending',
          budget: offer ? Number(offer) : null,
          message: fullMessage,
        })
        .select('id')
        .single()
      booking = inserted.data
      bookingError = inserted.error
    }

    if (isMissingPostIdColumnError(bookingError?.message)) {
      const retryWithoutPostId = await supabase
        .from('bookings')
        .insert({
          poster_id: proposalJob.posterId,
          helper_id: currentUserId,
          status: 'pending',
          budget: offer ? Number(offer) : null,
          message: fullMessage,
        })
        .select('id')
        .single()
      booking = retryWithoutPostId.data
      bookingError = retryWithoutPostId.error
    }

    if (bookingError || !booking) {
      setSending(false)
      setError(bookingError?.message ?? ui.errSendFailed)
      return
    }

    try {
      await supabase.from('messages').insert({
        booking_id: booking.id,
        sender_id: currentUserId,
        body: fullMessage,
      })
    } catch {
      // Optional bootstrap message; booking still exists.
    }

    // Send email/push notification to the job poster for this proposal.
    // We notify via `new-message` because we seed the initial chat content directly.
    void postNotify({
      type: 'new-message',
      senderId: currentUserId,
      bookingId: booking.id,
      preview,
    })

    setSending(false)
    setProposalJobId(null)
    setMessage('')
    setOffer('')
    router.push('/dashboard?requestSent=1')
  }

  return (
    <main className="mx-auto w-full max-w-7xl overflow-x-hidden px-3 py-5 sm:px-6">
      {proposalJob && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <button type="button" className="absolute inset-0 bg-black/45" onClick={closeProposalModal} />
          <div className="relative w-full max-w-lg rounded-2xl border border-gray-200 bg-white p-6 shadow-2xl">
            <h3 className="text-lg font-extrabold text-gray-900">{ui.modalTitle}</h3>
            <p className="text-sm text-gray-500 mt-1">{proposalJob.title}</p>
            <div className="mt-4 space-y-3">
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                rows={4}
                placeholder={ui.proposalPlaceholder}
                className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
              />
              <input
                type="number"
                value={offer}
                onChange={(e) => setOffer(e.target.value)}
                placeholder={ui.offerPlaceholder}
                className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
                min="0"
              />
              {error && <p className="text-xs text-red-600">{error}</p>}
            </div>
            <div className="mt-5 flex justify-end gap-3">
              <button type="button" onClick={closeProposalModal} className="rounded-xl border border-gray-200 px-4 py-2 text-sm font-semibold text-gray-600">
                {ui.cancel}
              </button>
              <button
                type="button"
                onClick={sendProposal}
                disabled={sending}
                className="rounded-xl px-4 py-2 text-sm font-bold text-white disabled:opacity-60"
                style={{ background: 'linear-gradient(90deg,#2563EB,#38BDF8)' }}
              >
                {sending ? ui.sending : ui.sendProposal}
              </button>
            </div>
          </div>
        </div>
      )}
      {detailJob && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <button type="button" className="absolute inset-0 bg-black/45" onClick={closeDetailModal} />
          <div className="relative w-full max-w-3xl rounded-2xl border border-gray-200 bg-white p-5 shadow-2xl">
            <div className="mb-3 flex items-start justify-between gap-3">
              <div>
                <h3 className="text-lg font-extrabold text-gray-900">{normalizeTitle(detailJob)}</h3>
                <p className="text-sm text-gray-500">{detailJob.location} · {detailJob.category}</p>
              </div>
              <button type="button" onClick={closeDetailModal} className="rounded-lg border border-gray-200 px-2.5 py-1 text-sm text-gray-600">×</button>
            </div>
            {getJobPhotoUrls(detailJob).length > 0 && (
              <div className="mb-4">
                <div className="relative mb-2 h-56 overflow-hidden rounded-xl border border-gray-200">
                  <Image
                    src={getJobPhotoUrls(detailJob)[Math.min(detailPhotoIndex, getJobPhotoUrls(detailJob).length - 1)]}
                    alt="Job photo"
                    fill
                    sizes="(max-width: 1024px) 100vw, 700px"
                    className="object-cover"
                  />
                </div>
                <div className="grid grid-cols-4 gap-2 sm:grid-cols-6">
                  {getJobPhotoUrls(detailJob).slice(0, 6).map((url, i) => (
                    <button
                      key={url}
                      type="button"
                      onClick={() => setDetailPhotoIndex(i)}
                      className={`relative h-14 overflow-hidden rounded-lg border ${i === detailPhotoIndex ? 'border-blue-500' : 'border-gray-200'}`}
                    >
                      <Image src={url} alt={`Job photo ${i + 1}`} fill sizes="100px" className="object-cover" />
                    </button>
                  ))}
                </div>
              </div>
            )}
            <p className="mb-3 text-sm text-gray-700 whitespace-pre-wrap">{splitDetails(detailJob).details}</p>
            <div className="flex items-center justify-between">
              <span className="text-sm font-bold text-green-700">{detailJob.budget ? ui.budgetLabel(detailJob.budget) : ui.budgetNegotiable}</span>
              <button
                type="button"
                onClick={() => {
                  closeDetailModal()
                  setDetailPhotoIndex(0)
                  openProposalFlow(detailJob)
                }}
                className="rounded-lg px-3 py-2 text-sm font-bold text-white"
                style={{ background: 'linear-gradient(90deg,#2563EB,#38BDF8)' }}
              >
                {ui.sendProposal}
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="mb-4 grid w-full max-w-full gap-2 overflow-hidden rounded-2xl border border-gray-200 bg-white p-2 sm:grid-cols-[1.5fr_0.8fr_0.4fr_0.5fr]">
        <input value={query} onChange={(e) => { setQuery(e.target.value); setPage(1) }} placeholder="What job are you looking for? (e.g. cleaning, moving, knitting)" className={`w-full min-w-0 px-4 ${UI_TOKENS.input}`} />
        <input value={locationFilter} onChange={(e) => { setLocationFilter(e.target.value); setPage(1) }} placeholder="Oslo, Norway" className={`w-full min-w-0 px-4 ${UI_TOKENS.input}`} />
        <button type="button" onClick={applyFiltersNow} className="w-full rounded-xl bg-blue-600 px-4 text-sm font-bold text-white hover:bg-blue-700">{ui.searchButton}</button>
        <button type="button" onClick={handleSaveSearch} className="w-full rounded-xl border border-gray-200 bg-white px-4 text-sm font-semibold text-gray-700">
          {saveSearchDone ? 'Saved' : ui.saveSearch}
        </button>
      </div>

      <div className="relative mb-4 w-full max-w-full overflow-hidden rounded-2xl border border-gray-200 bg-white p-2">
        <div className="flex w-full max-w-full gap-2 overflow-x-auto whitespace-nowrap md:grid md:grid-cols-9 md:overflow-visible md:whitespace-normal">
          {[...quickTopCategories, 'More'].map((chip) => (
            <button
              key={chip}
              type="button"
              onClick={() => {
                if (chip === 'More') {
                  setShowMoreCategories((v) => !v)
                  return
                }
                setShowMoreCategories(false)
                setQuickCategory(chip)
                setCategoryFilter(chip === ui.allQuick ? ui.allCategoryLabel : chip)
                setPage(1)
                setMapEmbedFailed(false)
              }}
              className={`min-w-[8.5rem] rounded-xl px-3 py-2 text-xs font-semibold transition md:min-w-0 md:w-full ${
                quickCategory === chip ? 'bg-blue-600 text-white' : 'border border-gray-200 bg-white text-gray-700 hover:border-blue-300'
              }`}
            >
              {chip}
            </button>
          ))}
        </div>
        {showMoreCategories && (
          <div className="absolute right-2 top-[calc(100%+6px)] z-20 max-h-56 w-[min(14rem,calc(100vw-2.5rem))] overflow-y-auto rounded-xl border border-gray-200 bg-white p-2 shadow-lg">
            {extraCategories.map((label) => (
              <button
                key={label}
                type="button"
                onClick={() => {
                  setQuickCategory(label)
                  setCategoryFilter(label)
                  setPage(1)
                  setMapEmbedFailed(false)
                  setShowMoreCategories(false)
                }}
                className="block w-full rounded-lg px-2 py-1.5 text-left text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-700"
              >
                {label}
              </button>
            ))}
          </div>
        )}
      </div>
      <div className="mb-3 flex items-center gap-2 lg:hidden">
        <button
          type="button"
          onClick={() => setShowMobileFilters(true)}
          className="inline-flex items-center rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm font-semibold text-gray-700"
        >
          {ui.filtersTitle}
        </button>
        <button
          type="button"
          onClick={clearAllFilters}
          className="inline-flex items-center rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm font-semibold text-blue-600"
        >
          {ui.clearAll}
        </button>
      </div>
      <div className="grid w-full max-w-full grid-cols-1 gap-4 lg:grid-cols-[260px_minmax(0,1fr)]">
        <aside className="hidden h-fit rounded-2xl border border-gray-200 bg-white p-4 lg:block">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-sm font-bold text-gray-900">{ui.filtersTitle}</h2>
            <button type="button" onClick={clearAllFilters} className="text-xs font-semibold text-blue-600 hover:underline">{ui.clearAll}</button>
          </div>
          {filtersPanel}
        </aside>

        <section className="min-w-0">
          <div className="mb-3 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm font-semibold text-gray-700">{ui.jobsFound(filtered.length)}</p>
            <div className="flex flex-wrap items-center gap-2">
              <select value={sortBy} onChange={(e) => { setSortBy(e.target.value as 'newest' | 'budget_desc' | 'budget_asc' | 'proposals_desc'); setPage(1) }} className={`min-w-0 px-3 py-1.5 text-xs ${UI_TOKENS.input}`}>
                <option value="newest">{ui.newestFirst}</option>
                <option value="budget_desc">{ui.budgetHighLow}</option>
                <option value="budget_asc">{ui.budgetLowHigh}</option>
                <option value="proposals_desc">{ui.mostProposals}</option>
              </select>
              <button onClick={() => { setViewMode('grid'); setMapEmbedFailed(false) }} className={`rounded-lg px-3 py-1.5 text-sm ${viewMode === 'grid' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-600'}`}>{ui.grid}</button>
              <button onClick={() => { setViewMode('list'); setMapEmbedFailed(false) }} className={`rounded-lg px-3 py-1.5 text-sm ${viewMode === 'list' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-600'}`}>{ui.list}</button>
              <button onClick={() => { setViewMode('map'); setMapEmbedFailed(false) }} className={`rounded-lg px-3 py-1.5 text-sm ${viewMode === 'map' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-600'}`}>{ui.map}</button>
            </div>
          </div>

          {activeFilterChips.length > 0 && (
            <div className={`${UI_TOKENS.panel} mb-3 flex flex-wrap items-center gap-2 rounded-xl p-2.5`}>
              {activeFilterChips.map((chip) => (
                <button
                  key={chip.key}
                  type="button"
                  onClick={() => {
                    if (chip.key === 'q') setQuery('')
                    if (chip.key === 'location') setLocationFilter('')
                    if (chip.key === 'category') {
                      setCategoryFilter(ui.allCategoryLabel)
                      setQuickCategory(ui.allQuick)
                    }
                    if (chip.key === 'min') setMinBudget('')
                    if (chip.key === 'max') setMaxBudget('')
                    if (chip.key === 'type') setJobType('all')
                    if (chip.key === 'sort') setSortBy('newest')
                    setPage(1)
                  }}
                  className={UI_TOKENS.chipButton}
                >
                  <span>{chip.label}</span>
                  <span>×</span>
                </button>
              ))}
              <button type="button" onClick={clearAllFilters} className={`ml-auto ${UI_TOKENS.clearAllLink}`}>{ui.clearAll}</button>
            </div>
          )}

          {filtered.length === 0 ? (
            <div className="rounded-2xl border border-gray-200 bg-white p-10 text-center">
              <p className="text-sm text-gray-500">{ui.emptySearch}</p>
              <Link href="/post" className="inline-block mt-3 text-sm font-semibold text-blue-600 hover:underline">
                {ui.postNew}
              </Link>
            </div>
          ) : viewMode === 'map' ? (
            <div className="grid gap-3 rounded-2xl border border-gray-200 bg-white p-3 lg:grid-cols-[320px_1fr]">
              <div className="max-h-[520px] space-y-2 overflow-y-auto pr-1">
                {pagedJobs.map((job) => {
                  const selected = activeMapJob?.id === job.id
                  return (
                    <button
                      key={job.id}
                      type="button"
                      onClick={() => {
                        setSelectedMapJobId(job.id)
                        setMapEmbedFailed(false)
                      }}
                      className={`block w-full rounded-lg border p-3 text-left transition ${
                        selected ? 'border-blue-400 bg-blue-50' : 'border-gray-200 hover:border-blue-300'
                      }`}
                    >
                      <p className="text-sm font-bold text-gray-900 line-clamp-1">{normalizeTitle(job)}</p>
                      <p className="mt-0.5 text-xs text-gray-500">{job.location}</p>
                      <p className="mt-1 text-xs font-semibold text-green-700">
                        {job.budget ? ui.budgetLabel(job.budget) : ui.budgetNegotiable}
                      </p>
                    </button>
                  )
                })}
              </div>
              <div className="overflow-hidden rounded-xl border border-gray-200">
                {isMobileViewport ? (
                  <div className="flex h-[520px] flex-col items-center justify-center gap-3 bg-gray-50 px-4 text-center">
                    <p className="text-sm font-semibold text-gray-700">Open location in your maps app</p>
                    <p className="text-xs text-gray-500">
                      {activeMapJob?.location ?? 'Oslo, Norway'}
                    </p>
                    <a
                      href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                        activeMapJob?.location ?? 'Oslo, Norway',
                      )}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="rounded-xl bg-blue-600 px-4 py-2 text-sm font-bold text-white hover:bg-blue-700"
                    >
                      Open in Maps
                    </a>
                  </div>
                ) : mapEmbedFailed ? (
                  <div className="flex h-[520px] flex-col items-center justify-center gap-3 bg-gray-50 px-4 text-center">
                    <p className="text-sm font-semibold text-gray-700">Map preview is unavailable on this device.</p>
                    <a
                      href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                        activeMapJob?.location ?? 'Oslo, Norway',
                      )}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="rounded-xl bg-blue-600 px-4 py-2 text-sm font-bold text-white hover:bg-blue-700"
                    >
                      Open in Maps
                    </a>
                  </div>
                ) : (
                  <iframe
                    key={activeMapJob?.id ?? 'map-empty'}
                    title="Jobs map"
                    src={`https://maps.google.com/maps?q=${encodeURIComponent(
                      activeMapJob?.location ?? 'Oslo, Norway',
                    )}&t=&z=13&ie=UTF8&iwloc=&output=embed`}
                    className="h-[520px] w-full"
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                    onError={() => setMapEmbedFailed(true)}
                  />
                )}
              </div>
            </div>
          ) : (
            <div className={viewMode === 'grid' ? 'grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-4' : 'space-y-3'}>
              {pagedJobs.map(job => (
                <article key={job.id} className={`group relative overflow-hidden rounded-xl border border-gray-200 bg-white ${viewMode === 'list' ? 'flex' : 'flex flex-col'} gap-0`}>
                  <div className={`relative ${viewMode === 'list' ? 'h-40 w-56 shrink-0' : 'h-32 w-full'}`}>
                    <Image src={getJobImageForCategory(job.category)} alt={job.category} fill sizes="(max-width: 1280px) 100vw, 25vw" className="object-cover" />
                    <div className="absolute left-2 top-2 rounded-full bg-white/90 px-2 py-0.5 text-[10px] font-semibold text-rose-600">
                      {job.proposalCount > 3 ? ui.urgentTag : ui.newTag}
                    </div>
                  </div>
                  <div className="flex flex-1 flex-col p-3.5">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <h2 className="text-sm font-extrabold text-gray-900 leading-snug line-clamp-2 min-h-10">{normalizeTitle(job)}</h2>
                        <p className="text-[11px] text-gray-400 mt-0.5">{job.location}</p>
                      </div>
                    </div>
                    {(() => {
                      const parsed = splitDetails(job)
                      const photoUrls = getJobPhotoUrls(job)
                      const points = parsed.summary ? parsed.summary.split(' · ').slice(0, 2) : []
                      return (
                        <>
                          {points.length > 0 && (
                            <div className="mt-1 flex flex-wrap gap-1">
                              {points.map((p) => (
                                <span key={p} className="rounded-full bg-blue-50 px-2 py-px text-[10px] font-semibold text-blue-700">
                                  {p}
                                </span>
                              ))}
                            </div>
                          )}
                          <p className="mt-1 text-xs text-gray-600 line-clamp-2 leading-relaxed">
                            {parsed.details}
                          </p>
                          {photoUrls.length > 0 && (
                            <div className="mt-2 flex items-center gap-1.5">
                              {photoUrls.slice(0, 2).map((url) => (
                                <div key={url} className="relative h-7 w-10 overflow-hidden rounded border border-gray-200">
                                  <Image src={url} alt="Attached job photo" fill sizes="40px" className="object-cover" />
                                </div>
                              ))}
                              {photoUrls.length > 2 && (
                                <span className="text-[10px] font-semibold text-blue-600">+{photoUrls.length - 2} more</span>
                              )}
                            </div>
                          )}
                        </>
                      )
                    })()}
                    <p className="mt-2 text-[10px] text-gray-400">{new Date(job.createdAt).toLocaleDateString()} · {ui.proposalsLabel(job.proposalCount)}</p>
                    <div className="mt-auto flex flex-col gap-2 pt-2">
                      <span className="text-xs font-bold text-green-700">
                        {job.budget ? ui.budgetLabel(job.budget) : ui.budgetNegotiable}
                      </span>
                      <div className="grid w-full grid-cols-2 gap-2">
                        <button
                          type="button"
                          onClick={() => {
                            setDetailJobId(job.id)
                            setDetailPhotoIndex(0)
                          }}
                          className="rounded-xl border border-gray-200 bg-white px-3 py-2 text-xs font-semibold text-gray-700 transition hover:border-blue-300 hover:text-blue-700"
                        >
                          {ui.viewJob}
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            openProposalFlow(job)
                          }}
                          className="rounded-xl px-3 py-2 text-xs font-semibold text-white shadow-sm transition hover:opacity-95"
                          style={{ background: 'linear-gradient(90deg,#2563EB,#38BDF8)' }}
                        >
                          {ui.sendProposal}
                        </button>
                      </div>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}

          {filtered.length > pageSize && (
            <div className="mt-4 flex items-center justify-center gap-2">
              <button disabled={currentPage === 1} onClick={() => setPage((p) => Math.max(1, p - 1))} className="rounded-lg border border-gray-200 px-2.5 py-1 text-sm disabled:opacity-40">{'<'}</button>
              {Array.from({ length: Math.min(totalPages, 6) }).map((_, i) => {
                const n = i + 1
                return (
                  <button key={n} onClick={() => setPage(n)} className={`h-8 w-8 rounded-lg text-sm font-semibold ${currentPage === n ? 'bg-blue-600 text-white' : 'border border-gray-200 text-gray-700'}`}>
                    {n}
                  </button>
                )
              })}
              {totalPages > 6 && <span className="text-sm text-gray-400">...</span>}
              <button disabled={currentPage === totalPages} onClick={() => setPage((p) => Math.min(totalPages, p + 1))} className="rounded-lg border border-gray-200 px-2.5 py-1 text-sm disabled:opacity-40">{'>'}</button>
            </div>
          )}
        </section>
      </div>
      {showMobileFilters && (
        <div className="fixed inset-0 z-[70] lg:hidden" role="dialog" aria-modal="true">
          <button type="button" className="absolute inset-0 bg-black/40" onClick={() => setShowMobileFilters(false)} aria-label="Close filters" />
          <aside className="absolute left-0 top-0 h-full w-[min(20rem,88vw)] overflow-y-auto border-r border-gray-200 bg-white p-4 shadow-xl">
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-sm font-bold text-gray-900">{ui.filtersTitle}</h2>
              <button type="button" onClick={() => setShowMobileFilters(false)} className="rounded-lg border border-gray-200 px-2 py-1 text-xs text-gray-600">✕</button>
            </div>
            <div className="mb-3">
              <button type="button" onClick={clearAllFilters} className="text-xs font-semibold text-blue-600 hover:underline">{ui.clearAll}</button>
            </div>
            {filtersPanel}
            <div className="mt-4">
              <button
                type="button"
                onClick={() => setShowMobileFilters(false)}
                className="w-full rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-bold text-white hover:bg-blue-700"
              >
                {ui.searchButton}
              </button>
            </div>
          </aside>
        </div>
      )}
    </main>
  )
}

