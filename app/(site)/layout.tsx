import Footer from '@/components/Footer'
import Navigation from '@/components/Navigation'

function SiteLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-emerald-50">
      <Navigation />
      <main className="relative">{children}</main>
      <Footer />
    </div>
  )
}

export default SiteLayout
