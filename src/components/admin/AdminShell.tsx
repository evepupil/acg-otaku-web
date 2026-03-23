'use client'

import { useState } from 'react'

import AdminHeader from '@/components/admin/AdminHeader'
import AdminSidebar from '@/components/admin/AdminSidebar'

interface AdminShellProps {
  children: React.ReactNode
}

export default function AdminShell({ children }: AdminShellProps) {
  const [sidebarOpen, setSidebarOpen] = useState(true)

  return (
    <div className="min-h-screen flex bg-gray-50">
      <AdminSidebar isOpen={sidebarOpen} onToggle={() => setSidebarOpen((open) => !open)} />
      <div className={`flex-1 transition-all duration-300 ${sidebarOpen ? 'ml-64' : 'ml-16'}`}>
        <AdminHeader onToggleSidebar={() => setSidebarOpen((open) => !open)} />
        <main className="mt-16 p-6">{children}</main>
      </div>
    </div>
  )
}
