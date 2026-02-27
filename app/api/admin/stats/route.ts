import { NextRequest, NextResponse } from 'next/server'
import { verifyAdminRequest } from '@/lib/admin-auth'
import { getContentStats } from '@/lib/turso'

export async function GET(request: NextRequest) {
  const isAdmin = await verifyAdminRequest(request)
  if (!isAdmin) {
    return NextResponse.json({ success: false, error: '未授权' }, { status: 401 })
  }

  try {
    const stats = await getContentStats()
    return NextResponse.json({ success: true, data: stats })
  } catch (error) {
    console.error('获取统计数据失败:', error)
    return NextResponse.json({ success: false, error: '获取统计数据失败' }, { status: 500 })
  }
}
