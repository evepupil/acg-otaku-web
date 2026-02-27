'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard, Image, CalendarDays, Palette, Hash,
  ChevronLeft, ChevronRight, LogOut
} from 'lucide-react'

const menuItems = [
  { label: '仪表盘', href: '/admin', icon: LayoutDashboard },
  { label: '作品管理', href: '/admin/artworks', icon: Image },
  { label: '每日精选', href: '/admin/daily-picks', icon: CalendarDays },
  { label: '画师专题', href: '/admin/artists', icon: Palette },
  { label: '话题专题', href: '/admin/topics', icon: Hash },
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
    <aside className={`fixed left-0 top-0 h-full bg-white border-r border-gray-200 z-30 transition-all duration-300 ${isOpen ? 'w-64' : 'w-16'}`}>
      {/* Logo区域 */}
      <div className="h-16 flex items-center justify-between px-4 border-b border-gray-100">
        {isOpen && (
          <Link href="/admin" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-r from-green-500 to-emerald-600 rounded-lg flex items-center justify-center">
              <span className="text-white text-sm font-bold">A</span>
            </div>
            <span className="font-semibold text-gray-900">管理后台</span>
          </Link>
        )}
        <button
          onClick={onToggle}
          className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-500"
        >
          {isOpen ? <ChevronLeft className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
        </button>
      </div>

      {/* 导航菜单 */}
      <nav className="p-3 space-y-1">
        {menuItems.map(item => {
          const isActive = pathname === item.href || (item.href !== '/admin' && pathname?.startsWith(item.href))
          const Icon = item.icon

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all
                ${isActive
                  ? 'bg-green-50 text-green-700'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                }`}
              title={!isOpen ? item.label : undefined}
            >
              <Icon className={`w-5 h-5 flex-shrink-0 ${isActive ? 'text-green-600' : ''}`} />
              {isOpen && <span>{item.label}</span>}
            </Link>
          )
        })}
      </nav>

      {/* 底部退出按钮 */}
      <div className="absolute bottom-0 left-0 right-0 p-3 border-t border-gray-100">
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-gray-600 hover:bg-red-50 hover:text-red-600 transition-all w-full"
          title={!isOpen ? '退出登录' : undefined}
        >
          <LogOut className="w-5 h-5 flex-shrink-0" />
          {isOpen && <span>退出登录</span>}
        </button>
      </div>
    </aside>
  )
}
