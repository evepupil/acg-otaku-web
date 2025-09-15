/**
 * 图片搜索API路由
 * 集成SauceNAO进行反向图像搜索
 */

import { NextRequest, NextResponse } from 'next/server'

/**
 * SauceNAO搜索结果接口
 */
interface SauceNAOResult {
  header: {
    similarity: string
    thumbnail: string
    index_id: number
    index_name: string
  }
  data: {
    title?: string
    member_name?: string
    member_id?: string
    pixiv_id?: string
    ext_urls?: string[]
    source?: string
    creator?: string
    material?: string
    characters?: string
    eng_name?: string
    jp_name?: string
  }
}

/**
 * SauceNAO API响应接口
 */
interface SauceNAOResponse {
  header: {
    user_id: string
    account_type: string
    short_limit: string
    long_limit: string
    long_remaining: number
    short_remaining: number
    status: number
    results_requested: number
    index: Record<string, unknown>
    search_depth: string
    minimum_similarity: number
    query_image_display: string
    query_image: string
    results_returned: number
  }
  results: SauceNAOResult[]
}

/**
 * 处理POST请求 - 图片搜索
 */
export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File

    if (!file) {
      return NextResponse.json(
        { error: '请提供图片文件' },
        { status: 400 }
      )
    }

    // 验证文件类型
    if (!file.type.startsWith('image/')) {
      return NextResponse.json(
        { error: '文件必须是图片格式' },
        { status: 400 }
      )
    }

    // 验证文件大小 (最大10MB)
    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json(
        { error: '图片文件不能超过10MB' },
        { status: 400 }
      )
    }

    // 准备发送到SauceNAO的表单数据
    const sauceFormData = new FormData()
    sauceFormData.append('file', file)
    sauceFormData.append('output_type', '2') // JSON输出
    sauceFormData.append('numres', '10') // 返回结果数量
    sauceFormData.append('db', '999') // 搜索所有数据库
    sauceFormData.append('dedupe', '2') // 去重
    
    // 如果有API密钥，添加到请求中
    const apiKey = process.env.SAUCENAO_API_KEY
    if (apiKey) {
      sauceFormData.append('api_key', apiKey)
    }

    // 调用SauceNAO API
    const sauceResponse = await fetch('https://saucenao.com/search.php', {
      method: 'POST',
      body: sauceFormData,
    })

    if (!sauceResponse.ok) {
      throw new Error(`SauceNAO API请求失败: ${sauceResponse.status}`)
    }

    const sauceData: SauceNAOResponse = await sauceResponse.json()

    // 检查API响应状态
    if (sauceData.header.status !== 0) {
      throw new Error('SauceNAO搜索失败')
    }

    // 处理搜索结果
    const results = sauceData.results?.map((result) => {
      const similarity = parseFloat(result.header.similarity) / 100
      const data = result.data
      
      // 提取标题
      let title = data.title || data.eng_name || data.jp_name
      if (!title && data.material) {
        title = data.material
      }
      
      // 提取作者
      const author = data.member_name || data.creator
      
      // 提取来源
      let source = result.header.index_name
      if (data.pixiv_id) {
        source = 'Pixiv'
      }
      
      // 提取URL
      let url: string | undefined
      if (data.ext_urls && data.ext_urls.length > 0) {
        url = data.ext_urls[0]
      } else if (data.pixiv_id) {
        url = `https://www.pixiv.net/artworks/${data.pixiv_id}`
      }
      
      return {
        similarity,
        thumbnail: result.header.thumbnail,
        title,
        author,
        source,
        url,
      }
    }) || []

    // 过滤相似度过低的结果
    const filteredResults = results.filter(result => result.similarity >= 0.6)

    return NextResponse.json({
      success: true,
      results: filteredResults,
      total: filteredResults.length,
      remaining_searches: {
        short: sauceData.header.short_remaining,
        long: sauceData.header.long_remaining,
      },
    })
  } catch (error) {
    console.error('图片搜索错误:', error)
    
    return NextResponse.json(
      { 
        error: error instanceof Error ? error.message : '搜索失败，请稍后重试',
        success: false 
      },
      { status: 500 }
    )
  }
}

/**
 * 处理GET请求 - 获取搜索限制信息
 */
export async function GET() {
  try {
    const apiKey = process.env.SAUCENAO_API_KEY
    
    if (!apiKey) {
      return NextResponse.json({
        message: '未配置API密钥，使用匿名搜索（有限制）',
        limits: {
          short: '每30秒6次',
          long: '每24小时100次'
        }
      })
    }

    // 获取账户信息
    const response = await fetch(`https://saucenao.com/user.php?api_key=${apiKey}`)
    
    if (response.ok) {
      const data = await response.text()
      return NextResponse.json({
        message: '已配置API密钥',
        account_info: data
      })
    }
    
    return NextResponse.json({
      message: 'API密钥可能无效',
      limits: {
        short: '每30秒6次',
        long: '每24小时100次'
      }
    })
  } catch {
    return NextResponse.json(
      { error: '获取账户信息失败' },
      { status: 500 }
    )
  }
}