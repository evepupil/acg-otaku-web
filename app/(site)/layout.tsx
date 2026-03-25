import Footer from '@/components/Footer'
import Navigation from '@/components/Navigation'

function SiteLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-[#f3f5f7]">
      <Navigation />
      <main className="relative">{children}</main>
      <Footer />
    </div>
  )
}

export default SiteLayout
