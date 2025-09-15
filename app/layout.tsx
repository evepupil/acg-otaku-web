import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import Navigation from '@/components/Navigation'
import Footer from '@/components/Footer'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: {
    default: 'ACG萌图宅 - 二次元插画作品展示平台',
    template: ' | ACG萌图宅'
  },
  description: '发现最萌最美的二次元插画作品，探索ACG艺术的无限魅力。每日更新Pixiv热门排行榜，汇聚优质二次元艺术作品。',
  keywords: ['ACG', '萌图', '二次元', '插画', '动漫', '艺术', '鉴赏', '排行榜', '推荐', 'Pixiv', '萝莉', '黑丝'],
  authors: [{ name: 'ACG萌图宅' }],
  creator: 'ACG萌图宅',
  publisher: 'ACG萌图宅',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL('https://acgotaku.com'),
  alternates: {
    canonical: '/',
  },
  openGraph: {
    type: 'website',
    locale: 'zh_CN',
    url: 'https://acgotaku.com',
    title: 'ACG萌图宅 - 二次元插画作品展示平台',
    description: '发现最萌最美的二次元插画作品，探索ACG艺术的无限魅力。每日更新Pixiv热门排行榜，汇聚优质二次元艺术作品。',
    siteName: 'ACG萌图宅',
    images: [
      {
        url: '/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'ACG萌图宅 - 精美二次元插画作品展示平台',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'ACG萌图宅 - 精美二次元插画作品展示平台',
    description: '发现最萌最美的二次元插画作品，探索ACG艺术的无限魅力。每日更新Pixiv热门排行榜，汇聚优质二次元艺术作品。',
    images: ['/og-image.jpg'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    google: 'your-google-verification-code',
    yandex: 'your-yandex-verification-code',
    yahoo: 'your-yahoo-verification-code',
  },
}

function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="zh-CN">
      <body className={inter.className}>
        <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-emerald-50">
          <Navigation />
          <main className="relative">
            {children}
          </main>
          <Footer />
        </div>
      </body>
    </html>
  )
}

export default RootLayout