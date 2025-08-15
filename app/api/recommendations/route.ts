import { NextRequest, NextResponse } from 'next/server'

/**
 * 推荐插画数据接口
 * 提供基于算法的个性化推荐内容
 */

// 模拟推荐数据
const mockRecommendations = [
  {
    id: 101,
    title: '梦幻森林精灵',
    artist: '梦境画师',
    imageUrl: 'https://trae-api-sg.mchost.guru/api/ide/v1/text_to_image?prompt=fantasy%20forest%20elf%20anime%20girl%20magical%20illustration%20detailed&image_size=square_hd',
    tags: ['奇幻', '精灵', '森林'],
    views: 8765,
    likes: 1234,
    description: '在神秘的森林深处，精灵少女轻舞飞扬',
    recommendReason: '基于您对奇幻题材的喜好推荐'
  },
  {
    id: 102,
    title: '都市夜景咖啡厅',
    artist: '城市速写师',
    imageUrl: 'https://trae-api-sg.mchost.guru/api/ide/v1/text_to_image?prompt=urban%20night%20cafe%20anime%20girl%20city%20lights%20cozy%20illustration&image_size=square_hd',
    tags: ['都市', '夜景', '咖啡厅'],
    views: 6543,
    likes: 987,
    description: '霓虹灯下的温馨咖啡时光',
    recommendReason: '您经常浏览都市风格作品'
  },
  {
    id: 103,
    title: '水彩风景画',
    artist: '水彩大师',
    imageUrl: 'https://trae-api-sg.mchost.guru/api/ide/v1/text_to_image?prompt=watercolor%20landscape%20painting%20soft%20colors%20peaceful%20nature&image_size=square_hd',
    tags: ['水彩', '风景', '自然'],
    views: 5432,
    likes: 876,
    description: '淡雅水彩描绘的宁静山水',
    recommendReason: '推荐给喜欢传统绘画风格的您'
  },
  {
    id: 104,
    title: '赛博朋克战士',
    artist: '未来画师',
    imageUrl: 'https://trae-api-sg.mchost.guru/api/ide/v1/text_to_image?prompt=cyberpunk%20warrior%20anime%20girl%20neon%20futuristic%20detailed%20illustration&image_size=square_hd',
    tags: ['赛博朋克', '科幻', '战士'],
    views: 9876,
    likes: 1543,
    description: '未来世界的霓虹战士',
    recommendReason: '热门科幻题材推荐'
  },
  {
    id: 105,
    title: '校园青春',
    artist: '青春记录者',
    imageUrl: 'https://trae-api-sg.mchost.guru/api/ide/v1/text_to_image?prompt=school%20life%20anime%20students%20cherry%20blossoms%20youth%20illustration&image_size=square_hd',
    tags: ['校园', '青春', '学生'],
    views: 7654,
    likes: 1098,
    description: '樱花飞舞的校园时光',
    recommendReason: '经典校园题材，永不过时'
  }
]

/**
 * GET请求处理函数 - 获取推荐插画数据
 * @param request - Next.js请求对象
 * @returns 推荐数据响应
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const category = searchParams.get('category') // 可选的分类筛选

    let filteredRecommendations = mockRecommendations

    // 如果指定了分类，进行筛选
    if (category) {
      filteredRecommendations = mockRecommendations.filter(item => 
        item.tags.some(tag => tag.toLowerCase().includes(category.toLowerCase()))
      )
    }

    // 分页处理
    const startIndex = (page - 1) * limit
    const endIndex = startIndex + limit
    const paginatedRecommendations = filteredRecommendations.slice(startIndex, endIndex)

    // 模拟推荐算法 - 随机打乱顺序以模拟个性化
    const shuffledRecommendations = [...paginatedRecommendations].sort(() => Math.random() - 0.5)

    return NextResponse.json({
      success: true,
      data: {
        recommendations: shuffledRecommendations,
        pagination: {
          page,
          limit,
          total: filteredRecommendations.length,
          totalPages: Math.ceil(filteredRecommendations.length / limit)
        },
        category: category || 'all',
        timestamp: new Date().toISOString()
      }
    })
  } catch (error) {
    console.error('获取推荐数据失败:', error)
    return NextResponse.json(
      { error: '服务器内部错误' },
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