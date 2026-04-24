import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { LanguageProvider } from "@/context/LanguageContext";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL('https://skilllink.no'),
  title: {
    template: '%s | SkillLink',
    default: 'SkillLink — Find Local Helpers in Norway',
  },
  description: 'SkillLink connects you with verified local helpers across Norway. Book cleaners, movers, tutors, handymen and more — fast and easy.',
  keywords: ['local helpers Norway', 'hire cleaner Oslo', 'find handyman Bergen', 'tutoring Norway', 'SkillLink'],
  openGraph: {
    siteName: 'SkillLink',
    type: 'website',
    locale: 'en_NO',
    images: [{ url: '/og-default.png', width: 1200, height: 630, alt: 'SkillLink — Local helpers in Norway' }],
  },
  twitter: {
    card: 'summary_large_image',
    site: '@skilllink_no',
  },
  robots: { index: true, follow: true },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
          <LanguageProvider>
            <Navbar />
            {children}
            <Footer />
          </LanguageProvider>
        </body>
    </html>
  );
}
