import { ZodError } from 'zod'
import { NextRequest, NextResponse } from 'next/server'

import { verifyAdminRequest } from '@/lib/admin-auth'
import { getDailyPicks } from '@/lib/turso'
import {
  adminDailyPickListQuerySchema,
  adminIdQuerySchema,
  createDailyPickSchema,
  updateDailyPickSchema,
} from '@/lib/validation/admin'
import { parseJsonBody, parseSearchParams } from '@/lib/validation/request'
import {
  createDailyPickRecord,
  deleteDailyPickRecord,
  getDailyPickExists,
  updateDailyPickRecord,
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
    const { page, limit, pickType } = parseSearchParams(
      new URL(request.url).searchParams,
      adminDailyPickListQuerySchema
    )

    const { picks, total } = await getDailyPicks(page, limit, pickType)
    return NextResponse.json({
      success: true,
      data: { picks, pagination: { page, limit, total, totalPages: Math.ceil(total / limit) } }
    })
  } catch (error) {
    if (error instanceof ZodError) {
      return validationErrorResponse(error)
    }

    console.error('获取每日精选列表失败:', error)
    return NextResponse.json({ success: false, error: '获取失败' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  const isAdmin = await verifyAdminRequest(request)
  if (!isAdmin) return NextResponse.json({ success: false, error: '未授权' }, { status: 401 })

  try {
    const payload = await parseJsonBody(request, createDailyPickSchema)
    const exists = await getDailyPickExists(payload.pickDate, payload.pickType)

    if (exists) {
      return NextResponse.json({ success: false, error: '相同日期和类型的每日精选已存在' }, { status: 409 })
    }

    const id = await createDailyPickRecord(payload)
    return NextResponse.json({ success: true, data: { id } })
  } catch (error) {
    if (error instanceof ZodError) {
      return validationErrorResponse(error)
    }

    console.error('创建每日精选失败:', error)
    return NextResponse.json({ success: false, error: '创建失败' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  const isAdmin = await verifyAdminRequest(request)
  if (!isAdmin) return NextResponse.json({ success: false, error: '未授权' }, { status: 401 })

  try {
    const payload = await parseJsonBody(request, updateDailyPickSchema)

    if (payload.pickDate && payload.pickType) {
      const exists = await getDailyPickExists(payload.pickDate, payload.pickType, payload.id)

      if (exists) {
        return NextResponse.json({ success: false, error: '相同日期和类型的每日精选已存在' }, { status: 409 })
      }
    }

    await updateDailyPickRecord(payload.id, payload)
    return NextResponse.json({ success: true })
  } catch (error) {
    if (error instanceof ZodError) {
      return validationErrorResponse(error)
    }

    console.error('更新每日精选失败:', error)
    return NextResponse.json({ success: false, error: '更新失败' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  const isAdmin = await verifyAdminRequest(request)
  if (!isAdmin) return NextResponse.json({ success: false, error: '未授权' }, { status: 401 })

  try {
    const { id } = parseSearchParams(new URL(request.url).searchParams, adminIdQuerySchema)
    await deleteDailyPickRecord(id)
    return NextResponse.json({ success: true })
  } catch (error) {
    if (error instanceof ZodError) {
      return validationErrorResponse(error)
    }

    console.error('删除每日精选失败:', error)
    return NextResponse.json({ success: false, error: '删除失败' }, { status: 500 })
  }
}
