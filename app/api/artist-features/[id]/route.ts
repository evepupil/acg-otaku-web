import { NextRequest, NextResponse } from 'next/server'
import { getArtistFeatureById } from '@/db/content'

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  try {
    const feature = await getArtistFeatureById(parseInt(id))
    if (!feature || !feature.isPublished) {
      return NextResponse.json({ success: false, error: '未找到' }, { status: 404 })
    }
    return NextResponse.json({ success: true, data: feature })
  } catch (error) {
    console.error('获取画师专题详情失败:', error)
    return NextResponse.json({ success: false, error: '获取失败' }, { status: 500 })
  }
}
