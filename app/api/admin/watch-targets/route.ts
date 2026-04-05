import { NextRequest, NextResponse } from 'next/server'
import { ZodError } from 'zod'

import { verifyAdminRequest } from '@/lib/admin-auth'
import {
  collectCrawlerWatchTargets,
  deleteCrawlerWatchTarget,
  listCrawlerWatchTargets,
  upsertCrawlerWatchTarget,
} from '@/lib/crawler-client'
import {
  adminWatchTargetActionSchema,
  adminWatchTargetDeleteSchema,
} from '@/lib/validation/admin'
import { parseJsonBody } from '@/lib/validation/request'

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
    const items = await listCrawlerWatchTargets()
    return NextResponse.json({ success: true, data: { items } })
  } catch (error) {
    console.error('获取监控源列表失败:', error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : '获取监控源列表失败',
      },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  const isAdmin = await verifyAdminRequest(request)
  if (!isAdmin) {
    return NextResponse.json({ success: false, error: '未授权' }, { status: 401 })
  }

  try {
    const payload = await parseJsonBody(request, adminWatchTargetActionSchema)

    if (payload.action === 'upsert') {
      const item = await upsertCrawlerWatchTarget({
        id: payload.id,
        targetType: payload.targetType,
        targetValue: payload.targetValue,
        bizType: payload.bizType,
        priority: payload.priority,
        windowDays: payload.windowDays,
        dailyPreviewQuota: payload.dailyPreviewQuota,
        enabled: payload.enabled,
      })
      return NextResponse.json({ success: true, data: { item } })
    }

    if (payload.action === 'batch-upsert') {
      const items = []

      for (const input of payload.items) {
        const item = await upsertCrawlerWatchTarget({
          targetType: input.targetType,
          targetValue: input.targetValue,
          bizType: input.bizType,
          priority: input.priority,
          windowDays: input.windowDays,
          dailyPreviewQuota: input.dailyPreviewQuota,
          enabled: input.enabled,
        })
        items.push(item)
      }

      const collectResult = payload.runAfterImport
        ? await collectCrawlerWatchTargets({
            targetIds: items.map((item) => item.id),
            limitTargets: items.length,
            perTargetLimit: payload.perTargetLimit,
          })
        : null

      return NextResponse.json({
        success: true,
        data: {
          count: items.length,
          items,
          collectResult,
        },
      })
    }

    const result = await collectCrawlerWatchTargets({
      targetIds: payload.targetIds,
      limitTargets: payload.limitTargets,
      perTargetLimit: payload.perTargetLimit,
    })

    return NextResponse.json({ success: true, data: result })
  } catch (error) {
    if (error instanceof ZodError) return validationErrorResponse(error)

    console.error('处理监控源操作失败:', error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : '处理监控源操作失败',
      },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest) {
  const isAdmin = await verifyAdminRequest(request)
  if (!isAdmin) {
    return NextResponse.json({ success: false, error: '未授权' }, { status: 401 })
  }

  try {
    const payload = await parseJsonBody(request, adminWatchTargetDeleteSchema)
    const id = await deleteCrawlerWatchTarget(payload.id)
    return NextResponse.json({ success: true, data: { id } })
  } catch (error) {
    if (error instanceof ZodError) return validationErrorResponse(error)

    console.error('删除监控源失败:', error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : '删除监控源失败',
      },
      { status: 500 }
    )
  }
}
