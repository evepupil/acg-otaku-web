import { NextRequest, NextResponse } from 'next/server'
import { getRankings } from '@/lib/supabase'

/**
 * 排行榜数据接口
 * 支持每日、每周、每月排行榜查询
 * 从Supabase数据库获取真实数据
 */

/**
 * GET请求处理函数 - 获取排行榜数据
 * @param request - Next.js请求对象
 * @returns 排行榜数据响应
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const period = searchParams.get('period') || 'daily' // 默认为每日排行榜
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')

    // 验证时间周期参数
    if (!['daily', 'weekly', 'monthly'].includes(period)) {
      return NextResponse.json(
        { error: '无效的时间周期参数' },
        { status: 400 }
      )
    }

    // 从Supabase数据库获取排行榜数据
    const { artworks, total } = await getRankings(
      period as 'daily' | 'weekly' | 'monthly',
      page,
      limit
    )

    return NextResponse.json({
      success: true,
      data: {
        rankings: artworks,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit)
        },
        period
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