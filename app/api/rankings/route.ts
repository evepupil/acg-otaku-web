import { NextRequest, NextResponse } from 'next/server'
import { getPublishedDailyPicks, getDailyPickByDate } from '@/lib/turso'

/**
 * 排行榜精选数据接口
 * 从daily_pick表获取人工精选的排行数据
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const date = searchParams.get('date')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')

    // 按日期获取单个精选
    if (date) {
      const pick = await getDailyPickByDate(date, 'ranking_pick')
      if (!pick) {
        return NextResponse.json({
          success: true,
          data: { rankings: [], pagination: { page: 1, limit, total: 0, totalPages: 0 }, date }
        })
      }
      return NextResponse.json({
        success: true,
        data: {
          rankings: pick.artworks,
          pagination: { page: 1, limit: pick.artworks.length, total: pick.artworks.length, totalPages: 1 },
          date: pick.pickDate,
          title: pick.title,
          description: pick.description,
        }
      })
    }

    // 获取所有排行精选列表
    const { picks, total } = await getPublishedDailyPicks(page, limit, 'ranking_pick')

    // 取第一个的作品作为默认展示
    const latestPick = picks[0] || null

    return NextResponse.json({
      success: true,
      data: {
        rankings: latestPick?.artworks || [],
        pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
        date: latestPick?.pickDate || '',
        title: latestPick?.title || '',
        description: latestPick?.description || '',
        picks: picks.map(p => ({ id: p.id, pickDate: p.pickDate, title: p.title })),
      }
    })
  } catch (error) {
    console.error('获取排行榜数据失败:', error)
    return NextResponse.json(
      { error: `服务器内部错误: ${error instanceof Error ? error.message : '未知错误'}` },
      { status: 500 }
    )
  }
}
