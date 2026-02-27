/**
 * B2对象存储上传模块
 * 使用S3兼容API将Pixiv图片下载并上传到Backblaze B2
 */

import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3'

const B2_KEY_ID = process.env.B2_APPLICATION_KEY_ID || ''
const B2_APP_KEY = process.env.B2_APPLICATION_KEY || ''
const B2_BUCKET_ID = process.env.B2_BUCKET_ID || ''
const B2_BUCKET_NAME = process.env.B2_BUCKET_NAME || ''
const B2_ENDPOINT = process.env.B2_ENDPOINT || `https://s3.us-west-004.backblazeb2.com`

let s3Client: S3Client | null = null

function getS3Client(): S3Client {
  if (!s3Client) {
    if (!B2_KEY_ID || !B2_APP_KEY) {
      throw new Error('缺少B2存储环境变量：B2_APPLICATION_KEY_ID 或 B2_APPLICATION_KEY')
    }
    s3Client = new S3Client({
      endpoint: B2_ENDPOINT,
      region: 'us-west-004',
      credentials: {
        accessKeyId: B2_KEY_ID,
        secretAccessKey: B2_APP_KEY,
      },
      forcePathStyle: true,
    })
  }
  return s3Client
}

/**
 * 从Pixiv下载图片并上传到B2
 * @param imageUrl Pixiv原始图片URL（i.pximg.net）
 * @param pid 作品PID
 * @param size 图片尺寸标识
 * @returns B2存储路径（不含bucket前缀），失败返回null
 */
export async function downloadAndUploadPixivImage(
  imageUrl: string,
  pid: string,
  size: string = 'regular'
): Promise<string | null> {
  try {
    // 通过代理下载Pixiv图片
    const proxyUrl = imageUrl.replace('i.pximg.net', 'i.pixiv.cat')

    const response = await fetch(proxyUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Referer': 'https://www.pixiv.net/',
      },
    })

    if (!response.ok) {
      console.error(`下载Pixiv图片失败: HTTP ${response.status}`)
      return null
    }

    const buffer = await response.arrayBuffer()
    const uint8Array = new Uint8Array(buffer)

    // 确定文件扩展名
    const urlPath = new URL(imageUrl).pathname
    const ext = urlPath.split('.').pop() || 'jpg'

    // 上传到B2
    const key = `pixiv/${pid}/${size}.${ext}`

    const contentTypeMap: Record<string, string> = {
      jpg: 'image/jpeg',
      jpeg: 'image/jpeg',
      png: 'image/png',
      gif: 'image/gif',
      webp: 'image/webp',
    }

    const client = getS3Client()
    await client.send(new PutObjectCommand({
      Bucket: B2_BUCKET_NAME || B2_BUCKET_ID,
      Key: key,
      Body: uint8Array,
      ContentType: contentTypeMap[ext] || 'application/octet-stream',
    }))

    console.log(`上传成功: ${key}`)
    return key
  } catch (error) {
    console.error(`下载并上传Pixiv图片失败:`, error)
    return null
  }
}

/**
 * 批量下载并上传多个尺寸
 */
export async function downloadAndUploadAllSizes(
  imageUrls: { thumb_mini: string; small: string; regular: string; original: string },
  pid: string
): Promise<Record<string, string | null>> {
  const sizes = ['thumb_mini', 'small', 'regular', 'original'] as const
  const results: Record<string, string | null> = {}

  for (const size of sizes) {
    const url = imageUrls[size]
    if (url) {
      results[size] = await downloadAndUploadPixivImage(url, pid, size)
    } else {
      results[size] = null
    }
  }

  return results
}
