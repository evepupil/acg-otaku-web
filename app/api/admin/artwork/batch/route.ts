import { NextRequest, NextResponse } from 'next/server'
import { verifyAdminRequest } from '@/lib/admin-auth'
import { addArtworkByPid, getArtworkById } from '@/lib/turso'
import { fetchPixivIllustInfo } from '@/lib/pixiv-api'
import { downloadAndUploadAllSizes } from '@/lib/b2-storage'

export async function POST(request: NextRequest) {
  const isAdmin = await verifyAdminRequest(request)
  if (!isAdmin) {
    return NextResponse.json({ success: false, error: '未授权' }, { status: 401 })
  }

  try {
    const { pids, downloadImages } = await request.json()

    if (!pids || !Array.isArray(pids) || pids.length === 0) {
      return NextResponse.json({ success: false, error: '请提供PID数组' }, { status: 400 })
    }

    if (pids.length > 50) {
      return NextResponse.json({ success: false, error: '单次最多添加50个作品' }, { status: 400 })
    }

    const results: Array<{ pid: string; success: boolean; error?: string }> = []

    for (const pid of pids) {
      try {
        const existing = await getArtworkById(parseInt(pid))
        if (existing) {
          results.push({ pid, success: false, error: '已存在' })
          continue
        }

        const info = await fetchPixivIllustInfo(pid)
        if (!info) {
          results.push({ pid, success: false, error: '无法获取信息' })
          continue
        }

        let imagePath = ''
        if (downloadImages && info.imageUrls.regular) {
          try {
            const paths = await downloadAndUploadAllSizes(info.imageUrls, pid)
            imagePath = paths.regular || ''
          } catch {
            // 上传失败不阻断
          }
        }

        await addArtworkByPid({
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

        results.push({ pid, success: true })
      } catch (error) {
        results.push({ pid, success: false, error: String(error) })
      }
    }

    const successCount = results.filter(r => r.success).length
    return NextResponse.json({
      success: true,
      data: { results, successCount, totalCount: pids.length }
    })
  } catch (error) {
    console.error('批量添加作品失败:', error)
    return NextResponse.json({ success: false, error: '批量添加作品失败' }, { status: 500 })
  }
}
