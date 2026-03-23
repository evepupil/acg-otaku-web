'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  BookOpen,
  CalendarDays,
  Hash,
  Home,
  Menu,
  Palette,
  Search,
  TrendingUp,
  X,
} from 'lucide-react'

import { cn } from '@/lib/utils'

interface NavItem {
  href: string
  label: string
  icon: React.ComponentType<{ className?: string }>
}

const navItems: NavItem[] = [
  { href: '/', label: '首页', icon: Home },
  { href: '/rankings', label: '每日排行精选', icon: TrendingUp },
  { href: '/daily', label: '每日美图', icon: CalendarDays },
  { href: '/artists', label: '画师鉴赏', icon: Palette },
  { href: '/topics', label: '话题鉴赏', icon: Hash },
  { href: '/articles', label: '文章', icon: BookOpen },
  { href: '/search', label: '搜图', icon: Search },
]

export default function Navigation() {
  const pathname = usePathname()
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  useEffect(() => {
    setIsMenuOpen(false)
  }, [pathname])

  useEffect(() => {
    document.body.style.overflow = isMenuOpen ? 'hidden' : ''
    return () => {
      document.body.style.overflow = ''
    }
  }, [isMenuOpen])

  return (
    <>
      <header className="fixed inset-x-0 top-0 z-50 border-b border-white/60 bg-[rgba(255,255,255,0.72)] backdrop-blur-xl supports-[backdrop-filter]:bg-[rgba(255,255,255,0.68)]">
        <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <Link href="/" className="flex items-center gap-3">
            <span className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-[linear-gradient(135deg,#059669,#34d399)] text-lg font-semibold text-white shadow-[0_12px_32px_rgba(5,150,105,0.28)]">
              萌
            </span>
            <span className="flex flex-col">
              <span className="text-base font-semibold tracking-[0.18em] text-slate-900 sm:text-lg">
                ACG萌图宅
              </span>
              <span className="hidden text-xs uppercase tracking-[0.22em] text-slate-500 sm:block">
                Curated Anime Art
              </span>
            </span>
          </Link>

          <nav className="hidden items-center gap-1 lg:flex">
            {navItems.map((item) => {
              const Icon = item.icon
              const isActive = pathname === item.href

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    'inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition',
                    isActive
                      ? 'bg-emerald-500/10 text-emerald-700'
                      : 'text-slate-600 hover:bg-white hover:text-slate-900'
                  )}
                >
                  <Icon className="h-4 w-4" />
                  <span>{item.label}</span>
                </Link>
              )
            })}
          </nav>

          <button
            type="button"
            onClick={() => setIsMenuOpen((prev) => !prev)}
            className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-slate-200 bg-white/90 text-slate-700 transition hover:border-slate-300 hover:text-slate-900 lg:hidden"
            aria-label={isMenuOpen ? '关闭菜单' : '打开菜单'}
            aria-expanded={isMenuOpen}
          >
            {isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </header>

      <div
        className={cn(
          'fixed inset-0 z-40 bg-slate-950/28 backdrop-blur-sm transition duration-200 lg:hidden',
          isMenuOpen ? 'pointer-events-auto opacity-100' : 'pointer-events-none opacity-0'
        )}
        onClick={() => setIsMenuOpen(false)}
      />

      <aside
        className={cn(
          'fixed right-0 top-0 z-50 flex h-full w-[min(86vw,22rem)] flex-col border-l border-white/60 bg-[linear-gradient(180deg,rgba(255,255,255,0.96)_0%,rgba(244,253,248,0.98)_100%)] px-5 pb-6 pt-24 shadow-[0_24px_80px_rgba(15,23,42,0.18)] transition-transform duration-300 lg:hidden',
          isMenuOpen ? 'translate-x-0' : 'translate-x-full'
        )}
      >
        <nav className="space-y-2">
          {navItems.map((item) => {
            const Icon = item.icon
            const isActive = pathname === item.href

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'flex items-center gap-3 rounded-2xl px-4 py-3 text-base font-medium transition',
                  isActive
                    ? 'bg-emerald-500/12 text-emerald-700'
                    : 'text-slate-700 hover:bg-white hover:text-slate-950'
                )}
              >
                <Icon className="h-5 w-5" />
                <span>{item.label}</span>
              </Link>
            )
          })}
        </nav>
      </aside>

      <div className="h-20" />
    </>
  )
}
