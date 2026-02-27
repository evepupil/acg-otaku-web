/**
 * 文章API路由 - Next.js App Router API
 * 提供文章列表、详情、搜索等功能
 */

import { NextRequest, NextResponse } from 'next/server'
import { getAllArticles, getArticleById, searchArticles } from '../../../src/lib/articles'

// 备用模拟文章数据（当真实文章不存在时使用）
const mockArticles: Array<{
  id: string; slug: string; title: string; author_name: string; featured_image: string;
  excerpt: string; content: string; tags: string[]; published_at: string;
  view_count: number; category: string
}> = [
  {
    id: '201', slug: '201',
    title: '日系插画中的色彩运用技巧',
    author_name: '艺术评论家A',
    featured_image: 'https://trae-api-sg.mchost.guru/api/ide/v1/text_to_image?prompt=japanese%20illustration%20color%20theory%20art%20analysis%20colorful&image_size=landscape_16_9',
    excerpt: '深入分析日系插画中独特的色彩搭配方法，探讨如何通过色彩传达情感...',
    content: '日系插画以其独特的色彩运用而闻名世界。本文将从色彩心理学的角度，分析日系插画中常见的配色方案...',
    category: '技法分析',
    tags: ['色彩理论', '日系插画', '绘画技巧'],
    published_at: '2024-01-15',
    view_count: 12450
  },
  {
    id: '202', slug: '202',
    title: '从宫崎骏作品看动画场景设计',
    author_name: '动画研究者B',
    featured_image: 'https://trae-api-sg.mchost.guru/api/ide/v1/text_to_image?prompt=studio%20ghibli%20style%20landscape%20animation%20background%20detailed&image_size=landscape_16_9',
    excerpt: '宫崎骏动画中的场景设计蕴含着深厚的艺术功底，本文解析其构图与色彩的奥秘...',
    content: '宫崎骏的动画作品不仅在故事情节上引人入胜，其场景设计更是达到了艺术的高度...',
    category: '大师解析',
    tags: ['宫崎骏', '场景设计', '动画艺术'],
    published_at: '2024-01-12',
    view_count: 18920
  },
  {
    id: '203', slug: '203',
    title: '数字绘画工具对比：Photoshop vs Procreate',
    author_name: '数字艺术家C',
    featured_image: 'https://trae-api-sg.mchost.guru/api/ide/v1/text_to_image?prompt=digital%20art%20tools%20comparison%20tablet%20stylus%20creative%20workspace&image_size=landscape_16_9',
    excerpt: '详细对比两大主流数字绘画软件的优缺点，帮助艺术家选择适合的创作工具...',
    content: '在数字艺术创作领域，工具的选择往往决定了创作的效率和最终效果...',
    category: '工具推荐',
    tags: ['数字绘画', '软件对比', '创作工具'],
    published_at: '2024-01-10',
    view_count: 9876
  },
  {
    id: '204', slug: '204',
    title: '二次元角色设计的黄金法则',
    author_name: '角色设计师D',
    featured_image: 'https://trae-api-sg.mchost.guru/api/ide/v1/text_to_image?prompt=anime%20character%20design%20concept%20art%20multiple%20poses%20detailed&image_size=landscape_16_9',
    excerpt: '揭秘成功二次元角色设计背后的设计原理，从造型到性格的完整设计流程...',
    content: '一个成功的二次元角色不仅要有吸引人的外观，更要有鲜明的性格特征...',
    category: '设计理论',
    tags: ['角色设计', '二次元', '设计原理'],
    published_at: '2024-01-08',
    view_count: 15670
  },
  {
    id: '205', slug: '205',
    title: '插画师如何建立个人风格',
    author_name: '资深插画师E',
    featured_image: 'https://trae-api-sg.mchost.guru/api/ide/v1/text_to_image?prompt=artist%20personal%20style%20development%20creative%20process%20inspiration&image_size=landscape_16_9',
    excerpt: '从模仿到创新，探讨插画师建立独特个人风格的成长路径和实用方法...',
    content: '每个插画师都希望拥有自己独特的风格，但风格的形成是一个循序渐进的过程...',
    category: '职业发展',
    tags: ['个人风格', '插画师', '职业规划'],
    published_at: '2024-01-05',
    view_count: 11234
  }
]

/**
 * GET请求处理函数 - 获取文章列表或单篇文章
 * @param request - Next.js请求对象
 * @returns 文章数据响应
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const articleId = searchParams.get('id')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const category = searchParams.get('category')
    const search = searchParams.get('search')

    // 获取真实文章数据，如果没有则使用mock数据
    const realArticles = getAllArticles()
    const allArticles = realArticles.length > 0 ? realArticles : mockArticles

    // 如果指定了文章ID，返回单篇文章详情
    if (articleId) {
      let article
      if (realArticles.length > 0) {
        article = getArticleById(articleId)
      } else {
        article = mockArticles.find(item => item.id === articleId)
      }
      
      if (!article) {
        return NextResponse.json(
          { error: '文章不存在' },
          { status: 404 }
        )
      }
      return NextResponse.json({
        success: true,
        data: article
      })
    }

    let filteredArticles = allArticles

    // 分类筛选
    if (category) {
      filteredArticles = filteredArticles.filter(article =>
        ('category' in article && article.category === category) ||
        article.tags.includes(category)
      )
    }

    // 搜索筛选
    if (search) {
      if (realArticles.length > 0) {
        // 使用真实文章的搜索功能
        filteredArticles = searchArticles(search)
      } else {
        // 使用mock数据的搜索逻辑
        const searchLower = search.toLowerCase()
        filteredArticles = filteredArticles.filter(article => 
          article.title.toLowerCase().includes(searchLower) ||
          article.excerpt.toLowerCase().includes(searchLower) ||
          article.tags.some(tag => tag.toLowerCase().includes(searchLower))
        )
      }
    }

    // 按发布日期排序（最新的在前）
    filteredArticles.sort((a, b) => {
      const dateA = 'published_at' in a ? a.published_at : ''
      const dateB = 'published_at' in b ? b.published_at : ''
      return new Date(dateB).getTime() - new Date(dateA).getTime()
    })

    // 分页处理
    const startIndex = (page - 1) * limit
    const endIndex = startIndex + limit
    const paginatedArticles = filteredArticles.slice(startIndex, endIndex)

    // 获取所有分类
    const categories = Array.from(new Set(mockArticles.map(article => article.category)))

    return NextResponse.json({
      success: true,
      data: {
        articles: paginatedArticles,
        pagination: {
          page,
          limit,
          total: filteredArticles.length,
          totalPages: Math.ceil(filteredArticles.length / limit)
        },
        categories,
        filters: {
          category: category || 'all',
          search: search || ''
        }
      }
    })
  } catch (error) {
    console.error('获取文章数据失败:', error)
    return NextResponse.json(
      { error: '服务器内部错误' },
      { status: 500 }
    )
  }
}

/**
 * POST请求处理函数 - 记录文章阅读行为
 * @param request - Next.js请求对象
 * @returns 操作结果响应
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { action, articleId, readProgress } = body

    // 验证必要参数
    if (!action || !articleId) {
      return NextResponse.json(
        { error: '缺少必要参数' },
        { status: 400 }
      )
    }

    // 记录用户阅读行为
    console.log(`文章阅读行为: ${action} - 文章ID: ${articleId} - 阅读进度: ${readProgress || 0}%`)

    return NextResponse.json({
      success: true,
      message: '行为记录成功',
      data: {
        action,
        articleId,
        readProgress,
        timestamp: new Date().toISOString()
      }
    })
  } catch (error) {
    console.error('记录阅读行为失败:', error)
    return NextResponse.json(
      { error: '服务器内部错误' },
      { status: 500 }
    )
  }
}