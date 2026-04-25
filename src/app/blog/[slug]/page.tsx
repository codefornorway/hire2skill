import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import {
  TrendingUp, PenLine, SprayCan, Truck, BarChart3, ShieldCheck, ArrowLeft, Clock,
} from 'lucide-react'

type Section = { heading?: string; body: string }

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
  sections: Section[]
}

const POSTS: Post[] = [
  {
    slug: '10-tips-to-get-more-bookings',
    category: 'For Helpers',
    categoryColor: '#2563EB',
    title: '10 tips to get more bookings on SkillLink',
    excerpt: "A complete profile, fast response times, and five-star first impressions — here's how top helpers fill their calendars.",
    date: 'April 18, 2026',
    readTime: '5 min read',
    iconBg: '#EFF6FF',
    iconColor: '#2563EB',
    Icon: TrendingUp,
    sections: [
      { body: 'Helpers who consistently earn on SkillLink share a handful of habits. These ten tips are drawn from the most-booked profiles on the platform.' },
      { heading: '1. Fill out every section of your profile', body: 'Profiles with a bio, photo, category list, and hourly rate get 3× more views than incomplete ones. Posters make quick decisions — give them everything they need at a glance.' },
      { heading: '2. Use a real, clear profile photo', body: 'A friendly, well-lit photo of your face builds trust immediately. Avoid sunglasses, group photos, or logos. Think LinkedIn, not Instagram.' },
      { heading: '3. Respond within one hour', body: 'Speed is the single biggest predictor of booking. Enable push notifications and aim to reply within 60 minutes. Helpers who reply in under an hour close 4× more bookings than those who take a day.' },
      { heading: '4. Write a bio that answers "why you?"', body: 'Mention your experience, what you specialise in, and one thing that makes you different. "5 years cleaning homes in Oslo, specialist in eco-friendly products" beats "I am good at cleaning."' },
      { heading: '5. Set a competitive starting rate', body: 'Check what others in your category charge in your city. Starting slightly below the median while you build reviews is smart — you can raise your rate once you have five or more 5-star reviews.' },
      { heading: '6. Ask every satisfied customer for a review', body: 'After a job, send a short message: "I really enjoyed helping you today — if you have a minute, a review on my profile would mean a lot." Most happy customers are glad to help.' },
      { heading: '7. List every category you can genuinely cover', body: 'If you can both clean and do laundry, list both. More categories means appearing in more searches.' },
      { heading: '8. Update your availability regularly', body: 'Posters filter by response time and availability. Keeping your profile active signals that you are ready to work.' },
      { heading: '9. Include a short video introduction', body: 'A 30-second video on your profile outperforms a wall of text. Show your workspace, tools, or simply introduce yourself — it humanises your profile dramatically.' },
      { heading: '10. Deliver a little more than expected', body: 'Leave the space tidier than promised. Finish five minutes early and ask if there is anything else. Small gestures produce five-star reviews and repeat customers.' },
    ],
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
    sections: [
      { body: 'A well-written task post attracts the right helpers quickly. A vague post attracts nobody, or the wrong person. Here is how to write one that works.' },
      { heading: 'Be specific about the task', body: 'Instead of "I need help cleaning," write "I need a 3-bedroom flat cleaned in Grünerløkka — kitchen, two bathrooms, hoovering throughout, approximately 4 hours of work." The more specific, the more accurate quotes you will receive.' },
      { heading: 'Mention the location and timing', body: 'Include the neighbourhood or city, and whether you need same-day, this week, or flexible timing. Helpers plan their schedules and will skip posts without this information.' },
      { heading: 'Set a realistic budget', body: 'Posting a budget tells helpers you are serious. Research average rates for your task category in Norway. A budget that is too low will attract few responses; one that is realistic will attract many.' },
      { heading: 'Add photos where helpful', body: 'For assembly, repairs, painting, or cleaning — a photo of the space is worth a thousand words. It lets helpers quote accurately and arrive prepared.' },
      { heading: 'List any special requirements', body: 'Allergies, pets in the home, parking restrictions, access codes, tools to bring — anything that affects how a helper plans their visit should be in the post.' },
      { heading: 'Reply promptly to questions', body: 'Helpers who ask follow-up questions are engaged and serious. A quick reply keeps them interested and keeps your task moving forward.' },
    ],
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
    sections: [
      { body: 'Spring is the perfect time to reset your home. Work through each room with this checklist and you will not miss a spot.' },
      { heading: 'Kitchen', body: '✓ Defrost and wipe inside the freezer\n✓ Clean oven racks and the oven interior\n✓ Wipe down cabinet fronts and handles\n✓ Clean behind and under the fridge\n✓ Descale the kettle and coffee maker\n✓ Check pantry for expired goods\n✓ Clean the range hood filter' },
      { heading: 'Bathrooms', body: '✓ Scrub grout between tiles\n✓ Descale taps and showerhead\n✓ Wipe down the extractor fan cover\n✓ Clean inside the medicine cabinet\n✓ Wash bath mats and shower curtains\n✓ Check and replace silicone sealant if mouldy' },
      { heading: 'Living room', body: '✓ Vacuum under and behind all furniture\n✓ Wipe skirting boards\n✓ Clean light switches and plug sockets\n✓ Dust ceiling corners and lampshades\n✓ Wash cushion covers and throws\n✓ Wipe down the TV screen and remote controls' },
      { heading: 'Bedrooms', body: '✓ Rotate and air the mattress\n✓ Wash pillows and duvet (check labels)\n✓ Vacuum under the bed\n✓ Clear out wardrobes and donate unused items\n✓ Wipe inside drawers\n✓ Clean windows and window sills' },
      { heading: 'Often forgotten spots', body: '✓ Top of the fridge\n✓ Inside the dishwasher (run a cleaning cycle)\n✓ Washing machine door seal\n✓ Behind the toilet\n✓ Inside wardrobe corners\n✓ Door frames and the tops of doors' },
      { heading: 'Need a hand?', body: 'If spring cleaning feels overwhelming, a professional cleaner on SkillLink can do a full deep-clean in a few hours. Many customers book annually for exactly this reason.' },
    ],
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
    sections: [
      { body: 'Moving home is consistently rated one of life\'s most stressful events. With the right preparation, it does not have to be. Here is a timeline that works.' },
      { heading: '4 weeks before: book your movers', body: 'Good movers in Oslo and Bergen fill up fast, especially on weekends at the end of the month. Book at least four weeks ahead. Get quotes from two or three helpers on SkillLink and compare.' },
      { heading: '3 weeks before: start decluttering', body: 'Moving is the perfect time to let go of things you no longer need. Sell, donate, or recycle before you pack — every item you move costs time and money.' },
      { heading: '2 weeks before: gather packing materials', body: 'You will need more boxes than you think. Collect free ones from supermarkets, or buy sturdy double-walled boxes for heavy items. Stock up on tape, bubble wrap, and markers.' },
      { heading: '1 week before: pack room by room', body: 'Start with rooms you use least — spare bedroom, storage areas. Label every box with its contents AND the room it belongs in at the new address. Pack essentials separately in a bag you keep with you.' },
      { heading: 'Moving day', body: 'Have a clear plan for where the movers should park. Walk through the new home before unloading. Put down protective covers on floors if needed. Keep children and pets out of the way.' },
      { heading: 'After the move', body: 'Update your address with Posten, your bank, and your employer. Register your new address at Folkeregisteret (skatteetaten.no) within eight days — it is a legal requirement in Norway.' },
      { heading: 'Tip: hire a packing helper separately', body: 'Many people hire a moving van and crew but underestimate the packing time. A packing helper the day before your move can save hours of stress.' },
    ],
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
    sections: [
      { body: 'Pricing yourself correctly is one of the most important decisions you will make as a helper. Too low and you undermine your worth; too high and you miss bookings.' },
      { heading: 'Average rates in Norway by category', body: 'Cleaning: 280–450 NOK/hr\nHandyman: 400–700 NOK/hr\nMoving help: 350–550 NOK/hr\nTutoring: 350–500 NOK/hr\nIT & Tech: 450–750 NOK/hr\nPersonal Training: 400–650 NOK/hr\nPet Care / Dog Walking: 200–350 NOK/hr\nCooking: 300–500 NOK/hr' },
      { heading: 'Start slightly below median', body: 'When you are new to the platform and have no reviews, price yourself 10–15% below the median for your category. Once you have five solid reviews, raise your rate to match the market.' },
      { heading: 'Charge more for specialisations', body: 'If you have a certification, years of experience, or a speciality (eco cleaning products, baby-proofing, music exam preparation), you can charge a premium. Call it out explicitly in your bio.' },
      { heading: 'Factor in travel time for distant jobs', body: 'If a job takes 30 minutes to reach, build that into your effective rate or set a minimum booking duration. Many helpers set a 2-hour minimum to make shorter travel worthwhile.' },
      { heading: 'Raise rates gradually, not suddenly', body: 'If you have regulars, give them a heads-up before increasing your rate. A polite message explaining that you are adjusting your prices next month maintains trust and keeps the relationship.' },
      { heading: 'Track your earnings over time', body: 'Keep a simple spreadsheet of hours worked and income. Knowing your effective hourly rate (after travel, supplies, and any SkillLink fees) helps you make smarter pricing decisions.' },
    ],
  },
  {
    slug: 'staying-safe-home-service-platforms',
    category: 'Safety',
    categoryColor: '#0284C7',
    title: 'Staying safe when using home service platforms',
    excerpt: "What to check before letting someone into your home, and how SkillLink's verification protects you.",
    date: 'March 14, 2026',
    readTime: '4 min read',
    iconBg: '#F0F9FF',
    iconColor: '#0284C7',
    Icon: ShieldCheck,
    sections: [
      { body: "Inviting someone into your home requires trust. Here is how to make sure that trust is well-placed — and what SkillLink does to protect you before they even arrive." },
      { heading: "Check the 'Verified' badge", body: "Helpers with the green Verified badge have submitted ID documents that our team has reviewed. This is the first thing to look for when browsing profiles. Unverified helpers are newer to the platform and have not yet completed this step." },
      { heading: 'Read the reviews carefully', body: 'Look for patterns across multiple reviews, not just the star rating. Reviews that mention punctuality, communication, and quality of work are the most useful. A helper with 20 reviews averaging 4.8★ is a much safer choice than one with two reviews at 5★.' },
      { heading: 'Message before booking', body: 'A short conversation before booking tells you a lot. Is the helper responsive? Do they ask clarifying questions about the job? Good communicators make good workers.' },
      { heading: 'Pay through the platform', body: 'Always pay through SkillLink. This protects both parties — your payment is only released once the job is marked complete, and our team can step in if there is a dispute.' },
      { heading: 'Trust your instincts', body: 'If a profile feels off or a helper asks to move the conversation off the platform, decline and report it. Our trust and safety team reviews all reports.' },
      { heading: 'The SkillLink Happiness Guarantee', body: 'If a task does not meet the agreed standard, contact us within 72 hours. We will work to resolve the issue — including facilitating a re-do or a partial refund where appropriate.' },
    ],
  },
]

export async function generateStaticParams() {
  return POSTS.map(p => ({ slug: p.slug }))
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params
  const post = POSTS.find(p => p.slug === slug)
  if (!post) return { title: 'Post not found' }
  return { title: post.title, description: post.excerpt }
}

export default async function BlogPostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const post = POSTS.find(p => p.slug === slug)
  if (!post) notFound()

  const PostIcon = post.Icon

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-2xl px-6 py-12">

        {/* Back */}
        <Link href="/blog"
          className="inline-flex items-center gap-2 text-sm font-semibold text-gray-500 hover:text-blue-600 mb-8 transition-colors">
          <ArrowLeft size={16} />
          Back to blog
        </Link>

        {/* Header */}
        <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-8 mb-8">
          <div className="flex items-center gap-4 mb-6">
            <div className="h-14 w-14 rounded-2xl flex items-center justify-center shrink-0 shadow-sm"
              style={{ background: post.iconBg }}>
              <PostIcon size={28} color={post.iconColor} strokeWidth={1.75} />
            </div>
            <div>
              <span className="text-sm font-bold" style={{ color: post.categoryColor }}>{post.category}</span>
              <div className="flex items-center gap-3 mt-0.5 text-xs text-gray-400">
                <span>{post.date}</span>
                <span>·</span>
                <span className="flex items-center gap-1">
                  <Clock size={11} />
                  {post.readTime}
                </span>
              </div>
            </div>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 leading-tight mb-3">
            {post.title}
          </h1>
          <p className="text-base text-gray-500 leading-relaxed">{post.excerpt}</p>
        </div>

        {/* Body */}
        <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-8 space-y-6">
          {post.sections.map((section, i) => (
            <div key={i}>
              {section.heading && (
                <h2 className="text-base font-extrabold text-gray-900 mb-2">{section.heading}</h2>
              )}
              <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-line">{section.body}</p>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className="mt-8 rounded-2xl px-8 py-8 text-center text-white"
          style={{ background: 'linear-gradient(135deg,#1E3A8A 0%,#2563EB 60%,#38BDF8 100%)' }}>
          <p className="font-extrabold text-lg mb-2">Ready to get started?</p>
          <p className="text-blue-100 text-sm mb-5">Find a verified helper near you or post your task today.</p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link href="/taskers"
              className="rounded-xl bg-white px-6 py-2.5 text-sm font-bold transition hover:bg-blue-50"
              style={{ color: '#1E3A8A' }}>
              Find a helper
            </Link>
            <Link href="/post"
              className="rounded-xl border-2 border-white/50 px-6 py-2.5 text-sm font-bold text-white transition hover:bg-white/10">
              Post a task
            </Link>
          </div>
        </div>

      </div>
    </div>
  )
}
