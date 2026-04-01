import { ZodError } from 'zod'
import { NextRequest, NextResponse } from 'next/server'

import {
  getArtistFeatureById,
  getDailyPickById,
  getTopicFeatureById,
} from '@/db/content'
import {
  updateArtistFeatureArtworkComments,
  updateArtistFeatureRecord,
  updateDailyPickArtworkComments,
  updateDailyPickRecord,
  updateTopicFeatureArtworkComments,
  updateTopicFeatureRecord,
} from '@/db/curation'
import { verifyAdminRequest } from '@/lib/admin-auth'
import {
  generateArtistFeatureContent,
  generateDailyPickContent,
  generateTopicFeatureContent,
} from '@/lib/curation-content-generator'
import { adminRegenerateCurationContentSchema } from '@/lib/validation/admin'
import { parseJsonBody } from '@/lib/validation/request'

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
    const payload = await parseJsonBody(request, adminRegenerateCurationContentSchema)

    if (payload.type === 'daily') {
      const pick = await getDailyPickById(payload.id)
      if (!pick) {
        return NextResponse.json({ success: false, error: '未找到该记录' }, { status: 404 })
      }

      if (pick.artworks.length === 0) {
        return NextResponse.json({ success: false, error: '当前没有可生成文案的作品' }, { status: 400 })
      }

      const generated = generateDailyPickContent({
        pickDate: pick.pickDate,
        artworks: pick.artworks,
      })

      await updateDailyPickRecord(payload.id, {
        title: generated.title,
        description: generated.description,
      })
      await updateDailyPickArtworkComments(payload.id, generated.artworkCommentsByPid)

      const updated = await getDailyPickById(payload.id)
      return NextResponse.json({ success: true, data: updated })
    }

    if (payload.type === 'topic') {
      const feature = await getTopicFeatureById(payload.id)
      if (!feature) {
        return NextResponse.json({ success: false, error: '未找到该记录' }, { status: 404 })
      }

      if (feature.artworks.length === 0) {
        return NextResponse.json({ success: false, error: '当前没有可生成文案的作品' }, { status: 400 })
      }

      const generated = generateTopicFeatureContent({
        topicName: feature.topicName,
        artworks: feature.artworks,
      })

      await updateTopicFeatureRecord(payload.id, {
        topicDescription: generated.topicDescription,
        featureContent: generated.featureContent,
        tags: generated.tags,
      })
      await updateTopicFeatureArtworkComments(payload.id, generated.artworkCommentsByPid)

      const updated = await getTopicFeatureById(payload.id)
      return NextResponse.json({ success: true, data: updated })
    }

    const feature = await getArtistFeatureById(payload.id)
    if (!feature) {
      return NextResponse.json({ success: false, error: '未找到该记录' }, { status: 404 })
    }

    if (feature.artworks.length === 0) {
      return NextResponse.json({ success: false, error: '当前没有可生成文案的作品' }, { status: 400 })
    }

    const generated = generateArtistFeatureContent({
      artistName: feature.artistName,
      artworks: feature.artworks,
    })

    await updateArtistFeatureRecord(payload.id, {
      featureTitle: generated.featureTitle,
      featureContent: generated.featureContent,
    })
    await updateArtistFeatureArtworkComments(payload.id, generated.artworkCommentsByPid)

    const updated = await getArtistFeatureById(payload.id)
    return NextResponse.json({ success: true, data: updated })
  } catch (error) {
    if (error instanceof ZodError) {
      return validationErrorResponse(error)
    }

    console.error('重新生成栏目文案失败:', error)
    return NextResponse.json({ success: false, error: '重新生成失败' }, { status: 500 })
  }
}
