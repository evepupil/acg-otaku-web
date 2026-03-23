import { headers } from 'next/headers'

import Footer from '@/components/Footer'
import Navigation from '@/components/Navigation'

export default async function LayoutChrome({
  children,
}: {
  children: React.ReactNode
}) {
  const requestHeaders = await headers()
  const pathname = requestHeaders.get('x-pathname') || ''
  const isAdminRoute = pathname.startsWith('/admin')

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-emerald-50">
      {!isAdminRoute && <Navigation />}
      <main className="relative">{children}</main>
      {!isAdminRoute && <Footer />}
    </div>
  )
}
