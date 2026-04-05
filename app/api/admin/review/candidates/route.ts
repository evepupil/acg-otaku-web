import { ZodError } from 'zod'
import { NextRequest, NextResponse } from 'next/server'

import { verifyAdminRequest } from '@/lib/admin-auth'
import { parseSearchParams } from '@/lib/validation/request'
import { adminReviewCandidateQuerySchema } from '@/lib/validation/admin'
import { getReviewCandidates } from '@/db/curation'

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
    const { limit, topN, tag, excludePublished, onlyDownloaded, downloadStatus } = parseSearchParams(
      new URL(request.url).searchParams,
      adminReviewCandidateQuerySchema
    )

    const artworks = await getReviewCandidates(limit, topN, tag, excludePublished, onlyDownloaded, downloadStatus)
    return NextResponse.json({
      success: true,
      data: {
        artworks,
        query: { limit, topN, tag, excludePublished, onlyDownloaded, downloadStatus },
      },
    })
  } catch (error) {
    if (error instanceof ZodError) return validationErrorResponse(error)

    console.error('获取评审池候选失败:', error)
    return NextResponse.json({ success: false, error: '获取候选失败' }, { status: 500 })
  }
}
