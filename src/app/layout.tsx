import type { Viewport } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import './globals.css'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import MobileBottomNav from '@/components/MobileBottomNav'
import PWARegister from '@/components/PWARegister'
import ThemeProvider from '@/components/ThemeProvider'
import { LanguageProvider } from '@/context/LanguageContext'

const geistSans = Geist({ variable: '--font-geist-sans', subsets: ['latin'] })
const geistMono = Geist_Mono({ variable: '--font-geist-mono', subsets: ['latin'] })

export const viewport: Viewport = {
  themeColor: '#1E3A8A',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  viewportFit: 'cover',
}

export const metadata = {
  metadataBase: new URL('https://hire2skill.com'),
  title: {
    template: '%s | Hire2Skill',
    default: 'Hire2Skill — Find Local Helpers in Norway',
  },
  description: 'Hire2Skill connects you with verified local helpers across Norway. Book cleaners, movers, tutors, handymen and more — fast and easy.',
  keywords: ['local helpers Norway', 'hire cleaner Oslo', 'find handyman Bergen', 'tutoring Norway', 'Hire2Skill'],
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'Hire2Skill',
  },
  formatDetection: { telephone: false },
  openGraph: {
    siteName: 'Hire2Skill',
    type: 'website',
    locale: 'nb_NO',
    images: [{ url: '/og-default.png', width: 1200, height: 630, alt: 'Hire2Skill — Local helpers in Norway' }],
  },
  twitter: {
    card: 'summary_large_image',
    site: '@hire2skill',
  },
  robots: { index: true, follow: true },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="nb" className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}>
      <head>
        <link rel="apple-touch-icon" href="/icons/icon-512.svg" />
        {/* No-flash: apply saved theme before first paint */}
        <script dangerouslySetInnerHTML={{ __html: `
          (function(){
            try {
              var t = localStorage.getItem('sl-theme');
              var p = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
              if ((t || p) === 'dark') document.documentElement.classList.add('dark');
            } catch(e){}
          })();
        `}} />
      </head>
      <body className="min-h-full flex flex-col">
        <ThemeProvider>
          <LanguageProvider>
            <Navbar />
            <div className="flex-1 flex flex-col pb-16 sm:pb-0">
              {children}
              <Footer />
            </div>
            <MobileBottomNav />
            <PWARegister />
          </LanguageProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
