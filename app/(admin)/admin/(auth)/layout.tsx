import { redirectAuthenticatedAdmin } from '@/lib/admin-session'

export default async function AdminAuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  await redirectAuthenticatedAdmin()

  return children
}
