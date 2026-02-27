import { NextRequest, NextResponse } from 'next/server'
import { loginAdmin, TOKEN_COOKIE_NAME } from '@/lib/admin-auth'

export async function POST(request: NextRequest) {
  try {
    const { password } = await request.json()

    if (!password) {
      return NextResponse.json(
        { success: false, error: '请输入密码' },
        { status: 400 }
      )
    }

    const token = await loginAdmin(password)

    if (!token) {
      return NextResponse.json(
        { success: false, error: '密码错误' },
        { status: 401 }
      )
    }

    const response = NextResponse.json({ success: true })
    response.cookies.set(TOKEN_COOKIE_NAME, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60, // 7天
      path: '/',
    })

    return response
  } catch {
    return NextResponse.json(
      { success: false, error: '登录失败' },
      { status: 500 }
    )
  }
}
