import { NextRequest, NextResponse } from 'next/server'
import { getDailyPickByDate, getPublishedDailyPicks } from '@/db/content'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const date = searchParams.get('date')
  const pickType = searchParams.get('type') || undefined
  const page = parseInt(searchParams.get('page') || '1')
  const limit = parseInt(searchParams.get('limit') || '20')

  try {
    // 按日期获取单个精选
    if (date) {
      const pick = await getDailyPickByDate(date, pickType)
      if (!pick) {
        return NextResponse.json({ success: true, data: null })
      }
      return NextResponse.json({ success: true, data: pick })
    }

    // 获取列表
    const { picks, total } = await getPublishedDailyPicks(page, limit, pickType)
    return NextResponse.json({
      success: true,
      data: {
        picks,
        pagination: { page, limit, total, totalPages: Math.ceil(total / limit) }
      }
    })
  } catch (error) {
    console.error('获取每日精选失败:', error)
    return NextResponse.json({ success: false, error: '获取失败' }, { status: 500 })
  }
}
