import { ZodError } from 'zod'
import { NextRequest, NextResponse } from 'next/server'

import { verifyAdminRequest } from '@/lib/admin-auth'
import { enqueueArtworkArchiveByPid } from '@/lib/crawler-client'
import { parseJsonBody } from '@/lib/validation/request'
import { adminReviewActionSchema } from '@/lib/validation/admin'
import {
  getArtworkExists,
  recordArtworkReviewAction,
  setArtworkUnfitStatus,
} from '@/db/curation'

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
    const payload = await parseJsonBody(request, adminReviewActionSchema)
    const exists = await getArtworkExists(payload.pid)
    if (!exists) {
      return NextResponse.json({ success: false, error: '作品不存在' }, { status: 404 })
    }

    await recordArtworkReviewAction(payload.pid, payload.action, payload.note)

    let archiveMessage: string | null = null

    if (payload.action === 'reject') {
      await setArtworkUnfitStatus(payload.pid, true)
    } else if (payload.action === 'favorite') {
      await setArtworkUnfitStatus(payload.pid, false)

      const archiveResult = await enqueueArtworkArchiveByPid(payload.pid, ['regular', 'original'])
      archiveMessage = archiveResult.message

      if (archiveResult.attempted && !archiveResult.success) {
        console.warn(
          `favorite archive queue failed for pid=${payload.pid}: ${archiveResult.message}`
        )
      }
    }

    return NextResponse.json({
      success: true,
      data: archiveMessage ? { archiveMessage } : undefined,
    })
  } catch (error) {
    if (error instanceof ZodError) return validationErrorResponse(error)

    console.error('写入评审动作失败:', error)
    return NextResponse.json({ success: false, error: '写入失败' }, { status: 500 })
  }
}
