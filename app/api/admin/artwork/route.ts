import { ZodError } from 'zod'
import { NextRequest, NextResponse } from 'next/server'

import { verifyAdminRequest } from '@/lib/admin-auth'
import { deleteArtworkRecord, getArtworkAdminList } from '@/db/curation'
import { importArtworkByPid } from '@/lib/admin-artwork'
import {
  adminArtworkListQuerySchema,
  adminPidQuerySchema,
  createArtworkSchema,
} from '@/lib/validation/admin'
import { parseJsonBody, parseSearchParams } from '@/lib/validation/request'

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
    const { page, limit, search } = parseSearchParams(
      new URL(request.url).searchParams,
      adminArtworkListQuerySchema
    )

    const { artworks, total } = await getArtworkAdminList(page, limit, search)
    return NextResponse.json({
      success: true,
      data: {
        artworks,
        pagination: { page, limit, total, totalPages: Math.ceil(total / limit) }
      }
    })
  } catch (error) {
    if (error instanceof ZodError) {
      return validationErrorResponse(error)
    }

    console.error('获取作品列表失败:', error)
    return NextResponse.json({ success: false, error: '获取作品列表失败' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  const isAdmin = await verifyAdminRequest(request)
  if (!isAdmin) {
    return NextResponse.json({ success: false, error: '未授权' }, { status: 401 })
  }

  try {
    const payload = await parseJsonBody(request, createArtworkSchema)
    const result = await importArtworkByPid(payload)

    if (!result.ok) {
      return NextResponse.json({ success: false, error: result.error }, { status: result.status })
    }

    return NextResponse.json({ success: true, data: result.data })
  } catch (error) {
    if (error instanceof ZodError) {
      return validationErrorResponse(error)
    }

    console.error('添加作品失败:', error)
    return NextResponse.json({ success: false, error: '添加作品失败' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  const isAdmin = await verifyAdminRequest(request)
  if (!isAdmin) {
    return NextResponse.json({ success: false, error: '未授权' }, { status: 401 })
  }

  try {
    const { pid } = parseSearchParams(new URL(request.url).searchParams, adminPidQuerySchema)
    await deleteArtworkRecord(pid)
    return NextResponse.json({ success: true })
  } catch (error) {
    if (error instanceof ZodError) {
      return validationErrorResponse(error)
    }

    console.error('删除作品失败:', error)
    return NextResponse.json({ success: false, error: '删除作品失败' }, { status: 500 })
  }
}
