'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  Hash,
  Image,
  LayoutDashboard,
  LogOut,
  Palette,
  Target,
} from 'lucide-react'

const menuItems = [
  { label: '\u4eea\u8868\u76d8', href: '/admin', icon: LayoutDashboard },
  { label: '\u4f5c\u54c1\u7ba1\u7406', href: '/admin/artworks', icon: Image },
  { label: '\u6bcf\u65e5\u7f8e\u56fe', href: '/admin/daily-picks', icon: CalendarDays },
  { label: '\u753b\u5e08\u4e13\u9898', href: '/admin/artists', icon: Palette },
  { label: '\u8bdd\u9898\u4e13\u9898', href: '/admin/topics', icon: Hash },
  { label: '\u76d1\u63a7\u6e90', href: '/admin/watch-targets', icon: Target },
]

interface AdminSidebarProps {
  isOpen: boolean
  onToggle: () => void
}

export default function AdminSidebar({ isOpen, onToggle }: AdminSidebarProps) {
  const pathname = usePathname()

  const handleLogout = async () => {
    await fetch('/api/admin/login', { method: 'DELETE' })
    window.location.href = '/admin/login'
  }

  return (
    <aside
      className={`fixed left-0 top-0 z-30 h-full border-r border-gray-200 bg-white transition-all duration-300 ${
        isOpen ? 'w-64' : 'w-16'
      }`}
    >
      <div className="flex h-16 items-center justify-between border-b border-gray-100 px-4">
        {isOpen && (
          <Link href="/admin" className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-r from-green-500 to-emerald-600">
              <span className="text-sm font-bold text-white">A</span>
            </div>
            <span className="font-semibold text-gray-900">Admin</span>
          </Link>
        )}
        <button onClick={onToggle} className="rounded-lg p-1.5 text-gray-500 hover:bg-gray-100">
          {isOpen ? <ChevronLeft className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
        </button>
      </div>

      <nav className="space-y-1 p-3">
        {menuItems.map((item) => {
          const isActive = pathname === item.href || (item.href !== '/admin' && pathname?.startsWith(item.href))
          const Icon = item.icon

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all ${
                isActive
                  ? 'bg-green-50 text-green-700'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
              }`}
              title={!isOpen ? item.label : undefined}
            >
              <Icon className={`h-5 w-5 flex-shrink-0 ${isActive ? 'text-green-600' : ''}`} />
              {isOpen && <span>{item.label}</span>}
            </Link>
          )
        })}
      </nav>

      <div className="absolute bottom-0 left-0 right-0 border-t border-gray-100 p-3">
        <button
          onClick={handleLogout}
          className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-gray-600 transition-all hover:bg-red-50 hover:text-red-600"
          title={!isOpen ? '\u9000\u51fa\u767b\u5f55' : undefined}
        >
          <LogOut className="h-5 w-5 flex-shrink-0" />
          {isOpen && <span>\u9000\u51fa\u767b\u5f55</span>}
        </button>
      </div>
    </aside>
  )
}
