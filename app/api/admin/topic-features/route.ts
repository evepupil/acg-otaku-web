import { ZodError } from 'zod'
import { NextRequest, NextResponse } from 'next/server'

import { getTopicFeatures } from '@/db/content'
import { verifyAdminRequest } from '@/lib/admin-auth'
import {
  adminIdQuerySchema,
  adminPaginationQuerySchema,
  createTopicFeatureSchema,
  updateTopicFeatureSchema,
} from '@/lib/validation/admin'
import { parseJsonBody, parseSearchParams } from '@/lib/validation/request'
import {
  createTopicFeatureRecord,
  deleteTopicFeatureRecord,
  getTopicFeatureSlugExists,
  updateTopicFeatureRecord,
} from '@/db/curation'

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
    const { page, limit } = parseSearchParams(
      new URL(request.url).searchParams,
      adminPaginationQuerySchema
    )

    const { features, total } = await getTopicFeatures(page, limit)
    return NextResponse.json({
      success: true,
      data: { features, pagination: { page, limit, total, totalPages: Math.ceil(total / limit) } }
    })
  } catch (error) {
    if (error instanceof ZodError) {
      return validationErrorResponse(error)
    }

    console.error('获取话题专题列表失败:', error)
    return NextResponse.json({ success: false, error: '获取失败' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  const isAdmin = await verifyAdminRequest(request)
  if (!isAdmin) return NextResponse.json({ success: false, error: '未授权' }, { status: 401 })

  try {
    const payload = await parseJsonBody(request, createTopicFeatureSchema)
    const exists = await getTopicFeatureSlugExists(payload.topicSlug)

    if (exists) {
      return NextResponse.json({ success: false, error: 'slug 已存在' }, { status: 409 })
    }

    const id = await createTopicFeatureRecord(payload)
    return NextResponse.json({ success: true, data: { id } })
  } catch (error) {
    if (error instanceof ZodError) {
      return validationErrorResponse(error)
    }

    console.error('创建话题专题失败:', error)
    return NextResponse.json({ success: false, error: '创建失败' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  const isAdmin = await verifyAdminRequest(request)
  if (!isAdmin) return NextResponse.json({ success: false, error: '未授权' }, { status: 401 })

  try {
    const payload = await parseJsonBody(request, updateTopicFeatureSchema)

    if (payload.topicSlug) {
      const exists = await getTopicFeatureSlugExists(payload.topicSlug, payload.id)

      if (exists) {
        return NextResponse.json({ success: false, error: 'slug 已存在' }, { status: 409 })
      }
    }

    await updateTopicFeatureRecord(payload.id, payload)
    return NextResponse.json({ success: true })
  } catch (error) {
    if (error instanceof ZodError) {
      return validationErrorResponse(error)
    }

    console.error('更新话题专题失败:', error)
    return NextResponse.json({ success: false, error: '更新失败' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  const isAdmin = await verifyAdminRequest(request)
  if (!isAdmin) return NextResponse.json({ success: false, error: '未授权' }, { status: 401 })

  try {
    const { id } = parseSearchParams(new URL(request.url).searchParams, adminIdQuerySchema)
    await deleteTopicFeatureRecord(id)
    return NextResponse.json({ success: true })
  } catch (error) {
    if (error instanceof ZodError) {
      return validationErrorResponse(error)
    }

    console.error('删除话题专题失败:', error)
    return NextResponse.json({ success: false, error: '删除失败' }, { status: 500 })
  }
}
