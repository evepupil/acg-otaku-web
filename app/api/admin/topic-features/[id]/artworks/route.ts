import { ZodError } from 'zod'
import { NextRequest, NextResponse } from 'next/server'

import { getTopicFeatureById } from '@/db/content'
import { verifyAdminRequest } from '@/lib/admin-auth'
import {
  adminPidQuerySchema,
  adminRouteIdSchema,
  createCurationArtworkLinkSchema,
} from '@/lib/validation/admin'
import { parseJsonBody, parseSearchParams } from '@/lib/validation/request'
import {
  addTopicFeatureArtworkRecord,
  getTopicFeatureArtworkLinkExists,
  removeTopicFeatureArtworkRecord,
} from '@/db/curation'

function validationErrorResponse(error: ZodError) {
  return NextResponse.json(
    { success: false, error: error.issues[0]?.message ?? '请求参数无效' },
    { status: 400 }
  )
}

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const isAdmin = await verifyAdminRequest(request)
  if (!isAdmin) return NextResponse.json({ success: false, error: '未授权' }, { status: 401 })

  try {
    const { id } = adminRouteIdSchema.parse(await params)
    const feature = await getTopicFeatureById(id)

    if (!feature) {
      return NextResponse.json({ success: false, error: '未找到' }, { status: 404 })
    }

    return NextResponse.json({ success: true, data: feature })
  } catch (error) {
    if (error instanceof ZodError) {
      return validationErrorResponse(error)
    }

    console.error('获取话题专题详情失败:', error)
    return NextResponse.json({ success: false, error: '获取失败' }, { status: 500 })
  }
}

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const isAdmin = await verifyAdminRequest(request)
  if (!isAdmin) return NextResponse.json({ success: false, error: '未授权' }, { status: 401 })

  try {
    const { id } = adminRouteIdSchema.parse(await params)
    const payload = await parseJsonBody(request, createCurationArtworkLinkSchema)

    if (await getTopicFeatureArtworkLinkExists(id, payload.pid)) {
      return NextResponse.json({ success: false, error: '作品已在该专题中' }, { status: 409 })
    }

    await addTopicFeatureArtworkRecord(id, payload.pid, payload.sortOrder, payload.editorComment)
    return NextResponse.json({ success: true })
  } catch (error) {
    if (error instanceof ZodError) {
      return validationErrorResponse(error)
    }

    console.error('添加作品失败:', error)
    return NextResponse.json({ success: false, error: '添加失败' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const isAdmin = await verifyAdminRequest(request)
  if (!isAdmin) return NextResponse.json({ success: false, error: '未授权' }, { status: 401 })

  try {
    const { id } = adminRouteIdSchema.parse(await params)
    const { pid } = parseSearchParams(new URL(request.url).searchParams, adminPidQuerySchema)

    await removeTopicFeatureArtworkRecord(id, pid)
    return NextResponse.json({ success: true })
  } catch (error) {
    if (error instanceof ZodError) {
      return validationErrorResponse(error)
    }

    console.error('移除作品失败:', error)
    return NextResponse.json({ success: false, error: '移除失败' }, { status: 500 })
  }
}
