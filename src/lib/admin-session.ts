import 'server-only'

import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'

import { TOKEN_COOKIE_NAME, verifyAdminToken } from '@/lib/admin-auth'

export async function hasAdminSession() {
  const cookieStore = await cookies()
  const token = cookieStore.get(TOKEN_COOKIE_NAME)?.value

  if (!token) {
    return false
  }

  return verifyAdminToken(token)
}

export async function requireAdminSession() {
  if (!(await hasAdminSession())) {
    redirect('/admin/login')
  }
}

export async function redirectAuthenticatedAdmin() {
  if (await hasAdminSession()) {
    redirect('/admin')
  }
}
