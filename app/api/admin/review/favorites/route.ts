import { ZodError } from 'zod'
import { NextRequest, NextResponse } from 'next/server'

import { verifyAdminRequest } from '@/lib/admin-auth'
import { parseSearchParams } from '@/lib/validation/request'
import { adminFavoriteListQuerySchema } from '@/lib/validation/admin'
import { getFavoriteArtworks } from '@/db/curation'

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
    const { page, limit, search, tag, artistId, excludePublished, sortBy } = parseSearchParams(
      new URL(request.url).searchParams,
      adminFavoriteListQuerySchema
    )

    const { artworks, total } = await getFavoriteArtworks(page, limit, {
      search,
      tag,
      artistId,
      excludePublished,
      sortBy,
    })

    return NextResponse.json({
      success: true,
      data: {
        artworks,
        pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
      },
    })
  } catch (error) {
    if (error instanceof ZodError) return validationErrorResponse(error)

    console.error('获取收藏素材失败:', error)
    return NextResponse.json({ success: false, error: '获取收藏素材失败' }, { status: 500 })
  }
}
