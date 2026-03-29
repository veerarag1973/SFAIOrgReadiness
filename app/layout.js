import { Playfair_Display, DM_Sans, DM_Mono } from 'next/font/google'
import { Analytics }     from '@vercel/analytics/react'
import { SpeedInsights }  from '@vercel/speed-insights/next'
import AuthSessionProvider from '@/components/AuthSessionProvider'
import Nav    from '@/components/Nav'
import Footer from '@/components/Footer'
import '@/styles/globals.css'
import '@/styles/animations.css'

const playfair = Playfair_Display({
  subsets: ['latin'],
  weight: ['400', '700', '900'],
  variable: '--font-playfair',
  display: 'swap',
})
const dmSans = DM_Sans({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600'],
  variable: '--font-dm-sans',
  display: 'swap',
})
const dmMono = DM_Mono({
  subsets: ['latin'],
  weight: ['400', '500'],
  variable: '--font-dm-mono',
  display: 'swap',
})

export const metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'),
  title: {
    template: '%s — SpanForge AI Readiness',
    default: 'AI Organisational Readiness Assessment — SpanForge',
  },
  description: 'Evaluate whether your organisation has the foundational capabilities to build, deploy, and govern AI at enterprise scale.',
  keywords: ['AI readiness', 'enterprise AI', 'AI strategy', 'AI governance', 'SpanForge'],
  openGraph: {
    type:        'website',
    siteName:    'SpanForge',
    title:       'AI Organisational Readiness Assessment — SpanForge',
    description: 'Evaluate whether your organisation has the foundational capabilities to build, deploy, and govern AI at enterprise scale.',
  },
  twitter: {
    card: 'summary_large_image',
  },
  robots: { index: true, follow: true },
}

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${playfair.variable} ${dmSans.variable} ${dmMono.variable}`}>
      <body>
        <a href="#main-content" className="skip-to-content">Skip to content</a>
        <AuthSessionProvider>
          <div className="app-shell">
            <Nav />
            <main id="main-content" className="app-shell-main">
              {children}
            </main>
            <Footer />
          </div>
        </AuthSessionProvider>
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  )
}
