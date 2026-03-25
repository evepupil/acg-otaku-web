import { ZodError } from 'zod'
import { NextRequest, NextResponse } from 'next/server'

import { getArtistFeatures } from '@/db/content'
import { verifyAdminRequest } from '@/lib/admin-auth'
import {
  adminIdQuerySchema,
  adminPaginationQuerySchema,
  createArtistFeatureSchema,
  updateArtistFeatureSchema,
} from '@/lib/validation/admin'
import { parseJsonBody, parseSearchParams } from '@/lib/validation/request'
import {
  createArtistFeatureRecord,
  deleteArtistFeatureRecord,
  updateArtistFeatureRecord,
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

    const { features, total } = await getArtistFeatures(page, limit)
    return NextResponse.json({
      success: true,
      data: { features, pagination: { page, limit, total, totalPages: Math.ceil(total / limit) } }
    })
  } catch (error) {
    if (error instanceof ZodError) {
      return validationErrorResponse(error)
    }

    console.error('获取画师专题列表失败:', error)
    return NextResponse.json({ success: false, error: '获取失败' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  const isAdmin = await verifyAdminRequest(request)
  if (!isAdmin) return NextResponse.json({ success: false, error: '未授权' }, { status: 401 })

  try {
    const payload = await parseJsonBody(request, createArtistFeatureSchema)
    const id = await createArtistFeatureRecord(payload)
    return NextResponse.json({ success: true, data: { id } })
  } catch (error) {
    if (error instanceof ZodError) {
      return validationErrorResponse(error)
    }

    console.error('创建画师专题失败:', error)
    return NextResponse.json({ success: false, error: '创建失败' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  const isAdmin = await verifyAdminRequest(request)
  if (!isAdmin) return NextResponse.json({ success: false, error: '未授权' }, { status: 401 })

  try {
    const payload = await parseJsonBody(request, updateArtistFeatureSchema)
    await updateArtistFeatureRecord(payload.id, payload)
    return NextResponse.json({ success: true })
  } catch (error) {
    if (error instanceof ZodError) {
      return validationErrorResponse(error)
    }

    console.error('更新画师专题失败:', error)
    return NextResponse.json({ success: false, error: '更新失败' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  const isAdmin = await verifyAdminRequest(request)
  if (!isAdmin) return NextResponse.json({ success: false, error: '未授权' }, { status: 401 })

  try {
    const { id } = parseSearchParams(new URL(request.url).searchParams, adminIdQuerySchema)
    await deleteArtistFeatureRecord(id)
    return NextResponse.json({ success: true })
  } catch (error) {
    if (error instanceof ZodError) {
      return validationErrorResponse(error)
    }

    console.error('删除画师专题失败:', error)
    return NextResponse.json({ success: false, error: '删除失败' }, { status: 500 })
  }
}
