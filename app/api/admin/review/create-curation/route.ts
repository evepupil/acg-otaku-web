import { ZodError } from 'zod'
import { NextRequest, NextResponse } from 'next/server'

import { verifyAdminRequest } from '@/lib/admin-auth'
import { parseJsonBody } from '@/lib/validation/request'
import { adminCreateCurationFromFavoritesSchema } from '@/lib/validation/admin'
import {
  addDailyPickArtworkRecord,
  addTopicFeatureArtworkRecord,
  createDailyPickRecord,
  createTopicFeatureRecord,
  getCandidateArtworksByPids,
  getDailyPickExists,
  getTopicFeatureSlugExists,
  isArtworkPublishedInCuration,
} from '@/db/curation'
import {
  generateDailyPickContent,
  generateTopicFeatureContent,
} from '@/lib/curation-content-generator'

function validationErrorResponse(error: ZodError) {
  return NextResponse.json(
    { success: false, error: error.issues[0]?.message ?? '请求参数无效' },
    { status: 400 }
  )
}

function slugifyTopic(input: string) {
  const slug = input
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
  return slug || `topic-${Date.now()}`
}

function normalizePids(pids: string[]) {
  return Array.from(new Set(pids.map((pid) => pid.trim()).filter(Boolean)))
}

async function ensurePidsNotPublished(pids: string[]) {
  const checks = await Promise.all(
    pids.map(async (pid) => ({ pid, published: await isArtworkPublishedInCuration(pid) }))
  )
  return checks.filter((item) => item.published).map((item) => item.pid)
}

export async function POST(request: NextRequest) {
  const isAdmin = await verifyAdminRequest(request)
  if (!isAdmin) return NextResponse.json({ success: false, error: '未授权' }, { status: 401 })

  try {
    const payload = await parseJsonBody(request, adminCreateCurationFromFavoritesSchema)
    const pids = normalizePids(payload.pids)
    if (pids.length === 0) {
      return NextResponse.json({ success: false, error: '请至少选择一张作品' }, { status: 400 })
    }

    const alreadyPublished = await ensurePidsNotPublished(pids)
    if (alreadyPublished.length > 0) {
      return NextResponse.json(
        {
          success: false,
          error: `有 ${alreadyPublished.length} 张作品已发布，不能重复发布`,
          data: { alreadyPublished },
        },
        { status: 409 }
      )
    }

    const artworks = await getCandidateArtworksByPids(pids)
    if (artworks.length !== pids.length) {
      const artworkPidSet = new Set(artworks.map((artwork) => String(artwork.id)))
      const missingPids = pids.filter((pid) => !artworkPidSet.has(pid))

      return NextResponse.json(
        {
          success: false,
          error: `有 ${missingPids.length} 张作品尚未入库，无法创建栏目`,
          data: { missingPids },
        },
        { status: 400 }
      )
    }

    if (payload.type === 'daily') {
      const exists = await getDailyPickExists(payload.pickDate, 'daily_art')
      if (exists) {
        return NextResponse.json(
          { success: false, error: `${payload.pickDate} 的每日美图已存在` },
          { status: 409 }
        )
      }

      const generated = generateDailyPickContent({
        pickDate: payload.pickDate,
        artworks,
      })

      const id = await createDailyPickRecord({
        pickDate: payload.pickDate,
        pickType: 'daily_art',
        title: payload.title ?? generated.title,
        description: payload.description ?? generated.description,
        coverPid: pids[0],
      })

      if (!id) {
        return NextResponse.json({ success: false, error: '创建每日美图失败' }, { status: 500 })
      }

      for (let i = 0; i < pids.length; i += 1) {
        await addDailyPickArtworkRecord(id, pids[i], i, generated.artworkCommentsByPid[pids[i]])
      }

      return NextResponse.json({
        success: true,
        data: { type: 'daily', id, editUrl: `/admin/daily-picks/${id}` },
      })
    }

    const baseSlug = payload.topicSlug || slugifyTopic(payload.topicName)
    const finalSlug = (await getTopicFeatureSlugExists(baseSlug))
      ? `${baseSlug}-${Date.now().toString().slice(-6)}`
      : baseSlug

    const generated = generateTopicFeatureContent({
      topicName: payload.topicName,
      artworks,
    })

    const id = await createTopicFeatureRecord({
      topicName: payload.topicName,
      topicSlug: finalSlug,
      topicDescription: payload.topicDescription ?? generated.topicDescription,
      featureContent: payload.featureContent ?? generated.featureContent,
      coverPid: pids[0],
      tags: payload.tags ?? generated.tags,
    })

    if (!id) {
      return NextResponse.json({ success: false, error: '创建话题专题失败' }, { status: 500 })
    }

    for (let i = 0; i < pids.length; i += 1) {
      await addTopicFeatureArtworkRecord(id, pids[i], i, generated.artworkCommentsByPid[pids[i]])
    }

    return NextResponse.json({
      success: true,
      data: { type: 'topic', id, editUrl: `/admin/topics/${id}`, topicSlug: finalSlug },
    })
  } catch (error) {
    if (error instanceof ZodError) return validationErrorResponse(error)

    console.error('由收藏素材创建栏目失败:', error)
    return NextResponse.json({ success: false, error: '创建失败' }, { status: 500 })
  }
}
