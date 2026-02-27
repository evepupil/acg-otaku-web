import { NextRequest, NextResponse } from 'next/server'
import { getArtistFeatures } from '@/lib/turso'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const page = parseInt(searchParams.get('page') || '1')
  const limit = parseInt(searchParams.get('limit') || '20')

  try {
    const { features, total } = await getArtistFeatures(page, limit, true)
    return NextResponse.json({
      success: true,
      data: { features, pagination: { page, limit, total, totalPages: Math.ceil(total / limit) } }
    })
  } catch (error) {
    console.error('获取画师专题列表失败:', error)
    return NextResponse.json({ success: false, error: '获取失败' }, { status: 500 })
  }
}
