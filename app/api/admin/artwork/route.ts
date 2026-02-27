import { NextRequest, NextResponse } from 'next/server'
import { verifyAdminRequest } from '@/lib/admin-auth'
import { getArtworkList, addArtworkByPid, deleteArtwork, getArtworkById } from '@/lib/turso'
import { fetchPixivIllustInfo } from '@/lib/pixiv-api'
import { downloadAndUploadAllSizes } from '@/lib/b2-storage'

export async function GET(request: NextRequest) {
  const isAdmin = await verifyAdminRequest(request)
  if (!isAdmin) {
    return NextResponse.json({ success: false, error: '未授权' }, { status: 401 })
  }

  const { searchParams } = new URL(request.url)
  const page = parseInt(searchParams.get('page') || '1')
  const limit = parseInt(searchParams.get('limit') || '20')
  const search = searchParams.get('search') || undefined

  try {
    const { artworks, total } = await getArtworkList(page, limit, search)
    return NextResponse.json({
      success: true,
      data: {
        artworks,
        pagination: { page, limit, total, totalPages: Math.ceil(total / limit) }
      }
    })
  } catch (error) {
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
    const body = await request.json()
    const { pid, downloadImages } = body

    if (!pid) {
      return NextResponse.json({ success: false, error: '请提供PID' }, { status: 400 })
    }

    // 检查是否已存在
    const existing = await getArtworkById(parseInt(pid))
    if (existing) {
      return NextResponse.json({ success: false, error: '该作品已存在' }, { status: 409 })
    }

    // 获取Pixiv信息
    const info = await fetchPixivIllustInfo(pid)
    if (!info) {
      return NextResponse.json({ success: false, error: '无法获取Pixiv插画信息，请检查PID是否正确' }, { status: 400 })
    }

    let imagePath = ''

    // 如果需要下载图片到B2
    if (downloadImages && info.imageUrls.regular) {
      try {
        const paths = await downloadAndUploadAllSizes(info.imageUrls, pid)
        imagePath = paths.regular || ''
      } catch (error) {
        console.error('上传图片到B2失败:', error)
        // 上传失败不阻断流程，继续使用代理URL
      }
    }

    // 保存到数据库
    await addArtworkByPid({
      pid: info.pid,
      title: info.title,
      authorId: info.authorId,
      authorName: info.authorName,
      tag: info.tags.join(','),
      imageUrl: info.imageUrls.regular || info.imageUrls.small || '',
      imagePath,
      good: info.likeCount,
      star: info.bookmarkCount,
      view: info.viewCount,
      popularity: 0,
    })

    return NextResponse.json({
      success: true,
      data: {
        pid: info.pid,
        title: info.title,
        authorName: info.authorName,
        imagePath,
      }
    })
  } catch (error) {
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
    const { searchParams } = new URL(request.url)
    const pid = searchParams.get('pid')

    if (!pid) {
      return NextResponse.json({ success: false, error: '请提供PID' }, { status: 400 })
    }

    await deleteArtwork(pid)
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('删除作品失败:', error)
    return NextResponse.json({ success: false, error: '删除作品失败' }, { status: 500 })
  }
}
