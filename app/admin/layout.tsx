'use client'

import { useState, useEffect } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import AdminSidebar from '@/components/admin/AdminSidebar'
import AdminHeader from '@/components/admin/AdminHeader'

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null)
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const router = useRouter()
  const pathname = usePathname()

  const isLoginPage = pathname === '/admin/login'

  useEffect(() => {
    if (isLoginPage) {
      setIsAuthenticated(true)
      return
    }

    // 检查认证状态：尝试访问一个需要认证的API
    fetch('/api/admin/stats')
      .then(res => {
        if (res.ok) {
          setIsAuthenticated(true)
        } else {
          setIsAuthenticated(false)
          router.push('/admin/login')
        }
      })
      .catch(() => {
        setIsAuthenticated(false)
        router.push('/admin/login')
      })
  }, [isLoginPage, router])

  if (isLoginPage) {
    return (
      <html lang="zh-CN">
        <body className="bg-gray-50">{children}</body>
      </html>
    )
  }

  if (isAuthenticated === null) {
    return (
      <html lang="zh-CN">
        <body className="bg-gray-50">
          <div className="min-h-screen flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600" />
          </div>
        </body>
      </html>
    )
  }

  if (!isAuthenticated) {
    return null
  }

  return (
    <html lang="zh-CN">
      <body className="bg-gray-50">
        <div className="min-h-screen flex">
          <AdminSidebar isOpen={sidebarOpen} onToggle={() => setSidebarOpen(!sidebarOpen)} />
          <div className={`flex-1 transition-all duration-300 ${sidebarOpen ? 'ml-64' : 'ml-16'}`}>
            <AdminHeader onToggleSidebar={() => setSidebarOpen(!sidebarOpen)} />
            <main className="p-6 mt-16">
              {children}
            </main>
          </div>
        </div>
      </body>
    </html>
  )
}
