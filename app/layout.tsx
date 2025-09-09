import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import Navigation from '@/components/Navigation'
import Footer from '@/components/Footer'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'ACG萌图宅 - 精美二次元插画作品展示平台',
  description: '发现最萌最美的二次元插画作品，探索ACG艺术的无限魅力',
  keywords: ['ACG', '萌图', '二次元', '插画', '动漫', '艺术', '鉴赏', '排行榜', '推荐'],
}

export default function RootLayout({
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