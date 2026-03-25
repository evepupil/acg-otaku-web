import { ZodError } from 'zod'
import { NextRequest, NextResponse } from 'next/server'

import { verifyAdminRequest } from '@/lib/admin-auth'
import { parseSearchParams } from '@/lib/validation/request'
import { adminCandidateQuerySchema } from '@/lib/validation/admin'
import { getDailyRandomTopNCandidates } from '@/db/curation'

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
    const { limit, topN, excludePublished } = parseSearchParams(
      new URL(request.url).searchParams,
      adminCandidateQuerySchema
    )

    const artworks = await getDailyRandomTopNCandidates(limit, topN, excludePublished)
    return NextResponse.json({
      success: true,
      data: {
        artworks,
        query: { limit, topN, excludePublished },
      },
    })
  } catch (error) {
    if (error instanceof ZodError) return validationErrorResponse(error)

    console.error('获取每日候选作品失败:', error)
    return NextResponse.json({ success: false, error: '获取候选作品失败' }, { status: 500 })
  }
}
