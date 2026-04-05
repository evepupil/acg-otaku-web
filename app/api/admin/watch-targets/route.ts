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
    { success: false, error: error.issues[0]?.message ?? 'Invalid request payload' },
    { status: 400 }
  )
}

export async function GET(request: NextRequest) {
  const isAdmin = await verifyAdminRequest(request)
  if (!isAdmin) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const items = await listCrawlerWatchTargets()
    return NextResponse.json({ success: true, data: { items } })
  } catch (error) {
    console.error('Failed to list watch targets:', error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to list watch targets',
      },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  const isAdmin = await verifyAdminRequest(request)
  if (!isAdmin) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
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

    const result = await collectCrawlerWatchTargets({
      targetIds: payload.targetIds,
      limitTargets: payload.limitTargets,
      perTargetLimit: payload.perTargetLimit,
    })

    return NextResponse.json({ success: true, data: result })
  } catch (error) {
    if (error instanceof ZodError) return validationErrorResponse(error)

    console.error('Failed to handle watch targets action:', error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to handle watch target action',
      },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest) {
  const isAdmin = await verifyAdminRequest(request)
  if (!isAdmin) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const payload = await parseJsonBody(request, adminWatchTargetDeleteSchema)
    const id = await deleteCrawlerWatchTarget(payload.id)
    return NextResponse.json({ success: true, data: { id } })
  } catch (error) {
    if (error instanceof ZodError) return validationErrorResponse(error)

    console.error('Failed to delete watch target:', error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to delete watch target',
      },
      { status: 500 }
    )
  }
}
