import { ZodError } from 'zod'
import { NextRequest, NextResponse } from 'next/server'

import { verifyAdminRequest } from '@/lib/admin-auth'
import { previewArtworkImport } from '@/lib/admin-artwork'
import { adminPidQuerySchema } from '@/lib/validation/admin'
import { parseSearchParams } from '@/lib/validation/request'

function validationErrorResponse(error: ZodError) {
  return NextResponse.json(
    { success: false, error: error.issues[0]?.message ?? '请求参数无效' },
    { status: 400 }
  )
}

export async function GET(request: NextRequest) {
  const isAdmin = await verifyAdminRequest(request)
  if (!isAdmin) {
    return NextResponse.json({ success: false, error: '未授权' }, { status: 401 })
  }

  try {
    const { pid } = parseSearchParams(new URL(request.url).searchParams, adminPidQuerySchema)
    const preview = await previewArtworkImport(pid)

    if (!preview) {
      return NextResponse.json({ success: false, error: '无法获取 Pixiv 插画信息' }, { status: 400 })
    }

    return NextResponse.json({ success: true, data: preview })
  } catch (error) {
    if (error instanceof ZodError) {
      return validationErrorResponse(error)
    }

    console.error('预览作品失败:', error)
    return NextResponse.json({ success: false, error: '获取预览信息失败' }, { status: 500 })
  }
}
