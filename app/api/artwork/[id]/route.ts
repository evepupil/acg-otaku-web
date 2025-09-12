import { NextRequest, NextResponse } from 'next/server'
import { getArtworkById } from '@/lib/supabase'

/**
 * 获取单个作品详情的API路由
 * @param request - Next.js请求对象
 * @param params - 路由参数，包含作品ID
 * @returns 作品详情数据
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params
    const artworkId = parseInt(resolvedParams.id)
    
    if (isNaN(artworkId)) {
      return NextResponse.json(
        { success: false, error: '无效的作品ID' },
        { status: 400 }
      )
    }

    // 从数据库获取作品详情
    const artwork = await getArtworkById(artworkId)
    
    if (!artwork) {
      return NextResponse.json(
        { success: false, error: '作品不存在' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      data: artwork
    })
  } catch (error) {
    console.error('获取作品详情失败:', error)
    return NextResponse.json(
      { success: false, error: '服务器内部错误' },
      { status: 500 }
    )
  }
}