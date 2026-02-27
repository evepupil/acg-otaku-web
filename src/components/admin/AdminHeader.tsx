'use client'

import { Menu, ExternalLink } from 'lucide-react'
import Link from 'next/link'

interface AdminHeaderProps {
  onToggleSidebar: () => void
}

export default function AdminHeader({ onToggleSidebar }: AdminHeaderProps) {
  return (
    <header className="fixed top-0 right-0 left-0 h-16 bg-white/80 backdrop-blur-xl border-b border-gray-200 z-20 flex items-center justify-between px-6">
      <div className="flex items-center gap-4">
        <button
          onClick={onToggleSidebar}
          className="p-2 rounded-lg hover:bg-gray-100 text-gray-500 lg:hidden"
        >
          <Menu className="w-5 h-5" />
        </button>
        <h2 className="text-lg font-semibold text-gray-900">ACG萌图宅 管理后台</h2>
      </div>

      <div className="flex items-center gap-3">
        <Link
          href="/"
          target="_blank"
          className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-gray-600 hover:text-green-600 bg-gray-50 rounded-lg hover:bg-green-50 transition-all"
        >
          <ExternalLink className="w-4 h-4" />
          查看前台
        </Link>
      </div>
    </header>
  )
}
