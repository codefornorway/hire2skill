import Link from 'next/link'
import { LogoHorizontal } from './SkillLinkLogo'

export default function Footer() {
  return (
    <footer className="bg-white border-t border-gray-200 mt-auto">
      <div className="mx-auto max-w-5xl px-6 py-10">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-8 mb-8">
          <div className="col-span-2 sm:col-span-1">
            <LogoHorizontal />
            <p className="mt-3 text-xs text-gray-400 leading-relaxed">
              Connecting people with local jobs and services across Norway.
            </p>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-3">Platform</p>
            <ul className="flex flex-col gap-2">
              <li><Link href="/signup" className="text-sm text-gray-500 hover:text-blue-600 transition-colors">Find Jobs</Link></li>
              <li><Link href="/post" className="text-sm text-gray-500 hover:text-blue-600 transition-colors">Post a Job</Link></li>
              <li><Link href="/signup" className="text-sm text-gray-500 hover:text-blue-600 transition-colors">Create Account</Link></li>
            </ul>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-3">Company</p>
            <ul className="flex flex-col gap-2">
              <li><Link href="#" className="text-sm text-gray-500 hover:text-blue-600 transition-colors">About</Link></li>
              <li><Link href="#" className="text-sm text-gray-500 hover:text-blue-600 transition-colors">Contact</Link></li>
              <li><Link href="#" className="text-sm text-gray-500 hover:text-blue-600 transition-colors">Blog</Link></li>
            </ul>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-3">Legal</p>
            <ul className="flex flex-col gap-2">
              <li><Link href="#" className="text-sm text-gray-500 hover:text-blue-600 transition-colors">Privacy Policy</Link></li>
              <li><Link href="#" className="text-sm text-gray-500 hover:text-blue-600 transition-colors">Terms of Service</Link></li>
              <li><Link href="#" className="text-sm text-gray-500 hover:text-blue-600 transition-colors">Cookie Policy</Link></li>
            </ul>
          </div>
        </div>
        <div className="border-t border-gray-100 pt-6 flex flex-col sm:flex-row items-center justify-between gap-2">
          <p className="text-xs text-gray-400">© {new Date().getFullYear()} SkillLink. All rights reserved.</p>
          <p className="text-xs text-gray-400">Made with ❤️ for Norway</p>
        </div>
      </div>
    </footer>
  )
}
