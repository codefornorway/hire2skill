'use client'

import Link from 'next/link'
import { LogoHorizontal } from './SkillLinkLogo'
import { useLanguage } from '@/context/LanguageContext'

export default function Footer() {
  const { t } = useLanguage()
  const f = t.footer

  return (
    <footer className="bg-white border-t border-gray-200 mt-auto">
      <div className="mx-auto max-w-5xl px-6 py-10">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-8 mb-8">
          <div className="col-span-2 sm:col-span-1">
            <LogoHorizontal />
            <p className="mt-3 text-xs text-gray-400 leading-relaxed">
              {f.tagline}
            </p>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-3">{f.platform}</p>
            <ul className="flex flex-col gap-2">
              <li><Link href="/signup" className="text-sm text-gray-500 hover:text-blue-600 transition-colors">{f.findJobs}</Link></li>
              <li><Link href="/post" className="text-sm text-gray-500 hover:text-blue-600 transition-colors">{f.postJob}</Link></li>
              <li><Link href="/signup" className="text-sm text-gray-500 hover:text-blue-600 transition-colors">{f.createAccount}</Link></li>
            </ul>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-3">{f.company}</p>
            <ul className="flex flex-col gap-2">
              <li><Link href="/about" className="text-sm text-gray-500 hover:text-blue-600 transition-colors">{f.about}</Link></li>
              <li><Link href="/contact" className="text-sm text-gray-500 hover:text-blue-600 transition-colors">{f.contact}</Link></li>
              <li><Link href="/blog" className="text-sm text-gray-500 hover:text-blue-600 transition-colors">{f.blog}</Link></li>
            </ul>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-3">{f.legal}</p>
            <ul className="flex flex-col gap-2">
              <li><Link href="/personvern" className="text-sm text-gray-500 hover:text-blue-600 transition-colors">{f.privacyLocal}</Link></li>
              <li><Link href="/vilkar" className="text-sm text-gray-500 hover:text-blue-600 transition-colors">{f.termsLocal}</Link></li>
              <li><Link href="/privacy" className="text-sm text-gray-500 hover:text-blue-600 transition-colors">{f.privacyEn}</Link></li>
              <li><Link href="/terms" className="text-sm text-gray-500 hover:text-blue-600 transition-colors">{f.termsEn}</Link></li>
            </ul>
          </div>
        </div>
        <div className="border-t border-gray-100 pt-6 flex flex-col sm:flex-row items-center justify-between gap-2">
          <p className="text-xs text-gray-400">© {new Date().getFullYear()} Hire2Skill. {f.rights}</p>
          <p className="text-xs text-gray-400">{f.madeIn}</p>
        </div>
      </div>
    </footer>
  )
}
