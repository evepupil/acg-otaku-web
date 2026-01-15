/**
 * Pixiv 图片访问工具函数
 * 优先使用 B2 存储桶，降级到反代服务器
 */

/**
 * 图片尺寸类型
 * - thumb_mini: 极小缩略图
 * - small: 小卡片
 * - regular: 详情页
 * - original: 原始大图
 */
export type ImageSize = 'thumb_mini' | 'small' | 'regular' | 'original'

/**
 * 获取 B2 存储桶域名
 * @returns B2 存储桶 URL
 */
function getB2BucketUrl(): string {
  return process.env.NEXT_PUBLIC_B2_BUCKET_URL || 'https://pixiv-b2-bucket.acgotaku.com'
}

/**
 * 获取反代服务器地址
 * @returns 反代服务器 URL
 */
function getProxyServer(): string {
  return process.env.NEXT_PUBLIC_PROXY_SERVER || 'http://124.156.215.153:3003'
}

/**
 * 从 image_path 中解析指定尺寸的路径
 * image_path 格式为 JSON 数组字符串，如：
 * '["pixiv/123_Artist/456/original.png","pixiv/123_Artist/456/regular.png"]'
 *
 * @param imagePath - 数据库中的 image_path 字段值（JSON 数组字符串）
 * @param size - 目标尺寸
 * @returns 匹配的路径或 null
 */
function parseImagePath(imagePath: string | undefined | null, size: ImageSize): string | null {
  if (!imagePath) return null

  try {
    // 解析 JSON 数组
    const paths: string[] = JSON.parse(imagePath)

    if (!Array.isArray(paths)) return null

    // 查找后缀为 {size}.png 的路径
    const targetSuffix = `${size}.png`

    for (const path of paths) {
      const trimmedPath = path.trim()
      if (trimmedPath.endsWith(targetSuffix)) {
        return trimmedPath
      }
    }

    return null
  } catch {
    // JSON 解析失败，尝试旧格式（冒号分隔）
    const paths = imagePath.split(':')
    const targetSuffix = `${size}.png`

    for (const path of paths) {
      const trimmedPath = path.trim()
      if (trimmedPath.endsWith(targetSuffix)) {
        return trimmedPath
      }
    }

    return null
  }
}

/**
 * 生成图片访问 URL
 * 优先使用 B2 存储桶，如果 image_path 中没有对应尺寸则降级到反代
 *
 * @param pid - Pixiv 插画 ID
 * @param size - 图片尺寸，默认为 'small'
 * @param imagePath - 数据库中的 image_path 字段值（可选）
 * @returns 图片访问 URL
 */
export function getImageUrl(
  pid: string | number,
  size: ImageSize = 'small',
  imagePath?: string | null
): string {
  // 尝试从 image_path 解析 B2 路径
  const b2Path = parseImagePath(imagePath, size)

  if (b2Path) {
    // 使用 B2 存储桶访问
    const bucketUrl = getB2BucketUrl()
    return `${bucketUrl}/${b2Path}`
  }

  // 降级到反代服务器
  const proxyServer = getProxyServer()
  return `${proxyServer}/api?action=proxy&pid=${pid}&size=${size}`
}

/**
 * 生成代理图片 URL（兼容旧接口）
 * @deprecated 建议使用 getImageUrl 代替
 * @param pid - Pixiv 插画 ID
 * @param size - 图片尺寸，默认为 'small'
 * @returns 代理图片 URL
 */
export function getProxyImageUrl(pid: string | number, size: ImageSize = 'small'): string {
  // 没有 imagePath 时，直接使用反代
  const proxyServer = getProxyServer()
  return `${proxyServer}/api?action=proxy&pid=${pid}&size=${size}`
}

/**
 * 从原始 Pixiv URL 提取 PID
 * @param originalUrl - 原始 Pixiv 图片 URL
 * @returns PID 或 null
 */
export function extractPidFromUrl(originalUrl: string): string | null {
  // 匹配各种 Pixiv URL 格式
  const patterns = [
    /\/artworks\/(\d+)/,
    /\/illust\/(\d+)/,
    /_(\d+)_/,
    /\/img\/.+\/(\d+)_/,
    /\/c\/.+\/(\d+)_/
  ]

  for (const pattern of patterns) {
    const match = originalUrl.match(pattern)
    if (match) {
      return match[1]
    }
  }

  return null
}

/**
 * 将原始图片 URL 转换为代理 URL
 * @param originalUrl - 原始图片 URL
 * @param size - 目标图片尺寸
 * @returns 代理图片 URL 或原始 URL（如果无法提取 PID）
 */
export function convertToProxyUrl(originalUrl: string, size: ImageSize = 'small'): string {
  const pid = extractPidFromUrl(originalUrl)
  if (pid) {
    return getProxyImageUrl(pid, size)
  }
  return originalUrl
}

/**
 * 预加载图片
 * @param url - 图片 URL
 * @returns Promise<boolean> - 是否加载成功
 */
export function preloadImage(url: string): Promise<boolean> {
  return new Promise((resolve) => {
    const img = new Image()
    img.onload = () => resolve(true)
    img.onerror = () => resolve(false)
    img.src = url
  })
}

/**
 * 批量预加载图片
 * @param urls - 图片 URL 数组
 * @returns Promise<boolean[]> - 每个图片的加载结果
 */
export async function preloadImages(urls: string[]): Promise<boolean[]> {
  return Promise.all(urls.map(url => preloadImage(url)))
}

/**
 * 获取推荐的图片尺寸
 * @param context - 使用场景
 * @returns 推荐的图片尺寸
 */
export function getRecommendedSize(context: 'thumbnail' | 'card' | 'detail' | 'fullscreen'): ImageSize {
  switch (context) {
    case 'thumbnail':
      return 'thumb_mini'
    case 'card':
      return 'small'
    case 'detail':
      return 'regular'
    case 'fullscreen':
      return 'original'
    default:
      return 'small'
  }
}

/**
 * 生成带降级策略的图片 URL 列表
 * 用于 img 标签的 srcset 或图片加载失败时的备选
 *
 * @param pid - Pixiv 插画 ID
 * @param size - 目标尺寸
 * @param imagePath - 数据库中的 image_path 字段值
 * @returns 图片 URL 数组，优先级从高到低
 */
export function getImageUrlsWithFallback(
  pid: string | number,
  size: ImageSize,
  imagePath?: string | null
): string[] {
  const urls: string[] = []

  // 优先：B2 存储桶
  const b2Path = parseImagePath(imagePath, size)
  if (b2Path) {
    urls.push(`${getB2BucketUrl()}/${b2Path}`)
  }

  // 降级：反代服务器
  urls.push(`${getProxyServer()}/api?action=proxy&pid=${pid}&size=${size}`)

  return urls
}
