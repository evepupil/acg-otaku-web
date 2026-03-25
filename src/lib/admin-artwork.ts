import 'server-only'

import { downloadAndUploadAllSizes } from '@/lib/b2-storage'
import { fetchPixivIllustInfo } from '@/lib/pixiv-api'
import { createArtworkRecord, getArtworkExists } from '@/db/curation'

export interface ArtworkImportPayload {
  pid: string
  downloadImages?: boolean
}

export async function previewArtworkImport(pid: string) {
  const info = await fetchPixivIllustInfo(pid)

  if (!info) {
    return null
  }

  return {
    pid: info.pid,
    title: info.title,
    authorName: info.authorName,
    tags: info.tags,
    viewCount: info.viewCount,
    likeCount: info.likeCount,
    bookmarkCount: info.bookmarkCount,
  }
}

export async function importArtworkByPid(payload: ArtworkImportPayload) {
  const exists = await getArtworkExists(payload.pid)
  if (exists) {
    return { ok: false as const, status: 409, error: '作品已存在' }
  }

  const info = await fetchPixivIllustInfo(payload.pid)
  if (!info) {
    return { ok: false as const, status: 400, error: '无法获取 Pixiv 插画信息' }
  }

  let imagePath = ''

  if (payload.downloadImages && info.imageUrls.regular) {
    try {
      const paths = await downloadAndUploadAllSizes(info.imageUrls, payload.pid)
      imagePath = paths.regular || ''
    } catch (error) {
      console.error('Upload artwork images to B2 failed:', error)
    }
  }

  await createArtworkRecord({
    pid: info.pid,
    title: info.title,
    authorId: info.authorId,
    authorName: info.authorName,
    tag: info.tags.join(','),
    imageUrl: info.imageUrls.regular || info.imageUrls.small || '',
    imagePath,
    good: info.likeCount,
    star: info.bookmarkCount,
    view: info.viewCount,
    popularity: 0,
  })

  return {
    ok: true as const,
    data: {
      pid: info.pid,
      title: info.title,
      authorName: info.authorName,
      imagePath,
    },
  }
}
