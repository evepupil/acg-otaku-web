/**
 * 服务端Pixiv API调用
 * 用于管理后台通过PID获取Pixiv插画信息
 */

const PIXIV_COOKIE = process.env.PIXIV_COOKIE || ''

interface PixivIllustInfo {
  pid: string
  title: string
  authorId: string
  authorName: string
  tags: string[]
  imageUrls: {
    thumb_mini: string
    small: string
    regular: string
    original: string
  }
  viewCount: number
  likeCount: number
  bookmarkCount: number
  pageCount: number
}

const defaultHeaders = {
  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  'Referer': 'https://www.pixiv.net/',
  'Accept-Language': 'zh-CN,zh;q=0.9,en;q=0.8',
  'Cookie': PIXIV_COOKIE,
}

/**
 * 获取Pixiv插画详细信息
 */
export async function fetchPixivIllustInfo(pid: string): Promise<PixivIllustInfo | null> {
  try {
    // 获取基本信息
    const infoRes = await fetch(`https://www.pixiv.net/ajax/illust/${pid}?lang=zh`, {
      headers: defaultHeaders,
    })

    if (!infoRes.ok) {
      console.error(`获取Pixiv插画 ${pid} 信息失败: HTTP ${infoRes.status}`)
      return null
    }

    const infoData = await infoRes.json()
    if (infoData.error !== false || !infoData.body) {
      console.error(`Pixiv API返回错误: ${infoData.message || '未知错误'}`)
      return null
    }

    const body = infoData.body

    // 获取图片URL列表
    const pagesRes = await fetch(`https://www.pixiv.net/ajax/illust/${pid}/pages?lang=zh`, {
      headers: defaultHeaders,
    })

    let imageUrls = {
      thumb_mini: '',
      small: '',
      regular: '',
      original: '',
    }

    if (pagesRes.ok) {
      const pagesData = await pagesRes.json()
      if (pagesData.error === false && pagesData.body?.length > 0) {
        const urls = pagesData.body[0].urls
        imageUrls = {
          thumb_mini: urls.thumb_mini || '',
          small: urls.small || '',
          regular: urls.regular || '',
          original: urls.original || '',
        }
      }
    }

    const tags = body.tags?.tags?.map((t: { tag: string }) => t.tag) || []

    return {
      pid,
      title: body.title || '',
      authorId: body.userId || '',
      authorName: body.userName || '',
      tags,
      imageUrls,
      viewCount: body.viewCount || 0,
      likeCount: body.likeCount || 0,
      bookmarkCount: body.bookmarkCount || 0,
      pageCount: body.pageCount || 1,
    }
  } catch (error) {
    console.error(`获取Pixiv插画 ${pid} 信息异常:`, error)
    return null
  }
}

/**
 * 获取Pixiv插画的所有页面图片URL
 */
export async function fetchPixivIllustPages(pid: string): Promise<Array<{
  thumb_mini: string
  small: string
  regular: string
  original: string
}>> {
  try {
    const res = await fetch(`https://www.pixiv.net/ajax/illust/${pid}/pages?lang=zh`, {
      headers: defaultHeaders,
    })

    if (!res.ok) return []

    const data = await res.json()
    if (data.error !== false || !data.body) return []

    return data.body.map((page: { urls: Record<string, string> }) => ({
      thumb_mini: page.urls.thumb_mini || '',
      small: page.urls.small || '',
      regular: page.urls.regular || '',
      original: page.urls.original || '',
    }))
  } catch (error) {
    console.error(`获取Pixiv插画 ${pid} 页面信息异常:`, error)
    return []
  }
}
