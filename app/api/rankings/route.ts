import { NextRequest, NextResponse } from 'next/server'

/**
 * 排行榜数据接口
 * 支持每日、每周、每月排行榜查询
 */

// 模拟排行榜数据
const mockRankings = {
  daily: [
    {
      id: 1,
      title: '夏日海滩少女',
      artist: '画师A',
      imageUrl: 'https://trae-api-sg.mchost.guru/api/ide/v1/text_to_image?prompt=anime%20girl%20on%20beach%20summer%20illustration%20colorful%20detailed&image_size=square_hd',
      views: 15420,
      likes: 2341,
      rank: 1
    },
    {
      id: 2,
      title: '魔法少女变身',
      artist: '画师B',
      imageUrl: 'https://trae-api-sg.mchost.guru/api/ide/v1/text_to_image?prompt=magical%20girl%20transformation%20anime%20illustration%20sparkles%20colorful&image_size=square_hd',
      views: 12890,
      likes: 1987,
      rank: 2
    },
    {
      id: 3,
      title: '樱花飞舞',
      artist: '画师C',
      imageUrl: 'https://trae-api-sg.mchost.guru/api/ide/v1/text_to_image?prompt=cherry%20blossoms%20falling%20anime%20girl%20spring%20illustration%20pink&image_size=square_hd',
      views: 11234,
      likes: 1756,
      rank: 3
    }
  ],
  weekly: [
    {
      id: 4,
      title: '星空下的约定',
      artist: '画师D',
      imageUrl: 'https://trae-api-sg.mchost.guru/api/ide/v1/text_to_image?prompt=starry%20night%20anime%20couple%20romantic%20illustration%20detailed&image_size=square_hd',
      views: 45670,
      likes: 6789,
      rank: 1
    },
    {
      id: 5,
      title: '机械少女',
      artist: '画师E',
      imageUrl: 'https://trae-api-sg.mchost.guru/api/ide/v1/text_to_image?prompt=cyberpunk%20anime%20girl%20mechanical%20parts%20futuristic%20illustration&image_size=square_hd',
      views: 38920,
      likes: 5432,
      rank: 2
    }
  ],
  monthly: [
    {
      id: 6,
      title: '古风美人',
      artist: '画师F',
      imageUrl: 'https://trae-api-sg.mchost.guru/api/ide/v1/text_to_image?prompt=traditional%20chinese%20style%20beautiful%20woman%20hanfu%20illustration%20elegant&image_size=square_hd',
      views: 123450,
      likes: 18765,
      rank: 1
    }
  ]
}

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

    // 获取对应时间周期的排行榜数据
    const rankings = mockRankings[period as keyof typeof mockRankings] || []
    
    // 分页处理
    const startIndex = (page - 1) * limit
    const endIndex = startIndex + limit
    const paginatedRankings = rankings.slice(startIndex, endIndex)

    return NextResponse.json({
      success: true,
      data: {
        rankings: paginatedRankings,
        pagination: {
          page,
          limit,
          total: rankings.length,
          totalPages: Math.ceil(rankings.length / limit)
        },
        period
      }
    })
  } catch (error) {
    console.error('获取排行榜数据失败:', error)
    return NextResponse.json(
      { error: '服务器内部错误' },
      { status: 500 }
    )
  }
}