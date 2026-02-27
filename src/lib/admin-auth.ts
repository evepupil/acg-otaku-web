import { SignJWT, jwtVerify } from 'jose'
import { NextRequest } from 'next/server'

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || ''
const JWT_SECRET = process.env.ADMIN_JWT_SECRET || 'default-secret-change-me'

const secret = new TextEncoder().encode(JWT_SECRET)
const TOKEN_COOKIE_NAME = 'admin_token'
const TOKEN_EXPIRY = '7d'

/**
 * 验证管理员密码并生成JWT token
 */
export async function loginAdmin(password: string): Promise<string | null> {
  if (!ADMIN_PASSWORD || password !== ADMIN_PASSWORD) {
    return null
  }

  const token = await new SignJWT({ role: 'admin' })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(TOKEN_EXPIRY)
    .sign(secret)

  return token
}

/**
 * 验证JWT token
 */
export async function verifyAdminToken(token: string): Promise<boolean> {
  try {
    await jwtVerify(token, secret)
    return true
  } catch {
    return false
  }
}

/**
 * 从请求中验证管理员身份
 */
export async function verifyAdminRequest(request: NextRequest): Promise<boolean> {
  // 优先从cookie获取token
  const cookieToken = request.cookies.get(TOKEN_COOKIE_NAME)?.value
  if (cookieToken) {
    return verifyAdminToken(cookieToken)
  }

  // 其次从Authorization header获取
  const authHeader = request.headers.get('Authorization')
  if (authHeader?.startsWith('Bearer ')) {
    const token = authHeader.slice(7)
    return verifyAdminToken(token)
  }

  return false
}

export { TOKEN_COOKIE_NAME }
