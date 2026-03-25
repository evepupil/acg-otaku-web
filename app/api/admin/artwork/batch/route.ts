import { ZodError } from 'zod'
import { NextRequest, NextResponse } from 'next/server'

import { verifyAdminRequest } from '@/lib/admin-auth'
import { importArtworkByPid } from '@/lib/admin-artwork'
import { createArtworkBatchSchema } from '@/lib/validation/admin'
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
    const { pids, downloadImages } = await parseJsonBody(request, createArtworkBatchSchema)

    const results: Array<{ pid: string; success: boolean; error?: string }> = []

    for (const pid of pids) {
      try {
        const result = await importArtworkByPid({ pid, downloadImages })
        if (result.ok) {
          results.push({ pid, success: true })
        } else {
          results.push({ pid, success: false, error: result.error })
        }
      } catch (error) {
        results.push({ pid, success: false, error: String(error) })
      }
    }

    const successCount = results.filter((item) => item.success).length
    return NextResponse.json({
      success: true,
      data: { results, successCount, totalCount: pids.length }
    })
  } catch (error) {
    if (error instanceof ZodError) {
      return validationErrorResponse(error)
    }

    console.error('批量添加作品失败:', error)
    return NextResponse.json({ success: false, error: '批量添加作品失败' }, { status: 500 })
  }
}
