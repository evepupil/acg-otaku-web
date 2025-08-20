import { NextRequest, NextResponse } from 'next/server'
import { getRecommendations } from '@/lib/supabase'

/**
 * 推荐插画数据接口
 * 支持分页筛选，从Supabase数据库获取真实数据
 */

/**
 * GET请求处理函数 - 获取推荐插画数据
 * @param request - Next.js请求对象
 * @returns 推荐插画数据响应
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '12')

    // 从Supabase数据库获取推荐数据
    const { recommendations, total } = await getRecommendations(page, limit)

    return NextResponse.json({
      success: true,
      data: {
        recommendations: recommendations,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit)
        }
      }
    })
  } catch (error) {
    console.error('获取推荐数据失败:', error)
    return NextResponse.json(
      { error: `服务器内部错误: ${error instanceof Error ? error.message : '未知错误'}` },
      { status: 500 }
    )
  }
}

/**
 * POST请求处理函数 - 记录用户行为以优化推荐
 * @param request - Next.js请求对象
 * @returns 操作结果响应
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { action, itemId, userId } = body

    // 验证必要参数
    if (!action || !itemId) {
      return NextResponse.json(
        { error: '缺少必要参数' },
        { status: 400 }
      )
    }

    // 这里可以记录用户行为数据，用于优化推荐算法
    console.log(`用户行为记录: ${action} - 作品ID: ${itemId} - 用户ID: ${userId || 'anonymous'}`)

    return NextResponse.json({
      success: true,
      message: '行为记录成功',
      data: {
        action,
        itemId,
        timestamp: new Date().toISOString()
      }
    })
  } catch (error) {
    console.error('记录用户行为失败:', error)
    return NextResponse.json(
      { error: '服务器内部错误' },
      { status: 500 }
    )
  }
}