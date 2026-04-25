import type { Metadata } from 'next'
import Link from 'next/link'
import {
  TrendingUp, PenLine, SprayCan, Truck, BarChart3, ShieldCheck,
} from 'lucide-react'

export const metadata: Metadata = {
  title: 'Blog',
  description: 'Tips, guides, and news from the Hire2Skill team. Get more from your helpers and grow your earnings as a tasker.',
}

type Post = {
  slug: string
  category: string
  categoryColor: string
  title: string
  excerpt: string
  date: string
  readTime: string
  iconBg: string
  iconColor: string
  Icon: React.ElementType
}

const POSTS: Post[] = [
  {
    slug: '10-tips-to-get-more-bookings',
    category: 'For Helpers',
    categoryColor: '#2563EB',
    title: '10 tips to get more bookings on Hire2Skill',
    excerpt: "A complete profile, fast response times, and five-star first impressions — here's how top helpers fill their calendars.",
    date: 'April 18, 2026',
    readTime: '5 min read',
    iconBg: '#EFF6FF',
    iconColor: '#2563EB',
    Icon: TrendingUp,
  },
  {
    slug: 'how-to-write-a-task-post',
    category: 'For Posters',
    categoryColor: '#7C3AED',
    title: 'How to write a task post that gets great responses',
    excerpt: 'Clear descriptions, realistic budgets, and good photos — the difference between one reply and ten.',
    date: 'April 12, 2026',
    readTime: '4 min read',
    iconBg: '#F5F3FF',
    iconColor: '#7C3AED',
    Icon: PenLine,
  },
  {
    slug: 'spring-cleaning-checklist',
    category: 'Home Tips',
    categoryColor: '#16A34A',
    title: 'Spring cleaning checklist: every room, covered',
    excerpt: 'The complete room-by-room guide to a thorough spring clean — including the spots everyone forgets.',
    date: 'April 5, 2026',
    readTime: '6 min read',
    iconBg: '#F0FDF4',
    iconColor: '#16A34A',
    Icon: SprayCan,
  },
  {
    slug: 'stress-free-move-in-norway',
    category: 'Moving',
    categoryColor: '#EA580C',
    title: 'How to prepare for a stress-free move in Norway',
    excerpt: 'From booking a mover early to packing room by room — a practical timeline for your next home move.',
    date: 'March 28, 2026',
    readTime: '7 min read',
    iconBg: '#FFF7ED',
    iconColor: '#EA580C',
    Icon: Truck,
  },
  {
    slug: 'setting-your-hourly-rate',
    category: 'For Helpers',
    categoryColor: '#2563EB',
    title: 'Setting your hourly rate: what helpers in Norway earn',
    excerpt: 'A look at average rates by category, how to price competitively, and when to charge more.',
    date: 'March 20, 2026',
    readTime: '5 min read',
    iconBg: '#FFFBEB',
    iconColor: '#D97706',
    Icon: BarChart3,
  },
  {
    slug: 'staying-safe-home-service-platforms',
    category: 'Safety',
    categoryColor: '#0284C7',
    title: 'Staying safe when using home service platforms',
    excerpt: "What to check before letting someone into your home, and how Hire2Skill's verification protects you.",
    date: 'March 14, 2026',
    readTime: '4 min read',
    iconBg: '#F0F9FF',
    iconColor: '#0284C7',
    Icon: ShieldCheck,
  },
]

const CATEGORIES = ['All', 'For Helpers', 'For Posters', 'Home Tips', 'Moving', 'Safety']

export default function BlogPage() {
  return (
    <div className="min-h-screen bg-gray-50">

      {/* Hero */}
      <div className="bg-white border-b border-gray-100">
        <div className="mx-auto max-w-4xl px-6 py-14 text-center">
          <h1 className="text-4xl font-extrabold text-gray-900 mb-3">Hire2Skill Blog</h1>
          <p className="text-gray-500 text-lg">Tips, guides, and news for helpers and task posters across Norway.</p>
        </div>
      </div>

      {/* Category filter */}
      <div className="mx-auto max-w-4xl px-6 pt-8">
        <div className="flex flex-wrap gap-2">
          {CATEGORIES.map((c, i) => (
            <span key={c}
              className={`rounded-full px-4 py-1.5 text-sm font-semibold cursor-pointer transition-colors ${
                i === 0
                  ? 'text-white'
                  : 'bg-white border border-gray-200 text-gray-600 hover:border-blue-300'
              }`}
              style={i === 0 ? { background: 'linear-gradient(135deg,#1E3A8A,#38BDF8)' } : undefined}>
              {c}
            </span>
          ))}
        </div>
      </div>

      {/* Posts grid */}
      <div className="mx-auto max-w-4xl px-6 py-8">
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {POSTS.map(post => {
            const PostIcon = post.Icon
            return (
              <Link key={post.title} href={`/blog/${post.slug}`}
                className="group bg-white rounded-2xl border border-gray-200 p-5 hover:border-blue-300 hover:shadow-lg transition-all duration-200 flex flex-col gap-3">

                {/* Icon */}
                <div className="h-12 w-12 rounded-xl flex items-center justify-center shrink-0 shadow-sm"
                  style={{ background: post.iconBg }}>
                  <PostIcon size={22} color={post.iconColor} strokeWidth={1.75} />
                </div>

                <div>
                  <span className="text-xs font-bold" style={{ color: post.categoryColor }}>
                    {post.category}
                  </span>
                  <h2 className="font-bold text-gray-900 mt-1 leading-snug group-hover:text-blue-600 transition-colors">
                    {post.title}
                  </h2>
                </div>

                <p className="text-sm text-gray-500 leading-relaxed flex-1">{post.excerpt}</p>

                <div className="flex items-center justify-between mt-auto pt-3 border-t border-gray-100">
                  <span className="text-xs text-gray-400">{post.date}</span>
                  <span className="flex items-center gap-1 text-xs text-gray-400">
                    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>
                    {post.readTime}
                  </span>
                </div>
              </Link>
            )
          })}
        </div>

        <p className="text-center text-sm text-gray-400 mt-12 py-8">
          More articles are on the way. Check back regularly.
        </p>
      </div>

    </div>
  )
}
