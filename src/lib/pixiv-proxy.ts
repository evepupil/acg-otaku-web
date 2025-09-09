/**
 * Pixiv 代理服务工具函数
 * 用于生成代理图片 URL 和处理图片请求
 */

/**
 * 代理服务域名
 */
const PROXY_DOMAIN = 'pixiv-proxy.acgotaku.com'

/**
 * 图片尺寸类型
 */
export type ImageSize = 'thumb_mini' | 'small' | 'regular' | 'original'

/**
 * 生成代理图片 URL
 * @param pid - Pixiv 插画 ID
 * @param size - 图片尺寸，默认为 'small'
 * @returns 代理图片 URL
 */
export function getProxyImageUrl(pid: string | number, size: ImageSize = 'small'): string {
  return `https://${PROXY_DOMAIN}/proxy/${pid}?size=${size}`
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