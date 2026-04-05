import { NextRequest, NextResponse } from 'next/server'
import { ZodError } from 'zod'

import { verifyAdminRequest } from '@/lib/admin-auth'
import {
  refreshCrawlerCandidateScores,
  runCrawlerBackfillPreview,
} from '@/lib/crawler-client'
import { adminCrawlerManualActionSchema } from '@/lib/validation/admin'
import { parseJsonBody } from '@/lib/validation/request'

function validationErrorResponse(error: ZodError) {
  return NextResponse.json(
    { success: false, error: error.issues[0]?.message ?? '请求参数无效' },
    { status: 400 }
  )
}

export async function POST(request: NextRequest) {
  const isAdmin = await verifyAdminRequest(request)
  if (!isAdmin) {
    return NextResponse.json({ success: false, error: '未授权' }, { status: 401 })
  }

  try {
    const payload = await parseJsonBody(request, adminCrawlerManualActionSchema)

    if (payload.action === 'refresh-candidate-score') {
      const result = await refreshCrawlerCandidateScores({
        limit: payload.limit,
      })

      return NextResponse.json({
        success: true,
        data: result,
      })
    }

    const result = await runCrawlerBackfillPreview({
      limit: payload.limit,
      minPopularity: payload.minPopularity,
      minAgeDays: payload.minAgeDays,
      dryRun: payload.dryRun,
    })

    return NextResponse.json({
      success: true,
      data: result,
    })
  } catch (error) {
    if (error instanceof ZodError) {
      return validationErrorResponse(error)
    }

    console.error('处理 crawler 手动任务失败:', error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : '处理 crawler 手动任务失败',
      },
      { status: 500 }
    )
  }
}
