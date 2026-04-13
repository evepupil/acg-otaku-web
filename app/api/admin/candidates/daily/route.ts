import { ZodError } from 'zod'
import { NextRequest, NextResponse } from 'next/server'

import { verifyAdminRequest } from '@/lib/admin-auth'
import { parseSearchParams } from '@/lib/validation/request'
import { adminDailyCandidateQuerySchema } from '@/lib/validation/admin'
import { getAdminBusinessCandidateArtworks } from '@/lib/admin-business-candidates'

function validationErrorResponse(error: ZodError) {
  return NextResponse.json(
    { success: false, error: error.issues[0]?.message ?? '请求参数无效' },
    { status: 400 }
  )
}

export async function GET(request: NextRequest) {
  const isAdmin = await verifyAdminRequest(request)
  if (!isAdmin) return NextResponse.json({ success: false, error: '未授权' }, { status: 401 })

  try {
    const { limit, topN, excludePublished, pickType } = parseSearchParams(
      new URL(request.url).searchParams,
      adminDailyCandidateQuerySchema
    )

    const artworks = await getAdminBusinessCandidateArtworks({
      pool: pickType === 'ranking_pick' ? 'ranking' : 'daily',
      limit,
      topN,
      excludePublished,
      onlyDownloaded: true,
    })
    return NextResponse.json({
      success: true,
      data: {
        artworks,
        query: { limit, topN, excludePublished, pickType },
      },
    })
  } catch (error) {
    if (error instanceof ZodError) return validationErrorResponse(error)

    console.error('获取每日候选作品失败:', error)
    return NextResponse.json({ success: false, error: '获取候选作品失败' }, { status: 500 })
  }
}
