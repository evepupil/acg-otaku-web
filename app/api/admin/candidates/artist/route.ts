import { ZodError } from 'zod'
import { NextRequest, NextResponse } from 'next/server'

import { verifyAdminRequest } from '@/lib/admin-auth'
import { parseJsonBody } from '@/lib/validation/request'
import { adminArtistCandidateSchema } from '@/lib/validation/admin'
import { getAdminBusinessCandidateArtworks } from '@/lib/admin-business-candidates'
import { triggerArtistCrawlById } from '@/lib/crawler-client'

function validationErrorResponse(error: ZodError) {
  return NextResponse.json(
    { success: false, error: error.issues[0]?.message ?? '请求参数无效' },
    { status: 400 }
  )
}

export async function POST(request: NextRequest) {
  const isAdmin = await verifyAdminRequest(request)
  if (!isAdmin) return NextResponse.json({ success: false, error: '未授权' }, { status: 401 })

  try {
    const payload = await parseJsonBody(request, adminArtistCandidateSchema)

    const crawler = payload.crawlBeforeQuery
      ? await triggerArtistCrawlById(payload.artistId, payload.topN)
      : {
          attempted: false,
          success: false,
          message: '已跳过爬虫触发，仅查询本地数据库',
        }

    const artworks = await getAdminBusinessCandidateArtworks({
      pool: 'artist',
      artistId: payload.artistId,
      limit: payload.limit,
      topN: payload.topN,
      excludePublished: payload.excludePublished,
      onlyDownloaded: true,
    })

    return NextResponse.json({
      success: true,
      data: {
        artworks,
        crawler,
        query: payload,
      },
    })
  } catch (error) {
    if (error instanceof ZodError) return validationErrorResponse(error)

    console.error('获取画师候选作品失败:', error)
    return NextResponse.json({ success: false, error: '获取候选作品失败' }, { status: 500 })
  }
}
