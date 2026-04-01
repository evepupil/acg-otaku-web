import { ZodError } from 'zod'
import { NextRequest, NextResponse } from 'next/server'

import { getArtistFeatureById } from '@/db/content'
import {
  addArtistFeatureArtworkRecord,
  getArtistFeatureArtworkLinkExists,
  getCandidateArtworksByPids,
  isArtworkPublishedInCuration,
  removeArtistFeatureArtworkRecord,
  updateArtistFeatureRecord,
} from '@/db/curation'
import { verifyAdminRequest } from '@/lib/admin-auth'
import {
  generateArtistFeatureContent,
  generateArtworkComment,
} from '@/lib/curation-content-generator'
import {
  adminPidQuerySchema,
  adminRouteIdSchema,
  createCurationArtworkLinkSchema,
} from '@/lib/validation/admin'
import { parseJsonBody, parseSearchParams } from '@/lib/validation/request'

function validationErrorResponse(error: ZodError) {
  return NextResponse.json(
    { success: false, error: error.issues[0]?.message ?? '请求参数无效' },
    { status: 400 }
  )
}

function normalizeComparableText(value: string | undefined) {
  return value?.trim() ?? ''
}

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const isAdmin = await verifyAdminRequest(request)
  if (!isAdmin) {
    return NextResponse.json({ success: false, error: '未授权' }, { status: 401 })
  }

  try {
    const { id } = adminRouteIdSchema.parse(await params)
    const feature = await getArtistFeatureById(id)

    if (!feature) {
      return NextResponse.json({ success: false, error: '未找到该记录' }, { status: 404 })
    }

    return NextResponse.json({ success: true, data: feature })
  } catch (error) {
    if (error instanceof ZodError) {
      return validationErrorResponse(error)
    }

    console.error('获取画师专题详情失败:', error)
    return NextResponse.json({ success: false, error: '获取失败' }, { status: 500 })
  }
}

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const isAdmin = await verifyAdminRequest(request)
  if (!isAdmin) {
    return NextResponse.json({ success: false, error: '未授权' }, { status: 401 })
  }

  try {
    const { id } = adminRouteIdSchema.parse(await params)
    const payload = await parseJsonBody(request, createCurationArtworkLinkSchema)
    const feature = await getArtistFeatureById(id)

    if (!feature) {
      return NextResponse.json({ success: false, error: '未找到该记录' }, { status: 404 })
    }

    if (await getArtistFeatureArtworkLinkExists(id, payload.pid)) {
      return NextResponse.json({ success: false, error: '作品已在当前专题中' }, { status: 409 })
    }

    if (await isArtworkPublishedInCuration(payload.pid)) {
      return NextResponse.json(
        { success: false, error: '该作品已在已发布栏目中，不能重复发布' },
        { status: 409 }
      )
    }

    const artwork = (await getCandidateArtworksByPids([payload.pid]))[0]
    const nextArtworks = artwork ? [...feature.artworks, artwork] : feature.artworks
    const editorComment = payload.editorComment ?? (
      artwork
        ? generateArtworkComment({
            artwork,
            artworks: nextArtworks,
            mode: 'artist',
            artistName: feature.artistName,
          })
        : undefined
    )

    const previousGeneratedFeatureContent = feature.artworks.length > 0
      ? generateArtistFeatureContent({
          artistName: feature.artistName,
          artworks: feature.artworks,
        }).featureContent
      : ''

    await addArtistFeatureArtworkRecord(id, payload.pid, payload.sortOrder, editorComment)

    const shouldRefreshFeatureContent = Boolean(
      artwork &&
      (
        !normalizeComparableText(feature.featureContent) ||
        normalizeComparableText(feature.featureContent) ===
          normalizeComparableText(previousGeneratedFeatureContent)
      )
    )

    if (shouldRefreshFeatureContent && artwork) {
      const generated = generateArtistFeatureContent({
        artistName: feature.artistName,
        artworks: nextArtworks,
      })

      await updateArtistFeatureRecord(id, {
        featureContent: generated.featureContent,
      })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    if (error instanceof ZodError) {
      return validationErrorResponse(error)
    }

    console.error('添加画师专题作品失败:', error)
    return NextResponse.json({ success: false, error: '添加失败' }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const isAdmin = await verifyAdminRequest(request)
  if (!isAdmin) {
    return NextResponse.json({ success: false, error: '未授权' }, { status: 401 })
  }

  try {
    const { id } = adminRouteIdSchema.parse(await params)
    const { pid } = parseSearchParams(new URL(request.url).searchParams, adminPidQuerySchema)

    await removeArtistFeatureArtworkRecord(id, pid)
    return NextResponse.json({ success: true })
  } catch (error) {
    if (error instanceof ZodError) {
      return validationErrorResponse(error)
    }

    console.error('移除画师专题作品失败:', error)
    return NextResponse.json({ success: false, error: '移除失败' }, { status: 500 })
  }
}
