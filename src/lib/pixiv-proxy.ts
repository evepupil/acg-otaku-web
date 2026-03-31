/**
 * Pixiv image access helpers.
 * Prefer B2 object URLs when available, fallback to proxy server.
 */

export type ImageSize = 'thumb_mini' | 'small' | 'regular' | 'original'

const IMAGE_SIZE_FALLBACK_ORDER: Record<ImageSize, ImageSize[]> = {
  thumb_mini: ['thumb_mini', 'small', 'regular', 'original'],
  small: ['small', 'regular', 'original', 'thumb_mini'],
  regular: ['regular', 'original', 'small', 'thumb_mini'],
  original: ['original', 'regular', 'small', 'thumb_mini'],
}

function getB2BucketUrl(): string {
  return process.env.NEXT_PUBLIC_B2_BUCKET_URL || 'https://pixiv-b2-bucket.acgotaku.com'
}

function getProxyServer(): string {
  return process.env.NEXT_PUBLIC_PROXY_SERVER || 'http://124.156.215.153:3003'
}

function extractSizeFromPath(path: string): ImageSize | null {
  const sizes: ImageSize[] = ['original', 'regular', 'small', 'thumb_mini']
  const lowerPath = path.toLowerCase()

  for (const size of sizes) {
    if (
      lowerPath.includes(`/${size}.`) ||
      lowerPath.includes(`_${size}.`) ||
      lowerPath.includes(`-${size}.`) ||
      lowerPath.endsWith(`${size}.png`) ||
      lowerPath.endsWith(`${size}.jpg`) ||
      lowerPath.endsWith(`${size}.webp`)
    ) {
      return size
    }
  }

  return null
}

function parsePathList(imagePath: string | undefined | null): string[] {
  if (!imagePath) return []

  try {
    const parsed: unknown = JSON.parse(imagePath)
    if (Array.isArray(parsed)) {
      return parsed.map((item) => String(item).trim()).filter(Boolean)
    }
  } catch {
    // legacy format fallback
  }

  return imagePath
    .split(':')
    .map((item) => item.trim())
    .filter(Boolean)
}

function findPathBySize(paths: string[], size: ImageSize): string | null {
  for (const path of paths) {
    const pathSize = extractSizeFromPath(path)
    if (pathSize === size) {
      return path
    }
  }
  return null
}

function parseImagePathWithFallback(
  imagePath: string | undefined | null,
  size: ImageSize
): string | null {
  const paths = parsePathList(imagePath)
  if (paths.length === 0) return null

  for (const fallbackSize of IMAGE_SIZE_FALLBACK_ORDER[size]) {
    const hit = findPathBySize(paths, fallbackSize)
    if (hit) return hit
  }

  return null
}

export function getImageUrl(
  pid: string | number,
  size: ImageSize = 'small',
  imagePath?: string | null
): string {
  const b2Path = parseImagePathWithFallback(imagePath, size)

  if (b2Path) {
    return `${getB2BucketUrl()}/${b2Path}`
  }

  return `${getProxyServer()}/api?action=proxy&pid=${pid}&size=${size}`
}

/**
 * @deprecated Prefer getImageUrl.
 */
export function getProxyImageUrl(pid: string | number, size: ImageSize = 'small'): string {
  return `${getProxyServer()}/api?action=proxy&pid=${pid}&size=${size}`
}

export function extractPidFromUrl(originalUrl: string): string | null {
  const patterns = [
    /\/artworks\/(\d+)/,
    /\/illust\/(\d+)/,
    /_(\d+)_/,
    /\/img\/.+\/(\d+)_/,
    /\/c\/.+\/(\d+)_/,
  ]

  for (const pattern of patterns) {
    const match = originalUrl.match(pattern)
    if (match) {
      return match[1]
    }
  }

  return null
}

export function convertToProxyUrl(originalUrl: string, size: ImageSize = 'small'): string {
  const pid = extractPidFromUrl(originalUrl)
  if (pid) {
    return getProxyImageUrl(pid, size)
  }
  return originalUrl
}

export function preloadImage(url: string): Promise<boolean> {
  return new Promise((resolve) => {
    const img = new Image()
    img.onload = () => resolve(true)
    img.onerror = () => resolve(false)
    img.src = url
  })
}

export async function preloadImages(urls: string[]): Promise<boolean[]> {
  return Promise.all(urls.map((url) => preloadImage(url)))
}

export function getRecommendedSize(
  context: 'thumbnail' | 'card' | 'detail' | 'fullscreen'
): ImageSize {
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

export function getImageUrlsWithFallback(
  pid: string | number,
  size: ImageSize,
  imagePath?: string | null
): string[] {
  const urls: string[] = []
  const paths = parsePathList(imagePath)
  const bucketUrl = getB2BucketUrl()

  for (const fallbackSize of IMAGE_SIZE_FALLBACK_ORDER[size]) {
    const hit = findPathBySize(paths, fallbackSize)
    if (hit) {
      urls.push(`${bucketUrl}/${hit}`)
    }
  }

  urls.push(`${getProxyServer()}/api?action=proxy&pid=${pid}&size=${size}`)

  return Array.from(new Set(urls))
}
