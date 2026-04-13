import { ZodError } from 'zod'
import { NextRequest, NextResponse } from 'next/server'

import { verifyAdminRequest } from '@/lib/admin-auth'
import { parseSearchParams } from '@/lib/validation/request'
import { adminTopicCandidateQuerySchema } from '@/lib/validation/admin'
import { getAdminBusinessCandidateArtworks } from '@/lib/admin-business-candidates'

function validationErrorResponse(error: ZodError) {
  return NextResponse.json(
    { success: false, error: error.issues[0]?.message ?? '请求参数无效' },
    { status: 400 }
  )
}

function parseTagList(tagsText?: string, topicName?: string) {
  if (tagsText && tagsText.trim().length > 0) {
    return tagsText
      .split(/[,，\n]/)
      .map((tag) => tag.trim())
      .filter(Boolean)
  }

  if (topicName && topicName.trim().length > 0) {
    return [topicName.trim()]
  }

  return []
}

export async function GET(request: NextRequest) {
  const isAdmin = await verifyAdminRequest(request)
  if (!isAdmin) return NextResponse.json({ success: false, error: '未授权' }, { status: 401 })

  try {
    const { limit, topN, excludePublished, tags, topicName } = parseSearchParams(
      new URL(request.url).searchParams,
      adminTopicCandidateQuerySchema
    )
    const tagList = parseTagList(tags, topicName)
    const artworks = await getAdminBusinessCandidateArtworks({
      pool: 'topic',
      limit,
      topN,
      excludePublished,
      onlyDownloaded: true,
      tags: tagList,
    })

    return NextResponse.json({
      success: true,
      data: {
        artworks,
        query: { limit, topN, excludePublished, topicName, tags: tagList },
      },
    })
  } catch (error) {
    if (error instanceof ZodError) return validationErrorResponse(error)

    console.error('获取话题候选作品失败:', error)
    return NextResponse.json({ success: false, error: '获取候选作品失败' }, { status: 500 })
  }
}
